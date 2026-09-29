revoke insert, update on table public.group_weekly_checkins from authenticated;

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

alter table public.group_weekly_checkins
  drop constraint if exists group_weekly_checkins_week_start_monday,
  add constraint group_weekly_checkins_week_start_monday
    check (extract(isodow from week_start)=1);

alter table public.group_weekly_checkins
  drop constraint if exists group_weekly_checkins_testimony_length,
  add constraint group_weekly_checkins_testimony_length
    check (testimony is null or char_length(testimony)<=5000);

alter table public.group_weekly_checkins
  drop constraint if exists group_weekly_checkins_needs_support_length,
  add constraint group_weekly_checkins_needs_support_length
    check (needs_support is null or char_length(needs_support)<=5000);

create or replace function app_private.normalize_group_weekly_checkin()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' then
    if old.group_id is distinct from new.group_id
       or old.submitted_by is distinct from new.submitted_by
       or old.week_start is distinct from new.week_start then
      raise exception 'Weekly check-in identity and week cannot be changed.';
    end if;
    new.created_at:=old.created_at;
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
