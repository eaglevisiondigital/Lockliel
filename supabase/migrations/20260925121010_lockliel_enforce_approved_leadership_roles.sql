create or replace function app_private.leader_type_allows_assignment(
  leader_type text,
  assignment_type text
)
returns boolean
language sql
immutable
set search_path to ''
as $function$
  select case assignment_type
    when 'mentor' then leader_type in ('mentor','discipleship_leader','regional_leader')
    when 'group_leader' then leader_type in ('group_leader','regional_leader')
    when 'founders_coach' then leader_type in ('founders_coach','regional_leader')
    when 'discipleship_leader' then leader_type in ('discipleship_leader','regional_leader')
    when 'regional_leader' then leader_type='regional_leader'
    else false
  end;
$function$;

revoke execute on function app_private.leader_type_allows_assignment(text,text)
from public, anon, authenticated;

create or replace function app_private.validate_leader_assignment_approval()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  approved_type text;
begin
  if new.status<>'active' then
    return new;
  end if;

  if new.member_id=new.leader_id then
    raise exception 'A member cannot be assigned as their own leader.';
  end if;

  select lp.leader_type
    into approved_type
  from public.leader_profiles lp
  where lp.profile_id=new.leader_id
    and lp.active=true
  limit 1;

  if approved_type is null then
    raise exception 'Leader assignments require an active approved leader profile.';
  end if;

  if not app_private.leader_type_allows_assignment(
    approved_type,
    new.assignment_type
  ) then
    raise exception 'The approved leader type does not support this assignment type.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_leader_assignment_approval()
from public, anon, authenticated;

drop trigger if exists validate_leader_assignment_approval_trigger
on public.leader_assignments;

create trigger validate_leader_assignment_approval_trigger
before insert or update of leader_id, assignment_type, status
on public.leader_assignments
for each row
execute function app_private.validate_leader_assignment_approval();

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

  if not exists(
    select 1
    from public.leader_profiles lp
    where lp.profile_id=new.leader_id
      and lp.active=true
      and lp.leader_type in ('group_leader','regional_leader')
  ) then
    raise exception 'Group leaders must have an active approved group-leader profile.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_group_leader_approval()
from public, anon, authenticated;

drop trigger if exists validate_group_leader_approval_trigger
on public.groups;

create trigger validate_group_leader_approval_trigger
before insert or update of leader_id
on public.groups
for each row
execute function app_private.validate_group_leader_approval();
