-- Authoritative280 synthetic regression. Disposable or explicitly isolated rollback-only.
create temporary table duration_policy_results(case_number integer, name text, passed boolean);
do $test$
declare n integer; u uuid; sid uuid; c uuid; l uuid; next_lesson uuid; asset uuid;
 result jsonb; before_evidence jsonb; earned_at timestamptz; finished_at timestamptz;
 denied boolean; blocked boolean; preserved boolean; wrong_identity_blocked boolean; replacement uuid; mutation text; original_result jsonb;
begin
 for n in 1..8 loop
  u:=gen_random_uuid();sid:=gen_random_uuid();
  perform set_config('request.jwt.claims','{}',true);
  insert into auth.users(id,email) values(u,u||'@example.invalid');
  insert into auth.sessions(id,user_id,aal) values(sid,u,'aal1');
  insert into public.courses(slug,title,status,translation_key,learning_rules)
   values('policy-'||u,'Synthetic duration policy','published','policy-'||u,
    '{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0}') returning id into c;
  insert into public.lessons(course_id,position,slug,title,worksheet_schema)
   values(c,1,'first-'||u,'Synthetic first','{"questions":[{"number":1,"text":"Reflection"}]}') returning id into l;
  insert into public.lessons(course_id,position,slug,title,worksheet_schema)
   values(c,2,'next-'||u,'Synthetic next','{"questions":[{"number":1,"text":"Reflection"}]}') returning id into next_lesson;
  insert into public.course_enrollments(profile_id,course_id) values(u,c);
  insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status,duration_seconds,duration_verification_source)
   values(l,'video','youtube','synthetic01','active',case when n=1 then null else 100 end,
    case when n=1 then null else 'Synthetic provider verification for synthetic01' end) returning id into asset;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',sid,'role','authenticated','aal','aal1')::text,true);
  if n in (3,4,5,8) then
   -- Fixture seeds elapsed telemetry, then the real authenticated sampler earns
   -- the final interval and threshold timestamp. No synthetic timestamp shortcut.
   insert into public.media_progress(profile_id,asset_id,covered_intervals,last_sample_at,last_sample_position,sample_session)
    values(u,asset,'[[0,94]]',clock_timestamp()-interval '5 seconds',94,sid);
   execute 'set local role authenticated';
   result:=public.lockliel_sample_media(u,asset,95,true);
   execute 'reset role';
   assert (result->>'percent_watched')::numeric=95;
   select watch_requirement_met_at into earned_at from public.lesson_progress where profile_id=u and lesson_id=l;
   assert earned_at is not null,'Fixture did not earn threshold';
   select covered_intervals into before_evidence from public.media_progress where profile_id=u and asset_id=asset;
  end if;

  if n=1 then
   denied:=false;begin update public.lesson_assets set duration_seconds=0,duration_verification_source='Synthetic invalid duration' where id=asset;
    exception when invalid_parameter_value then denied:=true;end;
   assert denied,'Invalid trusted duration was accepted';
   execute 'set local role authenticated';
   result:=public.lockliel_sample_media(u,asset,99,false);
   perform pg_sleep(0.31);
   denied:=false;begin perform public.lockliel_save_lesson(u,l,0,'{"1":"Synthetic answer"}','',true);
    exception when invalid_parameter_value then denied:=true;end;
   execute 'reset role';
   insert into duration_policy_results values(n,'Missing duration, no history',
    denied and not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson)
    and (select watch_requirement_met_at is null from public.lesson_progress where profile_id=u and lesson_id=l));
  elsif n=2 then
   insert into public.media_progress(profile_id,asset_id,covered_intervals,last_sample_at,last_sample_position,sample_session)
    values(u,asset,'[[0,50]]',clock_timestamp()-interval '5 seconds',50,sid);
   update public.lesson_assets set duration_seconds=null where id=asset;
   execute 'set local role authenticated';result:=public.lockliel_sample_media(u,asset,55,true);execute 'reset role';
   insert into duration_policy_results values(n,'Missing duration, partial history',
    not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson)
    and (select watch_requirement_met_at is null from public.lesson_progress where profile_id=u and lesson_id=l)
    and (select app_private.media_covered_seconds(covered_intervals)>=50 from public.media_progress where profile_id=u and asset_id=asset));
  elsif n=3 then
   update public.lesson_assets set duration_seconds=null where id=asset;
   blocked:=not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson);
   perform pg_sleep(0.31);
   execute 'set local role authenticated';
   denied:=false;begin perform public.lockliel_save_lesson(u,l,0,'{"1":"Synthetic answer"}','',true);
    exception when invalid_parameter_value then denied:=true;end;
   execute 'reset role';
   preserved:=(select watch_requirement_met_at=earned_at from public.lesson_progress where profile_id=u and lesson_id=l)
    and (select covered_intervals=before_evidence from public.media_progress where profile_id=u and asset_id=asset);
   assert preserved,'Historical evidence was erased';
   insert into duration_policy_results values(n,'Historical threshold cannot newly advance/complete without current trust',blocked and denied and preserved);
  elsif n=4 then
   perform pg_sleep(0.31);
   execute 'set local role authenticated';
   result:=public.lockliel_save_lesson(u,l,0,'{"1":"Synthetic answer"}','',true);
   execute 'reset role';
   assert result->>'status'='completed';
   select completed_at into finished_at from public.lesson_progress where profile_id=u and lesson_id=l;
   update public.lesson_assets set duration_seconds=null where id=asset;
   perform pg_sleep(0.31);
   execute 'set local role authenticated';
   result:=public.lockliel_save_lesson(u,l,1,'{"1":"Synthetic answer"}','Preserved private note',false);
   execute 'reset role';
   assert (select body='Preserved private note' from public.lesson_private_notes where profile_id=u and lesson_id=l),'Completed lesson notes were not saved';
   original_result:=result;
   execute 'set local role authenticated';
   result:=public.lockliel_save_lesson(u,l,1,'{"1":"Synthetic answer"}','Preserved private note',false);
   execute 'reset role';
   assert result=original_result,'Completed notes retry was not idempotent';
   update public.courses set learning_rules=jsonb_set(learning_rules,'{model}','"watch_score"') where id=c;
   assert not app_private.course_lesson_unlocked(u,next_lesson),'Model B historical completion bypassed current media trust';
   insert into duration_policy_results values(n,'Valid completed lesson remains completed and readable',
    result->>'status'='completed' and app_private.course_lesson_unlocked(u,l)
    and (select completed_at=finished_at and watch_requirement_met_at=earned_at from public.lesson_progress where profile_id=u and lesson_id=l));
  elsif n=5 then
   update public.lesson_assets set duration_seconds=null where id=asset;
   update public.lesson_assets set duration_seconds=100,duration_verification_source='Synthetic provider re-verification for synthetic01' where id=asset;
   blocked:=app_private.course_watch_met(u,l) and app_private.course_lesson_unlocked(u,next_lesson);
   perform pg_sleep(0.31);
   execute 'set local role authenticated';
   result:=public.lockliel_save_lesson(u,l,0,'{"1":"Synthetic answer"}','',true);
   execute 'reset role';
   insert into duration_policy_results values(n,'Restored trusted duration resumes legitimate progression',blocked and result->>'status'='completed');
  elsif n=6 then
   execute 'set local role authenticated';
   denied:=false;begin insert into public.media_progress(profile_id,asset_id,percent_watched) values(u,asset,100);
    exception when insufficient_privilege then denied:=true;end;
   execute 'reset role';
   insert into public.lesson_progress(profile_id,lesson_id,status,watch_requirement_met_at) values(u,l,'in_progress',clock_timestamp());
   assert not app_private.course_watch_met(u,l),'Cached timestamp alone authorized progression';
   insert into duration_policy_results values(n,'Forged browser percentage rejected',denied and not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson));
  elsif n=7 then
   execute 'set local role authenticated';result:=public.lockliel_sample_media(u,asset,0,false);execute 'reset role';
   update public.media_progress set last_sample_at=clock_timestamp()-interval '5 seconds' where profile_id=u and asset_id=asset;
   execute 'set local role authenticated';result:=public.lockliel_sample_media(u,asset,99,true);execute 'reset role';
   insert into duration_policy_results values(n,'Seek-to-end earns no threshold',
    (result->>'percent_watched')::numeric=0 and not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson));
  elsif n=8 then
   -- A watched asset cannot silently become a different video, even if later
   -- metadata is verified again. Replacement uses a new identity and no old credit.
   foreach mutation in array array[
    'lesson_id='||quote_literal(next_lesson), 'asset_type=''audio''', 'provider=''vimeo''',
    'provider_ref=''replacement''', 'external_url=''https://example.invalid/replacement''', 'storage_path=''synthetic/replacement'''
   ] loop
    denied:=false;begin execute 'update public.lesson_assets set '||mutation||' where id='||quote_literal(asset);
     exception when check_violation then denied:=position('watch history' in sqlerrm)>0;
      when raise_exception then denied:=
       (mutation like 'lesson_id=%' and sqlerrm='Lesson asset identity cannot be moved to another lesson.') or
       (mutation='provider=''vimeo''' and sqlerrm='Active video assets require a YouTube provider and video reference.');end;
    assert denied,'Watched asset identity changed';
   end loop;
   assert (select provider_ref='synthetic01' from public.lesson_assets where id=asset);
   update public.lesson_assets set status='draft' where id=asset;
   insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status,duration_seconds,duration_verification_source)
    values(l,'video','youtube','replacement','active',100,'Synthetic verification for replacement') returning id into replacement;
   wrong_identity_blocked:=not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson);
   assert (select covered_intervals=before_evidence from public.media_progress where profile_id=u and asset_id=asset),'Old telemetry erased';
   execute 'set local role authenticated';
   result:=public.lockliel_sample_media(u,replacement,99,false);
   execute 'reset role';
   assert (result->>'percent_watched')::numeric=0,'Replacement borrowed old coverage';
   update public.lesson_assets set status='draft' where id=replacement;
   update public.lesson_assets set status='active' where id=asset;
   -- Deliberately corrupt ONLY provenance in this rolled-back disposable fixture
   -- to prove defense in depth, independently of normalizer/constraint protection.
   alter table public.lesson_assets disable trigger normalize_lesson_asset_duration_verification_trigger;
   alter table public.lesson_assets drop constraint lesson_asset_duration_source_consistency;
   update public.lesson_assets set duration_verification_source=null where id=asset;
   blocked:=not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson);
   update public.lesson_assets set duration_verification_source='          ' where id=asset;
   blocked:=blocked and not app_private.course_watch_met(u,l) and not app_private.course_lesson_unlocked(u,next_lesson);
   update public.lesson_assets set duration_verification_source='x         ' where id=asset;
   blocked:=blocked and not app_private.course_watch_met(u,l);
   insert into duration_policy_results values(n,'Wrong video identity or missing/blank provenance blocks stale credit',wrong_identity_blocked and blocked);
  end if;
 end loop;
end;
$test$;
do $$begin
 assert (select count(*)=8 and bool_and(passed) from duration_policy_results),'Trusted-duration policy regression failed';
end$$;
select jsonb_agg(to_jsonb(r) order by case_number) from duration_policy_results r;
