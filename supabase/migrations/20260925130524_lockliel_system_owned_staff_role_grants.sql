revoke insert, update on table public.staff_roles
from authenticated;

grant insert (
  profile_id,
  role
) on table public.staff_roles
to authenticated;

create or replace function app_private.normalize_staff_role_grant()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.granted_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_staff_role_grant()
from public, anon, authenticated;

drop trigger if exists normalize_staff_role_grant_trigger
on public.staff_roles;

create trigger normalize_staff_role_grant_trigger
before insert on public.staff_roles
for each row
execute function app_private.normalize_staff_role_grant();
