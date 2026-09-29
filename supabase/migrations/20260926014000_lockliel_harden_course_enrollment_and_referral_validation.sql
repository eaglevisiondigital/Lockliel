alter table public.course_enrollments
  add constraint course_enrollments_status_check
    check (status in ('active','completed')),
  add constraint course_enrollments_completed_after_enrolled
    check (completed_at is null or completed_at>=enrolled_at),
  add constraint course_enrollments_completion_state
    check (
      (status='active' and completed_at is null)
      or
      (status='completed' and completed_at is not null)
    );

create or replace function app_private.normalize_course_enrollment_lifecycle()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='INSERT' then
    new.enrolled_at:=coalesce(new.enrolled_at,now());
  else
    if old.id is distinct from new.id
       or old.profile_id is distinct from new.profile_id
       or old.course_id is distinct from new.course_id
       or old.enrolled_at is distinct from new.enrolled_at then
      raise exception 'Course enrollment identity and enrollment time cannot be changed.';
    end if;

    if old.status='completed'
       and new.status<>'completed' then
      raise exception 'Completed course enrollments cannot be reopened.';
    end if;
  end if;

  if new.status='completed' then
    new.completed_at:=coalesce(
      case when tg_op='UPDATE' then old.completed_at else null end,
      new.completed_at,
      now()
    );
  else
    new.completed_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_course_enrollment_lifecycle()
from public,anon,authenticated;

drop trigger if exists normalize_course_enrollment_lifecycle_trigger
on public.course_enrollments;

create trigger normalize_course_enrollment_lifecycle_trigger
before insert or update
on public.course_enrollments
for each row
execute function app_private.normalize_course_enrollment_lifecycle();

alter table public.referral_events
  validate constraint referral_events_visit_member_check;
