create or replace function app_private.protect_super_admin_delete()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  super_admin_count integer;
begin
  if old.role<>'super_admin' then
    return old;
  end if;

  if (select auth.uid()) is not null
     and (select auth.uid())=old.profile_id then
    raise exception 'A super administrator cannot remove their own super administrator role.';
  end if;

  select count(*)::integer
    into super_admin_count
  from public.staff_roles
  where role='super_admin';

  if super_admin_count<=1 then
    raise exception 'Lockliel must retain at least one super administrator.';
  end if;

  return old;
end;
$function$;

revoke execute on function app_private.protect_super_admin_delete()
from public, anon, authenticated;

drop trigger if exists protect_super_admin_delete_trigger
on public.staff_roles;

create trigger protect_super_admin_delete_trigger
before delete on public.staff_roles
for each row
execute function app_private.protect_super_admin_delete();
