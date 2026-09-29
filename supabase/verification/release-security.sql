-- READ ONLY. Stable catalog fingerprints, not user data. Recompare before/after.
begin read only;
select jsonb_build_object(
  'public_table_count',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
  'rls_disabled',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity),
  'rls_acl_md5',(select md5(jsonb_agg(jsonb_build_object('table',c.relname,'rls',c.relrowsecurity,'force',c.relforcerowsecurity,'acl',c.relacl::text) order by c.relname)::text) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
  'column_acl_md5',(select md5(jsonb_agg(jsonb_build_object('table',c.relname,'column',a.attname,'acl',a.attacl::text) order by c.relname,a.attnum)::text) from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and a.attnum>0 and not a.attisdropped),
  'policies_md5',(select md5(jsonb_agg(to_jsonb(p) order by schemaname,tablename,policyname)::text) from pg_policies p where schemaname='public'),
  'functions_md5',(select md5(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'definition',pg_get_functiondef(p.oid),'acl',p.proacl::text) order by n.nspname,p.proname,pg_get_function_identity_arguments(p.oid))::text) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','app_private') and p.prokind in ('f','p')),
  'triggers_md5',(select md5(jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'name',t.tgname,'definition',pg_get_triggerdef(t.oid),'enabled',t.tgenabled) order by n.nspname,c.relname,t.tgname)::text) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth') and not t.tgisinternal),
  'event_triggers_md5',(select md5(jsonb_agg(jsonb_build_object('name',evtname,'enabled',evtenabled,'tags',evttags,'definition',pg_get_functiondef(evtfoid)) order by evtname)::text) from pg_event_trigger)
) as release_security;
commit;
