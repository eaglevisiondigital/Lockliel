drop policy if exists lesson_asset_storage_read
on storage.objects;

create policy lesson_asset_storage_read
on storage.objects
for select
to authenticated
using (
  bucket_id='lesson-assets'
  and (
    app_private.has_staff_role(
      array['super_admin','admin']
    )
    or exists(
      select 1
      from public.lesson_assets la
      join public.lessons content_lesson
        on content_lesson.id=la.lesson_id
      join public.courses content_course
        on content_course.id=content_lesson.course_id
      join public.course_enrollments ce
        on ce.profile_id=(select auth.uid())
       and ce.status in ('active','completed')
      join public.courses enrolled_course
        on enrolled_course.id=ce.course_id
      where la.storage_path=storage.objects.name
        and la.status='active'
        and content_course.status='published'
        and (
          content_course.id=enrolled_course.id
          or (
            content_course.translation_key is not null
            and content_course.translation_key=enrolled_course.translation_key
          )
        )
    )
  )
);

create or replace function public.lockliel_grip_readiness()
returns jsonb
language plpgsql
stable
security invoker
set search_path to ''
as $function$
declare
  course_row record;
  lesson_count int:=0;
  structured_count int:=0;
  playable_video_lessons int:=0;
  private_workbook_lessons int:=0;
  ready boolean:=false;
begin
  if not app_private.has_staff_role(
    array['super_admin','admin']
  ) then
    raise exception 'Administrator access required';
  end if;

  select c.id,c.slug,c.title,c.status
    into course_row
  from public.courses c
  where c.translation_key='getting-a-grip-on-the-basics'
  order by
    case when c.language_code='en' then 0 else 1 end,
    c.created_at
  limit 1;

  if course_row.id is null then
    return jsonb_build_object(
      'exists',false,
      'release_ready',false,
      'published',false,
      'lesson_count',0,
      'structured_lessons',0,
      'playable_video_lessons',0,
      'private_workbook_lessons',0
    );
  end if;

  select
    count(*)::int,
    count(*) filter(
      where jsonb_array_length(
        coalesce(l.worksheet_schema->'questions','[]'::jsonb)
      )>0
    )::int
  into lesson_count,structured_count
  from public.lessons l
  where l.course_id=course_row.id;

  select count(distinct a.lesson_id)::int
    into playable_video_lessons
  from public.lesson_assets a
  join public.lessons l on l.id=a.lesson_id
  where l.course_id=course_row.id
    and a.asset_type='video'
    and a.status='active'
    and lower(coalesce(a.provider,''))='youtube'
    and nullif(trim(coalesce(a.provider_ref,'')),'') is not null;

  select count(distinct a.lesson_id)::int
    into private_workbook_lessons
  from public.lesson_assets a
  join public.lessons l on l.id=a.lesson_id
  where l.course_id=course_row.id
    and a.asset_type='pdf'
    and a.status='active'
    and a.storage_path is not null
    and exists(
      select 1
      from storage.objects o
      where o.bucket_id='lesson-assets'
        and o.name=a.storage_path
    );

  ready:=
    lesson_count=13
    and structured_count=13
    and playable_video_lessons>=10
    and private_workbook_lessons=13;

  return jsonb_build_object(
    'exists',true,
    'course_id',course_row.id,
    'slug',course_row.slug,
    'title',course_row.title,
    'status',course_row.status,
    'published',course_row.status='published',
    'release_ready',ready,
    'lesson_count',lesson_count,
    'structured_lessons',structured_count,
    'playable_video_lessons',playable_video_lessons,
    'private_workbook_lessons',private_workbook_lessons
  );
end;
$function$;

revoke execute on function public.lockliel_grip_readiness()
from public, anon;

grant execute on function public.lockliel_grip_readiness()
to authenticated;
