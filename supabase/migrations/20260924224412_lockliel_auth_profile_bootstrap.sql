
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inviter uuid;
  referral text;
begin
  referral := nullif(trim(new.raw_user_meta_data->>'referral_code'),'');
  if referral is not null then
    select owner_id into inviter from public.referral_links
    where code = referral and active = true
    limit 1;
  end if;

  insert into public.profiles(id,first_name,last_name,email,phone,city,region,country,original_inviter_id,onboarding_status)
  values(
    new.id,
    nullif(trim(new.raw_user_meta_data->>'first_name'),''),
    nullif(trim(new.raw_user_meta_data->>'last_name'),''),
    new.email,
    nullif(trim(new.raw_user_meta_data->>'phone'),''),
    nullif(trim(new.raw_user_meta_data->>'city'),''),
    nullif(trim(new.raw_user_meta_data->>'region'),''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'country'),''),'United States'),
    inviter,
    'new'
  )
  on conflict(id) do nothing;

  insert into public.member_journey(profile_id,next_step_type,next_step_title,next_step_path)
  values(new.id,'onboarding','Complete your Lockliel profile','/my-lockliel/profile')
  on conflict(profile_id) do nothing;

  if referral is not null then
    insert into public.referral_events(referral_link_id,event_type,member_id,metadata)
    select id,'signup',new.id,jsonb_build_object('source','auth_signup')
    from public.referral_links where code=referral and active=true
    limit 1;
  end if;

  return new;
end;
$$;

revoke all on function app_private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_lockliel on auth.users;
create trigger on_auth_user_created_lockliel
after insert on auth.users
for each row execute function app_private.handle_new_user();

create policy "member_journey_self_update" on public.member_journey for update to authenticated
using(profile_id=(select auth.uid())) with check(profile_id=(select auth.uid()));

grant update on public.member_journey to authenticated;
