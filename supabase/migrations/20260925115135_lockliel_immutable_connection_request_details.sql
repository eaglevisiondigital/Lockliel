revoke insert, update on table public.connection_requests from authenticated;

grant insert (
  requester_id,
  requested_person_id,
  requested_group_id,
  request_type,
  status,
  message
) on table public.connection_requests to authenticated;

grant update (
  status
) on table public.connection_requests to authenticated;

drop policy if exists connection_request_self_insert on public.connection_requests;

create policy connection_request_self_insert
on public.connection_requests
for insert
to authenticated
with check (
  requester_id = (select auth.uid())
  and status = 'open'
);

create or replace function app_private.normalize_connection_request_resolution()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status in ('resolved','closed','cancelled') then
    new.resolved_at:=coalesce(old.resolved_at,now());
  elsif new.status='open' then
    new.resolved_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_connection_request_resolution()
from public, anon, authenticated;

drop trigger if exists normalize_connection_request_resolution_trigger
on public.connection_requests;

create trigger normalize_connection_request_resolution_trigger
before update of status on public.connection_requests
for each row
execute function app_private.normalize_connection_request_resolution();
