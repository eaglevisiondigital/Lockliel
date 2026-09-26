drop policy if exists communication_preferences_self_insert
on public.communication_preferences;

revoke all privileges on table public.communication_preferences from anon;
revoke insert, delete on table public.communication_preferences from authenticated;

revoke all privileges on table public.course_enrollments from anon;
revoke insert, update, delete on table public.course_enrollments from authenticated;

revoke all privileges on table public.checkout_sessions from anon;
revoke insert, update, delete on table public.checkout_sessions from authenticated;

revoke all privileges on table public.payment_events from anon;
revoke insert, update, delete on table public.payment_events from authenticated;

revoke all privileges on table public.partner_commitments from anon;
revoke insert, update, delete on table public.partner_commitments from authenticated;

revoke all privileges on table public.contact_permissions from anon;
revoke insert, delete on table public.contact_permissions from authenticated;

revoke all privileges on table public.orders from anon;
revoke insert, delete on table public.orders from authenticated;
