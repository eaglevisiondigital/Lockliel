select jsonb_build_object(
 'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'owner',pg_get_userbyid(p.proowner),'definer',p.prosecdef,'config',p.proconfig,'acl',p.proacl,'definition',pg_get_functiondef(p.oid),'md5',md5(pg_get_functiondef(p.oid))) order by n.nspname,p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='lockliel_cutover' or (n.nspname='public' and p.proname='lockliel_course_cutover_status')),
 'control',(select jsonb_agg(to_jsonb(c)) from lockliel_cutover.control c),
 'control_security',(select jsonb_build_object('owner',pg_get_userbyid(relowner),'acl',relacl,'rls',relrowsecurity) from pg_class where oid='lockliel_cutover.control'::regclass),
 'hook',(select jsonb_agg(jsonb_build_object('role',r.rolname,'database',s.setdatabase,'setting',c)) from pg_db_role_setting s join pg_roles r on r.oid=s.setrole cross join lateral unnest(s.setconfig) c where r.rolname='authenticator' and c like 'pgrst.db_pre_request=%'),
 'status',public.lockliel_course_cutover_status());
