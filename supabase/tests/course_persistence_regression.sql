-- Disposable cluster only. Reproduce the production REST conflict-update shape.
do $test$
declare
  learner uuid := gen_random_uuid();
  target_course uuid;
  target_lesson uuid;
  denied boolean := false;
begin
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
    values(learner,'course-fixture-'||learner||'@example.invalid',now(),'{}');
  insert into public.courses(slug,title,status,translation_key)
    values('fixture-'||learner,'Synthetic Persistence Course','published','fixture-'||learner)
    returning id into target_course;
  insert into public.lessons(course_id,position,slug,title,worksheet_schema)
    values(target_course,1,'fixture-one','Synthetic Lesson','{"questions":[{"number":1,"text":"Synthetic prompt"}]}')
    returning id into target_lesson;
  insert into public.course_enrollments(profile_id,course_id)
    values(learner,target_course) on conflict(profile_id,course_id) do nothing;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',learner,'role','authenticated','aal','aal1')::text,true);
  execute 'set local role authenticated';
  begin
    insert into public.lesson_progress(profile_id,lesson_id,status,worksheet_status,worksheet_answers)
    values(learner,target_lesson,'in_progress','in_progress','{"1":"Synthetic response"}')
    on conflict(profile_id,lesson_id) do update set
      profile_id=excluded.profile_id,lesson_id=excluded.lesson_id,
      status=excluded.status,worksheet_status=excluded.worksheet_status,
      worksheet_answers=excluded.worksheet_answers;
  exception when insufficient_privilege then denied:=true; end;
  assert denied,'Old REST merge unexpectedly has UPDATE identity privileges';
  assert not exists(select 1 from public.lesson_progress where lesson_id=target_lesson),
    'Failed upsert unexpectedly persisted a row';
  -- The existing grants admit a narrow SQL upsert that never updates identity.
  insert into public.lesson_progress(profile_id,lesson_id,status,worksheet_status,worksheet_answers)
    values(learner,target_lesson,'in_progress','in_progress','{"1":"Synthetic response"}')
    on conflict(profile_id,lesson_id) do update set
      status=excluded.status,worksheet_status=excluded.worksheet_status,
      worksheet_answers=excluded.worksheet_answers;
  assert (select worksheet_answers->>'1'='Synthetic response' from public.lesson_progress
    where profile_id=learner and lesson_id=target_lesson),'Narrow write did not persist';
  execute 'reset role';
end;
$test$;
