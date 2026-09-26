
create policy "staff_roles_superadmin_insert" on public.staff_roles for insert to authenticated
with check(app_private.has_staff_role(array['super_admin']));
create policy "staff_roles_superadmin_delete" on public.staff_roles for delete to authenticated
using(app_private.has_staff_role(array['super_admin']));
grant insert,delete on public.staff_roles to authenticated;

create or replace function app_private.audit_staff_role_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values((select auth.uid()),'staff_role_granted','staff_role',new.profile_id::text,
   'Staff role granted',
   jsonb_build_object('role',new.role));
 return new;
end;
$$;

create or replace function app_private.audit_staff_role_delete()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values((select auth.uid()),'staff_role_removed','staff_role',old.profile_id::text,
   'Staff role removed',
   jsonb_build_object('role',old.role));
 return old;
end;
$$;

revoke all on function app_private.audit_staff_role_insert() from public,anon,authenticated;
revoke all on function app_private.audit_staff_role_delete() from public,anon,authenticated;

drop trigger if exists audit_staff_role_insert_trigger on public.staff_roles;
create trigger audit_staff_role_insert_trigger after insert on public.staff_roles
for each row execute function app_private.audit_staff_role_insert();

drop trigger if exists audit_staff_role_delete_trigger on public.staff_roles;
create trigger audit_staff_role_delete_trigger after delete on public.staff_roles
for each row execute function app_private.audit_staff_role_delete();
