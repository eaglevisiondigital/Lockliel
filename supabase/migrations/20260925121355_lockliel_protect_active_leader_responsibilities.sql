create or replace function app_private.protect_active_leader_responsibilities()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.active=true and new.active=false then
    if exists(
      select 1
      from public.leader_assignments la
      where la.leader_id=new.profile_id
        and la.status='active'
    ) then
      raise exception 'Reassign active members before deactivating this leader.';
    end if;

    if exists(
      select 1
      from public.groups g
      where g.leader_id=new.profile_id
        and g.status in ('forming','active')
    ) then
      raise exception 'Reassign active groups before deactivating this leader.';
    end if;
  end if;

  if old.leader_type is distinct from new.leader_type then
    if exists(
      select 1
      from public.leader_assignments la
      where la.leader_id=new.profile_id
        and la.status='active'
        and not app_private.leader_type_allows_assignment(
          new.leader_type,
          la.assignment_type
        )
    ) then
      raise exception 'The new leader type is incompatible with an active member assignment.';
    end if;

    if new.leader_type not in ('group_leader','regional_leader')
       and exists(
         select 1
         from public.groups g
         where g.leader_id=new.profile_id
           and g.status in ('forming','active')
       ) then
      raise exception 'This leader still leads an active group and must retain a group-leader compatible role.';
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.protect_active_leader_responsibilities()
from public, anon, authenticated;

drop trigger if exists protect_active_leader_responsibilities_trigger
on public.leader_profiles;

create trigger protect_active_leader_responsibilities_trigger
before update of active, leader_type, city, region, country, capacity, language_code
on public.leader_profiles
for each row
execute function app_private.protect_active_leader_responsibilities();

create or replace function app_private.audit_leader_profile_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if tg_op='INSERT' then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      coalesce((select auth.uid()),new.approved_by),
      'leader_profile_approved',
      'leader_profile',
      new.profile_id::text,
      'Leader profile approved',
      jsonb_build_object(
        'leader_type',new.leader_type,
        'active',new.active
      )
    );
  elsif old.leader_type is distinct from new.leader_type
     or old.active is distinct from new.active
     or old.capacity is distinct from new.capacity
     or old.city is distinct from new.city
     or old.region is distinct from new.region
     or old.country is distinct from new.country
     or old.language_code is distinct from new.language_code then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'leader_profile_changed',
      'leader_profile',
      new.profile_id::text,
      'Leader profile changed',
      jsonb_build_object(
        'leader_type_from',old.leader_type,
        'leader_type_to',new.leader_type,
        'active_from',old.active,
        'active_to',new.active,
        'capacity_from',old.capacity,
        'capacity_to',new.capacity
      )
    );
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.audit_leader_profile_change()
from public, anon, authenticated;

drop trigger if exists audit_leader_profile_change_trigger
on public.leader_profiles;

create trigger audit_leader_profile_change_trigger
after insert or update on public.leader_profiles
for each row
execute function app_private.audit_leader_profile_change();
