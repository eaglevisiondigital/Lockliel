
create policy "communication_preferences_self_insert" on public.communication_preferences for insert to authenticated
with check(profile_id=(select auth.uid()));
grant insert on public.communication_preferences to authenticated;
