revoke all privileges on table public.group_weekly_checkins from anon;
revoke insert, update, delete on table public.group_weekly_checkins from authenticated;

grant select on table public.group_weekly_checkins to authenticated;

grant insert (
  group_id,
  submitted_by,
  week_start,
  gathered,
  attendance_count,
  faith_boosts_used,
  people_shared_with,
  new_people_count,
  next_leader_identified,
  testimony,
  needs_support
) on table public.group_weekly_checkins to authenticated;

grant update (
  gathered,
  attendance_count,
  faith_boosts_used,
  people_shared_with,
  new_people_count,
  next_leader_identified,
  testimony,
  needs_support
) on table public.group_weekly_checkins to authenticated;

drop policy if exists group_checkins_leader_update
on public.group_weekly_checkins;

create policy group_checkins_leader_update
on public.group_weekly_checkins
for update
to authenticated
using (
  app_private.is_group_leader(group_id)
)
with check (
  app_private.is_group_leader(group_id)
);

create or replace function app_private.normalize_group_weekly_checkin()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' then
    if old.group_id is distinct from new.group_id
       or old.week_start is distinct from new.week_start
       or old.submitted_by is distinct from new.submitted_by then
      raise exception 'Weekly check-in identity cannot be changed.';
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_group_weekly_checkin()
from public, anon, authenticated;

drop trigger if exists normalize_group_weekly_checkin_trigger
on public.group_weekly_checkins;

create trigger normalize_group_weekly_checkin_trigger
before insert or update on public.group_weekly_checkins
for each row
execute function app_private.normalize_group_weekly_checkin();
