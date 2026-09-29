
create table public.leader_profiles (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 leader_type text not null default 'mentor' check(leader_type in ('mentor','group_leader','founders_coach','discipleship_leader','regional_leader')),
 active boolean not null default true,
 city text,
 region text,
 country text,
 capacity int check(capacity is null or capacity between 1 and 10000),
 approved_by uuid references public.profiles(id) on delete set null,
 approved_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index leader_profiles_location_idx on public.leader_profiles(country,region,city,active);

create table public.leader_assignments (
 member_id uuid primary key references public.profiles(id) on delete cascade,
 leader_id uuid not null references public.profiles(id) on delete cascade,
 assignment_type text not null default 'mentor' check(assignment_type in ('mentor','group_leader','founders_coach','discipleship_leader','regional_leader')),
 status text not null default 'active' check(status in ('active','paused','ended')),
 assigned_by uuid references public.profiles(id) on delete set null,
 assigned_at timestamptz not null default now(),
 ended_at timestamptz,
 updated_at timestamptz not null default now(),
 check(member_id<>leader_id)
);
create index leader_assignments_leader_idx on public.leader_assignments(leader_id,status);

alter table public.leader_profiles enable row level security;
alter table public.leader_assignments enable row level security;

create policy "leader_profiles_self_read" on public.leader_profiles for select to authenticated
using(
 profile_id=(select auth.uid())
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
);
create policy "leader_profiles_staff_insert" on public.leader_profiles for insert to authenticated
with check(
 approved_by=(select auth.uid())
 and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
);
create policy "leader_profiles_staff_update" on public.leader_profiles for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));

create policy "leader_assignments_related_read" on public.leader_assignments for select to authenticated
using(
 member_id=(select auth.uid())
 or leader_id=(select auth.uid())
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
);
create policy "leader_assignments_staff_insert" on public.leader_assignments for insert to authenticated
with check(
 assigned_by=(select auth.uid())
 and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
);
create policy "leader_assignments_staff_update" on public.leader_assignments for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']));

grant select,insert,update on public.leader_profiles to authenticated;
grant select,insert,update on public.leader_assignments to authenticated;

create or replace function app_private.sync_leader_assignment_relationship()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  convo uuid;
begin
  if tg_op='UPDATE'
     and old.status='active'
     and (new.status<>'active' or old.leader_id is distinct from new.leader_id) then

    update public.contact_permissions
    set revoked_at=now()
    where profile_id=old.member_id
      and other_profile_id=old.leader_id
      and permission_type='leader_followup'
      and revoked_at is null;

    update public.conversation_members cm
    set left_at=now()
    from public.conversations c
    where cm.conversation_id=c.id
      and c.conversation_type='leader_followup'
      and cm.profile_id in (old.member_id,old.leader_id)
      and exists(
        select 1 from public.conversation_members x
        where x.conversation_id=c.id and x.profile_id=old.member_id
      )
      and exists(
        select 1 from public.conversation_members y
        where y.conversation_id=c.id and y.profile_id=old.leader_id
      )
      and cm.left_at is null;
  end if;

  if new.status='active' then
    update public.profiles
    set current_leader_id=new.leader_id,
        updated_at=now()
    where id=new.member_id;

    insert into public.contact_permissions(profile_id,other_profile_id,permission_type)
    values(new.member_id,new.leader_id,'leader_followup')
    on conflict(profile_id,other_profile_id,permission_type)
    do update set revoked_at=null;

    select c.id into convo
    from public.conversations c
    where c.conversation_type='leader_followup'
      and exists(
        select 1 from public.conversation_members a
        where a.conversation_id=c.id and a.profile_id=new.member_id and a.left_at is null
      )
      and exists(
        select 1 from public.conversation_members b
        where b.conversation_id=c.id and b.profile_id=new.leader_id and b.left_at is null
      )
    limit 1;

    if convo is null then
      insert into public.conversations(conversation_type)
      values('leader_followup')
      returning id into convo;

      insert into public.conversation_members(conversation_id,profile_id,member_role)
      values
        (convo,new.member_id,'member'),
        (convo,new.leader_id,'leader');
    end if;
  elsif tg_op='UPDATE'
        and old.status='active'
        and new.status<>'active' then
    update public.profiles
    set current_leader_id=null,
        updated_at=now()
    where id=new.member_id and current_leader_id=old.leader_id;
  end if;

  return new;
end;
$$;

revoke all on function app_private.sync_leader_assignment_relationship() from public,anon,authenticated;

drop trigger if exists sync_leader_assignment_relationship_trigger on public.leader_assignments;
create trigger sync_leader_assignment_relationship_trigger
after insert or update of leader_id,status on public.leader_assignments
for each row execute function app_private.sync_leader_assignment_relationship();

create or replace function app_private.audit_leader_assignment()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values(
   (select auth.uid()),
   case when tg_op='INSERT' then 'leader_assigned' else 'leader_assignment_changed' end,
   'leader_assignment',
   new.member_id::text,
   'Member leader assignment changed',
   jsonb_build_object(
     'leader_id',new.leader_id,
     'assignment_type',new.assignment_type,
     'status',new.status
   )
 );
 return new;
end;
$$;
revoke all on function app_private.audit_leader_assignment() from public,anon,authenticated;

drop trigger if exists audit_leader_assignment_trigger on public.leader_assignments;
create trigger audit_leader_assignment_trigger
after insert or update on public.leader_assignments
for each row execute function app_private.audit_leader_assignment();
