alter table public.connection_requests
  drop constraint if exists connection_requests_status_check,
  add constraint connection_requests_status_check
    check (status in ('open','in_progress','resolved','closed','cancelled'));

create or replace function app_private.normalize_connection_request_resolution()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status in ('resolved','closed','cancelled') then
    new.resolved_at:=coalesce(old.resolved_at,now());
  elsif new.status in ('open','in_progress') then
    new.resolved_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_connection_request_resolution()
from public, anon, authenticated;
