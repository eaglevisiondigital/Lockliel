
create or replace function app_private.shares_group(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
 select (select auth.uid()) is not null and exists(
   select 1
   from public.group_members mine
   join public.group_members theirs on theirs.group_id=mine.group_id
   where mine.profile_id=(select auth.uid())
     and mine.status='active'
     and theirs.profile_id=target_profile
     and theirs.status='active'
 );
$$;
revoke all on function app_private.shares_group(uuid) from public,anon;
grant execute on function app_private.shares_group(uuid) to authenticated;

drop policy if exists "group_members_combined_read" on public.group_members;
create policy "group_members_combined_read" on public.group_members for select to authenticated
using(
 profile_id=(select auth.uid())
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
 or app_private.shares_group(profile_id)
);

drop policy if exists "connection_cards_allowed_read" on public.profile_connection_cards;
create policy "connection_cards_allowed_read" on public.profile_connection_cards for select to authenticated
using(
 profile_id=(select auth.uid())
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
 or app_private.shares_group(profile_id)
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
