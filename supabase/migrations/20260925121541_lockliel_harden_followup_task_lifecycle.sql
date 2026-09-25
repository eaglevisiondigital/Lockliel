revoke all privileges on table public.follow_up_tasks from anon;
revoke insert, update, delete on table public.follow_up_tasks from authenticated;

grant select on table public.follow_up_tasks to authenticated;
grant update (
  assigned_to,
  status
) on table public.follow_up_tasks to authenticated;

alter table public.follow_up_tasks
  drop constraint if exists follow_up_tasks_status_check,
  add constraint follow_up_tasks_status_check
    check (status in ('open','in_progress','completed'));

create or replace function app_private.normalize_follow_up_task_lifecycle()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and old.status='completed'
     and new.status<>'completed' then
    raise exception 'Completed follow-up tasks cannot be reopened.';
  end if;

  if new.status='completed' then
    new.completed_at:=coalesce(
      case when tg_op='UPDATE' then old.completed_at else null end,
      now()
    );
  else
    new.completed_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_follow_up_task_lifecycle()
from public, anon, authenticated;

drop trigger if exists normalize_follow_up_task_lifecycle_trigger
on public.follow_up_tasks;

create trigger normalize_follow_up_task_lifecycle_trigger
before insert or update of status
on public.follow_up_tasks
for each row
execute function app_private.normalize_follow_up_task_lifecycle();

create or replace function app_private.audit_follow_up_task_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is not distinct from new.status
     and old.assigned_to is not distinct from new.assigned_to then
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
    (select auth.uid()),
    'follow_up_task_changed',
    'follow_up_task',
    new.id::text,
    'Follow-up task assignment or status changed',
    jsonb_build_object(
      'status_from',old.status,
      'status_to',new.status,
      'assigned_to_from',old.assigned_to,
      'assigned_to_to',new.assigned_to
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_follow_up_task_change()
from public, anon, authenticated;

drop trigger if exists audit_follow_up_task_change_trigger
on public.follow_up_tasks;

create trigger audit_follow_up_task_change_trigger
after update of status, assigned_to
on public.follow_up_tasks
for each row
execute function app_private.audit_follow_up_task_change();
