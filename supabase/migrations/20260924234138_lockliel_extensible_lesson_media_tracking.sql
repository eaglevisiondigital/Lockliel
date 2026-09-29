
create table public.lesson_assets (
 id uuid primary key default gen_random_uuid(),
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 asset_type text not null check(asset_type in ('video','audio','pdf','worksheet','external_link')),
 title text,
 provider text,
 provider_ref text,
 storage_path text,
 external_url text,
 duration_seconds numeric,
 sort_order int not null default 0,
 status text not null default 'draft' check(status in ('draft','active','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index lesson_assets_lesson_idx on public.lesson_assets(lesson_id,sort_order);

create table public.media_progress (
 profile_id uuid not null references public.profiles(id) on delete cascade,
 asset_id uuid not null references public.lesson_assets(id) on delete cascade,
 last_position_seconds numeric not null default 0,
 played_seconds numeric not null default 0,
 percent_watched numeric not null default 0 check(percent_watched>=0 and percent_watched<=100),
 covered_intervals jsonb not null default '[]'::jsonb,
 first_started_at timestamptz,
 last_activity_at timestamptz not null default now(),
 completed_at timestamptz,
 primary key(profile_id,asset_id)
);
create index media_progress_asset_idx on public.media_progress(asset_id);

alter table public.lesson_assets enable row level security;
alter table public.media_progress enable row level security;

create policy "lesson_assets_member_read" on public.lesson_assets for select to authenticated
using(
 status='active'
 and exists(
  select 1 from public.lessons l
  join public.courses c on c.id=l.course_id
  where l.id=lesson_assets.lesson_id
    and (
      c.status='published'
      or exists(
        select 1 from public.course_enrollments ce
        where ce.course_id=c.id and ce.profile_id=(select auth.uid()) and ce.status in ('active','completed')
      )
    )
 )
 or app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin'])
);
create policy "lesson_assets_staff_insert" on public.lesson_assets for insert to authenticated
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));
create policy "lesson_assets_staff_update" on public.lesson_assets for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));

create policy "media_progress_combined_read" on public.media_progress for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','discipleship_admin']));
create policy "media_progress_self_insert" on public.media_progress for insert to authenticated
with check(profile_id=(select auth.uid()));
create policy "media_progress_self_update" on public.media_progress for update to authenticated
using(profile_id=(select auth.uid())) with check(profile_id=(select auth.uid()));

grant select on public.lesson_assets,public.media_progress to authenticated;
grant insert,update on public.lesson_assets to authenticated;
grant insert,update on public.media_progress to authenticated;
