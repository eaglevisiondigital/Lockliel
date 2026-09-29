create or replace function app_private.founder_orientation_completion_followup()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  required_count int;
  complete_count int;
begin
  if new.completed_at is null then
    return new;
  end if;

  select count(*)::int
    into required_count
  from public.founder_orientation_steps
  where active=true
    and required=true;

  select count(*)::int
    into complete_count
  from public.founder_orientation_progress p
  join public.founder_orientation_steps s
    on s.id=p.step_id
  where p.profile_id=new.profile_id
    and p.completed_at is not null
    and s.active=true
    and s.required=true;

  if required_count>0
     and complete_count>=required_count then

    update public.founders50_applications
    set status=case
          when status='accepted' then 'orientation'
          else status
        end,
        updated_at=now()
    where profile_id=new.profile_id
      and status in ('accepted','orientation');

    if not exists(
      select 1
      from public.follow_up_tasks f
      where f.subject_profile_id=new.profile_id
        and f.task_type='founder_orientation_complete'
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
        new.profile_id,
        null,
        'founder_orientation_complete',
        'open',
        now()+interval '2 days',
        'Founders 50 orientation is complete. Review readiness for active-host status.',
        'founders50',
        new.profile_id::text
      );
    end if;

    insert into public.notifications(
      profile_id,
      notification_type,
      title,
      body,
      href
    )
    select
      new.profile_id,
      'founders50',
      'Founders 50 orientation complete',
      'You completed the Founders 50 orientation steps. The Lockliel team will review your readiness for active-host status.',
      '/my-lockliel/founder'
    where not exists(
      select 1
      from public.notifications n
      where n.profile_id=new.profile_id
        and n.notification_type='founders50'
        and n.title='Founders 50 orientation complete'
    );
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.founder_orientation_completion_followup()
from public, anon, authenticated;
