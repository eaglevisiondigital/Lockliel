
drop policy if exists "enrollment_self_read" on public.course_enrollments;
drop policy if exists "enrollment_self_read_2" on public.course_enrollments;
drop policy if exists "enrollments_staff_read" on public.course_enrollments;
create policy "enrollments_combined_read" on public.course_enrollments for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));

drop policy if exists "entitlements_self_read" on public.entitlements;
drop policy if exists "entitlements_staff_read" on public.entitlements;
create policy "entitlements_combined_read" on public.entitlements for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','finance_admin','content_admin']));

drop policy if exists "faith_profile_self_read" on public.faith_profiles;
drop policy if exists "faith_profiles_staff_read" on public.faith_profiles;
create policy "faith_profiles_combined_read" on public.faith_profiles for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));

drop policy if exists "followup_assignee_read" on public.follow_up_tasks;
drop policy if exists "followup_staff_read" on public.follow_up_tasks;
create policy "followup_combined_read" on public.follow_up_tasks for select to authenticated
using(assigned_to=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));

drop policy if exists "followup_assignee_update" on public.follow_up_tasks;
drop policy if exists "followup_staff_update" on public.follow_up_tasks;
create policy "followup_combined_update" on public.follow_up_tasks for update to authenticated
using(assigned_to=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
with check(assigned_to=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));

drop policy if exists "f50_self_read" on public.founders50_applications;
drop policy if exists "founders50_staff_read" on public.founders50_applications;
create policy "founders50_combined_read" on public.founders50_applications for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));

drop policy if exists "gifts_self_read" on public.gifts;
drop policy if exists "gifts_finance_read" on public.gifts;
create policy "gifts_combined_read" on public.gifts for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','finance_admin']));

drop policy if exists "group_members_self_read" on public.group_members;
drop policy if exists "group_members_staff_read" on public.group_members;
create policy "group_members_combined_read" on public.group_members for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));

drop policy if exists "groups_member_read" on public.groups;
drop policy if exists "groups_staff_read" on public.groups;
create policy "groups_combined_read" on public.groups for select to authenticated
using(
 exists(select 1 from public.group_members gm where gm.group_id=groups.id and gm.profile_id=(select auth.uid()))
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
);

drop policy if exists "progress_self_read" on public.lesson_progress;
drop policy if exists "progress_staff_read" on public.lesson_progress;
create policy "progress_combined_read" on public.lesson_progress for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));

drop policy if exists "commitment_self_read" on public.partner_commitments;
drop policy if exists "commitments_finance_read" on public.partner_commitments;
create policy "commitments_combined_read" on public.partner_commitments for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','finance_admin']));

drop policy if exists "profile_self_read" on public.profiles;
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_combined_read" on public.profiles for select to authenticated
using(id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin']));

drop policy if exists "staff_roles_self_read" on public.staff_roles;
drop policy if exists "staff_roles_superadmin_read" on public.staff_roles;
create policy "staff_roles_combined_read" on public.staff_roles for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin']));

drop policy if exists "conversation_members_self_read" on public.conversation_members;
drop policy if exists "conversation_members_conversation_read" on public.conversation_members;
create policy "conversation_members_combined_read" on public.conversation_members for select to authenticated
using(app_private.is_conversation_member(conversation_id));
