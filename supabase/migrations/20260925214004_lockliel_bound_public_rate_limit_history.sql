
create index if not exists public_rate_limits_updated_at_idx
on app_private.public_rate_limits(updated_at);

create or replace function public.consume_public_rate_limit(
  scope_input text,
  key_hash_input text,
  window_seconds integer,
  max_hits integer
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  current_hits integer;
  window_length interval;
begin
  if nullif(trim(scope_input),'') is null
     or nullif(trim(key_hash_input),'') is null
     or window_seconds<1
     or window_seconds>86400
     or max_hits<1
     or max_hits>1000 then
    return false;
  end if;

  window_length:=pg_catalog.make_interval(secs=>window_seconds);

  insert into app_private.public_rate_limits(
    scope,key_hash,window_started_at,hits,updated_at
  )
  values(
    left(scope_input,80),
    left(key_hash_input,128),
    now(),
    1,
    now()
  )
  on conflict(scope,key_hash)
  do update set
    window_started_at=case
      when app_private.public_rate_limits.window_started_at<=now()-window_length
        then now()
      else app_private.public_rate_limits.window_started_at
    end,
    hits=case
      when app_private.public_rate_limits.window_started_at<=now()-window_length
        then 1
      else app_private.public_rate_limits.hits+1
    end,
    updated_at=now()
  returning hits into current_hits;

  if current_hits=1
     and left(key_hash_input,1)='0' then
    delete from app_private.public_rate_limits r
    where (r.scope,r.key_hash) in (
      select stale.scope,stale.key_hash
      from app_private.public_rate_limits stale
      where stale.updated_at<now()-interval '48 hours'
      order by stale.updated_at
      limit 500
    );
  end if;

  return current_hits<=max_hits;
end;
$function$;

revoke all on function public.consume_public_rate_limit(text,text,integer,integer)
from public, anon, authenticated;

grant execute on function public.consume_public_rate_limit(text,text,integer,integer)
to service_role;
