drop policy if exists anon_visit_insert on public.referral_events;

revoke all privileges on table public.referral_events from anon;
revoke all privileges on table public.referral_events from authenticated;

grant select on table public.referral_events to authenticated;
grant insert (
  referral_link_id,
  event_type,
  member_id,
  metadata
) on table public.referral_events to authenticated;

revoke all privileges on table public.referral_links from anon;
revoke all privileges on table public.referral_links from authenticated;

grant select on table public.referral_links to authenticated;
grant insert (
  owner_id,
  code,
  campaign,
  content_type,
  content_id,
  destination_path,
  reach_contact_id
) on table public.referral_links to authenticated;
