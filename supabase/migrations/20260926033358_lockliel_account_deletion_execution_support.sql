create table app_private.account_deletion_targets(
  request_id uuid primary key references public.privacy_requests(id) on delete cascade,
  target_profile_id uuid not null,
  target_email text,
  created_at timestamptz not null default now()
);

revoke all on table app_private.account_deletion_targets
from public,anon,authenticated;

insert into app_private.account_deletion_targets(
  request_id,target_profile_id,target_email
)
select
  pr.id,
  pr.profile_id,
  lower(p.email)
from public.privacy_requests pr
left join public.profiles p on p.id=pr.profile_id
where pr.request_type='account_deletion'
  and pr.status in ('submitted','in_review')
  and pr.profile_id is not null
on conflict(request_id) do nothing;

create or replace function app_private.capture_account_deletion_target()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.request_type='account_deletion' then
    insert into app_private.account_deletion_targets(
      request_id,target_profile_id,target_email
    )
    select
      new.id,
      new.profile_id,
      lower(p.email)
    from public.profiles p
    where p.id=new.profile_id
    on conflict(request_id)
    do update set
      target_profile_id=excluded.target_profile_id,
      target_email=excluded.target_email;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.capture_account_deletion_target()
from public,anon,authenticated;

drop trigger if exists capture_account_deletion_target_trigger
on public.privacy_requests;

create trigger capture_account_deletion_target_trigger
after insert
on public.privacy_requests
for each row
execute function app_private.capture_account_deletion_target();

create or replace function app_private.clear_account_deletion_target()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.request_type='account_deletion'
     and new.status in ('completed','declined','cancelled')
     and old.status is distinct from new.status then
    delete from app_private.account_deletion_targets
    where request_id=new.id;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.clear_account_deletion_target()
from public,anon,authenticated;

drop trigger if exists clear_account_deletion_target_trigger
on public.privacy_requests;

create trigger clear_account_deletion_target_trigger
after update of status
on public.privacy_requests
for each row
execute function app_private.clear_account_deletion_target();

