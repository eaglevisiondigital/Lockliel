
create table public.notifications (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.profiles(id) on delete cascade,
 notification_type text not null,
 title text not null,
 body text,
 href text,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index notifications_profile_unread_idx
on public.notifications(profile_id,read_at,created_at desc);

alter table public.notifications enable row level security;
create policy "notifications_self_read" on public.notifications for select to authenticated
using(profile_id=(select auth.uid()));
create policy "notifications_self_update" on public.notifications for update to authenticated
using(profile_id=(select auth.uid()))
with check(profile_id=(select auth.uid()));
grant select,update on public.notifications to authenticated;

create or replace function app_private.notify_group_member_added()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare gname text;
begin
 select name into gname from public.groups where id=new.group_id;
 insert into public.notifications(profile_id,notification_type,title,body,href)
 values(
   new.profile_id,
   'group_assignment',
   'You have been connected to a Lockliel group',
   'You were added to ' || coalesce(gname,'a Lockliel group') || '.',
   '/my-lockliel/group'
 );
 return new;
end;
$$;

create or replace function app_private.notify_leader_assignment()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if new.status='active'
    and (tg_op='INSERT' or old.status is distinct from 'active' or old.leader_id is distinct from new.leader_id) then
   insert into public.notifications(profile_id,notification_type,title,body,href)
   values(
     new.member_id,
     'leader_assignment',
     'A Lockliel leader has been assigned to you',
     'Open My Five & Connections to connect with the leader currently assigned to help you grow.',
     '/my-lockliel/connections'
   );
 end if;
 return new;
end;
$$;

create or replace function app_private.notify_founders50_status()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if new.profile_id is not null and old.status is distinct from new.status then
   insert into public.notifications(profile_id,notification_type,title,body,href)
   values(
     new.profile_id,
     'founders50_status',
     'Your Founders 50 status has been updated',
     'Your application status is now ' || replace(new.status,'_',' ') || '.',
     '/founders-50'
   );
 end if;
 return new;
end;
$$;

create or replace function app_private.notify_resource_entitlement()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare ptitle text;
begin
 select title into ptitle from public.products where id=new.product_id;
 insert into public.notifications(profile_id,notification_type,title,body,href)
 values(
   new.profile_id,
   'resource_granted',
   'A new Lockliel resource is available',
   coalesce(ptitle,'A digital resource') || ' is now in your Books & Resources library.',
   '/my-lockliel/resources'
 );
 return new;
end;
$$;

create or replace function app_private.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.notifications(profile_id,notification_type,title,body,href)
 select
   cm.profile_id,
   'new_message',
   'You have a new Lockliel message',
   left(new.body,240),
   '/my-lockliel/connections'
 from public.conversation_members cm
 where cm.conversation_id=new.conversation_id
   and cm.profile_id<>new.sender_id
   and cm.left_at is null;
 return new;
end;
$$;

revoke all on function app_private.notify_group_member_added() from public,anon,authenticated;
revoke all on function app_private.notify_leader_assignment() from public,anon,authenticated;
revoke all on function app_private.notify_founders50_status() from public,anon,authenticated;
revoke all on function app_private.notify_resource_entitlement() from public,anon,authenticated;
revoke all on function app_private.notify_new_message() from public,anon,authenticated;

drop trigger if exists notify_group_member_added_trigger on public.group_members;
create trigger notify_group_member_added_trigger after insert on public.group_members
for each row execute function app_private.notify_group_member_added();

drop trigger if exists notify_leader_assignment_trigger on public.leader_assignments;
create trigger notify_leader_assignment_trigger after insert or update of leader_id,status on public.leader_assignments
for each row execute function app_private.notify_leader_assignment();

drop trigger if exists notify_founders50_status_trigger on public.founders50_applications;
create trigger notify_founders50_status_trigger after update of status on public.founders50_applications
for each row execute function app_private.notify_founders50_status();

drop trigger if exists notify_resource_entitlement_trigger on public.entitlements;
create trigger notify_resource_entitlement_trigger after insert on public.entitlements
for each row execute function app_private.notify_resource_entitlement();

drop trigger if exists notify_new_message_trigger on public.messages;
create trigger notify_new_message_trigger after insert on public.messages
for each row execute function app_private.notify_new_message();
