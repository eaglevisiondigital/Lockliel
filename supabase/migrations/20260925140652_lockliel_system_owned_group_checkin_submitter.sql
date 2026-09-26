revoke insert on table public.group_weekly_checkins from authenticated;

grant insert (
  group_id,
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

create or replace function app_private.normalize_group_weekly_checkin()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='INSERT' then
    new.submitted_by:=(select auth.uid());
  else
    if old.group_id is distinct from new.group_id
       or old.week_start is distinct from new.week_start then
      raise exception 'Weekly check-in identity cannot be changed.';
    end if;

    new.submitted_by:=old.submitted_by;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_group_weekly_checkin()
from public, anon, authenticated;
