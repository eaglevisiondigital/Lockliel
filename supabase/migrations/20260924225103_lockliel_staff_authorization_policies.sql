
create or replace function app_private.has_staff_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select (select auth.uid()) is not null
    and exists(
      select 1 from public.staff_roles sr
      where sr.profile_id=(select auth.uid())
        and sr.role=any(required_roles)
    );
$$;
revoke all on function app_private.has_staff_role(text[]) from public,anon;
grant execute on function app_private.has_staff_role(text[]) to authenticated;

create policy "profiles_admin_read" on public.profiles for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));
create policy "founders50_staff_read" on public.founders50_applications for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));
create policy "founders50_staff_update" on public.founders50_applications for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']))
with check(app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));
create policy "enrollments_staff_read" on public.course_enrollments for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));
create policy "progress_staff_read" on public.lesson_progress for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));
create policy "faith_profiles_staff_read" on public.faith_profiles for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));
create policy "groups_staff_read" on public.groups for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "group_members_staff_read" on public.group_members for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "followup_staff_read" on public.follow_up_tasks for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "followup_staff_update" on public.follow_up_tasks for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "gifts_finance_read" on public.gifts for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']));
create policy "commitments_finance_read" on public.partner_commitments for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']));
create policy "entitlements_staff_read" on public.entitlements for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin','content_admin']));
create policy "staff_roles_superadmin_read" on public.staff_roles for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin']));

grant update on public.founders50_applications, public.follow_up_tasks to authenticated;
