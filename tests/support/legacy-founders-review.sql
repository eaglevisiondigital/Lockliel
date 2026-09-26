-- Test-only reconstruction of a pre-existing object absent from all 272 migrations.
-- Verified against read-only production catalog metadata on 2026-09-26.
-- Deliberately separate from Supabase compatibility: this is repository replay debt.
-- Loaded immediately before 20260925120958; subsequent migrations add/replace checks.
create table public.founders50_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.founders50_applications(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision text not null, rationale text, created_at timestamptz not null default now()
);
alter table public.founders50_reviews enable row level security;
create policy founders50_reviews_staff_read on public.founders50_reviews
for select to authenticated
using (app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));
create policy founders50_reviews_staff_insert on public.founders50_reviews
for insert to authenticated
with check (reviewer_id=(select auth.uid()) and
  app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));
