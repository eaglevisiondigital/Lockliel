
drop policy if exists "courses_member_read" on public.courses;
create policy "courses_member_read" on public.courses for select to authenticated
using(
 status='published'
 or exists(
   select 1 from public.course_enrollments ce
   where ce.course_id=courses.id
     and ce.profile_id=(select auth.uid())
     and ce.status in ('active','completed')
 )
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin'])
);

drop policy if exists "lessons_member_read" on public.lessons;
create policy "lessons_member_read" on public.lessons for select to authenticated
using(
 exists(
   select 1 from public.courses c
   where c.id=lessons.course_id
     and (
       c.status='published'
       or exists(
         select 1 from public.course_enrollments ce
         where ce.course_id=c.id
           and ce.profile_id=(select auth.uid())
           and ce.status in ('active','completed')
       )
       or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin'])
     )
 )
);

create or replace function app_private.ensure_grip_enrollment()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare cid uuid;
begin
 select id into cid from public.courses where slug='getting-a-grip-on-the-basics' limit 1;
 if cid is not null then
   insert into public.course_enrollments(profile_id,course_id,status)
   values(new.profile_id,cid,'active')
   on conflict(profile_id,course_id) do nothing;
 end if;
 return new;
end;
$$;
revoke all on function app_private.ensure_grip_enrollment() from public,anon,authenticated;

drop trigger if exists on_faith_profile_enroll_grip on public.faith_profiles;
create trigger on_faith_profile_enroll_grip
after insert or update on public.faith_profiles
for each row execute function app_private.ensure_grip_enrollment();

create policy "enrollment_self_read_2" on public.course_enrollments for select to authenticated
using(profile_id=(select auth.uid()));
