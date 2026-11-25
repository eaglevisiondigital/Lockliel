-- Disposable PostgreSQL only. The runner supplies exact279 ledger and old hook.
create temporary table readiness_before as
 select p.oid,p.proowner,p.proacl,p.proconfig,p.prosecdef,pg_get_functiondef(p.oid) definition
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='lockliel_cutover' or p.oid='public.lockliel_course_cutover_status()'::regprocedure;
create temporary table readiness_hook_before as select * from pg_db_role_setting;
do $$begin
 assert public.lockliel_course_cutover_status()='{"paused":true,"protocol":"278-v1","schemaReady":false}'::jsonb;
end$$;
-- APPLY_READINESS_UPDATE
create function pg_temp.expect_closed(ready boolean) returns void language plpgsql as $$begin
 assert public.lockliel_course_cutover_status()=jsonb_build_object('paused',true,'protocol','278-v1','schemaReady',ready),'Wrong readiness/maintenance state';
end$$;
select pg_temp.expect_closed(true);
do $$begin
 assert not exists(select 1 from readiness_before b join pg_proc p using(oid)
 where p.proowner<>b.proowner or p.proacl is distinct from b.proacl
 or p.proconfig is distinct from b.proconfig or p.prosecdef<>b.prosecdef
 or (p.oid<>'public.lockliel_course_cutover_status()'::regprocedure and pg_get_functiondef(p.oid)<>b.definition)), 'Operational security or other function changed';
 assert not exists((select * from pg_db_role_setting except select * from readiness_hook_before)
 union all (select * from readiness_hook_before except select * from pg_db_role_setting)), 'Hook binding changed';
 assert (select paused from lockliel_cutover.control), 'Paused flag changed';
 -- Each failure fixture rolls itself back. No hosted drift injection.
 begin
  delete from supabase_migrations.schema_migrations where version='20261001133500';
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
 begin
  update supabase_migrations.schema_migrations set version='20990101000000' where version='20261001133500';
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
 begin
  alter table public.lesson_private_notes rename to hidden_private_notes;
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
 begin
  alter function public.lockliel_course_gates() rename to hidden_course_gates;
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
 begin
  alter function public.lockliel_course_gates() set search_path='public';
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
 begin
  grant truncate on public.lesson_private_notes to service_role;
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
 begin
  grant select(body) on public.lesson_private_notes to service_role;
  perform pg_temp.expect_closed(false);
  raise exception sqlstate 'Z0001';
 exception when sqlstate 'Z0001' then null;end;
end$$;
select pg_temp.expect_closed(true);
-- Actual role denials, not just ACL metadata. No valid member fixture needed.
do $$begin
 begin
  set local role anon;
  perform public.lockliel_course_cutover_status();
  raise exception 'Anonymous readiness execution unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 begin
  set local role service_role;
  update lockliel_cutover.control set paused=false;
  raise exception 'Service maintenance manipulation unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 begin
  set local role authenticated;
  update lockliel_cutover.control set paused=false;
  raise exception 'Member maintenance manipulation unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 begin
  set local role authenticated;
  execute 'create or replace function public.lockliel_course_cutover_status() returns jsonb language sql as ''select null::jsonb''';
  raise exception 'Member readiness replacement unexpectedly allowed';
 exception when insufficient_privilege then null;end;
end$$;
set local role authenticated;
do $$begin
 assert public.lockliel_course_cutover_status()='{"paused":true,"protocol":"278-v1","schemaReady":true}'::jsonb;
end$$;
reset role;
-- Existing private PostgREST hook still denies a course RPC even with new protocol.
set local request.path='/rpc/lockliel_save_lesson';
set local request.method='POST';
set local request.headers='{"x-lockliel-course-protocol":"278-v1"}';
do $$begin
 begin
  perform lockliel_cutover.request();
  raise exception 'Course request unexpectedly reopened';
 exception when sqlstate 'PT503' then null;end;
end$$;
select pg_temp.expect_closed(true);
