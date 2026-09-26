
create or replace function app_private.link_confirmed_nonfinancial_records_for_user(
  target_user uuid,
  target_email text
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  normalized_email text;
  leads_count integer:=0;
  founders_count integer:=0;
begin
  normalized_email:=lower(trim(coalesce(target_email,'')));

  if target_user is null or normalized_email='' then
    return jsonb_build_object('leads',0,'founders50',0);
  end if;

  if not exists(
    select 1
    from auth.users u
    where u.id=target_user
      and u.email_confirmed_at is not null
      and lower(trim(coalesce(u.email,'')))=normalized_email
  ) then
    return jsonb_build_object('leads',0,'founders50',0);
  end if;

  update public.lead_contacts
  set linked_profile_id=target_user,
      updated_at=now()
  where linked_profile_id is null
    and lower(email)=normalized_email;
  get diagnostics leads_count=row_count;

  update public.founders50_applications
  set profile_id=target_user,
      updated_at=now()
  where profile_id is null
    and lower(email)=normalized_email;
  get diagnostics founders_count=row_count;

  if founders_count>0 then
    insert into public.profile_tags(profile_id,tag_id,source)
    select target_user,t.id,'founders50-application'
    from public.tags t
    where t.slug='founders-50'
    on conflict(profile_id,tag_id)
    do update set source=excluded.source;
  end if;

  if leads_count+founders_count>0 then
    insert into public.audit_events(
      actor_profile_id,
      event_type,
      entity_type,
      entity_id,
      summary,
      metadata
    )
    values(
      null,
      'confirmed_email_nonfinancial_records_linked',
      'profile',
      target_user::text,
      'Verified pre-account Lockliel records linked to member account',
      jsonb_build_object(
        'lead_contacts',leads_count,
        'founders50_applications',founders_count
      )
    );
  end if;

  return jsonb_build_object(
    'leads',leads_count,
    'founders50',founders_count
  );
end;
$function$;

revoke execute on function app_private.link_confirmed_nonfinancial_records_for_user(uuid,text)
from public, anon, authenticated;

drop trigger if exists on_profile_link_founders50
on public.profiles;

drop trigger if exists on_profile_link_lead_contact
on public.profiles;

create or replace function app_private.link_nonfinancial_records_for_confirmed_new_profile()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform app_private.link_confirmed_nonfinancial_records_for_user(
    new.id,
    new.email
  );
  return new;
end;
$function$;

revoke execute on function app_private.link_nonfinancial_records_for_confirmed_new_profile()
from public, anon, authenticated;

drop trigger if exists link_nonfinancial_records_for_confirmed_new_profile_trigger
on public.profiles;

create trigger link_nonfinancial_records_for_confirmed_new_profile_trigger
after insert on public.profiles
for each row
execute function app_private.link_nonfinancial_records_for_confirmed_new_profile();

create or replace function app_private.link_nonfinancial_records_on_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.email_confirmed_at is not null
     and old.email_confirmed_at is null
     and new.email is not null then
    perform app_private.link_confirmed_nonfinancial_records_for_user(
      new.id,
      new.email
    );
  end if;
  return new;
end;
$function$;

revoke execute on function app_private.link_nonfinancial_records_on_email_confirmation()
from public, anon, authenticated;

drop trigger if exists link_nonfinancial_records_on_email_confirmation_trigger
on auth.users;

create trigger link_nonfinancial_records_on_email_confirmation_trigger
after update of email_confirmed_at on auth.users
for each row
execute function app_private.link_nonfinancial_records_on_email_confirmation();

create or replace function app_private.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.email is not distinct from new.email then
    return new;
  end if;

  if new.email is null
     or nullif(trim(new.email),'') is null then
    return new;
  end if;

  update public.profiles
  set email=lower(trim(new.email)),
      updated_at=now()
  where id=new.id;

  if new.email_confirmed_at is not null then
    perform app_private.link_confirmed_financial_records_for_user(
      new.id,
      new.email
    );
    perform app_private.link_confirmed_nonfinancial_records_for_user(
      new.id,
      new.email
    );
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    new.id,
    'account_email_changed',
    'profile',
    new.id::text,
    'Account sign-in email changed',
    jsonb_build_object('email_changed',true)
  );

  insert into public.notifications(
    profile_id,
    notification_type,
    title,
    body,
    href
  )
  values(
    new.id,
    'account',
    'Your sign-in email was updated',
    'Your Lockliel sign-in email was changed. Review Account Security if you did not expect this.',
    '/my-lockliel/security'
  );

  return new;
end;
$function$;

revoke execute on function app_private.sync_profile_email_from_auth()
from public, anon, authenticated;
