
alter table public.founders50_applications
  add column if not exists faith_stage text
    check(faith_stage is null or faith_stage in (
      'exploring',
      'new-believer',
      'growing',
      'established',
      'serving-leading',
      'prefer-not-to-answer'
    )),
  add column if not exists faith_background text,
  add column if not exists ministry_experience text,
  add column if not exists interest_path text
    check(interest_path is null or interest_path in (
      'host',
      'join-group',
      'either',
      'explore'
    )),
  add column if not exists growth_interests text[] not null default '{}';
