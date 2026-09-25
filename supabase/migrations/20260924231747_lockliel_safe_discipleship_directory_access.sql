
drop policy if exists "connection_cards_allowed_read" on public.profile_connection_cards;
create policy "connection_cards_allowed_read" on public.profile_connection_cards for select to authenticated
using(
 profile_id=(select auth.uid())
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
 or exists(
  select 1 from public.contact_permissions cp
  where cp.revoked_at is null
    and (
      (cp.profile_id=profile_connection_cards.profile_id and cp.other_profile_id=(select auth.uid()))
      or
      (cp.other_profile_id=profile_connection_cards.profile_id and cp.profile_id=(select auth.uid()))
    )
 )
);
