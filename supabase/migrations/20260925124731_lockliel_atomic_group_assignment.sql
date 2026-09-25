create or replace function public.lockliel_assign_member_to_group(
  member_uuid uuid,
  group_uuid uuid,
  request_uuid uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  target_status text;
  request_row public.connection_requests%rowtype;
begin
  if not app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  ) then
    raise exception 'Group administration access required';
  end if;

  if member_uuid is null or group_uuid is null then
    raise exception 'Group and member are required.';
  end if;

  select g.status
    into target_status
  from public.groups g
  where g.id=group_uuid
  for update;

  if target_status is null
     or target_status not in ('forming','active') then
    raise exception 'Target group is not available for assignment.';
  end if;

  if request_uuid is not null then
    select *
      into request_row
    from public.connection_requests
    where id=request_uuid
      and requester_id=member_uuid
      and request_type='find_local_group'
      and status='open'
    for update;

    if request_row.id is null then
      raise exception 'Open group request not found for this member.';
    end if;
  end if;

  insert into public.group_members(
    group_id,
    profile_id,
    role,
    status,
    left_at
  )
  values(
    group_uuid,
    member_uuid,
    'participant',
    'active',
    null
  )
  on conflict(group_id,profile_id)
  do update set
    role='participant',
    status='active',
    left_at=null;

  if request_uuid is not null then
    update public.connection_requests
    set status='resolved'
    where id=request_row.id
      and status='open';

    if not found then
      raise exception 'Group request changed before resolution.';
    end if;
  end if;

  return jsonb_build_object(
    'ok',true,
    'group_id',group_uuid,
    'member_id',member_uuid,
    'request_id',request_uuid
  );
end;
$function$;

revoke execute on function public.lockliel_assign_member_to_group(uuid,uuid,uuid)
from public, anon;

grant execute on function public.lockliel_assign_member_to_group(uuid,uuid,uuid)
to authenticated;
