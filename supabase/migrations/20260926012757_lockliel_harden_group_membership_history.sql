alter table public.group_members
  add constraint group_members_left_after_join
    check (left_at is null or left_at>=joined_at),
  add constraint group_members_status_left_at_consistency
    check (
      (status='active' and left_at is null)
      or
      (status='inactive' and left_at is not null)
    );

create or replace function app_private.normalize_group_membership_dates()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status='active' then
    new.left_at:=null;
  elsif new.status='inactive'
        and new.left_at is null then
    new.left_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_group_membership_dates()
from public,anon,authenticated;
