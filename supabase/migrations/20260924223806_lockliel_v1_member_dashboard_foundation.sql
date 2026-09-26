
create table public.staff_roles (
 profile_id uuid references public.profiles(id) on delete cascade,
 role text not null check(role in ('super_admin','admin','discipleship_admin','founders50_reviewer','group_leader','finance_admin','content_admin')),
 granted_at timestamptz not null default now(),
 primary key(profile_id,role)
);
alter table public.staff_roles enable row level security;
create policy "staff_roles_self_read" on public.staff_roles for select to authenticated using (profile_id=(select auth.uid()));

create table public.member_journey (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 next_step_type text, next_step_title text, next_step_path text,
 reach_one_count int not null default 0, active_connections_count int not null default 0,
 last_faith_boost_at timestamptz, updated_at timestamptz not null default now()
);
alter table public.member_journey enable row level security;
create policy "member_journey_self_read" on public.member_journey for select to authenticated using(profile_id=(select auth.uid()));

create table public.share_assets (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
 asset_type text not null check(asset_type in ('faith_boost','graphic','book','course','invitation')),
 description text, destination_path text not null, status text not null default 'draft',
 created_at timestamptz not null default now()
);
alter table public.share_assets enable row level security;
create policy "share_assets_member_read" on public.share_assets for select to authenticated using(status='active');

create table public.connection_requests (
 id uuid primary key default gen_random_uuid(), requester_id uuid not null references public.profiles(id) on delete cascade,
 requested_person_id uuid references public.profiles(id) on delete set null, requested_group_id uuid references public.groups(id) on delete set null,
 request_type text not null check(request_type in ('connect_with_inviter','connect_with_leader','join_group','find_local_group','follow_up')),
 status text not null default 'open', message text, created_at timestamptz not null default now(), resolved_at timestamptz
);
alter table public.connection_requests enable row level security;
create policy "connection_request_self_read" on public.connection_requests for select to authenticated using(requester_id=(select auth.uid()));
create policy "connection_request_self_insert" on public.connection_requests for insert to authenticated with check(requester_id=(select auth.uid()));

create index idx_staff_roles_role on public.staff_roles(role);
create index idx_connection_requested_person on public.connection_requests(requested_person_id);
create index idx_connection_requested_group on public.connection_requests(requested_group_id);

insert into public.share_assets(slug,title,asset_type,description,destination_path,status) values
('faith-boost','Faith Boost','faith_boost','Share Faith Boost with someone who could use encouragement today.','/faith-boost','active'),
('founders-50','The Founders 50','invitation','Invite someone to discover the Founders 50.','/founders-50','active'),
('heart-for-the-lost','A Heart for the Lost','book','Share the upcoming A Heart for the Lost resource.','/a-heart-for-the-lost','active');

grant select, update on public.profiles to authenticated;
grant select on public.tags, public.profile_tags, public.courses, public.lessons, public.course_enrollments, public.partner_commitments, public.gifts, public.products, public.entitlements, public.groups, public.group_members, public.founders50_applications, public.follow_up_tasks, public.contact_permissions, public.referral_events, public.staff_roles, public.member_journey, public.share_assets to authenticated;
grant select, insert, update on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.referral_links to authenticated;
grant select, insert on public.connection_requests to authenticated;
