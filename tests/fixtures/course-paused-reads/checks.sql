-- Disposable only, no hosted fixtures or permission probes.
create function pg_temp.hook(path text,method text) returns void language plpgsql as $$begin
 perform set_config('request.path',path,true);perform set_config('request.method',method,true);
 perform lockliel_cutover.request();
end$$;
create function pg_temp.denied(path text,method text) returns void language plpgsql as $$begin
 begin perform pg_temp.hook(path,method);raise exception 'Expected maintenance denial: % %',method,path;
 exception when sqlstate 'PT503' then null;end;
end$$;
do $test$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); sid uuid:=gen_random_uuid(); other_session uuid:=gen_random_uuid(); c uuid; draft uuid; l uuid; draft_l uuid; asset uuid; lp jsonb; method text; path text; claims text;
begin
 insert into auth.users(id,email) values(a,a||'@example.invalid'),(b,b||'@example.invalid');
 insert into auth.sessions(id,user_id,aal) values(sid,a,'aal1'),(other_session,b,'aal1');
 insert into public.courses(slug,title,status,translation_key,language_code,learning_rules) values('paused-'||a,'Synthetic paused','published','paused-'||a,'en','{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0}') returning id into c;
 insert into public.courses(slug,title,status,translation_key,language_code) values('draft-'||a,'Hidden draft','draft','draft-'||a,'en') returning id into draft;
 insert into public.lessons(course_id,position,slug,title,translation_key,worksheet_schema) values(c,1,'one','Synthetic one','one-'||a,'{"questions":[{"number":1,"text":"Reflection"}]}') returning id into l;
 insert into public.lessons(course_id,position,slug,title,translation_key) values(draft,1,'draft','Hidden draft','draft-one-'||a) returning id into draft_l;
 insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status) values(l,'video','youtube','synthetic01','active') returning id into asset;
 insert into public.course_enrollments(profile_id,course_id) values(a,c),(b,c),(a,draft);
 insert into public.lesson_progress(profile_id,lesson_id,last_activity_at) values(a,l,now()-interval '1 minute'),(b,l,now()-interval '1 minute');
 insert into public.lesson_private_notes(profile_id,lesson_id,body) values(a,l,'Never expose this note'),(b,l,'Other private note');
 insert into app_private.course_answer_keys(lesson_id,configuration_version,answers) values(l,1,'{"1":"Private grading key"}');
 claims:=jsonb_build_object('sub',a,'session_id',sid,'role','authenticated','aal','aal1')::text;
 perform set_config('request.jwt.claims',claims,true);
 set local role authenticated;
 foreach path in array array['/courses','/lessons','/lesson_assets','/course_enrollments','/lesson_progress','/media_progress'] loop
  foreach method in array array['GET','HEAD'] loop perform pg_temp.hook(path,method);end loop;
  foreach method in array array['POST','PATCH','PUT','DELETE'] loop perform pg_temp.denied(path,method);end loop;
 end loop;
 perform pg_temp.hook('/courses','GET');
 assert exists(select 1 from public.courses where id=c),'Published course hidden';
 assert not exists(select 1 from public.courses where id=draft),'Draft exposed';
 perform pg_temp.hook('/lessons','GET');
 assert exists(select 1 from public.lessons where id=l),'Enrolled lesson hidden';
 assert not exists(select 1 from public.lessons where id=draft_l),'Draft lesson exposed';
 perform pg_temp.hook('/lesson_progress','GET');
 assert exists(select 1 from public.lesson_progress where profile_id=a) and not exists(select 1 from public.lesson_progress where profile_id=b),'A/B progress isolation failed';
 perform pg_temp.hook('/course_enrollments','GET');
 assert not exists(select 1 from public.course_enrollments where profile_id=b),'Other enrollment exposed';
 perform pg_temp.hook('/lesson_assets','GET');assert exists(select 1 from public.lesson_assets where id=asset),'Active resource hidden';
 perform pg_temp.hook('/rpc/lockliel_course_gates','POST');assert jsonb_array_length(public.lockliel_course_gates())=1,'Gate projection wrong';
 foreach path in array array['/rpc/lockliel_save_lesson','/rpc/lockliel_sample_media','/rpc/lockliel_grip_readiness','/rpc/arbitrary_course_write','/lesson_private_notes'] loop
  perform pg_temp.denied(path,'POST');perform pg_temp.denied(path,'GET');
 end loop;
 perform pg_temp.hook('/profiles','GET');
 assert not exists(select 1 from public.lessons where id=l),'Unrelated embedded path exposed lessons';
 assert not exists(select 1 from public.lesson_private_notes),'Embedded private notes exposed';
 perform set_config('request.path','',true);perform set_config('request.method','',true);
 foreach path in array array['object.list','object.upload','object.delete','object.update','object.sign','object.get',''] loop
  perform set_config('storage.operation',path,true);assert not lockliel_cutover.safe_read(),'Unexpected Storage operation admitted';
 end loop;
 perform set_config('storage.operation','object.get_authenticated_info',true);
 assert lockliel_cutover.safe_read(),'Authenticated download metadata blocked';
 perform set_config('storage.operation','storage.object.get_authenticated',true);
 assert lockliel_cutover.safe_read(),'Authenticated download context blocked';
 assert exists(select 1 from public.lessons where id=l),'Enrolled download metadata blocked';
 assert not exists(select 1 from public.lessons where id=draft_l),'Storage exception exposed draft';
 assert not exists(select 1 from public.lesson_private_notes),'Storage exception exposed notes';
 perform set_config('storage.operation','',true);

 begin perform 1 from app_private.course_answer_keys;raise exception 'Grading keys exposed';exception when insufficient_privilege then null;end;
 -- The existing normalization trigger stamps now(); age this local fixture past its rate window.
 perform pg_sleep(0.35);
 -- Direct/indirect calls cannot bypass triggers by skipping the request hook.
 perform set_config('request.path','/rpc/lockliel_save_lesson',true);perform set_config('request.method','POST',true);
 begin perform public.lockliel_save_lesson(a,l,0,'{"1":"Synthetic"}','Synthetic note',false);raise exception 'Save succeeded while paused';exception when sqlstate 'PT503' then null;end;
 begin perform public.lockliel_sample_media(a,asset,0,false);raise exception 'Media succeeded while paused';exception when sqlstate 'PT503' then null;end;
 begin update lockliel_cutover.control set paused=false;raise exception 'Member changed pause';exception when insufficient_privilege then null;end;
 reset role;
 begin update public.lesson_private_notes set body='No mutation' where profile_id=a;raise exception 'Indirect note write succeeded';exception when sqlstate 'PT503' then null;end;
 begin insert into public.course_enrollments(profile_id,course_id) values(b,draft);raise exception 'Indirect enrollment write succeeded';exception when sqlstate 'PT503' then null;end;
 perform set_config('request.jwt.claims','{}',true);
 set local role anon;perform pg_temp.denied('/lessons','GET');reset role;
 perform set_config('request.jwt.claims',claims,true);
 -- Existing enrollment cannot expose an archived course, even in read mode.
 perform set_config('request.jwt.claims','',true);
 update public.courses set status='archived' where id=c;
 perform set_config('request.jwt.claims',claims,true);set local role authenticated;
 perform pg_temp.hook('/lessons','GET');assert not exists(select 1 from public.lessons where id=l),'Archived lesson exposed';
 reset role;
 assert not has_table_privilege('service_role','public.lesson_private_notes','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN');
 assert public.lockliel_course_cutover_status()='{"paused":true,"protocol":"278-v1","schemaReady":true}'::jsonb;
end;$test$;
