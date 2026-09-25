
create table public.group_weekly_checkins (
 id uuid primary key default gen_random_uuid(),
 group_id uuid not null references public.groups(id) on delete cascade,
 submitted_by uuid not null references public.profiles(id) on delete cascade,
 week_start date not null,
 gathered boolean not null default false,
 attendance_count int not null default 0 check(attendance_count>=0 and attendance_count<=10000),
 faith_boosts_used int not null default 0 check(faith_boosts_used>=0 and faith_boosts_used<=50),
 people_shared_with int not null default 0 check(people_shared_with>=0 and people_shared_with<=10000),
 new_people_count int not null default 0 check(new_people_count>=0 and new_people_count<=10000),
 next_leader_identified boolean not null default false,
 testimony text,
 needs_support text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(group_id,week_start)
);
create index group_weekly_checkins_group_idx on public.group_weekly_checkins(group_id,week_start desc);
create index group_weekly_checkins_submitter_idx on public.group_weekly_checkins(submitted_by,week_start desc);

alter table public.group_weekly_checkins enable row level security;

create or replace function app_private.is_group_leader(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
 select (select auth.uid()) is not null and (
   exists(
     select 1 from public.groups g
     where g.id=target_group and g.leader_id=(select auth.uid())
   )
   or exists(
     select 1 from public.group_members gm
     where gm.group_id=target_group
       and gm.profile_id=(select auth.uid())
       and gm.role in ('leader','host')
       and gm.status='active'
   )
 );
$$;
revoke all on function app_private.is_group_leader(uuid) from public,anon;
grant execute on function app_private.is_group_leader(uuid) to authenticated;

create policy "group_checkins_read" on public.group_weekly_checkins for select to authenticated
using(
 app_private.is_group_leader(group_id)
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
);
create policy "group_checkins_leader_insert" on public.group_weekly_checkins for insert to authenticated
with check(submitted_by=(select auth.uid()) and app_private.is_group_leader(group_id));
create policy "group_checkins_leader_update" on public.group_weekly_checkins for update to authenticated
using(submitted_by=(select auth.uid()) and app_private.is_group_leader(group_id))
with check(submitted_by=(select auth.uid()) and app_private.is_group_leader(group_id));

grant select,insert,update on public.group_weekly_checkins to authenticated;

create or replace function app_private.audit_group_checkin()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values(new.submitted_by,'group_weekly_checkin','group',new.group_id::text,'Weekly group check-in submitted',
   jsonb_build_object(
     'week_start',new.week_start,
     'gathered',new.gathered,
     'attendance_count',new.attendance_count,
     'faith_boosts_used',new.faith_boosts_used,
     'people_shared_with',new.people_shared_with,
     'new_people_count',new.new_people_count,
     'next_leader_identified',new.next_leader_identified
   ));
 return new;
end;
$$;
revoke all on function app_private.audit_group_checkin() from public,anon,authenticated;

drop trigger if exists audit_group_checkin_trigger on public.group_weekly_checkins;
create trigger audit_group_checkin_trigger
after insert on public.group_weekly_checkins
for each row execute function app_private.audit_group_checkin();
