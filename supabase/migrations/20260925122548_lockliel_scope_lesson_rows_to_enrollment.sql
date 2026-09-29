drop policy if exists lessons_member_read
on public.lessons;

create policy lessons_member_read
on public.lessons
for select
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin','content_admin']
  )
  or exists(
    select 1
    from public.courses content_course
    join public.course_enrollments ce
      on ce.profile_id=(select auth.uid())
     and ce.status in ('active','completed')
    join public.courses enrolled_course
      on enrolled_course.id=ce.course_id
    where content_course.id=lessons.course_id
      and content_course.status='published'
      and (
        content_course.id=enrolled_course.id
        or (
          content_course.translation_key is not null
          and content_course.translation_key=enrolled_course.translation_key
        )
      )
  )
);
