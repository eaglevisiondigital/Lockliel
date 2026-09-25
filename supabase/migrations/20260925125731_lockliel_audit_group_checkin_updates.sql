create or replace function app_private.audit_group_checkin()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  actor uuid;
begin
  actor:=coalesce((select auth.uid()),new.submitted_by);

  if tg_op='INSERT' then
    insert into public.audit_events(
      actor_profile_id,
      event_type,
      entity_type,
      entity_id,
      summary,
      metadata
    )
    values(
      actor,
      'group_weekly_checkin',
      'group',
      new.group_id::text,
      'Weekly group check-in submitted',
      jsonb_build_object(
        'checkin_id',new.id,
        'week_start',new.week_start,
        'gathered',new.gathered,
        'attendance_count',new.attendance_count,
        'faith_boosts_used',new.faith_boosts_used,
        'people_shared_with',new.people_shared_with,
        'new_people_count',new.new_people_count,
        'next_leader_identified',new.next_leader_identified,
        'support_requested',
          nullif(trim(coalesce(new.needs_support,'')),'') is not null
      )
    );
    return new;
  end if;

  if old.gathered is not distinct from new.gathered
     and old.attendance_count is not distinct from new.attendance_count
     and old.faith_boosts_used is not distinct from new.faith_boosts_used
     and old.people_shared_with is not distinct from new.people_shared_with
     and old.new_people_count is not distinct from new.new_people_count
     and old.next_leader_identified is not distinct from new.next_leader_identified
     and old.testimony is not distinct from new.testimony
     and old.needs_support is not distinct from new.needs_support then
    return new;
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    actor,
    'group_weekly_checkin_updated',
    'group',
    new.group_id::text,
    'Weekly group check-in updated',
    jsonb_build_object(
      'checkin_id',new.id,
      'week_start',new.week_start,
      'gathered_from',old.gathered,
      'gathered_to',new.gathered,
      'attendance_from',old.attendance_count,
      'attendance_to',new.attendance_count,
      'faith_boosts_from',old.faith_boosts_used,
      'faith_boosts_to',new.faith_boosts_used,
      'people_shared_with_from',old.people_shared_with,
      'people_shared_with_to',new.people_shared_with,
      'new_people_from',old.new_people_count,
      'new_people_to',new.new_people_count,
      'next_leader_from',old.next_leader_identified,
      'next_leader_to',new.next_leader_identified,
      'testimony_changed',old.testimony is distinct from new.testimony,
      'support_changed',old.needs_support is distinct from new.needs_support,
      'support_requested',
        nullif(trim(coalesce(new.needs_support,'')),'') is not null
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_group_checkin()
from public, anon, authenticated;

drop trigger if exists audit_group_checkin_trigger
on public.group_weekly_checkins;

create trigger audit_group_checkin_trigger
after insert or update of
  gathered,
  attendance_count,
  faith_boosts_used,
  people_shared_with,
  new_people_count,
  next_leader_identified,
  testimony,
  needs_support
on public.group_weekly_checkins
for each row
execute function app_private.audit_group_checkin();
