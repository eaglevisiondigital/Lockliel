revoke insert, update on table public.faith_profiles from authenticated;

grant insert (
  profile_id,
  faith_stage,
  church_background,
  ministry_experience,
  growth_interests,
  wants_group,
  wants_host,
  preferred_connection
) on table public.faith_profiles to authenticated;

grant update (
  profile_id,
  faith_stage,
  church_background,
  ministry_experience,
  growth_interests,
  wants_group,
  wants_host,
  preferred_connection
) on table public.faith_profiles to authenticated;

alter table public.faith_profiles
  drop constraint if exists faith_profiles_faith_stage_check,
  add constraint faith_profiles_faith_stage_check
    check (
      faith_stage is null
      or faith_stage in (
        'exploring',
        'new-believer',
        'growing',
        'established',
        'serving-leading',
        'prefer-not-to-answer'
      )
    );

alter table public.faith_profiles
  drop constraint if exists faith_profiles_preferred_connection_check,
  add constraint faith_profiles_preferred_connection_check
    check (
      preferred_connection is null
      or preferred_connection in ('either','local','online','not-now')
    );

alter table public.faith_profiles
  drop constraint if exists faith_profiles_growth_interests_check,
  add constraint faith_profiles_growth_interests_check
    check (
      cardinality(growth_interests)<=20
      and growth_interests <@ array[
        'biblical-foundations',
        'identity-in-christ',
        'prayer',
        'faith-development',
        'evangelism',
        'discipleship',
        'leadership',
        'healing-wholeness',
        'family-relationships'
      ]::text[]
    );

alter table public.faith_profiles
  drop constraint if exists faith_profiles_church_background_length,
  add constraint faith_profiles_church_background_length
    check (
      church_background is null
      or char_length(church_background)<=3000
    );

alter table public.faith_profiles
  drop constraint if exists faith_profiles_ministry_experience_length,
  add constraint faith_profiles_ministry_experience_length
    check (
      ministry_experience is null
      or char_length(ministry_experience)<=3000
    );

create or replace function app_private.normalize_faith_profile_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and old.profile_id is distinct from new.profile_id then
    raise exception 'Faith profile identity cannot be changed.';
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_faith_profile_update()
from public, anon, authenticated;

drop trigger if exists normalize_faith_profile_update_trigger
on public.faith_profiles;

create trigger normalize_faith_profile_update_trigger
before insert or update on public.faith_profiles
for each row
execute function app_private.normalize_faith_profile_update();
