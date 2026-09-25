create or replace function app_private.is_active_founders50_host(
  target_profile uuid
)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select target_profile is not null
    and exists(
      select 1
      from public.founders50_applications f
      where f.profile_id=target_profile
        and f.status='active_host'
    );
$function$;

revoke execute on function app_private.is_active_founders50_host(uuid)
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

drop trigger if exists protect_active_founders_host_responsibility_trigger
on public.founders50_applications;

create trigger protect_active_founders_host_responsibility_trigger
before update of status
on public.founders50_applications
for each row
execute function app_private.protect_active_founders_host_responsibility();
