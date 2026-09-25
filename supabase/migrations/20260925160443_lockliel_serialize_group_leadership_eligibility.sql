
create or replace function app_private.protect_active_leader_responsibilities()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if (old.active=true and new.active=false)
     or old.leader_type is distinct from new.leader_type then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(new.profile_id::text,0)
    );
  end if;

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

    if exists(
      select 1
      from public.group_members gm
      join public.groups g on g.id=gm.group_id
      where gm.profile_id=new.profile_id
        and gm.status='active'
        and gm.role in ('leader','host')
        and g.status in ('forming','active')
    ) then
      raise exception 'Reassign active group leadership or hosting before deactivating this leader.';
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

    if new.leader_type not in ('group_leader','regional_leader')
       and exists(
         select 1
         from public.group_members gm
         join public.groups g on g.id=gm.group_id
         where gm.profile_id=new.profile_id
           and gm.status='active'
           and gm.role in ('leader','host')
           and g.status in ('forming','active')
       ) then
      raise exception 'This leader still has active group leadership or hosting responsibilities and must retain a group-leader compatible role.';
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.protect_active_leader_responsibilities()
from public, anon, authenticated;

create or replace function app_private.validate_group_leader_approval()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.leader_id is null then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.leader_id::text,0)
  );

  if not (
    exists(
      select 1
      from public.leader_profiles lp
      where lp.profile_id=new.leader_id
        and lp.active=true
        and lp.leader_type in ('group_leader','regional_leader')
    )
    or app_private.is_active_founders50_host(new.leader_id)
  ) then
    raise exception
      'Group leaders must be an approved group/regional leader or an active Founders 50 host.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_group_leader_approval()
from public, anon, authenticated;

create or replace function app_private.validate_group_leadership_membership()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  group_leader uuid;
begin
  if new.role not in ('leader','host') then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.profile_id::text,0)
  );

  if not (
    exists(
      select 1
      from public.leader_profiles lp
      where lp.profile_id=new.profile_id
        and lp.active=true
        and lp.leader_type in ('group_leader','regional_leader')
    )
    or app_private.is_active_founders50_host(new.profile_id)
  ) then
    raise exception
      'Group leader and host roles require approved group leadership or active Founders 50 host status.';
  end if;

  if new.role='leader' then
    select g.leader_id
      into group_leader
    from public.groups g
    where g.id=new.group_id;

    if group_leader is distinct from new.profile_id then
      raise exception
        'The leader membership must match the group leader assignment.';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_group_leadership_membership()
from public, anon, authenticated;

create or replace function app_private.protect_active_founders_host_responsibility()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status='active_host'
     and new.status<>'active_host'
     and old.profile_id is not null then

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(old.profile_id::text,0)
    );

    if exists(
      select 1
      from public.groups g
      where g.leader_id=old.profile_id
        and g.status in ('forming','active')
    )
    or exists(
      select 1
      from public.group_members gm
      join public.groups g on g.id=gm.group_id
      where gm.profile_id=old.profile_id
        and gm.status='active'
        and gm.role in ('leader','host')
        and g.status in ('forming','active')
    ) then
      raise exception
        'Reassign active group leadership before removing this Founders 50 active-host status.';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_active_founders_host_responsibility()
from public, anon, authenticated;
