-- Migration278 regression. Synthetic disposable identities; no hosted fixture execution.
do $test$
declare learner uuid; sid uuid; course_id uuid; translated_course uuid;
 first_lesson uuid; second_lesson uuid; translated_lesson uuid; media uuid;
 state text; localized boolean; result jsonb; before_media jsonb; before_lesson jsonb; rejected boolean; cases integer:=0;
begin
 foreach localized in array array[false,true] loop
  foreach state in array array['published','draft','archived'] loop
   learner:=gen_random_uuid();sid:=gen_random_uuid();
   insert into auth.users(id,email,raw_user_meta_data) values(learner,learner||'@example.invalid','{}');
   insert into auth.sessions(id,user_id,aal) values(sid,learner,'aal1');
   update public.profiles set locale=case when localized then 'es' else 'en' end where id=learner;
   insert into public.courses(slug,title,status,translation_key,language_code,learning_rules)
   values('publication-'||learner,'Synthetic publication diagnostic','published','publication-'||learner,'en',
    '{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0}') returning id into course_id;
   insert into public.lessons(course_id,position,slug,title,translation_key,worksheet_schema)
   values(course_id,1,'one','Synthetic One','publication-one-'||learner,'{"questions":[{"number":1,"text":"Synthetic"}]}') returning id into first_lesson;
   insert into public.lessons(course_id,position,slug,title,translation_key,worksheet_schema)
   values(course_id,2,'two','Synthetic Two','publication-two-'||learner,'{"questions":[{"number":1,"text":"Synthetic"}]}') returning id into second_lesson;
   if localized then
    insert into public.courses(slug,title,status,translation_key,language_code,learning_rules)
    values('publication-es-'||learner,'Synthetic translated diagnostic','published','publication-'||learner,'es',
     '{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0}') returning id into translated_course;
    insert into public.lessons(course_id,position,slug,title,translation_key,worksheet_schema)
    values(translated_course,1,'one-es','Synthetic translated one','publication-one-'||learner,'{"questions":[{"number":1,"text":"Synthetic"}]}') returning id into translated_lesson;
   else translated_lesson:=first_lesson;
   end if;
   insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status,duration_seconds)
   values(translated_lesson,'video','youtube','synthetic01','active',100) returning id into media;
   insert into public.course_enrollments(profile_id,course_id) values(learner,course_id);
   perform set_config('request.jwt.claims',jsonb_build_object('sub',learner,'role','authenticated','aal','aal1','session_id',sid)::text,true);
   execute 'set local role authenticated';
   result:=public.lockliel_sample_media(learner,media,0,false);
   execute 'reset role';
   assert (result->>'percent_watched')::numeric=0,'Published control unexpectedly credited a seek';
   -- Synthetic owner fixture represents 94% legitimately earned while published.
   update public.media_progress set covered_intervals='[[0,94]]',last_sample_at=clock_timestamp()-interval '5 seconds',last_sample_position=94,sample_session=sid
    where profile_id=learner and asset_id=media;
   assert not app_private.course_watch_met(learner,first_lesson),'Fixture was already complete';
   update public.courses set status=state where id=course_id;
   -- For localized cases, the translated media stays published while enrolled canonical changes.
   select to_jsonb(p) into before_media from public.media_progress p where profile_id=learner and asset_id=media;
   select to_jsonb(p) into before_lesson from public.lesson_progress p where profile_id=learner and lesson_id=first_lesson;
   execute 'set local role authenticated';
   rejected:=false;
   begin result:=public.lockliel_sample_media(learner,media,95,true);
   exception when insufficient_privilege then rejected:=true; end;
   execute 'reset role';
   if state<>'published' then
    assert rejected,'Unpublished enrolled course accepted direct sampling';
    assert (select to_jsonb(p)=before_media from public.media_progress p where profile_id=learner and asset_id=media),'Denied sample changed media';
    assert (select to_jsonb(p)=before_lesson from public.lesson_progress p where profile_id=learner and lesson_id=first_lesson),'Denied sample changed lesson';
    assert not app_private.course_watch_met(learner,first_lesson),'Denied sample earned watch credit';
    assert not app_private.course_lesson_unlocked(learner,second_lesson),'Denied sample unlocked next lesson';
    execute 'set local role authenticated';
    assert public.lockliel_course_gates()='[]'::jsonb,'Unpublished canonical gates should be hidden';
    rejected:=false;
    begin perform public.lockliel_save_lesson(learner,first_lesson,0,'{}','',false);
    exception when insufficient_privilege then rejected:=true;end;
    assert rejected,'Save RPC publication control failed';
    execute 'reset role';
    update public.courses set status='published' where id=course_id;
    execute 'set local role authenticated';
    result:=public.lockliel_sample_media(learner,media,95,true);
    execute 'reset role';
   else assert not rejected,'Published sample denied';
   end if;
   assert (result->>'percent_watched')::numeric=95,'Published/republished sample lost95% behavior';
   assert app_private.course_watch_met(learner,first_lesson),'Published sample failed watch requirement';
   assert app_private.course_lesson_unlocked(learner,second_lesson),'Published sample did not unlock next lesson';
   select to_jsonb(p) into before_media from public.media_progress p where profile_id=learner and asset_id=media;
   select to_jsonb(p) into before_lesson from public.lesson_progress p where profile_id=learner and lesson_id=first_lesson;
   update public.courses set status='draft' where id=course_id;
   assert app_private.course_watch_met(learner,first_lesson),'Unpublication destroyed earned history';
   -- Staff membership is not a bypass of the learner RPC publication rule.
   insert into public.staff_roles(profile_id,role) values(learner,'admin');
   execute 'set local role authenticated';
   rejected:=false;begin perform public.lockliel_sample_media(learner,media,96,true);exception when insufficient_privilege then rejected:=true;end;
   assert rejected,'Staff learner bypassed publication';
   rejected:=false;begin perform public.lockliel_sample_media(gen_random_uuid(),media,96,true);exception when insufficient_privilege then rejected:=true;end;
   assert rejected,'Expected-user mismatch accepted';
   execute 'reset role';
   assert (select to_jsonb(p)=before_media from public.media_progress p where profile_id=learner and asset_id=media),'Historical media changed on denial';
   assert (select to_jsonb(p)=before_lesson from public.lesson_progress p where profile_id=learner and lesson_id=first_lesson),'Historical lesson changed on denial';
   cases:=cases+1;
  end loop;
 end loop;
 assert cases=6,'Incomplete state matrix';
 -- Published canonical + unpublished translation correctly falls back to canonical.
 update public.courses set status='published' where id=course_id;
 update public.courses set status='draft' where id=translated_course;
 assert app_private.resolve_content_lesson_for_profile(learner,first_lesson)=first_lesson,'Expected canonical fallback missing';
 execute 'set local role authenticated';
 rejected:=false;begin perform public.lockliel_sample_media(learner,media,96,true);exception when insufficient_privilege then rejected:=true;end;
 assert rejected,'Unselected unpublished translation unexpectedly sampled';
 execute 'reset role';
 -- With both canonical and translation unpublished, resolver still returns canonical.
 update public.courses set status='draft' where id=course_id;
 insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status,duration_seconds)
 values(first_lesson,'video','youtube','fallback001','active',100) returning id into media;
 execute 'set local role authenticated';
 rejected:=false;begin perform public.lockliel_sample_media(learner,media,0,false);exception when insufficient_privilege then rejected:=true;end;
 assert rejected,'Unpublished canonical fallback sampled';
 execute 'reset role';
 assert not exists(select 1 from public.media_progress where profile_id=learner and asset_id=media),'Fallback denial wrote media';
 -- inactive is not a supported course status; verify the actual constraint.
 rejected:=false;begin update public.courses set status='inactive' where id=course_id;exception when check_violation then rejected:=true;end;
 assert rejected,'Unexpected inactive course status support';
end;
$test$;
