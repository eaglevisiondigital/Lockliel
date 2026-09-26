
drop policy if exists "referral_links_self_all" on public.referral_links;
create policy "referral_links_combined_read" on public.referral_links for select to authenticated
using(owner_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin']));
create policy "referral_links_owner_insert" on public.referral_links for insert to authenticated
with check(owner_id=(select auth.uid()));
create policy "referral_links_owner_update" on public.referral_links for update to authenticated
using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "referral_links_owner_delete" on public.referral_links for delete to authenticated
using(owner_id=(select auth.uid()));

drop policy if exists "referral_events_owner_read" on public.referral_events;
create policy "referral_events_combined_read" on public.referral_events for select to authenticated
using(
 exists(select 1 from public.referral_links rl where rl.id=referral_link_id and rl.owner_id=(select auth.uid()))
 or app_private.has_staff_role(array['super_admin','admin'])
);

drop policy if exists "profile_tags_self_read" on public.profile_tags;
create policy "profile_tags_combined_read" on public.profile_tags for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));
