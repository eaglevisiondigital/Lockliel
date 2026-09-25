revoke insert, update on table public.leader_assignments from authenticated;

grant insert (
  member_id,
  leader_id,
  assignment_type,
  status
) on table public.leader_assignments to authenticated;

grant update (
  leader_id,
  assignment_type,
  status
) on table public.leader_assignments to authenticated;

revoke insert, update on table public.leader_profiles from authenticated;

grant insert (
  profile_id,
  leader_type,
  active,
  city,
  region,
  country,
  capacity,
  language_code
) on table public.leader_profiles to authenticated;

grant update (
  leader_type,
  active,
  city,
  region,
  country,
  capacity,
  language_code
) on table public.leader_profiles to authenticated;
