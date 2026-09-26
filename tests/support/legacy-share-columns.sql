-- Test-only replay gap, verified from read-only share_assets column metadata
-- on 2026-09-26. These six columns exist live but have no ADD COLUMN migration.
alter table public.share_assets
  add column share_text text,
  add column category text,
  add column preview_image_path text,
  add column sort_order integer not null default 100,
  add column featured boolean not null default false,
  add column updated_at timestamptz not null default now();
