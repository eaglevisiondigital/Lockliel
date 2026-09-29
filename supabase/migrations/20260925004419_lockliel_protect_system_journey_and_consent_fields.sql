
create or replace function app_private.advance_journey_after_profile()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.onboarding_status='active'
     and old.onboarding_status is distinct from new.onboarding_status then
    update public.member_journey
    set next_step_type='faith_profile',
        next_step_title='Tell us where you are in your faith journey',
        next_step_path='/my-lockliel/faith-profile',
        updated_at=now()
    where profile_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function app_private.advance_journey_after_profile() from public,anon,authenticated;

drop trigger if exists advance_journey_after_profile_trigger on public.profiles;
create trigger advance_journey_after_profile_trigger
after update of onboarding_status on public.profiles
for each row execute function app_private.advance_journey_after_profile();

create or replace function app_private.advance_journey_after_faith_profile()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  update public.member_journey
  set next_step_type='course',
      next_step_title='Begin Getting a Grip on the Basics',
      next_step_path='/my-lockliel/journey',
      updated_at=now()
  where profile_id=new.profile_id;
  return new;
end;
$$;
revoke all on function app_private.advance_journey_after_faith_profile() from public,anon,authenticated;

drop trigger if exists advance_journey_after_faith_profile_trigger on public.faith_profiles;
create trigger advance_journey_after_faith_profile_trigger
after insert or update on public.faith_profiles
for each row execute function app_private.advance_journey_after_faith_profile();

revoke update on public.member_journey from authenticated;

revoke update on public.communication_preferences from authenticated;
grant update(
  ministry_email,
  faith_boost_email,
  book_release_email,
  partner_email,
  sms_updates
) on public.communication_preferences to authenticated;
