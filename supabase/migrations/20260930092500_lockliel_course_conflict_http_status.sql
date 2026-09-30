-- Business revision conflicts must not trigger PostgREST serialization retries.
-- Keep all ownership, session, CAS, completion and note protections unchanged.
create or replace function public.lockliel_save_lesson(expected_user uuid,target_lesson uuid,expected_revision bigint,answers jsonb,notes text,complete boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); lesson public.lessons; progress public.lesson_progress; rules jsonb;
 content_id uuid; questions jsonb; worksheet_done boolean; watch_done boolean; grade numeric; keys jsonb; snapshot jsonb;
begin
 if uid is null or uid is distinct from expected_user or not app_private.current_session_is_active() then raise exception 'Account changed. Sign in again.' using errcode='42501'; end if;
 select l.* into lesson from public.lessons l join public.courses c on c.id=l.course_id
 join public.course_enrollments e on e.course_id=c.id and e.profile_id=uid and e.status in ('active','completed')
 where l.id=target_lesson and c.status='published';
 if lesson.id is null then raise exception 'Lesson unavailable.' using errcode='42501'; end if;
 if not app_private.course_lesson_unlocked(uid,target_lesson) then raise exception 'Previous lesson requirement is not met.' using errcode='42501'; end if;
 if expected_revision is null or expected_revision<0 or answers is null or jsonb_typeof(answers)<>'object' or octet_length(answers::text)>60000
 or notes is null or char_length(notes)>12000 then raise exception 'Invalid lesson response.' using errcode='22023'; end if;
 if (select count(*) from jsonb_each(answers))>100 or exists(select 1 from jsonb_each(answers) x where jsonb_typeof(value)<>'string' or char_length(value#>>'{}')>4000) then raise exception 'Answer limits exceeded.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('lesson:'||uid||':'||target_lesson,0));
 select * into progress from public.lesson_progress where profile_id=uid and lesson_id=target_lesson for update;
 -- A lost response may be retried verbatim; acknowledge the same atomic result.
 if progress.revision=expected_revision+1 and progress.worksheet_answers=answers
 and exists(select 1 from public.lesson_private_notes n where n.profile_id=uid and n.lesson_id=target_lesson and n.body=notes)
 and (not complete or progress.status='completed') then return to_jsonb(progress)||jsonb_build_object('notes',notes); end if;
 if coalesce(progress.revision,0)<>expected_revision then raise exception 'Newer cloud work exists. Reload before saving.' using errcode='PT409'; end if;
 if progress.last_activity_at>clock_timestamp()-interval '300 milliseconds' then raise exception 'Save rate exceeded.' using errcode='54000'; end if;
 content_id:=app_private.resolve_content_lesson_for_profile(uid,target_lesson);
 select learning_rules into rules from public.courses where id=lesson.course_id;
 select worksheet_schema->'questions' into questions from public.lessons where id=content_id;
 questions:=coalesce(questions,'[]'::jsonb);
 -- Preserve exactly which prompts/version were answered. Completed answers are immutable; notes remain editable.
 snapshot:=case when progress.content_snapshot ? 'questions' then progress.content_snapshot else jsonb_build_object('configuration_version',lesson.configuration_version,'questions',questions,'rules',rules,'media',(select coalesce(jsonb_agg(jsonb_build_object('asset',id,'provider_ref',provider_ref,'duration_seconds',duration_seconds)),'[]') from public.lesson_assets where lesson_id=content_id and asset_type='video' and status='active')) end;
 questions:=snapshot->'questions';
 if progress.status='completed' then
  if answers is distinct from progress.worksheet_answers then raise exception 'Completed answers cannot be changed.' using errcode='22023'; end if;
  snapshot:=progress.content_snapshot;
  worksheet_done:=true;
 else
  worksheet_done:=not exists(select 1 from jsonb_array_elements(questions) q
   where coalesce((q->>'required')::boolean,true) and nullif(btrim(answers->>coalesce(q->>'number',q->>'id')),'') is null);
 end if;
 watch_done:=app_private.course_watch_met(uid,target_lesson);
 if complete and progress.status is distinct from 'completed' then
  if rules->>'model' in ('watch_answer','watch_score','review') and coalesce((rules->>'worksheet_required')::boolean,true) and jsonb_array_length(questions)=0 then raise exception 'Worksheet configuration is pending.' using errcode='22023'; end if;
  if not watch_done or not worksheet_done then raise exception 'Watch and worksheet requirements are not met.' using errcode='22023'; end if;
  if rules->>'model'='review' and progress.review_approved_at is null then raise exception 'Course manager review is required.' using errcode='22023'; end if;
  if rules->>'model'='watch_score' then
   select k.answers into keys from app_private.course_answer_keys k where k.lesson_id=content_id and k.configuration_version=(snapshot->>'configuration_version')::integer;
   if keys is null or keys='{}'::jsonb then raise exception 'Scoring is not configured.' using errcode='22023'; end if;
   select 100.0*count(*) filter(where lower(btrim(answers->>key))=lower(btrim(value#>>'{}')))/count(*) into grade from jsonb_each(keys);
   if grade<(rules->>'minimum_score')::numeric then raise exception 'The configured score requirement is not met.' using errcode='22023'; end if;
  end if;
 end if;
 insert into public.lesson_progress(profile_id,lesson_id,status,worksheet_status,worksheet_answers,revision,content_snapshot,watch_requirement_met_at)
 values(uid,target_lesson,case when complete or progress.status='completed' then 'completed' else 'in_progress' end,
 case when worksheet_done then 'completed' else 'in_progress' end,answers,expected_revision+1,snapshot,
 coalesce(progress.watch_requirement_met_at,case when watch_done then clock_timestamp() end))
 on conflict(profile_id,lesson_id) do update set status=excluded.status,worksheet_status=excluded.worksheet_status,
 worksheet_answers=excluded.worksheet_answers,revision=excluded.revision,content_snapshot=excluded.content_snapshot,
 watch_requirement_met_at=coalesce(public.lesson_progress.watch_requirement_met_at,excluded.watch_requirement_met_at) returning * into progress;
 insert into public.lesson_private_notes(profile_id,lesson_id,body) values(uid,target_lesson,notes)
 on conflict(profile_id,lesson_id) do update set body=excluded.body,updated_at=clock_timestamp();
 return to_jsonb(progress)||jsonb_build_object('notes',notes);
end; $$;
revoke all on function public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean) from public,anon;
grant execute on function public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean) to authenticated;

