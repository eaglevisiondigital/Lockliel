create or replace function app_private.sync_journey_from_lesson_progress()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  current_lesson record;
  next_lesson record;
  remaining_count int;
begin
  if tg_op='UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;

  select l.id,l.course_id,l.position,l.slug,l.title
    into current_lesson
  from public.lessons l
  where l.id=new.lesson_id;

  if current_lesson.id is null then
    return new;
  end if;

  if new.status='in_progress' then
    update public.member_journey
    set next_step_type='course',
        next_step_title='Continue: ' || current_lesson.title,
        next_step_path='/my-lockliel/journey/lesson?lesson=' || current_lesson.slug,
        updated_at=now()
    where profile_id=new.profile_id;

    return new;
  end if;

  if new.status='completed' then
    select count(*)::int
      into remaining_count
    from public.lessons l
    where l.course_id=current_lesson.course_id
      and not exists(
        select 1
        from public.lesson_progress lp
        where lp.profile_id=new.profile_id
          and lp.lesson_id=l.id
          and lp.status='completed'
      );

    if remaining_count=0 then
      update public.course_enrollments
      set status='completed',
          completed_at=coalesce(completed_at,now())
      where profile_id=new.profile_id
        and course_id=current_lesson.course_id;

      update public.member_journey
      set next_step_type='reach_one',
          next_step_title='Reach one and help them grow',
          next_step_path='/my-lockliel/connections',
          updated_at=now()
      where profile_id=new.profile_id;

      insert into public.notifications(
        profile_id,notification_type,title,body,href
      )
      select
        new.profile_id,
        'course',
        'You completed your foundational journey',
        'Keep growing, then reach one and help someone else take their next step.',
        '/my-lockliel/connections'
      where not exists(
        select 1
        from public.notifications n
        where n.profile_id=new.profile_id
          and n.notification_type='course'
          and n.title='You completed your foundational journey'
      );

      return new;
    end if;

    select l.id,l.slug,l.title,l.position
      into next_lesson
    from public.lessons l
    where l.course_id=current_lesson.course_id
      and l.position>current_lesson.position
      and not exists(
        select 1
        from public.lesson_progress lp
        where lp.profile_id=new.profile_id
          and lp.lesson_id=l.id
          and lp.status='completed'
      )
    order by l.position
    limit 1;

    if next_lesson.id is null then
      select l.id,l.slug,l.title,l.position
        into next_lesson
      from public.lessons l
      where l.course_id=current_lesson.course_id
        and not exists(
          select 1
          from public.lesson_progress lp
          where lp.profile_id=new.profile_id
            and lp.lesson_id=l.id
            and lp.status='completed'
        )
      order by l.position
      limit 1;
    end if;

    if next_lesson.id is not null then
      update public.member_journey
      set next_step_type='course',
          next_step_title='Next: ' || next_lesson.title,
          next_step_path='/my-lockliel/journey/lesson?lesson=' || next_lesson.slug,
          updated_at=now()
      where profile_id=new.profile_id;
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_journey_from_lesson_progress()
from public, anon, authenticated;
