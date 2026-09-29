
create or replace function app_private.refresh_connection_count(target uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare total int;
begin
  select count(distinct other_id)::int into total
  from (
    select cp.other_profile_id as other_id
    from public.contact_permissions cp
    where cp.profile_id=target and cp.revoked_at is null
    union
    select cp.profile_id as other_id
    from public.contact_permissions cp
    where cp.other_profile_id=target and cp.revoked_at is null
  ) x;

  update public.member_journey
  set active_connections_count=coalesce(total,0),
      updated_at=now()
  where profile_id=target;
end;
$$;

revoke all on function app_private.refresh_connection_count(uuid) from public,anon,authenticated;

create or replace function app_private.sync_connection_counts()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  perform app_private.refresh_connection_count(coalesce(new.profile_id,old.profile_id));
  perform app_private.refresh_connection_count(coalesce(new.other_profile_id,old.other_profile_id));
  return coalesce(new,old);
end;
$$;

revoke all on function app_private.sync_connection_counts() from public,anon,authenticated;

drop trigger if exists sync_connection_counts_trigger on public.contact_permissions;
create trigger sync_connection_counts_trigger
after insert or update or delete on public.contact_permissions
for each row execute function app_private.sync_connection_counts();
