create or replace function public.lockliel_resolve_group_transition(
  request_uuid uuid,
  target_group_uuid uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  transition public.connection_requests%rowtype;
  membership public.group_members%rowtype;
  target_status text;
  now_at timestamptz:=now();
begin
  if not app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  ) then
    raise exception 'Group administration access required';
  end if;

  select *
    into transition
  from public.connection_requests
  where id=request_uuid
    and request_type='leave_or_change_group'
    and status='open'
  for update;

  if transition.id is null
     or transition.requester_id is null
     or transition.requested_group_id is null then
    raise exception 'Open group transition request not found.';
  end if;

  select *
    into membership
  from public.group_members
  where group_id=transition.requested_group_id
    and profile_id=transition.requester_id
    and status='active'
  for update;

  if membership.profile_id is null then
    raise exception 'Current active group membership not found.';
  end if;

  if membership.role in ('leader','host') then
    raise exception 'Reassign group leadership before moving or ending this leader/host membership.';
  end if;

  if target_group_uuid is not null
     and target_group_uuid=transition.requested_group_id then
    raise exception 'Choose a different group or end the current membership.';
  end if;

  if target_group_uuid is not null then
    select g.status
      into target_status
    from public.groups g
    where g.id=target_group_uuid
    for update;

    if target_status is null
       or target_status not in ('forming','active') then
      raise exception 'Target group is not available for assignment.';
    end if;

    insert into public.group_members(
      group_id,
      profile_id,
      role,
      status,
      left_at
    )
    values(
      target_group_uuid,
      transition.requester_id,
      'participant',
      'active',
      null
    )
    on conflict(group_id,profile_id)
    do update set
      role='participant',
      status='active',
      left_at=null;
  end if;

  update public.group_members
  set status='inactive',
      left_at=now_at
  where group_id=transition.requested_group_id
    and profile_id=transition.requester_id
    and status='active';

  if not found then
    raise exception 'Current group membership changed before this request was processed.';
  end if;

  update public.connection_requests
  set status='resolved'
  where id=transition.id
    and status='open';

  if not found then
    raise exception 'Group transition request changed before resolution.';
  end if;

  return jsonb_build_object(
    'ok',true,
    'outcome',case when target_group_uuid is null then 'ended' else 'transferred' end,
    'target_group_id',target_group_uuid,
    'member_id',transition.requester_id,
    'previous_group_id',transition.requested_group_id
  );
end;
$function$;

revoke execute on function public.lockliel_resolve_group_transition(uuid,uuid)
from public, anon;

grant execute on function public.lockliel_resolve_group_transition(uuid,uuid)
to authenticated;
