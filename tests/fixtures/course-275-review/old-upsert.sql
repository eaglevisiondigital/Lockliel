-- Disposable schema274 only. Reproduce the original PostgREST merge-upsert shape.
do $test$
declare a uuid:=gen_random_uuid(); s uuid:=gen_random_uuid(); c uuid; l uuid;
 denied boolean:=false;
begin
 insert into auth.users(id,email) values(a,a||'@example.invalid');
 insert into auth.sessions(id,user_id,aal) values(s,a,'aal1');
 insert into public.courses(slug,title,status) values('old-'||a,'Synthetic old course','published') returning id into c;
 insert into public.lessons(course_id,position,slug,title) values(c,1,'one','Synthetic old lesson') returning id into l;
 insert into public.course_enrollments(profile_id,course_id) values(a,c);
 assert not exists(select 1 from pg_policies where tablename='lesson_progress' and policyname='engine_lesson_insert'), 'Not schema274';
 assert not has_column_privilege('authenticated','public.lesson_progress','profile_id','UPDATE');
 assert not has_column_privilege('authenticated','public.lesson_progress','lesson_id','UPDATE');
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal1','session_id',s)::text,true);
 execute 'set local role authenticated';
 begin
  insert into public.lesson_progress(profile_id,lesson_id,status,worksheet_answers)
  values(a,l,'in_progress','{}') on conflict(profile_id,lesson_id) do update
  set profile_id=excluded.profile_id,lesson_id=excluded.lesson_id,status=excluded.status,worksheet_answers=excluded.worksheet_answers;
 exception when insufficient_privilege then
  assert sqlerrm='permission denied for table lesson_progress', 'Unexpected 403 cause';
  denied:=true;
 end;
 assert denied,'Original identity-column merge-upsert unexpectedly permitted';
 insert into public.lesson_progress(profile_id,lesson_id,status,worksheet_answers) values(a,l,'in_progress','{}');
 assert exists(select 1 from public.lesson_progress where profile_id=a and lesson_id=l),'Plain INSERT failed';
 execute 'reset role';
end;
$test$;
