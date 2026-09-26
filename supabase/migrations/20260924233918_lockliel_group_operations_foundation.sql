
create policy "groups_staff_insert" on public.groups for insert to authenticated
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "groups_staff_update" on public.groups for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']) or leader_id=(select auth.uid()))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']) or leader_id=(select auth.uid()));

create policy "group_members_staff_insert" on public.group_members for insert to authenticated
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "group_members_staff_update" on public.group_members for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));

grant insert,update on public.groups,public.group_members to authenticated;

create or replace function app_private.audit_group_membership()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values((select auth.uid()),'group_member_added','group',new.group_id::text,'Member added to Lockliel group',
   jsonb_build_object('profile_id',new.profile_id,'role',new.role,'status',new.status));
 return new;
end;
$$;
revoke all on function app_private.audit_group_membership() from public,anon,authenticated;
drop trigger if exists audit_group_membership_trigger on public.group_members;
create trigger audit_group_membership_trigger after insert on public.group_members
for each row execute function app_private.audit_group_membership();
