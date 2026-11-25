-- Hosted acceptance exposed an invoker trigger calling an intentionally private
-- readiness helper. Keep the helper private and retain the existing release gate.
-- Course UPDATE privileges, staff RLS and MFA checks remain unchanged.
alter function app_private.validate_course_release() security definer;
alter function app_private.validate_course_release() set search_path = '';
revoke all on function app_private.validate_course_release() from public, anon, authenticated;
