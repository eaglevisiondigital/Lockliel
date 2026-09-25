
create index idx_profiles_inviter on public.profiles(original_inviter_id);
create index idx_profiles_leader on public.profiles(current_leader_id);
create index idx_profile_tags_tag on public.profile_tags(tag_id);
create index idx_referral_links_owner on public.referral_links(owner_id);
create index idx_referral_events_link on public.referral_events(referral_link_id);
create index idx_referral_events_member on public.referral_events(member_id);
create index idx_f50_profile on public.founders50_applications(profile_id);
create index idx_groups_leader on public.groups(leader_id);
create index idx_group_members_profile on public.group_members(profile_id);
create index idx_enrollments_course on public.course_enrollments(course_id);
create index idx_progress_lesson on public.lesson_progress(lesson_id);
create index idx_commitments_profile on public.partner_commitments(profile_id);
create index idx_gifts_profile on public.gifts(profile_id);
create index idx_entitlements_product on public.entitlements(product_id);
create index idx_followup_subject on public.follow_up_tasks(subject_profile_id);
create index idx_followup_assignee on public.follow_up_tasks(assigned_to);
create index idx_contact_other on public.contact_permissions(other_profile_id);

create policy "groups_member_read" on public.groups for select to authenticated
using (exists(select 1 from public.group_members gm where gm.group_id=id and gm.profile_id=(select auth.uid())));
create policy "group_members_self_read" on public.group_members for select to authenticated
using (profile_id=(select auth.uid()));
create policy "f50_self_read" on public.founders50_applications for select to authenticated
using (profile_id=(select auth.uid()));
create policy "followup_assignee_read" on public.follow_up_tasks for select to authenticated
using (assigned_to=(select auth.uid()));
