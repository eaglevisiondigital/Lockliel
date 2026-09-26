
create policy "referral_events_owner_read" on public.referral_events for select to authenticated
using (exists(select 1 from public.referral_links rl where rl.id=referral_link_id and rl.owner_id=(select auth.uid())));
