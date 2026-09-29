alter table public.profiles
  add constraint profiles_original_inviter_not_self
    check (original_inviter_id is null or original_inviter_id<>id),
  add constraint profiles_current_leader_not_self
    check (current_leader_id is null or current_leader_id<>id);

alter table public.reach_contacts
  add constraint reach_contacts_linked_profile_not_owner
    check (linked_profile_id is null or linked_profile_id<>owner_id);

alter table public.contact_permissions
  add constraint contact_permissions_not_self
    check (profile_id<>other_profile_id);

create or replace function app_private.guard_original_inviter_lineage()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  _invalid boolean:=false;
begin
  if tg_op='UPDATE'
     and new.original_inviter_id is not distinct from old.original_inviter_id then
    return new;
  end if;

  if new.original_inviter_id is null then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('lockliel:original-inviter-lineage',0)
  );

  if new.original_inviter_id=new.id then
    raise exception 'A member cannot be their own original inviter.';
  end if;

  if tg_op='UPDATE'
     and old.original_inviter_id is not null
     and new.original_inviter_id is distinct from old.original_inviter_id then
    raise exception 'Original inviter lineage cannot be reassigned once established.';
  end if;

  with recursive lineage(id,original_inviter_id,path,cycle) as (
    select
      p.id,
      p.original_inviter_id,
      array[p.id]::uuid[],
      false
    from public.profiles p
    where p.id=new.original_inviter_id

    union all

    select
      p.id,
      p.original_inviter_id,
      l.path||p.id,
      p.id=any(l.path)
    from lineage l
    join public.profiles p on p.id=l.original_inviter_id
    where l.original_inviter_id is not null
      and not l.cycle
  )
  select exists(
    select 1
    from lineage
    where id=new.id
       or cycle=true
  ) into _invalid;

  if _invalid then
    raise exception 'Original inviter lineage cannot contain a cycle.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.guard_original_inviter_lineage()
from public,anon,authenticated;

drop trigger if exists guard_original_inviter_lineage_trigger
on public.profiles;

create trigger guard_original_inviter_lineage_trigger
before insert or update of original_inviter_id
on public.profiles
for each row
execute function app_private.guard_original_inviter_lineage();


create or replace function app_private.guard_current_leader_pointer()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.current_leader_id is null then
    return new;
  end if;

  if new.current_leader_id=new.id then
    raise exception 'A member cannot be their own current leader.';
  end if;

  if not exists(
    select 1
    from public.leader_assignments la
    where la.member_id=new.id
      and la.leader_id=new.current_leader_id
      and la.status='active'
  ) then
    raise exception 'Current leader must match an active leader assignment.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.guard_current_leader_pointer()
from public,anon,authenticated;

drop trigger if exists guard_current_leader_pointer_trigger
on public.profiles;

create trigger guard_current_leader_pointer_trigger
before insert or update of current_leader_id
on public.profiles
for each row
execute function app_private.guard_current_leader_pointer();
