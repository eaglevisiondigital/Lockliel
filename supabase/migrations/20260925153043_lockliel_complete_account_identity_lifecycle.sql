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

create or replace function app_private.audit_auth_password_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.encrypted_password is not distinct from new.encrypted_password then
    return new;
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
    null,
    'account_password_changed',
    'profile',
    new.id::text,
    'Account password changed',
    jsonb_build_object(
      'profile_id',new.id,
      'password_changed',true
    )
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
    'Your Lockliel password was changed',
    'Your Lockliel account password was updated. Review Account Security if you did not make this change.',
    '/my-lockliel/security'
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_auth_password_change()
from public, anon, authenticated;

drop trigger if exists audit_auth_password_change_trigger
on auth.users;

create trigger audit_auth_password_change_trigger
after update of encrypted_password
on auth.users
for each row
execute function app_private.audit_auth_password_change();
