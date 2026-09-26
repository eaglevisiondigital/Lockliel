create or replace function app_private.close_inviter_task_on_consent_revoke()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.revoked_at is null
     and new.revoked_at is not null
     and new.permission_type='inviter_followup' then

    update public.follow_up_tasks
    set status='completed',
        completed_at=coalesce(completed_at,now()),
        notes=case
          when notes is null then 'Closed because the member paused inviter messaging.'
          else notes || ' Closed because the member paused inviter messaging.'
        end
    where subject_profile_id=new.profile_id
      and assigned_to=new.other_profile_id
      and task_type='welcome_invited_person'
      and status in ('open','in_progress');
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.close_inviter_task_on_consent_revoke()
from public, anon, authenticated;

drop trigger if exists close_inviter_task_on_consent_revoke_trigger
on public.contact_permissions;

create trigger close_inviter_task_on_consent_revoke_trigger
after update of revoked_at on public.contact_permissions
for each row
execute function app_private.close_inviter_task_on_consent_revoke();
