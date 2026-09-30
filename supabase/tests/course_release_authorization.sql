-- Disposable runner only. Exercise the real authenticated UPDATE trigger path.
do $test$
declare manager_id uuid:=gen_random_uuid(); session_id uuid:=gen_random_uuid();
 c uuid; lesson_row record; denied boolean:=false;
begin
 insert into auth.users(id,email,raw_user_meta_data) values(manager_id,manager_id||'@example.invalid','{}');
 insert into auth.sessions(id,user_id,aal) values(session_id,manager_id,'aal2');
 insert into public.staff_roles(profile_id,role) values(manager_id,'discipleship_admin');
 select id into strict c from public.courses where translation_key='getting-a-grip-on-the-basics';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',manager_id,'role','authenticated','aal','aal2','session_id',session_id)::text,true);
 execute 'set local role authenticated';
 begin update public.courses set status='published' where id=c;
 exception when raise_exception then
   assert sqlerrm like 'Getting a Grip cannot be published%', 'Unexpected publication failure';
   denied:=true;
 end;
 assert denied,'Incomplete course was published';
 execute 'reset role';
 for lesson_row in select a.id,a.storage_path from public.lesson_assets a join public.lessons l on l.id=a.lesson_id where l.course_id=c and a.asset_type='pdf' and a.storage_path is not null loop
  insert into storage.objects(bucket_id,name,metadata) values('lesson-assets',lesson_row.storage_path,'{"mimetype":"application/pdf"}');
  update public.lesson_assets set status='active' where id=lesson_row.id;
 end loop;
 assert app_private.grip_course_release_ready(c),'Synthetic release fixture is not ready';
 execute 'set local role authenticated';
 update public.courses set status='published' where id=c;
 assert found,'MFA manager could not publish ready course';
 execute 'reset role';
 assert not has_function_privilege('authenticated','app_private.grip_course_release_ready(uuid)','execute'),'Internal helper became public';
 assert not has_function_privilege('authenticated','app_private.validate_course_release()','execute'),'Trigger became directly callable';
 assert (select status='published' from public.courses where id=c),'Publication did not persist';
end;
$test$;
