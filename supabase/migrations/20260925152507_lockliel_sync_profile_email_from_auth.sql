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

  return new;
end;
$function$;

revoke execute on function app_private.sync_profile_email_from_auth()
from public, anon, authenticated;

drop trigger if exists sync_profile_email_from_auth_trigger
on auth.users;

create trigger sync_profile_email_from_auth_trigger
after update of email
on auth.users
for each row
execute function app_private.sync_profile_email_from_auth();
