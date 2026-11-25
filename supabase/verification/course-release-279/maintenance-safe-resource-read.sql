-- ISOLATED operational follow-up: exact authenticated Storage download only.
-- No new Storage policy/grant, no listing/upload/delete/signing route, no migration.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
lock table lockliel_cutover.control in share row exclusive mode;
do $$begin
 if current_user<>'postgres' or session_user<>'postgres'
 or coalesce(current_setting('request.jwt.claims',true),'') not in ('','{}')
 or public.lockliel_course_cutover_status()<>'{"paused":true,"protocol":"278-v1","schemaReady":true}'::jsonb
 or md5(pg_get_functiondef('lockliel_cutover.safe_read()'::regprocedure))<>'835a8cf9c4faa545346855c1956dad4d'
 then raise exception 'Exact isolated paused read helper required';end if;
end$$;
create or replace function lockliel_cutover.safe_read() returns boolean language sql stable set search_path='' as $$
 select coalesce(auth.uid() is not null and app_private.current_session_is_active()
 and public.lockliel_course_cutover_status()->>'schemaReady'='true'
 and public.lockliel_course_cutover_status()->>'protocol'='278-v1'
 and ((current_setting('request.method',true) in ('GET','HEAD') and current_setting('request.path',true) in
 ('/courses','/lessons','/lesson_assets','/course_enrollments','/lesson_progress','/media_progress'))
 or (current_setting('request.method',true) in ('GET','HEAD','POST') and current_setting('request.path',true)='/rpc/lockliel_course_gates')
 or storage.allow_only_operation('object.get_authenticated')),false);
$$;
-- Function owner/ACL, permanent Storage RLS and maintenance state are preserved.
commit;
