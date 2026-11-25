-- Disposable exact-279 before/after regression. Runner inserts the pinned migration source.
do $test$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); manager uuid:=gen_random_uuid();
 sa uuid:=gen_random_uuid(); sb uuid:=gen_random_uuid(); sm uuid:=gen_random_uuid();
 c uuid; l uuid; r jsonb; denied boolean; p text; role_name text;
begin
 insert into auth.users(id,email) values(a,a||'@example.invalid'),(b,b||'@example.invalid'),(manager,manager||'@example.invalid');
 insert into auth.sessions(id,user_id,aal) values(sa,a,'aal1'),(sb,b,'aal1'),(sm,manager,'aal2');
 insert into public.staff_roles(profile_id,role) values(manager,'content_admin');
 insert into public.courses(slug,title,status,translation_key,learning_rules)
 values('notes-'||a,'Synthetic Notes','published','notes-'||a,'{"model":"simple","sequential":false,"watch_threshold":95,"minimum_score":0}') returning id into c;
 insert into public.lessons(course_id,position,slug,title,worksheet_schema) values(c,1,'one','Synthetic Notes Lesson','{"questions":[{"number":1,"text":"Synthetic"}]}') returning id into l;
 insert into public.course_enrollments(profile_id,course_id) values(a,c),(b,c);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal1','session_id',sa)::text,true);
 execute 'set local role authenticated';
 r:=public.lockliel_save_lesson(a,l,0,'{"1":"A answer"}','Private A',false);
 assert r->>'notes'='Private A';
 assert (select body='Private A' from public.lesson_private_notes where profile_id=a and lesson_id=l);
 execute 'reset role';
 -- Security defect: inherited TRUNCATE succeeds independently of row policies.
 assert has_table_privilege('service_role','public.lesson_private_notes','TRUNCATE');
 execute 'set local role service_role';
 truncate public.lesson_private_notes;
 execute 'reset role';
 assert not exists(select 1 from public.lesson_private_notes),'TRUNCATE reproduction failed';
 -- Apply the actual migration, not a test approximation. Applying an absent
 -- privilege revocation again must be harmless in this rolled-back fixture.
 -- APPLY_279_HERE
 -- APPLY_279_HERE
 execute 'set local role service_role';
 denied:=false;begin truncate public.lesson_private_notes;exception when insufficient_privilege then denied:=true;end;
 assert denied,'Actual279 failed to revoke TRUNCATE';
 execute 'reset role';
 for p in select unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) loop
  assert not has_table_privilege('service_role','public.lesson_private_notes',p),'Service privilege still required';
 end loop;
 assert not exists(select 1 from pg_class c cross join lateral aclexplode(c.relacl) x where c.oid='public.lesson_private_notes'::regclass and x.grantee=0),'PUBLIC table grant';
 perform pg_sleep(0.31);
 execute 'set local role authenticated';
 r:=public.lockliel_save_lesson(a,l,1,'{"1":"A answer"}','Private A restored',false);
 assert r->>'revision'='2' and r->>'notes'='Private A restored';
 assert (select body='Private A restored' from public.lesson_private_notes where profile_id=a and lesson_id=l);
 denied:=false;begin update public.lesson_private_notes set body='forged';exception when insufficient_privilege then denied:=true;end;
 assert denied,'Direct note write permitted';
 denied:=false;begin perform public.lockliel_save_lesson(b,l,0,'{}','forged B',false);exception when insufficient_privilege then denied:=true;end;
 assert denied,'Forged expected_user accepted';
 denied:=false;begin perform public.lockliel_save_lesson(a,gen_random_uuid(),0,'{}','unknown lesson',false);exception when insufficient_privilege then denied:=true;end;
 assert denied,'Unknown lesson write accepted';
 denied:=false;begin update public.courses set learning_rules='{}' where id=c;
  denied:=not found;exception when insufficient_privilege then denied:=true;end;
 assert denied,'Learner rewrote course authorization rules';
 update public.lesson_progress set worksheet_answers='{"1":"forged"}' where profile_id=a and lesson_id=l;
 assert not found,'Direct progress bypassed restrictive engine policy';
 execute 'reset role';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated','aal','aal1','session_id',sb)::text,true);
 execute 'set local role authenticated';
 assert not exists(select 1 from public.lesson_private_notes where profile_id=a),'B reads A notes';
 r:=public.lockliel_save_lesson(b,l,0,'{"1":"B answer"}','Private B',false);
 assert r->>'profile_id'=b::text;
 execute 'reset role';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',manager,'role','authenticated','aal','aal2','session_id',sm)::text,true);
 execute 'set local role authenticated';
 assert not exists(select 1 from public.lesson_private_notes),'Manager reads learner notes';
 denied:=false;begin perform public.lockliel_save_lesson(a,l,2,'{}','forged manager',false);exception when insufficient_privilege then denied:=true;end;
 assert denied,'Manager writes A notes';
 execute 'reset role';
 delete from auth.sessions where id=sa;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal1','session_id',sa)::text,true);
 execute 'set local role authenticated';
 assert not exists(select 1 from public.lesson_private_notes),'Revoked session reads notes';
 denied:=false;begin perform public.lockliel_save_lesson(a,l,2,'{}','revoked session',false);exception when insufficient_privilege then denied:=true;end;
 assert denied,'Revoked session saves notes';
 execute 'reset role';
 for role_name in select unnest(array['anon','service_role']) loop
  execute format('set local role %I',role_name);
  denied:=false;begin perform body from public.lesson_private_notes;exception when insufficient_privilege then denied:=true;end;
  assert denied,'Nonlearner reads notes';
  denied:=false;begin perform public.lockliel_save_lesson(a,l,2,'{}','forged',false);exception when insufficient_privilege then denied:=true;end;
  assert denied,'Nonlearner invokes save RPC';
  execute 'reset role';
 end loop;
 for role_name in select unnest(array['anon','authenticated','service_role']) loop
  execute format('set local role %I',role_name);
  denied:=false;begin perform answers from app_private.course_answer_keys;exception when insufficient_privilege then denied:=true;end;
  assert denied,'Private grading keys exposed';
  execute 'reset role';
 end loop;
 assert not exists(select 1 from pg_proc p cross join lateral aclexplode(p.proacl) x
  where p.oid='public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)'::regprocedure and x.grantee=0),'PUBLIC RPC EXECUTE';
 assert (select prosecdef and pg_get_userbyid(proowner)='postgres' and proconfig=array['search_path=""'] from pg_proc where oid='public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)'::regprocedure);
end;
$test$;
