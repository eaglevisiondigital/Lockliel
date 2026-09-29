drop policy if exists courses_member_read
on public.courses;

create policy courses_member_read
on public.courses
for select
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin','content_admin']
  )
  or (
    status='published'
    and exists(
      select 1
      from public.course_enrollments ce
      join public.courses enrolled_course
        on enrolled_course.id=ce.course_id
      where ce.profile_id=(select auth.uid())
        and ce.status in ('active','completed')
        and (
          courses.id=enrolled_course.id
          or (
            courses.translation_key is not null
            and courses.translation_key=enrolled_course.translation_key
          )
        )
    )
  )
);
