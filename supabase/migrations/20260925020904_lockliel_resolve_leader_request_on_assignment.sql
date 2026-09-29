
create or replace function app_private.resolve_leader_request_on_assignment()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.status='active' then
    update public.connection_requests
    set status='resolved',
        resolved_at=now()
    where requester_id=new.member_id
      and request_type='connect_with_leader'
      and status='open';
  end if;
  return new;
end;
$$;

revoke all on function app_private.resolve_leader_request_on_assignment()
from public,anon,authenticated;

drop trigger if exists resolve_leader_request_on_assignment_trigger
on public.leader_assignments;

create trigger resolve_leader_request_on_assignment_trigger
after insert or update of leader_id,status
on public.leader_assignments
for each row execute function app_private.resolve_leader_request_on_assignment();
