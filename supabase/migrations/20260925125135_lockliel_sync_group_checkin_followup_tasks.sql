create or replace function app_private.create_tasks_from_group_checkin()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  group_name text;
  support_present boolean;
begin
  select g.name
    into group_name
  from public.groups g
  where g.id=new.group_id;

  support_present:=
    nullif(trim(coalesce(new.needs_support,'')),'') is not null;

  if support_present then
    if exists(
      select 1
      from public.follow_up_tasks f
      where f.context_type='group_checkin'
        and f.context_id=new.id::text
        and f.task_type='group_support_request'
        and f.status in ('open','in_progress')
    ) then
      update public.follow_up_tasks
      set notes=coalesce(group_name,'Group')
          || ' requested support: '
          || left(new.needs_support,1500),
          due_at=least(
            coalesce(due_at,now()+interval '1 day'),
            now()+interval '1 day'
          )
      where context_type='group_checkin'
        and context_id=new.id::text
        and task_type='group_support_request'
        and status in ('open','in_progress');
    else
      insert into public.follow_up_tasks(
        subject_profile_id,
        assigned_to,
        task_type,
        status,
        due_at,
        notes,
        context_type,
        context_id
      )
      values(
        new.submitted_by,
        null,
        'group_support_request',
        'open',
        now()+interval '1 day',
        coalesce(group_name,'Group')
          || ' requested support: '
          || left(new.needs_support,1500),
        'group_checkin',
        new.id::text
      );
    end if;
  else
    update public.follow_up_tasks
    set status='completed',
        notes=case
          when notes is null then
            'Closed because the support request was cleared on the weekly check-in.'
          else
            notes || ' Closed because the support request was cleared on the weekly check-in.'
        end
    where context_type='group_checkin'
      and context_id=new.id::text
      and task_type='group_support_request'
      and status in ('open','in_progress');
  end if;

  if new.next_leader_identified then
    if not exists(
      select 1
      from public.follow_up_tasks f
      where f.context_type='group_checkin'
        and f.context_id=new.id::text
        and f.task_type='leadership_signal'
        and f.status in ('open','in_progress')
    ) then
      insert into public.follow_up_tasks(
        subject_profile_id,
        assigned_to,
        task_type,
        status,
        due_at,
        notes,
        context_type,
        context_id
      )
      values(
        new.submitted_by,
        null,
        'leadership_signal',
        'open',
        now()+interval '3 days',
        coalesce(group_name,'Group')
          || ' reported a possible next leader / multiplier.',
        'group_checkin',
        new.id::text
      );
    end if;
  else
    update public.follow_up_tasks
    set status='completed',
        notes=case
          when notes is null then
            'Closed because the leadership signal was cleared on the weekly check-in.'
          else
            notes || ' Closed because the leadership signal was cleared on the weekly check-in.'
        end
    where context_type='group_checkin'
      and context_id=new.id::text
      and task_type='leadership_signal'
      and status in ('open','in_progress');
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.create_tasks_from_group_checkin()
from public, anon, authenticated;

drop trigger if exists create_tasks_from_group_checkin_trigger
on public.group_weekly_checkins;

create trigger create_tasks_from_group_checkin_trigger
after insert or update of needs_support,next_leader_identified
on public.group_weekly_checkins
for each row
execute function app_private.create_tasks_from_group_checkin();
