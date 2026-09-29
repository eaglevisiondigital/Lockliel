revoke all privileges on table public.communication_preference_events from anon;
revoke all privileges on table public.communication_preference_events from authenticated;
grant select on table public.communication_preference_events to authenticated;

revoke all privileges on table public.tags from anon;
revoke all privileges on table public.tags from authenticated;
grant select on table public.tags to authenticated;

revoke all privileges on table public.profile_tags from anon;
revoke all privileges on table public.profile_tags from authenticated;
grant select on table public.profile_tags to authenticated;

revoke all privileges on table public.notifications from anon;
revoke all privileges on table public.notifications from authenticated;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;
