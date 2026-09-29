
create extension if not exists pgcrypto;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 first_name text, last_name text, email text, phone text,
 city text, region text, country text,
 original_inviter_id uuid references public.profiles(id) on delete set null,
 current_leader_id uuid references public.profiles(id) on delete set null,
 onboarding_status text not null default 'new',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tags (
 id uuid primary key default gen_random_uuid(), slug text unique not null, label text not null,
 category text not null check(category in ('source','interest','background','operational')),
 created_at timestamptz not null default now()
);
create table public.profile_tags (
 profile_id uuid references public.profiles(id) on delete cascade,
 tag_id uuid references public.tags(id) on delete cascade,
 source text, created_at timestamptz not null default now(),
 primary key(profile_id,tag_id)
);
create table public.referral_links (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
 code text unique not null, campaign text, content_type text, content_id text, destination_path text not null,
 created_at timestamptz not null default now(), active boolean not null default true
);
create table public.referral_events (
 id bigint generated always as identity primary key, referral_link_id uuid references public.referral_links(id) on delete set null,
 event_type text not null check(event_type in ('share_initiated','visit','signup','course_started','lesson_completed')),
 visitor_key text, member_id uuid references public.profiles(id) on delete set null,
 occurred_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb
);
create table public.founders50_applications (
 id uuid primary key default gen_random_uuid(), profile_id uuid references public.profiles(id) on delete set null,
 first_name text not null, last_name text not null, email text not null, phone text,
 city text, region text, country text, church_affiliation text, gathering_place text, invite_count text,
 why_interested text, what_excites_you text, share_with_five text, gather_weekly text, training_willingness boolean,
 status text not null default 'interested' check(status in ('interested','applied','under_review','needs_info','accepted','orientation','active_host','paused','withdrawn','declined')),
 source_campaign text default 'founders50', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.groups (
 id uuid primary key default gen_random_uuid(), name text not null, leader_id uuid references public.profiles(id) on delete set null,
 city text, region text, country text, status text not null default 'forming', created_at timestamptz not null default now()
);
create table public.group_members (
 group_id uuid references public.groups(id) on delete cascade, profile_id uuid references public.profiles(id) on delete cascade,
 role text not null default 'participant', status text not null default 'active', joined_at timestamptz not null default now(),
 primary key(group_id,profile_id)
);
create table public.courses (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text,
 status text not null default 'draft', created_at timestamptz not null default now()
);
create table public.lessons (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
 position int not null, slug text not null, title text not null, video_provider text, video_ref text,
 worksheet_schema jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 unique(course_id,position), unique(course_id,slug)
);
create table public.course_enrollments (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade, status text not null default 'active',
 enrolled_at timestamptz not null default now(), completed_at timestamptz, unique(profile_id,course_id)
);
create table public.lesson_progress (
 profile_id uuid references public.profiles(id) on delete cascade, lesson_id uuid references public.lessons(id) on delete cascade,
 status text not null default 'not_started', last_position_seconds numeric not null default 0, watched_seconds numeric not null default 0,
 worksheet_status text not null default 'not_started', worksheet_answers jsonb not null default '{}'::jsonb,
 started_at timestamptz, last_activity_at timestamptz not null default now(), completed_at timestamptz,
 primary key(profile_id,lesson_id)
);
create table public.partner_commitments (
 id uuid primary key default gen_random_uuid(), profile_id uuid references public.profiles(id) on delete set null,
 provider text, provider_customer_ref text, provider_subscription_ref text, cadence text check(cadence in ('one_time','monthly')),
 amount_cents bigint, currency text not null default 'USD', status text not null default 'pending', created_at timestamptz not null default now()
);
create table public.gifts (
 id uuid primary key default gen_random_uuid(), profile_id uuid references public.profiles(id) on delete set null,
 provider text not null, provider_transaction_ref text not null, amount_cents bigint not null, currency text not null default 'USD',
 status text not null, received_at timestamptz, created_at timestamptz not null default now(),
 unique(provider,provider_transaction_ref)
);
create table public.products (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
 product_type text not null check(product_type in ('digital_book','physical_book','resource')), status text not null default 'draft',
 price_cents bigint, currency text not null default 'USD', created_at timestamptz not null default now()
);
create table public.entitlements (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade, reason text not null, source_ref text,
 granted_at timestamptz not null default now(), unique(profile_id,product_id,reason)
);
create table public.follow_up_tasks (
 id uuid primary key default gen_random_uuid(), subject_profile_id uuid references public.profiles(id) on delete cascade,
 assigned_to uuid references public.profiles(id) on delete set null, task_type text not null, status text not null default 'open',
 due_at timestamptz, notes text, created_at timestamptz not null default now(), completed_at timestamptz
);
create table public.contact_permissions (
 profile_id uuid references public.profiles(id) on delete cascade, other_profile_id uuid references public.profiles(id) on delete cascade,
 permission_type text not null check(permission_type in ('inviter_followup','leader_followup','group_contact')),
 granted_at timestamptz not null default now(), revoked_at timestamptz,
 primary key(profile_id,other_profile_id,permission_type)
);

alter table public.profiles enable row level security;
alter table public.tags enable row level security; alter table public.profile_tags enable row level security;
alter table public.referral_links enable row level security; alter table public.referral_events enable row level security;
alter table public.founders50_applications enable row level security; alter table public.groups enable row level security;
alter table public.group_members enable row level security; alter table public.courses enable row level security;
alter table public.lessons enable row level security; alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security; alter table public.partner_commitments enable row level security;
alter table public.gifts enable row level security; alter table public.products enable row level security;
alter table public.entitlements enable row level security; alter table public.follow_up_tasks enable row level security;
alter table public.contact_permissions enable row level security;

create policy "profile_self_read" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "profile_self_update" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "tags_member_read" on public.tags for select to authenticated using (true);
create policy "profile_tags_self_read" on public.profile_tags for select to authenticated using ((select auth.uid())=profile_id);
create policy "referral_links_self_all" on public.referral_links for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "courses_member_read" on public.courses for select to authenticated using (status='published');
create policy "lessons_member_read" on public.lessons for select to authenticated using (exists(select 1 from public.courses c where c.id=course_id and c.status='published'));
create policy "enrollment_self_read" on public.course_enrollments for select to authenticated using ((select auth.uid())=profile_id);
create policy "progress_self_read" on public.lesson_progress for select to authenticated using ((select auth.uid())=profile_id);
create policy "progress_self_insert" on public.lesson_progress for insert to authenticated with check ((select auth.uid())=profile_id);
create policy "progress_self_update" on public.lesson_progress for update to authenticated using ((select auth.uid())=profile_id) with check ((select auth.uid())=profile_id);
create policy "commitment_self_read" on public.partner_commitments for select to authenticated using ((select auth.uid())=profile_id);
create policy "gifts_self_read" on public.gifts for select to authenticated using ((select auth.uid())=profile_id);
create policy "products_member_read" on public.products for select to authenticated using (status='active');
create policy "entitlements_self_read" on public.entitlements for select to authenticated using ((select auth.uid())=profile_id);
create policy "contact_permissions_self_read" on public.contact_permissions for select to authenticated using ((select auth.uid())=profile_id or (select auth.uid())=other_profile_id);

insert into public.tags(slug,label,category) values
('founders-50','Founders 50','source'),('faith-boost','Faith Boost','source'),('book-interest','Book Interest','source'),
('personal-invitation','Personal Invitation','source'),('biblical-foundations','Biblical Foundations','interest'),
('evangelism','Evangelism','interest'),('identity-in-christ','Identity in Christ','interest'),('leadership','Leadership','interest'),
('hosting','Hosting a Group','interest'),('join-group','Join a Group','interest'),('prayer','Prayer','interest');
insert into public.courses(slug,title,description,status) values
('getting-a-grip-on-the-basics','Getting a Grip on the Basics','Foundational discipleship journey.','draft');
insert into public.products(slug,title,product_type,status) values
('a-heart-for-the-lost-digital','A Heart for the Lost','digital_book','draft'),
('a-heart-for-the-lost-physical','A Heart for the Lost','physical_book','draft');
