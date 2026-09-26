revoke insert, update on table public.groups from authenticated;

grant insert (
  name,
  leader_id,
  city,
  region,
  country,
  status,
  language_code
) on table public.groups to authenticated;

grant update (
  name,
  leader_id,
  city,
  region,
  country,
  status,
  language_code
) on table public.groups to authenticated;

drop policy if exists groups_staff_update
on public.groups;

create policy groups_staff_update
on public.groups
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

create or replace function app_private.protect_group_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and (
       old.id is distinct from new.id
       or old.created_at is distinct from new.created_at
     ) then
    raise exception 'Group identity fields cannot be changed after creation.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_group_identity()
from public, anon, authenticated;

drop trigger if exists protect_group_identity_trigger
on public.groups;

create trigger protect_group_identity_trigger
before update on public.groups
for each row
execute function app_private.protect_group_identity();
