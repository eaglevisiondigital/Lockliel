create or replace function app_private.shares_group(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
 select (select auth.uid()) is not null and exists(
   select 1
   from public.group_members mine
   join public.group_members theirs on theirs.group_id=mine.group_id
   where mine.profile_id=(select auth.uid())
     and mine.status='active'
     and theirs.profile_id=target_profile
     and theirs.status='active'
 );
$function$;

revoke execute on function app_private.shares_group(uuid)
from public, anon, authenticated;

grant execute on function app_private.shares_group(uuid)
to authenticated;

create or replace function app_private.is_group_leader(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
 select (select auth.uid()) is not null and exists(
   select 1
   from public.groups g
   where g.id=target_group
     and g.status in ('forming','active')
     and (
       g.leader_id=(select auth.uid())
       or exists(
         select 1
         from public.group_members gm
         where gm.group_id=g.id
           and gm.profile_id=(select auth.uid())
           and gm.role in ('leader','host')
           and gm.status='active'
       )
     )
 );
$function$;

revoke execute on function app_private.is_group_leader(uuid)
from public, anon, authenticated;

grant execute on function app_private.is_group_leader(uuid)
to authenticated;

drop policy if exists groups_combined_read
on public.groups;

create policy groups_combined_read
on public.groups
for select
to authenticated
using (
  (
    status in ('forming','active')
    and exists(
      select 1
      from public.group_members gm
      where gm.group_id=groups.id
        and gm.profile_id=(select auth.uid())
        and gm.status='active'
    )
  )
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);
