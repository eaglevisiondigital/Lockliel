-- SELECT only. Valid after migration 275. Never invokes a mutating RPC.
select jsonb_build_object(
 'ledger_count',(select count(*) from supabase_migrations.schema_migrations),
 'grip_rules_invalid',(select count(*) from public.courses where translation_key='getting-a-grip-on-the-basics' and not coalesce(learning_rules->>'model'='watch_answer' and (learning_rules->>'watch_threshold')::numeric=95 and (learning_rules->>'minimum_score')::numeric=0 and (learning_rules->>'sequential')::boolean,false)),
 'duration_invalid',(select count(*) from public.lesson_assets where (duration_seconds is null)<>(duration_verification_source is null) or (duration_seconds is not null and (duration_verified_at is null or char_length(duration_verification_source) not between 10 and 500))),
 'notes_rls',(select relrowsecurity from pg_class where oid='public.lesson_private_notes'::regclass),
 'keys_rls',(select relrowsecurity from pg_class where oid='app_private.course_answer_keys'::regclass),
 'notes_authenticated_select',has_table_privilege('authenticated','public.lesson_private_notes','SELECT'),
 'notes_authenticated_write',has_table_privilege('authenticated','public.lesson_private_notes','INSERT,UPDATE,DELETE'),
 'notes_anon_any',has_table_privilege('anon','public.lesson_private_notes','SELECT,INSERT,UPDATE,DELETE'),
 'keys_authenticated_any',has_table_privilege('authenticated','app_private.course_answer_keys','SELECT,INSERT,UPDATE,DELETE'),
 'keys_anon_any',has_table_privilege('anon','app_private.course_answer_keys','SELECT,INSERT,UPDATE,DELETE'),
 'save_authenticated',has_function_privilege('authenticated','public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)','EXECUTE'),
 'save_anon',has_function_privilege('anon','public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)','EXECUTE'),
 'save_conflict_40001',position('errcode=''40001''' in pg_get_functiondef('public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)'::regprocedure))>0,
 'save_conflict_pt409',position('errcode=''PT409''' in pg_get_functiondef('public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)'::regprocedure))>0,
 'release_trigger_definer',(select prosecdef from pg_proc where oid='app_private.validate_course_release()'::regprocedure),
 'release_trigger_authenticated',has_function_privilege('authenticated','app_private.validate_course_release()','EXECUTE'),
 'notes_orphans',(select count(*) from public.lesson_private_notes n left join public.lesson_progress p using(profile_id,lesson_id) where p.profile_id is null),
 'negative_revisions',(select count(*) from public.lesson_progress where revision<0),
 'invalid_snapshots',(select count(*) from public.lesson_progress where jsonb_typeof(content_snapshot)<>'object'),
 'progress_totals_invalid',(select count(*) from public.course_enrollments e where (select count(*) from public.lesson_progress p join public.lessons l on l.id=p.lesson_id where p.profile_id=e.profile_id and l.course_id=e.course_id and p.status='completed')>(select count(*) from public.lessons l where l.course_id=e.course_id))
) as postconditions;
