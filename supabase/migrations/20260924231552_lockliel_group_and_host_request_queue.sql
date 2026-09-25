
alter table public.connection_requests drop constraint if exists connection_requests_request_type_check;
alter table public.connection_requests add constraint connection_requests_request_type_check
check(request_type in ('connect_with_inviter','connect_with_leader','join_group','find_local_group','follow_up','explore_hosting'));

drop policy if exists "connection_request_self_read" on public.connection_requests;
create policy "connection_requests_combined_read" on public.connection_requests for select to authenticated
using(requester_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
create policy "connection_requests_staff_update" on public.connection_requests for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));
grant update on public.connection_requests to authenticated;

create or replace function app_private.sync_faith_connection_requests()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if new.wants_group then
   if not exists(select 1 from public.connection_requests where requester_id=new.profile_id and request_type='find_local_group' and status='open') then
     insert into public.connection_requests(requester_id,request_type,status,message)
     values(new.profile_id,'find_local_group','open','Member asked for help finding a local Lockliel group or gathering.');
   end if;
 else
   update public.connection_requests set status='closed',resolved_at=now()
   where requester_id=new.profile_id and request_type='find_local_group' and status='open';
 end if;

 if new.wants_host then
   if not exists(select 1 from public.connection_requests where requester_id=new.profile_id and request_type='explore_hosting' and status='open') then
     insert into public.connection_requests(requester_id,request_type,status,message)
     values(new.profile_id,'explore_hosting','open','Member is interested in possibly hosting or helping lead.');
   end if;
 else
   update public.connection_requests set status='closed',resolved_at=now()
   where requester_id=new.profile_id and request_type='explore_hosting' and status='open';
 end if;
 return new;
end;
$$;
revoke all on function app_private.sync_faith_connection_requests() from public,anon,authenticated;

drop trigger if exists on_faith_profile_sync_connections on public.faith_profiles;
create trigger on_faith_profile_sync_connections
after insert or update of wants_group,wants_host on public.faith_profiles
for each row execute function app_private.sync_faith_connection_requests();
