-- Execution evidence is private and disappears with the completed target record.
alter table app_private.account_deletion_targets
  add column execution_started_at timestamptz,
  add column sessions_revoked_at timestamptz,
  add column scrubbed_at timestamptz,
  add column scrub_result jsonb;
alter table app_private.account_deletion_targets enable row level security;

create or replace function public.lockliel_prepare_account_deletion(
  request_id_input uuid,
  actor_id_input uuid,
  actor_session_id_input uuid,
  revoke_sessions_input boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  request_row public.privacy_requests%rowtype;
  state jsonb;
  target_id uuid;
  first_execution boolean;
  revoked integer;
begin
  -- The Edge worker supplies identity only after validating the caller's JWT.
  -- Recheck that exact AAL2 session and staff role at each privileged phase.
  if not exists(
    select 1 from auth.sessions s
    join auth.users u on u.id=s.user_id
    join public.staff_roles sr on sr.profile_id=u.id
    where s.id=actor_session_id_input and s.user_id=actor_id_input
      and s.aal='aal2' and (s.not_after is null or s.not_after>now())
      and u.deleted_at is null and (u.banned_until is null or u.banned_until<=now())
      and sr.role in ('super_admin','admin')
  ) then
    raise exception 'Active administrator MFA session required.';
  end if;

  select * into request_row from public.privacy_requests
  where id=request_id_input for update;
  if request_row.id is null or request_row.request_type<>'account_deletion'
     or request_row.status<>'in_review'
     or request_row.handled_by is distinct from actor_id_input then
    raise exception 'Claimed account deletion request required.';
  end if;

  state:=public.lockliel_account_deletion_state(request_id_input);
  target_id:=(state->>'target_profile_id')::uuid;
  if target_id is null or target_id=actor_id_input then
    raise exception 'Another administrator must process this account deletion.';
  end if;
  if (state->>'blocker_count')::integer is distinct from 0 then
    raise exception 'Account deletion responsibilities or Storage ownership remain unresolved.';
  end if;

  select execution_started_at is null into first_execution
  from app_private.account_deletion_targets where request_id=request_id_input for update;
  update app_private.account_deletion_targets
  set execution_started_at=coalesce(execution_started_at,now())
  where request_id=request_id_input;
  if first_execution then
    insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary)
    values(actor_id_input,'account_deletion_execution_started','privacy_request',
      request_id_input::text,'Verified account deletion execution started');
  end if;

  if revoke_sessions_input then
    -- Auth API must suspend sign-in before revocation so new sessions cannot race deletion.
    if exists(select 1 from auth.users where id=target_id
      and (banned_until is null or banned_until<=now())) then
      raise exception 'Suspend account sign-in before revoking deletion sessions.';
    end if;
    delete from auth.refresh_tokens where user_id=target_id::text;
    delete from auth.sessions where user_id=target_id;
    get diagnostics revoked=row_count;
    update app_private.account_deletion_targets
    set sessions_revoked_at=coalesce(sessions_revoked_at,now())
    where request_id=request_id_input;
    if revoked>0 then
      insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
      values(actor_id_input,'account_deletion_sessions_revoked','privacy_request',request_id_input::text,
        'Account sessions revoked before Auth deletion',jsonb_build_object('sessions_revoked',revoked));
    end if;
  end if;
  return public.lockliel_account_deletion_state(request_id_input);
end;
$function$;
revoke all on function public.lockliel_prepare_account_deletion(uuid,uuid,uuid,boolean)
from public,anon,authenticated;
grant execute on function public.lockliel_prepare_account_deletion(uuid,uuid,uuid,boolean) to service_role;

create or replace function app_private.guard_account_deletion_execution()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  target app_private.account_deletion_targets%rowtype;
begin
  if new.request_type<>'account_deletion' then return new; end if;
  select * into target from app_private.account_deletion_targets where request_id=new.id;
  if target.execution_started_at is not null then
    if new.status not in ('in_review','completed') then
      raise exception 'Started account deletion must be retried or completed, not declined or cancelled.';
    end if;
    -- Keep the handler stable while they remain eligible. Recovery by another
    -- admin is possible if the original handler has lost their admin role.
    if new.handled_by is distinct from old.handled_by and exists(
      select 1 from public.staff_roles where profile_id=old.handled_by
        and role in ('super_admin','admin')
    ) then
      raise exception 'Account deletion execution handler cannot change while eligible.';
    end if;
  end if;
  if new.status='completed' and old.status is distinct from new.status then
    if target.request_id is null or target.execution_started_at is null
       or target.sessions_revoked_at is null or target.scrubbed_at is null
       or exists(select 1 from auth.users where id=target.target_profile_id)
       or exists(select 1 from auth.sessions where user_id=target.target_profile_id)
       or exists(select 1 from public.profiles where id=target.target_profile_id)
       or exists(select 1 from storage.objects where owner=target.target_profile_id
          or owner_id=target.target_profile_id::text) then
      raise exception 'Verified execution, session revocation, and personal-data scrubbing required for completion.';
    end if;
  end if;
  return new;
end;
$function$;
revoke all on function app_private.guard_account_deletion_execution() from public,anon,authenticated;
-- Runs after the existing guard has assigned the effective handler.
create trigger zz_guard_account_deletion_execution
before update on public.privacy_requests for each row
execute function app_private.guard_account_deletion_execution();

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
  receipt jsonb;
begin
  perform 1 from public.privacy_requests
  where id=request_id_input and request_type='account_deletion' and status='in_review'
  for update;
  if not found then raise exception 'In-review account deletion request required.'; end if;
  select scrub_result into receipt from app_private.account_deletion_targets
  where request_id=request_id_input and scrubbed_at is not null;
  if receipt is not null then return receipt; end if;
  if not exists(select 1 from app_private.account_deletion_targets
    where request_id=request_id_input and execution_started_at is not null
      and sessions_revoked_at is not null) then
    raise exception 'Verified execution and session revocation required before scrubbing.';
  end if;
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
    set rationale='Personal data removed for account deletion.'
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
        why_interested='Personal data removed for account deletion.',
        what_excites_you='Personal data removed for account deletion.',
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

  receipt:=jsonb_build_object(
    'lead_contacts_deleted',lead_rows,
    'founders50_applications_anonymized',founder_rows,
    'founders50_review_rationales_cleared',review_rows
  );
  update app_private.account_deletion_targets
  set scrubbed_at=now(),scrub_result=receipt where request_id=request_id_input;
  return receipt;
end;
$function$;

revoke all on function public.lockliel_scrub_deleted_nonfinancial_records(uuid)
from public,anon,authenticated;

grant execute on function public.lockliel_scrub_deleted_nonfinancial_records(uuid)
to service_role;

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
  where pr.id=request_id_input for update;

  if request_row.id is null
     or request_row.request_type<>'account_deletion'
     or request_row.status not in ('submitted','in_review') then
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

