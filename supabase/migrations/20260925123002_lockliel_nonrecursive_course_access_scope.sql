create or replace function app_private.can_read_course(
  target_course uuid,
  target_translation_key text
)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists(
    select 1
    from public.course_enrollments ce
    join public.courses enrolled_course
      on enrolled_course.id=ce.course_id
    where ce.profile_id=(select auth.uid())
      and ce.status in ('active','completed')
      and (
        enrolled_course.id=target_course
        or (
          target_translation_key is not null
          and enrolled_course.translation_key=target_translation_key
        )
      )
  );
$function$;

revoke execute on function app_private.can_read_course(uuid,text)
from public, anon;

grant execute on function app_private.can_read_course(uuid,text)
to authenticated;

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
    and app_private.can_read_course(id,translation_key)
  )
);
