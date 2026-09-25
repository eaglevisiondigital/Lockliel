
create or replace function app_private.validate_lesson_completion()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  required_videos int;
  completed_videos int;
  question_count int;
begin
  if new.status<>'completed' then
    return new;
  end if;

  select count(*)::int into required_videos
  from public.lesson_assets a
  where a.lesson_id=new.lesson_id
    and a.asset_type='video'
    and a.status='active';

  if required_videos>0 then
    select count(*)::int into completed_videos
    from public.lesson_assets a
    join public.media_progress mp
      on mp.asset_id=a.id
     and mp.profile_id=new.profile_id
    where a.lesson_id=new.lesson_id
      and a.asset_type='video'
      and a.status='active'
      and mp.percent_watched>=95;

    if completed_videos<required_videos then
      raise exception 'Lesson cannot be completed until all required videos are watched to at least 95 percent';
    end if;
  end if;

  select jsonb_array_length(coalesce(l.worksheet_schema->'questions','[]'::jsonb))
    into question_count
  from public.lessons l
  where l.id=new.lesson_id;

  if coalesce(question_count,0)>0 and new.worksheet_status<>'completed' then
    raise exception 'Lesson cannot be completed until the worksheet is completed';
  end if;

  return new;
end;
$$;

revoke all on function app_private.validate_lesson_completion() from public,anon,authenticated;

drop trigger if exists validate_lesson_completion_trigger on public.lesson_progress;
create trigger validate_lesson_completion_trigger
before insert or update of status,worksheet_status on public.lesson_progress
for each row execute function app_private.validate_lesson_completion();

create or replace function app_private.sync_journey_from_lesson_progress()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  current_lesson record;
  next_lesson record;
  remaining_count int;
begin
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
    select count(*)::int into remaining_count
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

      insert into public.notifications(profile_id,notification_type,title,body,href)
      values(
        new.profile_id,
        'course',
        'You completed your foundational journey',
        'Keep growing, then reach one and help someone else take their next step.',
        '/my-lockliel/connections'
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
$$;

revoke all on function app_private.sync_journey_from_lesson_progress() from public,anon,authenticated;

drop trigger if exists sync_journey_from_lesson_progress_trigger on public.lesson_progress;
create trigger sync_journey_from_lesson_progress_trigger
after insert or update of status on public.lesson_progress
for each row execute function app_private.sync_journey_from_lesson_progress();
