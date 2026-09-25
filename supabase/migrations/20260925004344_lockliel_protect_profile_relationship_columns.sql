
revoke update on public.profiles from authenticated;

grant update(
  first_name,
  last_name,
  phone,
  city,
  region,
  country,
  onboarding_status,
  updated_at
) on public.profiles to authenticated;

revoke insert,delete on public.profiles from authenticated;
