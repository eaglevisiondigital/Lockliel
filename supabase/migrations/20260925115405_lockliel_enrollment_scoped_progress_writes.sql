drop policy if exists progress_self_insert on public.lesson_progress;
drop policy if exists progress_self_update on public.lesson_progress;

create policy progress_self_insert
on public.lesson_progress
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and exists(
    select 1
    from public.lessons l
    join public.course_enrollments ce
      on ce.course_id=l.course_id
    where l.id=lesson_id
      and ce.profile_id=(select auth.uid())
      and ce.status in ('active','completed')
  )
);

create policy progress_self_update
on public.lesson_progress
for update
to authenticated
using (
  profile_id = (select auth.uid())
)
with check (
  profile_id = (select auth.uid())
  and exists(
    select 1
    from public.lessons l
    join public.course_enrollments ce
      on ce.course_id=l.course_id
    where l.id=lesson_id
      and ce.profile_id=(select auth.uid())
      and ce.status in ('active','completed')
  )
);

drop policy if exists media_progress_self_insert on public.media_progress;
drop policy if exists media_progress_self_update on public.media_progress;

create policy media_progress_self_insert
on public.media_progress
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and exists(
    select 1
    from public.lesson_assets a
    join public.lessons l on l.id=a.lesson_id
    join public.courses content_course on content_course.id=l.course_id
    join public.course_enrollments ce on ce.profile_id=(select auth.uid())
    join public.courses enrolled_course on enrolled_course.id=ce.course_id
    where a.id=asset_id
      and a.status='active'
      and ce.status in ('active','completed')
      and (
        content_course.id=enrolled_course.id
        or (
          content_course.translation_key is not null
          and content_course.translation_key=enrolled_course.translation_key
        )
      )
  )
);

create policy media_progress_self_update
on public.media_progress
for update
to authenticated
using (
  profile_id = (select auth.uid())
)
with check (
  profile_id = (select auth.uid())
  and exists(
    select 1
    from public.lesson_assets a
    join public.lessons l on l.id=a.lesson_id
    join public.courses content_course on content_course.id=l.course_id
    join public.course_enrollments ce on ce.profile_id=(select auth.uid())
    join public.courses enrolled_course on enrolled_course.id=ce.course_id
    where a.id=asset_id
      and a.status='active'
      and ce.status in ('active','completed')
      and (
        content_course.id=enrolled_course.id
        or (
          content_course.translation_key is not null
          and content_course.translation_key=enrolled_course.translation_key
        )
      )
  )
);

create or replace function app_private.protect_progress_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_table_name='lesson_progress' then
    if old.profile_id is distinct from new.profile_id
       or old.lesson_id is distinct from new.lesson_id then
      raise exception 'Lesson progress identity cannot be changed.';
    end if;
  elsif tg_table_name='media_progress' then
    if old.profile_id is distinct from new.profile_id
       or old.asset_id is distinct from new.asset_id then
      raise exception 'Media progress identity cannot be changed.';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_progress_identity()
from public, anon, authenticated;

drop trigger if exists protect_lesson_progress_identity_trigger
on public.lesson_progress;

create trigger protect_lesson_progress_identity_trigger
before update on public.lesson_progress
for each row
execute function app_private.protect_progress_identity();

drop trigger if exists protect_media_progress_identity_trigger
on public.media_progress;

create trigger protect_media_progress_identity_trigger
before update on public.media_progress
for each row
execute function app_private.protect_progress_identity();
