alter table public.group_members
  drop constraint if exists group_members_role_check,
  add constraint group_members_role_check
    check (role in ('participant','host','leader'));

alter table public.group_members
  drop constraint if exists group_members_status_check,
  add constraint group_members_status_check
    check (status in ('active','inactive'));

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

  if not exists(
    select 1
    from public.leader_profiles lp
    where lp.profile_id=new.profile_id
      and lp.active=true
      and lp.leader_type in ('group_leader','regional_leader')
  ) then
    raise exception 'Group leader and host roles require an active approved group-leader profile.';
  end if;

  if new.role='leader' then
    select g.leader_id
      into group_leader
    from public.groups g
    where g.id=new.group_id;

    if group_leader is distinct from new.profile_id then
      raise exception 'The leader membership must match the group leader assignment.';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_group_leadership_membership()
from public, anon, authenticated;

drop trigger if exists validate_group_leadership_membership_trigger
on public.group_members;

create trigger validate_group_leadership_membership_trigger
before insert or update of profile_id, role, status
on public.group_members
for each row
execute function app_private.validate_group_leadership_membership();

create or replace function app_private.sync_group_primary_leader_membership()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and old.leader_id is distinct from new.leader_id
     and old.leader_id is not null then
    update public.group_members
    set role='participant'
    where group_id=new.id
      and profile_id=old.leader_id
      and role='leader';
  end if;

  if new.leader_id is not null then
    insert into public.group_members(
      group_id,profile_id,role,status,left_at
    )
    values(
      new.id,new.leader_id,'leader','active',null
    )
    on conflict(group_id,profile_id)
    do update set
      role='leader',
      status='active',
      left_at=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_group_primary_leader_membership()
from public, anon, authenticated;

drop trigger if exists sync_group_primary_leader_membership_trigger
on public.groups;

create trigger sync_group_primary_leader_membership_trigger
after insert or update of leader_id
on public.groups
for each row
execute function app_private.sync_group_primary_leader_membership();
