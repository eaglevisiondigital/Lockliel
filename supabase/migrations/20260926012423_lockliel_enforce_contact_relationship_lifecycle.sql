create or replace function app_private.validate_contact_permission_relationship()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  _valid boolean:=false;
begin
  if new.revoked_at is not null then
    return new;
  end if;

  if new.permission_type='inviter_followup' then
    select exists(
      select 1
      from public.profiles p
      where p.id=new.profile_id
        and p.original_inviter_id=new.other_profile_id
    ) into _valid;
  elsif new.permission_type='leader_followup' then
    select exists(
      select 1
      from public.leader_assignments la
      where la.member_id=new.profile_id
        and la.leader_id=new.other_profile_id
        and la.status='active'
    ) into _valid;
  elsif new.permission_type='group_contact' then
    select exists(
      select 1
      from public.group_members a
      join public.group_members b on b.group_id=a.group_id
      join public.groups g on g.id=a.group_id
      where a.profile_id=new.profile_id
        and b.profile_id=new.other_profile_id
        and a.status='active'
        and b.status='active'
        and g.status in ('forming','active')
    ) into _valid;
  end if;

  if not _valid then
    raise exception 'Active contact permission requires a valid current relationship.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_contact_permission_relationship()
from public,anon,authenticated;

drop trigger if exists validate_contact_permission_relationship_trigger
on public.contact_permissions;

create trigger validate_contact_permission_relationship_trigger
before insert or update of profile_id,other_profile_id,permission_type,revoked_at
on public.contact_permissions
for each row
execute function app_private.validate_contact_permission_relationship();


create or replace function app_private.revoke_stale_group_contacts_for_member(
  target_profile uuid
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
begin
  update public.contact_permissions cp
  set revoked_at=now()
  where cp.permission_type='group_contact'
    and cp.revoked_at is null
    and (
      cp.profile_id=target_profile
      or cp.other_profile_id=target_profile
    )
    and not exists(
      select 1
      from public.group_members a
      join public.group_members b on b.group_id=a.group_id
      join public.groups g on g.id=a.group_id
      where a.profile_id=cp.profile_id
        and b.profile_id=cp.other_profile_id
        and a.status='active'
        and b.status='active'
        and g.status in ('forming','active')
    );
end;
$function$;

revoke execute on function app_private.revoke_stale_group_contacts_for_member(uuid)
from public,anon,authenticated;


create or replace function app_private.sync_group_contact_permission_lifecycle()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  _profile uuid;
begin
  _profile:=case when tg_op='DELETE' then old.profile_id else new.profile_id end;

  if tg_op='DELETE'
     or (
       tg_op='UPDATE'
       and old.status='active'
       and new.status<>'active'
     ) then
    perform app_private.revoke_stale_group_contacts_for_member(_profile);
  end if;

  return case when tg_op='DELETE' then old else new end;
end;
$function$;

revoke execute on function app_private.sync_group_contact_permission_lifecycle()
from public,anon,authenticated;

drop trigger if exists sync_group_contact_permission_lifecycle_trigger
on public.group_members;

create trigger sync_group_contact_permission_lifecycle_trigger
after update of status or delete
on public.group_members
for each row
execute function app_private.sync_group_contact_permission_lifecycle();


create or replace function app_private.sync_group_status_contact_permissions()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  member_row record;
begin
  if old.status in ('forming','active')
     and new.status not in ('forming','active') then
    for member_row in
      select gm.profile_id
      from public.group_members gm
      where gm.group_id=new.id
        and gm.status='active'
    loop
      perform app_private.revoke_stale_group_contacts_for_member(
        member_row.profile_id
      );
    end loop;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_group_status_contact_permissions()
from public,anon,authenticated;

drop trigger if exists sync_group_status_contact_permissions_trigger
on public.groups;

create trigger sync_group_status_contact_permissions_trigger
after update of status
on public.groups
for each row
execute function app_private.sync_group_status_contact_permissions();
