create or replace function app_private.normalize_group_membership_dates()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status='active' then
    new.left_at:=null;
  elsif tg_op='UPDATE'
        and old.status='active'
        and new.status<>'active'
        and new.left_at is null then
    new.left_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_group_membership_dates()
from public, anon, authenticated;

drop trigger if exists normalize_group_membership_dates_trigger
on public.group_members;

create trigger normalize_group_membership_dates_trigger
before insert or update of status, left_at on public.group_members
for each row
execute function app_private.normalize_group_membership_dates();
