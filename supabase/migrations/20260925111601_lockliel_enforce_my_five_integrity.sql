revoke insert, update on table public.reach_contacts from authenticated;

grant insert (
  owner_id,
  display_name,
  relationship_context,
  status,
  next_follow_up_at,
  private_notes
) on table public.reach_contacts to authenticated;

grant update (
  display_name,
  relationship_context,
  status,
  last_shared_at,
  last_follow_up_at,
  next_follow_up_at,
  private_notes,
  updated_at
) on table public.reach_contacts to authenticated;

create or replace function app_private.enforce_reach_contact_limit()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  active_count integer;
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

  select count(*)::integer
    into active_count
  from public.reach_contacts rc
  where rc.owner_id=new.owner_id
    and rc.status in ('praying','invited','connected','growing')
    and (tg_op='INSERT' or rc.id<>new.id);

  if active_count>=5 then
    raise exception 'My Five can contain no more than five active people.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.enforce_reach_contact_limit()
from public, anon, authenticated;

drop trigger if exists enforce_reach_contact_limit_trigger
on public.reach_contacts;

create trigger enforce_reach_contact_limit_trigger
before insert or update of status, owner_id on public.reach_contacts
for each row
execute function app_private.enforce_reach_contact_limit();
