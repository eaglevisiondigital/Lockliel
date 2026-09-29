
alter table public.follow_up_tasks
  add column if not exists context_type text,
  add column if not exists context_id text;

create index if not exists follow_up_tasks_context_idx
  on public.follow_up_tasks(context_type,context_id,status);

create or replace function app_private.create_tasks_from_group_checkin()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  group_name text;
begin
  select g.name into group_name
  from public.groups g
  where g.id=new.group_id;

  if nullif(trim(coalesce(new.needs_support,'')),'') is not null then
    if not exists(
      select 1 from public.follow_up_tasks f
      where f.context_type='group_checkin'
        and f.context_id=new.id::text
        and f.task_type='group_support_request'
        and f.status='open'
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
        'group_support_request',
        'open',
        now()+interval '1 day',
        coalesce(group_name,'Group') || ' requested support: ' || left(new.needs_support,1500),
        'group_checkin',
        new.id::text
      );
    end if;
  end if;

  if new.next_leader_identified then
    if not exists(
      select 1 from public.follow_up_tasks f
      where f.context_type='group_checkin'
        and f.context_id=new.id::text
        and f.task_type='leadership_signal'
        and f.status='open'
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
        coalesce(group_name,'Group') || ' reported a possible next leader / multiplier.',
        'group_checkin',
        new.id::text
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function app_private.create_tasks_from_group_checkin() from public,anon,authenticated;

drop trigger if exists create_tasks_from_group_checkin_trigger on public.group_weekly_checkins;
create trigger create_tasks_from_group_checkin_trigger
after insert or update of needs_support,next_leader_identified on public.group_weekly_checkins
for each row execute function app_private.create_tasks_from_group_checkin();
