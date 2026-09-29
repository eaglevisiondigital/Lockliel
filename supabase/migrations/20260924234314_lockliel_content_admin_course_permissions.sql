
create policy "courses_staff_update" on public.courses for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));
create policy "lessons_staff_insert" on public.lessons for insert to authenticated
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));
create policy "lessons_staff_update" on public.lessons for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));
grant update on public.courses to authenticated;
grant insert,update on public.lessons to authenticated;
