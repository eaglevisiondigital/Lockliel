-- REVIEW ONLY. No migration, mutation, hook installation, seed, role switch or fixture.
-- Pin client host to db.bsndfhbemstyrrglajat.supabase.co:5432 and verify-full CA.
-- Startup: default_transaction_read_only=on, lock_timeout=5s, statement_timeout=30s.
-- Execute twice >=10s apart in independent sessions. No pooler substitution.
BEGIN READ ONLY;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
SELECT current_database(), current_setting('server_version') AS server_version,
 current_setting('transaction_read_only') AS readonly,
 current_setting('lock_timeout') AS lock_timeout,
 current_setting('statement_timeout') AS statement_timeout,
 ssl,version AS tls,cipher FROM pg_stat_ssl WHERE pid=pg_backend_pid();
-- Ordered versions must equal the original274 manifest, with no275+ versions.
-- Ledger statement digests are provider serialization fingerprints, not SQL-file SHA256.
SELECT count(*) AS ledger_count,max(version) AS ledger_last,
 jsonb_agg(jsonb_build_object('version',version,'statements_md5',md5(statements::text)) ORDER BY version) AS ledger
 FROM supabase_migrations.schema_migrations;
-- Aggregate-only snapshots. No answers, notes, contact fields, credentials or query text.
SELECT clock_timestamp() AS observed_at,
 (SELECT count(*) FROM public.profiles) AS members,
 (SELECT count(*) FROM public.course_enrollments) AS enrollments,
 (SELECT count(*) FROM public.lesson_progress) AS progress,
 (SELECT count(*) FROM public.media_progress) AS media_progress,
 (SELECT count(*) FROM public.staff_roles) AS staff,
 (SELECT count(*) FROM public.share_assets) AS share_assets,
 (SELECT count(*) FROM public.payment_provider_connections) AS payment_connections,
 (SELECT count(*) FROM public.partner_checkout_state) AS checkout_rows,
 (SELECT count(*) FROM storage.objects WHERE bucket_id='lesson-assets') AS resource_objects,
 (SELECT NOT public FROM storage.buckets WHERE id='lesson-assets') AS resources_private,
 (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity) AS public_rls_disabled,
 to_regprocedure('public.lockliel_course_cutover_status()') IS NOT NULL AS maintenance_installed;
-- Fingerprints only, never export protected row values. Equality detects drift, not a backup.
SELECT 'staff' AS scope,count(*) AS rows,md5(coalesce(string_agg(t::text,'|' ORDER BY t::text),'')) AS digest FROM public.staff_roles t
UNION ALL SELECT 'payments',count(*),md5(coalesce(string_agg(t::text,'|' ORDER BY t::text),'')) FROM public.payment_provider_connections t
UNION ALL SELECT 'checkout',count(*),md5(coalesce(string_agg(t::text,'|' ORDER BY t::text),'')) FROM public.partner_checkout_state t
UNION ALL SELECT 'share',count(*),md5(coalesce(string_agg(t::text,'|' ORDER BY t::text),'')) FROM public.share_assets t
UNION ALL SELECT 'flags',count(*),md5(coalesce(string_agg(t::text,'|' ORDER BY t::text),'')) FROM public.feature_flags t;
-- Catalog fingerprints for comparison; no function bodies or policy expressions exported.
SELECT 'policies' AS scope,count(*) AS objects,md5(coalesce(string_agg(p::text,'|' ORDER BY p::text),'')) AS digest FROM pg_policies p WHERE schemaname IN ('public','app_private','storage')
UNION ALL SELECT 'public_table_grants',count(*),md5(coalesce(string_agg(g::text,'|' ORDER BY g::text),'')) FROM information_schema.role_table_grants g WHERE table_schema='public'
UNION ALL SELECT 'public_column_grants',count(*),md5(coalesce(string_agg(g::text,'|' ORDER BY g::text),'')) FROM information_schema.column_privileges g WHERE table_schema='public';
SELECT n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS arguments,
 md5(pg_get_functiondef(p.oid)) AS definition_digest
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname IN ('public','app_private') AND p.prokind='f'
 AND (p.proname LIKE 'lockliel_%' OR p.proname IN ('course_watch_met','course_lesson_unlocked','validate_course_release','validate_lesson_completion'))
 ORDER BY 1,2,3;
SELECT stats_reset FROM pg_stat_database WHERE datname=current_database();
SELECT schemaname,relname,n_tup_ins,n_tup_upd,n_tup_del FROM pg_stat_user_tables
 WHERE schemaname IN ('public','auth','storage') ORDER BY 1,2;
SELECT c.relname,l.mode,l.granted FROM pg_locks l JOIN pg_class c ON c.oid=l.relation
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
 AND c.relname IN ('courses','lessons','lesson_assets','course_enrollments','lesson_progress','media_progress')
 AND l.pid<>pg_backend_pid();
SELECT count(*) FILTER (WHERE wait_event_type='Lock') AS lock_waiters,
 count(*) FILTER (WHERE xact_start IS NOT NULL) AS open_other_transactions,
 max(extract(epoch FROM clock_timestamp()-xact_start)) AS oldest_seconds
 FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid();
-- Public course inventory only. Protected paths/object payloads are intentionally omitted.
SELECT l.position,l.title,a.id AS asset_id,a.provider,a.provider_ref,a.duration_seconds,
 a.duration_verified_at,to_jsonb(a)->>'duration_verification_source' AS duration_source,
 (SELECT count(*) FROM lesson_assets p WHERE p.lesson_id=l.id AND p.asset_type='pdf'
 AND p.status='active' AND EXISTS(SELECT 1 FROM storage.objects o
 WHERE o.bucket_id='lesson-assets' AND o.name=p.storage_path)) AS protected_pdf_count
 FROM lessons l JOIN courses c ON c.id=l.course_id LEFT JOIN lesson_assets a
 ON a.lesson_id=l.id AND a.asset_type='video' AND a.status='active'
 WHERE c.translation_key='getting-a-grip-on-the-basics' ORDER BY l.position,a.id;
ROLLBACK;
