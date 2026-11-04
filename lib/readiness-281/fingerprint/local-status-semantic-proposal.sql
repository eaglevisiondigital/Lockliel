-- NEW UNEXECUTED SEMANTIC LOCAL-ONLY PROPOSAL. Preserves all historical hashes and guards. No hosted installation or activation authority.
-- Exact fixture whole-file text[] ledger representation, NOT provider/CLI fingerprint.
-- Requires separate reviewed disposable fixture before this definition can be accepted.
begin;
create schema lockliel_281_semantic_review;
revoke all on schema lockliel_281_semantic_review from public,anon,authenticated,service_role;
create function lockliel_281_semantic_review.local_status() returns jsonb
language sql stable security invoker set search_path='' as $local281$
with catalog(value) as (select jsonb_build_object(
 'function',(select jsonb_build_object('identity',p.oid::regprocedure::text,'definition',pg_get_functiondef(p.oid),'owner',pg_get_userbyid(p.proowner),'securityDefiner',p.prosecdef,'config',p.proconfig,'acl',p.proacl::text)
 from pg_proc p where p.oid=to_regprocedure('app_private.enforce_reach_contact_limit()')),
 'relation',(select jsonb_build_object('rls',relrowsecurity,'forceRls',relforcerowsecurity,'owner',pg_get_userbyid(relowner))from pg_class where oid='public.reach_contacts'::regclass),
 'policies',(select jsonb_agg(to_jsonb(p)-'tablename'-'schemaname' order by policyname)from pg_policies p where schemaname='public' and tablename='reach_contacts'),
 'triggers',(select jsonb_agg(pg_get_triggerdef(oid) order by tgname)from pg_trigger where tgrelid='public.reach_contacts'::regclass and not tgisinternal),
 'constraints',(select jsonb_agg(jsonb_build_object('name',conname,'definition',case when conname='reach_contacts_owner_id_fkey' and pg_get_constraintdef(oid)='FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE' then 'FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE' when conname='reach_contacts_linked_profile_id_fkey' and pg_get_constraintdef(oid)='FOREIGN KEY (linked_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL' then 'FOREIGN KEY (linked_profile_id) REFERENCES profiles(id) ON DELETE SET NULL' else pg_get_constraintdef(oid) end)order by conname)from pg_constraint where conrelid='public.reach_contacts'::regclass),
 'tableGrants',(select jsonb_agg(jsonb_build_object('grantor',grantor,'role',grantee,'privilege',privilege_type,'grantable',is_grantable)order by grantor,grantee,privilege_type)from information_schema.table_privileges where table_schema='public' and table_name='reach_contacts'),
 'columnGrants',(select jsonb_agg(jsonb_build_object('role',grantee,'column',column_name,'privilege',privilege_type,'grantable',is_grantable) order by grantee,column_name,privilege_type)from information_schema.column_privileges where table_schema='public' and table_name='reach_contacts'),
 'indexes',(select jsonb_agg(indexdef order by indexname)from pg_indexes where schemaname='public' and tablename='reach_contacts')
)),foreign_keys(value) as (select jsonb_agg(jsonb_build_object(
 'name',con.conname,
 'sourceSchema',src_ns.nspname,'sourceTable',src.relname,'sourceOwner',pg_get_userbyid(src.relowner),
 'targetSchema',dst_ns.nspname,'targetTable',dst.relname,'targetOwner',pg_get_userbyid(dst.relowner),
 'sourceColumns',(select jsonb_agg(a.attname order by k.ordinality)from unnest(con.conkey)with ordinality k(attnum,ordinality)join pg_attribute a on a.attrelid=con.conrelid and a.attnum=k.attnum),
 'targetColumns',(select jsonb_agg(a.attname order by k.ordinality)from unnest(con.confkey)with ordinality k(attnum,ordinality)join pg_attribute a on a.attrelid=con.confrelid and a.attnum=k.attnum),
 'matchType',con.confmatchtype,'updateAction',con.confupdtype,'deleteAction',con.confdeltype,
 'deferrable',con.condeferrable,'initiallyDeferred',con.condeferred,'validated',con.convalidated,
 'sourceRls',src.relrowsecurity,'sourceForceRls',src.relforcerowsecurity
)order by con.conname)
from pg_constraint con
join pg_class src on src.oid=con.conrelid join pg_namespace src_ns on src_ns.oid=src.relnamespace
join pg_class dst on dst.oid=con.confrelid join pg_namespace dst_ns on dst_ns.oid=dst.relnamespace
where con.contype='f' and con.conrelid='public.reach_contacts'::regclass),ledger(value) as (select jsonb_agg(jsonb_build_object('version',version,'name',name,'statements_md5',md5(statements::text))order by version)
from supabase_migrations.schema_migrations), guards as (
 select current_user='postgres' and session_user='postgres'
 and coalesce(current_setting('request.jwt.claims',true),'') in ('','{}')
 and current_setting('transaction_read_only')='on'
 and current_setting('lock_timeout')='5s' and current_setting('statement_timeout')='30s'
 and (select value='[{"sourceSchema":"public","sourceTable":"reach_contacts","sourceOwner":"postgres","targetSchema":"public","targetTable":"profiles","targetOwner":"postgres","targetColumns":["id"],"matchType":"s","updateAction":"a","deferrable":false,"initiallyDeferred":false,"validated":true,"sourceRls":true,"sourceForceRls":false,"name":"reach_contacts_linked_profile_id_fkey","sourceColumns":["linked_profile_id"],"deleteAction":"n"},{"sourceSchema":"public","sourceTable":"reach_contacts","sourceOwner":"postgres","targetSchema":"public","targetTable":"profiles","targetOwner":"postgres","targetColumns":["id"],"matchType":"s","updateAction":"a","deferrable":false,"initiallyDeferred":false,"validated":true,"sourceRls":true,"sourceForceRls":false,"name":"reach_contacts_owner_id_fkey","sourceColumns":["owner_id"],"deleteAction":"c"}]'::jsonb from foreign_keys)
 and (select count(*)=281 from supabase_migrations.schema_migrations)
 and (select md5(value::text)='f7dda4d7a05e4356514047e821ecaf8e' from ledger)
 and (select md5(value::text)='a17ce00d97fc4a694c09e7e3ee164f64' from catalog)
 and (select paused and protocol='278-v1' from lockliel_cutover.control where singleton)
 and md5(pg_get_functiondef('public.lockliel_current_session_active()'::regprocedure))='c7ad281a9078abef4a4115cb000b8247'
 and md5(pg_get_functiondef('app_private.current_session_is_active()'::regprocedure))='3637d79b4a93e044b8bd7f3c3e1d454b'
 and (select count(*)=10 and bool_and(md5(pg_get_functiondef(p.oid))=expected.value and pg_get_userbyid(p.proowner)='postgres')
 from jsonb_each_text('{"app_private.audit_learning_configuration":"abacb6205c5aa998ff5e566108a494e4","app_private.course_lesson_unlocked":"42b8ebd199be053eb3bb9abdc6a69fe9","app_private.course_watch_met":"0175421186adfd98a13abbb50c2e107f","app_private.normalize_lesson_asset_duration_verification":"ffcb56a46a947385dd3c515ca6916fa5","app_private.preserve_watched_media_identity":"f9a207e66e10f02a2ebd69a767e4a2c8","app_private.validate_course_release":"a9c38e606b5510100854ed9b5da72550","app_private.validate_lesson_completion":"445dc44467c92cf1fac7d3bca2e00a00","public.lockliel_course_gates":"f9220d0f0d325909c82b56c49b4c43b1","public.lockliel_sample_media":"9a5509a2b798cb45dc83e8cec67d5b1c","public.lockliel_save_lesson":"c6addc013849d6ff24292ebce383de4f"}'::jsonb) expected
 join pg_namespace n on n.nspname=split_part(expected.key,'.',1)
 join pg_proc p on p.pronamespace=n.oid and p.proname=split_part(expected.key,'.',2))
 and (select count(*)=57 and bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p'))
 and not has_table_privilege('service_role','public.lesson_private_notes','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
 and not has_any_column_privilege('service_role','public.lesson_private_notes','SELECT,INSERT,UPDATE,REFERENCES') as ok)
select jsonb_build_object('localCandidateCompatible',coalesce(ok,false),'hostedReady',false,'executionAuthorized',false,'scope','LOCAL_FIXTURE_ONLY') from guards;
$local281$;
revoke all on function lockliel_281_semantic_review.local_status() from public,anon,authenticated,service_role;
commit;
