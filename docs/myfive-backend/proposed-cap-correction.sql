-- PROPOSAL ONLY: unnumbered, not executed; not a migration or deployment authorization.
-- Retain existing owner, column grants, status, timestamp, RLS and lineage controls.
-- Trigger already targets this exact function; do not recreate or widen it.
create or replace function app_private.enforce_reach_contact_limit()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.status not in ('praying','invited','connected','growing') then
    return new;
  end if;

  if tg_op='UPDATE'
     and old.owner_id=new.owner_id
     and old.status in ('praying','invited','connected','growing') then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.owner_id::text,0)
  );

  return new;
end;
$function$;

revoke execute on function app_private.enforce_reach_contact_limit()
from public, anon, authenticated;

