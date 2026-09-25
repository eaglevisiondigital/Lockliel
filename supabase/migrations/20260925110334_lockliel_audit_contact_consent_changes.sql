create or replace function app_private.audit_contact_permission_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.revoked_at is not distinct from new.revoked_at then
    return new;
  end if;

  if new.permission_type not in ('inviter_followup','leader_followup') then
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
    new.profile_id,
    case when new.revoked_at is null
      then 'contact_permission_restored'
      else 'contact_permission_revoked'
    end,
    'contact_permission',
    new.other_profile_id::text,
    case
      when new.permission_type='inviter_followup' and new.revoked_at is null
        then 'Member restored inviter messaging.'
      when new.permission_type='inviter_followup'
        then 'Member paused inviter messaging.'
      when new.revoked_at is null
        then 'Member restored leader messaging.'
      else 'Member paused leader messaging.'
    end,
    jsonb_build_object(
      'permission_type',new.permission_type,
      'allowed',new.revoked_at is null
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_contact_permission_change()
from public, anon, authenticated;

drop trigger if exists audit_contact_permission_change_trigger
on public.contact_permissions;

create trigger audit_contact_permission_change_trigger
after update of revoked_at on public.contact_permissions
for each row
execute function app_private.audit_contact_permission_change();
