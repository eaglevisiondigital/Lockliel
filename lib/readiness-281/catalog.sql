-- PROPOSED READ-ONLY281 catalog query; not executed or fingerprint-certified.
-- Use only inside separately authorized direct verified read-only transaction.
select jsonb_build_object(
 'function',(select jsonb_build_object('identity',p.oid::regprocedure::text,'definition',pg_get_functiondef(p.oid),'owner',pg_get_userbyid(p.proowner),'securityDefiner',p.prosecdef,'config',p.proconfig,'acl',p.proacl::text)
 from pg_proc p where p.oid=to_regprocedure('app_private.enforce_reach_contact_limit()')),
 'relation',(select jsonb_build_object('rls',relrowsecurity,'forceRls',relforcerowsecurity,'owner',pg_get_userbyid(relowner))from pg_class where oid='public.reach_contacts'::regclass),
 'policies',(select jsonb_agg(to_jsonb(p)-'tablename'-'schemaname' order by policyname)from pg_policies p where schemaname='public' and tablename='reach_contacts'),
 'triggers',(select jsonb_agg(pg_get_triggerdef(oid) order by tgname)from pg_trigger where tgrelid='public.reach_contacts'::regclass and not tgisinternal),
 'constraints',(select jsonb_agg(jsonb_build_object('name',conname,'definition',pg_get_constraintdef(oid))order by conname)from pg_constraint where conrelid='public.reach_contacts'::regclass),
 'tableGrants',(select jsonb_agg(jsonb_build_object('grantor',grantor,'role',grantee,'privilege',privilege_type,'grantable',is_grantable)order by grantor,grantee,privilege_type)from information_schema.table_privileges where table_schema='public' and table_name='reach_contacts'),
 'columnGrants',(select jsonb_agg(jsonb_build_object('role',grantee,'column',column_name,'privilege',privilege_type,'grantable',is_grantable) order by grantee,column_name,privilege_type)from information_schema.column_privileges where table_schema='public' and table_name='reach_contacts'),
 'indexes',(select jsonb_agg(indexdef order by indexname)from pg_indexes where schemaname='public' and tablename='reach_contacts')
);
