alter table public.group_members
  add column if not exists left_at timestamptz;

alter table public.connection_requests
  drop constraint if exists connection_requests_request_type_check;

alter table public.connection_requests
  add constraint connection_requests_request_type_check
  check (
    request_type = any (
      array[
        'connect_with_inviter'::text,
        'connect_with_leader'::text,
        'join_group'::text,
        'find_local_group'::text,
        'follow_up'::text,
        'explore_hosting'::text,
        'leave_or_change_group'::text
      ]
    )
  );

create or replace function app_private.audit_group_membership_change()
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
      (select auth.uid()),
      'group_membership_added',
      'group_membership',
      new.group_id::text||':'||new.profile_id::text,
      'Group membership added',
      jsonb_build_object(
        'group_id',new.group_id,
        'profile_id',new.profile_id,
        'role',new.role,
        'status',new.status
      )
    );
    return new;
  end if;

  if old.role is distinct from new.role
     or old.status is distinct from new.status
     or old.left_at is distinct from new.left_at then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'group_membership_changed',
      'group_membership',
      new.group_id::text||':'||new.profile_id::text,
      'Group membership changed',
      jsonb_build_object(
        'group_id',new.group_id,
        'profile_id',new.profile_id,
        'role_from',old.role,
        'role_to',new.role,
        'status_from',old.status,
        'status_to',new.status,
        'left_at',new.left_at
      )
    );
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.audit_group_membership_change()
from public, anon, authenticated;

drop trigger if exists audit_group_membership_change_trigger
on public.group_members;

create trigger audit_group_membership_change_trigger
after insert or update of role, status, left_at on public.group_members
for each row
execute function app_private.audit_group_membership_change();
