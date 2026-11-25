-- ISOLATED operational maintenance routing correction, not a migration.
-- qjksggxorghaxvpyslip only. Never change readiness, paused, or the migration ledger.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
lock table lockliel_cutover.control in share row exclusive mode;
do $$begin
 if current_user<>'postgres' or session_user<>'postgres'
 or coalesce(current_setting('request.jwt.claims',true),'') not in ('','{}')
 or public.lockliel_course_cutover_status()<>'{"paused":true,"protocol":"278-v1","schemaReady":true}'::jsonb
 then raise exception 'Direct operator and exact ready279 paused state required';end if;
 if md5(pg_get_functiondef('lockliel_cutover.request()'::regprocedure))<>'5384e542a86090bc95f6090b06218086' then raise exception 'Unexpected request hook definition';end if;
 if (select count(*) from pg_policy where polname='cutover_read_guard' and polrelid in
 ('public.courses'::regclass,'public.lessons'::regclass,'public.lesson_assets'::regclass,'public.lesson_progress'::regclass,'public.media_progress'::regclass))<>5
 then raise exception 'Expected five temporary read guards required';end if;
end$$;
-- No SECURITY DEFINER and no data access beyond the existing readiness/session API.
-- Method/path are supplied by PostgREST, not an app-provided request header.
create function lockliel_cutover.safe_read() returns boolean language sql stable set search_path='' as $$
 select coalesce(auth.uid() is not null and app_private.current_session_is_active()
 and public.lockliel_course_cutover_status()->>'schemaReady'='true'
 and public.lockliel_course_cutover_status()->>'protocol'='278-v1'
 and ((current_setting('request.method',true) in ('GET','HEAD') and current_setting('request.path',true) in
 ('/courses','/lessons','/lesson_assets','/course_enrollments','/lesson_progress','/media_progress'))
 or (current_setting('request.method',true) in ('GET','HEAD','POST') and current_setting('request.path',true)='/rpc/lockliel_course_gates')),false);
$$;
revoke all on function lockliel_cutover.safe_read() from public,anon,service_role;
grant execute on function lockliel_cutover.safe_read() to authenticated;
-- Keep restrictive policies; all permanent enrollment/publication/locale policies
-- still apply. No embedded reads through unrelated endpoints and no private notes.
alter policy cutover_read_guard on public.courses using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true)
 or (lockliel_cutover.safe_read() and status='published'));
alter policy cutover_read_guard on public.lessons using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true)
 or (lockliel_cutover.safe_read() and exists(select 1 from public.courses c where c.id=course_id and c.status='published')));
alter policy cutover_read_guard on public.lesson_assets using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true)
 or (lockliel_cutover.safe_read() and status='active' and exists(select 1 from public.lessons l where l.id=lesson_id)));
alter policy cutover_read_guard on public.lesson_progress using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true)
 or (lockliel_cutover.safe_read() and profile_id=auth.uid() and exists(select 1 from public.lessons l where l.id=lesson_id)));
alter policy cutover_read_guard on public.media_progress using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true)
 or (lockliel_cutover.safe_read() and profile_id=auth.uid() and exists(select 1 from public.lesson_assets a where a.id=asset_id)));
create policy cutover_enrollment_read_guard on public.course_enrollments as restrictive for select to authenticated using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true)
 or (lockliel_cutover.safe_read() and profile_id=auth.uid()));
create policy cutover_notes_read_guard on public.lesson_private_notes as restrictive for select to authenticated using
 (not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true));
-- Close indirect trigger/RPC mutations too, without changing existing privileges.
create trigger cutover_write_guard before insert or update or delete on public.course_enrollments for each row execute function lockliel_cutover.deny_write();
create trigger cutover_write_guard before insert or update or delete on public.lesson_private_notes for each row execute function lockliel_cutover.deny_write();
create or replace function lockliel_cutover.request() returns void language plpgsql security definer set search_path='' as $$
declare path text:=current_setting('request.path',true); method text:=current_setting('request.method',true); headers jsonb:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb; state jsonb;
begin
 if path is null or method is null then raise sqlstate 'PT503' using message='Course request context unavailable.';end if;
 if path ~ '^/(courses|lessons|lesson_assets|course_enrollments|lesson_progress|media_progress|lesson_private_notes)(/|$)'
 or path ~ '^/rpc/(lockliel_(sample_media|save_lesson|course_gates|grip_readiness)|.*course.*|.*lesson.*)$' and path not in ('/rpc/lockliel_course_cutover_status','/rpc/lockliel_course_cutover_request') then
  state:=public.lockliel_course_cutover_status();
  if coalesce((state->>'paused')::boolean,true) then
   if lockliel_cutover.safe_read() then return;end if;
   raise sqlstate 'PT503' using message='Getting a Grip is being updated. Course writes are paused.';
  end if;
  if method not in ('GET','HEAD','OPTIONS') and path not in ('/rpc/lockliel_course_gates','/rpc/lockliel_grip_readiness') and headers->>'x-lockliel-course-protocol' is distinct from state->>'protocol' then raise sqlstate 'PT426' using message='Reload Getting a Grip before saving. Keep a copy of unsaved answers.';end if;
 end if;
end;$$;
-- CREATE OR REPLACE preserves the exact pre-request function ACL and hook binding.
do $$begin
 if public.lockliel_course_cutover_status()<>'{"paused":true,"protocol":"278-v1","schemaReady":true}'::jsonb then raise exception 'Closed readiness changed';end if;
end$$;
commit;
