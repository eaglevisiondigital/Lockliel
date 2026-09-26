
create table public.founder_orientation_steps (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 position int not null unique,
 title text not null,
 description text,
 href text,
 required boolean not null default true,
 active boolean not null default true,
 created_at timestamptz not null default now()
);

create table public.founder_orientation_progress (
 profile_id uuid not null references public.profiles(id) on delete cascade,
 step_id uuid not null references public.founder_orientation_steps(id) on delete cascade,
 completed_at timestamptz,
 notes text,
 updated_at timestamptz not null default now(),
 primary key(profile_id,step_id)
);
create index founder_orientation_progress_step_idx
  on public.founder_orientation_progress(step_id,completed_at);

alter table public.founder_orientation_steps enable row level security;
alter table public.founder_orientation_progress enable row level security;

create or replace function app_private.is_founders50_member(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists(
    select 1 from public.founders50_applications f
    where f.profile_id=target_profile
      and f.status in ('accepted','orientation','active_host')
  );
$$;
revoke all on function app_private.is_founders50_member(uuid) from public,anon;
grant execute on function app_private.is_founders50_member(uuid) to authenticated;

create policy "founder_orientation_steps_read" on public.founder_orientation_steps for select to authenticated
using(
  active=true
  and (
    app_private.is_founders50_member((select auth.uid()))
    or app_private.has_staff_role(array['super_admin','admin','founders50_reviewer'])
  )
);

create policy "founder_orientation_progress_read" on public.founder_orientation_progress for select to authenticated
using(
  profile_id=(select auth.uid())
  or app_private.has_staff_role(array['super_admin','admin','founders50_reviewer'])
);

create policy "founder_orientation_progress_insert" on public.founder_orientation_progress for insert to authenticated
with check(
  profile_id=(select auth.uid())
  and app_private.is_founders50_member((select auth.uid()))
);

create policy "founder_orientation_progress_update" on public.founder_orientation_progress for update to authenticated
using(
  profile_id=(select auth.uid())
  and app_private.is_founders50_member((select auth.uid()))
)
with check(
  profile_id=(select auth.uid())
  and app_private.is_founders50_member((select auth.uid()))
);

grant select on public.founder_orientation_steps,public.founder_orientation_progress to authenticated;
grant insert,update on public.founder_orientation_progress to authenticated;

insert into public.founder_orientation_steps(slug,position,title,description,href,required)
values
('vision',1,'Catch the Lockliel vision','Understand Reach. Teach. Train. Disciple. Multiply. and the heart behind reaching one.','/founders-50',true),
('role',2,'Know your Founder role','A Founder gathers people, loves people, facilitates conversation, points to Scripture, encourages, prays and helps people take a next step.','/founders-50',true),
('profile',3,'Complete My Lockliel','Finish your member profile and faith-journey information so we can connect and support you well.','/my-lockliel/profile',true),
('discipleship',4,'Begin your own discipleship journey','Grow yourself as you help other people grow.','/my-lockliel/journey',true),
('share-five',5,'Practice Share With Five','Choose five real people to pray for, encourage, invite and follow up with.','/my-lockliel/connections',true),
('group-rhythm',6,'Learn the group rhythm','CONNECT → WATCH → TALK → ACT → MULTIPLY. Keep gatherings relational, simple and reproducible.','/my-lockliel/group',true),
('weekly-checkin',7,'Understand weekly check-ins','Know how Lockliel will collect attendance, Faith Boost use, sharing, wins, support needs and multiplication signals.','/my-lockliel/group',true)
on conflict(slug) do update set
  position=excluded.position,
  title=excluded.title,
  description=excluded.description,
  href=excluded.href,
  required=excluded.required,
  active=true;

create or replace function app_private.founder_orientation_completion_followup()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  required_count int;
  complete_count int;
begin
  if new.completed_at is null then return new; end if;

  select count(*)::int into required_count
  from public.founder_orientation_steps
  where active=true and required=true;

  select count(*)::int into complete_count
  from public.founder_orientation_progress p
  join public.founder_orientation_steps s on s.id=p.step_id
  where p.profile_id=new.profile_id
    and p.completed_at is not null
    and s.active=true
    and s.required=true;

  if required_count>0 and complete_count>=required_count then
    update public.founders50_applications
    set status=case when status='accepted' then 'orientation' else status end,
        updated_at=now()
    where profile_id=new.profile_id
      and status in ('accepted','orientation');

    if not exists(
      select 1 from public.follow_up_tasks f
      where f.subject_profile_id=new.profile_id
        and f.task_type='founder_orientation_complete'
        and f.status in ('open','in_progress')
    ) then
      insert into public.follow_up_tasks(
        subject_profile_id,assigned_to,task_type,status,due_at,notes,context_type,context_id
      )
      values(
        new.profile_id,
        null,
        'founder_orientation_complete',
        'open',
        now()+interval '2 days',
        'Founders 50 orientation is complete. Review readiness for active-host status.',
        'founders50',
        new.profile_id::text
      );
    end if;

    insert into public.notifications(profile_id,notification_type,title,body,href)
    values(
      new.profile_id,
      'founders50',
      'Founders 50 orientation complete',
      'You completed the Founders 50 orientation steps. The Lockliel team will review your readiness for active-host status.',
      '/my-lockliel/founder'
    );
  end if;

  return new;
end;
$$;
revoke all on function app_private.founder_orientation_completion_followup() from public,anon,authenticated;

drop trigger if exists founder_orientation_completion_followup_trigger on public.founder_orientation_progress;
create trigger founder_orientation_completion_followup_trigger
after insert or update of completed_at on public.founder_orientation_progress
for each row execute function app_private.founder_orientation_completion_followup();