create or replace function public.lockliel_account_deletion_state(
  request_id_input uuid
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  request_row record;
  target_row record;
  target_id uuid;
  current_email text;
  auth_user_exists boolean:=false;
  session_count integer:=0;
  profile_exists boolean:=false;
  owned_storage_objects integer:=0;
  responsibility_health jsonb:='{}'::jsonb;
  blocker_count integer:=0;
begin
  select
    pr.id,
    pr.profile_id,
    pr.request_type,
    pr.status,
    pr.handled_by
  into request_row
  from public.privacy_requests pr
  where pr.id=request_id_input;

  if request_row.id is null
     or request_row.request_type<>'account_deletion' then
    raise exception 'Account deletion request not found.';
  end if;

  select
    t.target_profile_id,
    t.target_email
  into target_row
  from app_private.account_deletion_targets t
  where t.request_id=request_id_input;

  target_id:=coalesce(
    target_row.target_profile_id,
    request_row.profile_id
  );

  if target_id is null then
    raise exception 'Account deletion target is unavailable.';
  end if;

  select lower(p.email)
    into current_email
  from public.profiles p
  where p.id=target_id;

  if target_row.target_profile_id is null then
    insert into app_private.account_deletion_targets(
      request_id,target_profile_id,target_email
    )
    values(
      request_id_input,
      target_id,
      current_email
    )
    on conflict(request_id)
    do update set
      target_profile_id=excluded.target_profile_id,
      target_email=coalesce(
        excluded.target_email,
        app_private.account_deletion_targets.target_email
      );
  elsif current_email is not null
        and current_email is distinct from target_row.target_email then
    update app_private.account_deletion_targets
    set target_email=current_email
    where request_id=request_id_input;
  end if;

  select exists(
    select 1 from auth.users u where u.id=target_id
  ) into auth_user_exists;

  select count(*)::integer
    into session_count
  from auth.sessions s
  where s.user_id=target_id;

  select exists(
    select 1 from public.profiles p where p.id=target_id
  ) into profile_exists;

  select count(*)::integer
    into owned_storage_objects
  from storage.objects o
  where o.owner=target_id
     or o.owner_id=target_id::text;

  responsibility_health:=
    app_private.account_deletion_responsibility_counts(target_id);

  blocker_count:=
    owned_storage_objects
    + coalesce(
        (responsibility_health->>'blocker_count')::integer,
        0
      );

  return jsonb_build_object(
    'request_id',request_id_input,
    'request_status',request_row.status,
    'handled_by',request_row.handled_by,
    'target_profile_id',target_id,
    'auth_user_exists',auth_user_exists,
    'session_count',session_count,
    'profile_exists',profile_exists,
    'owned_storage_objects',owned_storage_objects,
    'blocker_count',blocker_count,
    'responsibilities',responsibility_health
  );
end;
$function$;

revoke all on function public.lockliel_account_deletion_state(uuid)
from public,anon,authenticated;

grant execute on function public.lockliel_account_deletion_state(uuid)
to service_role;

create or replace function public.lockliel_scrub_deleted_nonfinancial_records(
  request_id_input uuid
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  target_id uuid;
  target_email text;
  lead_rows integer:=0;
  founder_rows integer:=0;
  review_rows integer:=0;
begin
  select t.target_profile_id,t.target_email
    into target_id,target_email
  from app_private.account_deletion_targets t
  where t.request_id=request_id_input;

  if target_id is null then
    raise exception 'Account deletion target is unavailable.';
  end if;

  if exists(select 1 from auth.users u where u.id=target_id)
     or exists(select 1 from auth.sessions s where s.user_id=target_id)
     or exists(select 1 from public.profiles p where p.id=target_id) then
    raise exception 'Auth account deletion must complete before personal-data scrubbing.';
  end if;

  if target_email is not null then
    delete from public.lead_contacts lc
    where lower(lc.email)=lower(target_email);
    get diagnostics lead_rows=row_count;

    update public.founders50_reviews fr
    set rationale=null
    where exists(
      select 1
      from public.founders50_applications fa
      where fa.id=fr.application_id
        and lower(fa.email)=lower(target_email)
    )
      and fr.rationale is not null;
    get diagnostics review_rows=row_count;

    update public.founders50_applications fa
    set profile_id=null,
        first_name='Deleted',
        last_name='Member',
        email='deleted-'||replace(fa.id::text,'-','')||'@privacy.invalid',
        phone=null,
        city=null,
        region=null,
        country=null,
        church_affiliation=null,
        faith_stage=null,
        faith_background=null,
        ministry_experience=null,
        interest_path=null,
        growth_interests='{}'::text[],
        gathering_place=null,
        invite_count=null,
        why_interested=null,
        what_excites_you=null,
        share_with_five=null,
        gather_weekly=null,
        training_willingness=null,
        status=case
          when fa.status='declined' then fa.status
          else 'withdrawn'
        end,
        updated_at=now()
    where lower(fa.email)=lower(target_email);
    get diagnostics founder_rows=row_count;
  end if;

  insert into public.audit_events(
    actor_profile_id,event_type,entity_type,entity_id,summary,metadata
  )
  values(
    null,
    'account_deletion_nonfinancial_data_scrubbed',
    'privacy_request',
    request_id_input::text,
    'Nonfinancial personal data scrubbed for completed account deletion processing',
    jsonb_build_object(
      'lead_contacts_deleted',lead_rows,
      'founders50_applications_anonymized',founder_rows,
      'founders50_review_rationales_cleared',review_rows
    )
  );

  return jsonb_build_object(
    'lead_contacts_deleted',lead_rows,
    'founders50_applications_anonymized',founder_rows,
    'founders50_review_rationales_cleared',review_rows
  );
end;
$function$;

revoke all on function public.lockliel_scrub_deleted_nonfinancial_records(uuid)
from public,anon,authenticated;

grant execute on function public.lockliel_scrub_deleted_nonfinancial_records(uuid)
to service_role;
