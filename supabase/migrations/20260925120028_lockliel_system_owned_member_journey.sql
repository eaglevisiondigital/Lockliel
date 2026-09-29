drop policy if exists member_journey_self_update
on public.member_journey;

revoke all privileges on table public.member_journey from anon;
revoke insert, update, delete on table public.member_journey from authenticated;

grant select on table public.member_journey to authenticated;
