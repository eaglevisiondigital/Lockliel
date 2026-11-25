-- Read-only review snapshot. Run inside a READ ONLY transaction with bounded timeouts.
-- Never returns member answers, notes, contact fields, credentials, or query text.
with target as (
 select c.oid,n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity
 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where (n.nspname='public' and c.relname in ('courses','lessons','lesson_assets','course_enrollments','lesson_progress','media_progress','lesson_private_notes','audit_events'))
 or (n.nspname='app_private' and c.relname='course_answer_keys')
), protected_rows as (
 select 'courses' as name,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) as fingerprint from public.courses t
 union all select 'lessons',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) from public.lessons t
 union all select 'lesson_assets',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) from public.lesson_assets t
 union all select 'staff_roles',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) from public.staff_roles t
 union all select 'feature_flags',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) from public.feature_flags t
 union all select 'payment_provider_connections',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) from public.payment_provider_connections t
 union all select 'partner_checkout_state',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) from public.partner_checkout_state t
 union all select 'share_assets',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) from public.share_assets t
 union all select 'storage_objects',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) from storage.objects t
 union all select 'storage_buckets',count(*),md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id::text),'')) from storage.buckets t
), counts as (
 select 'auth_users' as name,count(*) as rows from auth.users
 union all select 'profiles',count(*) from public.profiles
 union all select 'enrollments',count(*) from public.course_enrollments
 union all select 'lesson_progress',count(*) from public.lesson_progress
 union all select 'media_progress',count(*) from public.media_progress
 union all select 'audit_events',count(*) from public.audit_events
), content as (
 select l.position,c.status as course_status,l.id,
 jsonb_array_length(coalesce(l.worksheet_schema->'questions','[]')) as questions,
 (select count(*) from public.lesson_assets a where a.lesson_id=l.id and a.asset_type='video' and a.status='active') as active_videos,
 (select count(*) from public.lesson_assets a where a.lesson_id=l.id and a.asset_type='video' and a.status='active' and a.duration_seconds>0 and a.duration_verified_at is not null and nullif(to_jsonb(a)->>'duration_verification_source','') is not null) as trusted_videos,
 (select count(*) from public.lesson_assets a where a.lesson_id=l.id and a.asset_type='pdf' and a.status='active' and exists(select 1 from storage.objects o where o.bucket_id='lesson-assets' and o.name=a.storage_path)) as protected_pdfs
 from public.lessons l join public.courses c on c.id=l.course_id where c.translation_key='getting-a-grip-on-the-basics'
)
select jsonb_build_object(
 'observed_at',clock_timestamp(),'database',current_database(),'server_version',current_setting('server_version'),'transaction_read_only',current_setting('transaction_read_only'),'lock_timeout',current_setting('lock_timeout'),'statement_timeout',current_setting('statement_timeout'),
 'ledger',(select jsonb_agg(jsonb_build_object('version',version,'name',name,'statements_md5',md5(statements::text)) order by version) from supabase_migrations.schema_migrations),
 'protected',(select jsonb_agg(to_jsonb(t) order by name) from protected_rows t),
 'counts',(select jsonb_object_agg(name,rows) from counts),
 'tables',(select jsonb_agg(jsonb_build_object('schema',nspname,'name',relname,'rls',relrowsecurity,'force_rls',relforcerowsecurity,'bytes',pg_total_relation_size(oid)) order by nspname,relname) from target),
 'columns',(select jsonb_agg(jsonb_build_object('table',t.relname,'column',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notnull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) order by t.relname,a.attnum) from target t join pg_attribute a on a.attrelid=t.oid and a.attnum>0 and not a.attisdropped left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum),
 'constraints',(select jsonb_agg(jsonb_build_object('table',t.relname,'name',c.conname,'validated',c.convalidated,'definition',pg_get_constraintdef(c.oid)) order by t.relname,c.conname) from target t join pg_constraint c on c.conrelid=t.oid),
 'indexes',(select jsonb_agg(jsonb_build_object('table',t.relname,'definition',pg_get_indexdef(i.indexrelid),'valid',i.indisvalid) order by t.relname,i.indexrelid::text) from target t join pg_index i on i.indrelid=t.oid),
 'policies',(select jsonb_agg(to_jsonb(p) order by p.tablename,p.policyname) from pg_policies p where p.schemaname in ('public','app_private') and p.tablename in (select relname from target)),
 'triggers',(select jsonb_agg(jsonb_build_object('table',t.relname,'name',g.tgname,'enabled',g.tgenabled,'definition',pg_get_triggerdef(g.oid)) order by t.relname,g.tgname) from target t join pg_trigger g on g.tgrelid=t.oid and not g.tgisinternal),
 'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),'returns',pg_get_function_result(p.oid),'owner',pg_get_userbyid(p.proowner),'definer',p.prosecdef,'config',p.proconfig,'acl',p.proacl::text,'body_md5',md5(pg_get_functiondef(p.oid))) order by n.nspname,p.proname,p.oid) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','app_private') and (p.proname like 'lockliel_%' or p.proname in ('course_watch_met','course_lesson_unlocked','normalize_lesson_asset_duration_verification','validate_course_release','validate_lesson_completion','audit_learning_configuration','current_session_is_active','resolve_content_lesson_for_profile','media_covered_seconds','grip_course_release_ready'))),
 'grants',(select jsonb_agg(to_jsonb(g) order by table_name,grantee,privilege_type) from information_schema.role_table_grants g where table_schema in ('public','app_private') and table_name in (select relname from target) and grantee in ('anon','authenticated','PUBLIC')),
 'column_grants',(select jsonb_agg(to_jsonb(g) order by table_name,column_name,grantee,privilege_type) from information_schema.column_privileges g where table_schema='public' and table_name in (select relname from target) and grantee in ('anon','authenticated','PUBLIC')),
 'content',(select jsonb_agg(to_jsonb(c)-'id' order by position) from content c),
 'compatibility',jsonb_build_object(
  'invalid_duration',(select count(*) from public.lesson_assets where duration_seconds is not null and (duration_seconds<=0 or duration_seconds>86400 or duration_seconds::text in ('NaN','Infinity','-Infinity'))),
  'duration_without_verified_at',(select count(*) from public.lesson_assets where duration_seconds is not null and duration_verified_at is null),
  'non_null_durations',(select count(*) from public.lesson_assets where duration_seconds is not null),
  'invalid_question_arrays',(select count(*) from public.lessons where worksheet_schema ? 'questions' and jsonb_typeof(worksheet_schema->'questions')<>'array'),
  'duplicate_enrollments',(select count(*) from (select profile_id,course_id from public.course_enrollments group by 1,2 having count(*)>1)d),
  'duplicate_progress',(select count(*) from (select profile_id,lesson_id from public.lesson_progress group by 1,2 having count(*)>1)d),
  'invalid_enrollment_status',(select count(*) from public.course_enrollments where status not in ('active','completed')),
  'invalid_progress_status',(select count(*) from public.lesson_progress where status not in ('not_started','in_progress','completed')),
  'orphan_progress',(select count(*) from public.lesson_progress p left join public.lessons l on l.id=p.lesson_id left join public.profiles u on u.id=p.profile_id where l.id is null or u.id is null),
  'progress_without_enrollment',(select count(*) from public.lesson_progress p join public.lessons l on l.id=p.lesson_id where not exists(select 1 from public.course_enrollments e where e.profile_id=p.profile_id and e.course_id=l.course_id)),
  'completed_without_timestamp',(select count(*) from public.lesson_progress where status='completed' and completed_at is null),
  'invalid_answer_shape',(select count(*) from public.lesson_progress where jsonb_typeof(worksheet_answers)<>'object'),
  'rls_disabled',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity)
 ),
 'stats_reset',(select stats_reset from pg_stat_database where datname=current_database()),
 'write_counters',(select jsonb_agg(jsonb_build_object('schema',schemaname,'table',relname,'insert',n_tup_ins,'update',n_tup_upd,'delete',n_tup_del) order by schemaname,relname) from pg_stat_user_tables where schemaname in ('public','auth','storage')),
 'locks',(select coalesce(jsonb_agg(jsonb_build_object('table',t.relname,'mode',l.mode,'granted',l.granted)), '[]') from pg_locks l join target t on t.oid=l.relation where l.pid<>pg_backend_pid()),
 'waiters',(select count(*) from pg_stat_activity where datname=current_database() and wait_event_type='Lock'),
 'active_transactions',(select coalesce(jsonb_agg(jsonb_build_object('state',state,'age_seconds',extract(epoch from clock_timestamp()-xact_start),'wait_type',wait_event_type)), '[]') from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and xact_start is not null)
) as snapshot;
