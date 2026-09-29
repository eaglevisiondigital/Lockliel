revoke insert, update on table public.group_members from authenticated;

grant insert (
  group_id,
  profile_id,
  role,
  status,
  left_at
) on table public.group_members to authenticated;

grant update (
  role,
  status,
  left_at
) on table public.group_members to authenticated;

create or replace function app_private.protect_group_membership_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and (
       old.group_id is distinct from new.group_id
       or old.profile_id is distinct from new.profile_id
       or old.joined_at is distinct from new.joined_at
     ) then
    raise exception 'Group membership identity cannot be changed after creation.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_group_membership_identity()
from public, anon, authenticated;

drop trigger if exists protect_group_membership_identity_trigger
on public.group_members;

create trigger protect_group_membership_identity_trigger
before update on public.group_members
for each row
execute function app_private.protect_group_membership_identity();
