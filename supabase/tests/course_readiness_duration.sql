-- Rollback-only fixture in the disposable PostgreSQL runner.
do $test$
declare u uuid:=gen_random_uuid(); s uuid:=gen_random_uuid(); admin_user uuid:=gen_random_uuid(); admin_session uuid:=gen_random_uuid(); c uuid; l uuid; a uuid; denied boolean; r jsonb;
begin
 insert into auth.users(id,email,raw_user_meta_data) values(u,u||'@example.invalid','{}'),(admin_user,admin_user||'@example.invalid','{}');
 insert into auth.sessions(id,user_id,aal) values(s,u,'aal1'),(admin_session,admin_user,'aal2');
 insert into public.staff_roles(profile_id,role) values(admin_user,'content_admin');
 insert into public.courses(slug,title,status,translation_key,learning_rules) values('duration-'||u,'Synthetic duration','published','duration-'||u,'{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0}') returning id into c;
 insert into public.lessons(course_id,position,slug,title,worksheet_schema) values(c,1,'duration','Synthetic duration','{"questions":[{"number":1,"text":"Reflection"}]}') returning id into l;
 insert into public.course_enrollments(profile_id,course_id) values(u,c);
 assert not app_private.course_watch_met(u,l),'Missing video granted watch completion';
 insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status) values(l,'video','youtube','synthetic01','active') returning id into a;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated','aal','aal1','session_id',s)::text,true);
 execute 'set local role authenticated';
 r:=public.lockliel_sample_media(u,a,99,false);
 assert (r->>'percent_watched')::numeric=0,'Unknown duration awarded percent';
 perform pg_sleep(0.31);
 denied:=false;begin perform public.lockliel_save_lesson(u,l,0,'{"1":"Answer"}','',true);exception when invalid_parameter_value then denied:=true;end;
 assert denied,'Unknown duration allowed completion';
 update public.lesson_assets set duration_seconds=100,duration_verification_source='Forged member duration' where id=a;
 assert not found,'Member changed trusted duration';
 execute 'reset role';
 assert not app_private.course_watch_met(u,l),'Missing trusted duration met watch gate';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',admin_user,'role','authenticated','aal','aal2','session_id',admin_session)::text,true);
 execute 'set local role authenticated';
 update public.lesson_assets set duration_seconds=100,duration_verification_source='Manual approved provider verification' where id=a;
 assert found,'MFA content administrator could not verify duration';
 execute 'reset role';
 assert (select duration_verified_at is not null and duration_verification_source='Manual approved provider verification' from public.lesson_assets where id=a),'Missing provenance or timestamp';
 denied:=false;begin update public.lesson_assets set provider_ref='replacement' where id=a;
  exception when check_violation then denied:=true;end;
 assert denied,'Watched asset identity changed';
 update public.lesson_assets set duration_seconds=null where id=a;
 assert (select duration_seconds is null and duration_verified_at is null and duration_verification_source is null from public.lesson_assets where id=a),'Changed video reused trusted duration';
 update public.lesson_assets set duration_seconds=100,duration_verification_source='Replacement provider verified' where id=a;
 update public.media_progress set covered_intervals='[[0,94]]' where profile_id=u and asset_id=a;
 assert not app_private.course_watch_met(u,l),'94 percent passed';
 update public.media_progress set covered_intervals='[[0,95]]' where profile_id=u and asset_id=a;
 assert app_private.course_watch_met(u,l),'95 percent failed';
 update public.lessons set worksheet_schema='{}' where id=l;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated','aal','aal1','session_id',s)::text,true);
 execute 'set local role authenticated';
 denied:=false;begin perform public.lockliel_save_lesson(u,l,0,'{}','',true);exception when invalid_parameter_value then denied:=true;end;
 assert denied,'Missing required worksheet granted completion';
 execute 'reset role';
 -- Grip cannot be cleared or downgraded, even by a trusted manager.
 for r in select v from (values ('{}'::jsonb),('{"model":"simple","sequential":true,"watch_threshold":95,"minimum_score":0}'::jsonb),('{"model":"watch_answer","sequential":true,"watch_threshold":94,"minimum_score":0}'::jsonb),('{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0,"worksheet_required":false}'::jsonb)) bad(v) loop
  denied:=false;begin update public.courses set learning_rules=r where translation_key='getting-a-grip-on-the-basics';exception when check_violation then denied:=true;end;
  assert denied,'Permanent Grip model was weakened';
 end loop;
 assert (select relrowsecurity from pg_class where oid='app_private.course_answer_keys'::regclass),'Private grading RLS disabled';
end;
$test$;
