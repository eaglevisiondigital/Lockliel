create or replace function app_private.audit_group_record_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
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
      (select auth.uid()),
      'group_created',
      'group',
      new.id::text,
      'Lockliel group created',
      jsonb_build_object(
        'leader_id',new.leader_id,
        'status',new.status,
        'language_code',new.language_code
      )
    );
    return new;
  end if;

  if old.name is not distinct from new.name
     and old.leader_id is not distinct from new.leader_id
     and old.city is not distinct from new.city
     and old.region is not distinct from new.region
     and old.country is not distinct from new.country
     and old.status is not distinct from new.status
     and old.language_code is not distinct from new.language_code then
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
    (select auth.uid()),
    'group_changed',
    'group',
    new.id::text,
    'Lockliel group changed',
    jsonb_build_object(
      'leader_id_from',old.leader_id,
      'leader_id_to',new.leader_id,
      'status_from',old.status,
      'status_to',new.status,
      'name_changed',old.name is distinct from new.name,
      'location_changed',
        old.city is distinct from new.city
        or old.region is distinct from new.region
        or old.country is distinct from new.country,
      'language_changed',old.language_code is distinct from new.language_code
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_group_record_change()
from public, anon, authenticated;

drop trigger if exists audit_group_record_change_trigger
on public.groups;

create trigger audit_group_record_change_trigger
after insert or update of
  name,
  leader_id,
  city,
  region,
  country,
  status,
  language_code
on public.groups
for each row
execute function app_private.audit_group_record_change();
