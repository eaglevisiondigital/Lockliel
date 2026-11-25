-- ISOLATED operational update, not a repository schema migration.
-- Execute only via a separately authorized direct endpoint pinned to
-- qjksggxorghaxvpyslip, after exact279 ledger/catalog verification.
-- Existing temporary hook/control/ACLs remain intact. Never reopen here.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
lock table lockliel_cutover.control in share row exclusive mode;
do $guard$
begin
 if current_user <> 'postgres' or session_user <> 'postgres'
 or coalesce(current_setting('request.jwt.claims',true),'') not in ('','{}') then
  raise exception 'Direct reviewed operator connection required';
 end if;
 if (select count(*) from supabase_migrations.schema_migrations) <> 279
 or (select count(*) from lockliel_cutover.control) <> 1
 or not exists(select 1 from lockliel_cutover.control where singleton and paused and protocol='278-v1') then
  raise exception 'Expected279 closed maintenance required';
 end if;
 if not exists(select 1 from pg_proc where oid='public.lockliel_course_cutover_status()'::regprocedure
  and md5(pg_get_functiondef(oid))='294b9e42f9c0474ef2fb2506f0d1b05a'
  and pg_get_userbyid(proowner)='postgres' and prosecdef
  and proconfig=array['search_path=""']
  and proacl::text[] @> array['postgres=X/postgres','authenticated=X/postgres']
  and cardinality(proacl)=2) then raise exception 'Unexpected prior readiness definition or security';end if;
end;$guard$;
create or replace function public.lockliel_course_cutover_status() returns jsonb language sql stable security definer set search_path='' as $$
 with ready as (select
 (select count(*)=279 from supabase_migrations.schema_migrations) and (select count(*)=5 from supabase_migrations.schema_migrations where version in
 ('20260929215159','20260930092000','20260930092500','20260930145334','20261001133500'))
 and (select count(*)=9 and bool_and(md5(pg_get_functiondef(p.oid))=expected.value and pg_get_userbyid(p.proowner)='postgres')
 from jsonb_each_text('{"app_private.audit_learning_configuration":"abacb6205c5aa998ff5e566108a494e4","app_private.course_lesson_unlocked":"4ee41fbb39e108322c0ae7fd9b7104bc","app_private.course_watch_met":"e27d583485b82a70712915f4d1a93d2a","app_private.normalize_lesson_asset_duration_verification":"ffcb56a46a947385dd3c515ca6916fa5","app_private.validate_course_release":"a9c38e606b5510100854ed9b5da72550","app_private.validate_lesson_completion":"445dc44467c92cf1fac7d3bca2e00a00","public.lockliel_course_gates":"f9220d0f0d325909c82b56c49b4c43b1","public.lockliel_sample_media":"9a5509a2b798cb45dc83e8cec67d5b1c","public.lockliel_save_lesson":"670f673fcfd9aa78f75164a18a321050"}'::jsonb) expected
 join pg_namespace n on n.nspname=split_part(expected.key,'.',1)
 join pg_proc p on p.pronamespace=n.oid and p.proname=split_part(expected.key,'.',2)) and not coalesce(has_table_privilege('service_role',to_regclass('public.lesson_private_notes'),'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'),true)
 and not coalesce(has_any_column_privilege('service_role',to_regclass('public.lesson_private_notes'),'SELECT,INSERT,UPDATE,REFERENCES'),true) as ok)
 select jsonb_build_object('paused',paused or not coalesce(ready.ok,false),'protocol',protocol,'schemaReady',coalesce(ready.ok,false)) from lockliel_cutover.control,ready where singleton;
$$;
do $verify$
begin
 if public.lockliel_course_cutover_status() is distinct from
  '{"paused":true,"protocol":"278-v1","schemaReady":true}'::jsonb then
  raise exception 'Corrected readiness not verified; rollback required';
 end if;
 if not exists(select 1 from pg_proc where oid='public.lockliel_course_cutover_status()'::regprocedure
  and pg_get_userbyid(proowner)='postgres' and prosecdef
  and proconfig=array['search_path=""']
  and proacl::text[] @> array['postgres=X/postgres','authenticated=X/postgres']
  and cardinality(proacl)=2) then raise exception 'Readiness security changed';end if;
end;$verify$;
commit;
