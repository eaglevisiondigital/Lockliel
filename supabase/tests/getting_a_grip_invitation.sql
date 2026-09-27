-- Synthetic content and accounts only. Disposable runner rolls this fixture back.
do $test$
declare
 inviter uuid:=gen_random_uuid(); member_id uuid:=gen_random_uuid(); outsider uuid:=gen_random_uuid();
 fixture_course uuid:=gen_random_uuid(); lesson_id uuid; contact_id uuid; asset_id uuid; i int; rejected boolean;
 code text:='grip'||substr(replace(gen_random_uuid()::text,'-',''),1,10);
begin
 insert into auth.users(id,email,raw_user_meta_data) values
 (inviter,inviter||'@example.invalid','{"first_name":"Inviter"}'),(outsider,outsider||'@example.invalid','{"first_name":"Outsider"}');
 insert into public.reach_contacts(owner_id,display_name,private_notes) values(inviter,'Synthetic recipient','Never public') returning id into contact_id;
 insert into public.share_assets(slug,title,asset_type,category,destination_path,status,language_code,translation_key) values('fixture-'||member_id,'Synthetic Grip','course','biblical-foundations','/getting-a-grip','active','zz','fixture-'||member_id) returning id into asset_id;
 insert into public.referral_links(owner_id,code,campaign,content_type,destination_path,reach_contact_id,content_id)
 values(inviter,code,'share-center-my-five','course','/getting-a-grip',contact_id,asset_id);
 insert into auth.users(id,email,raw_user_meta_data) values(member_id,member_id||'@example.invalid',jsonb_build_object('first_name','Recipient','referral_code',code));
 assert (select original_inviter_id=inviter from public.profiles where id=member_id),'Signup lost original inviter';
 assert (select linked_profile_id=member_id from public.reach_contacts where id=contact_id),'Personal link did not connect recipient';
 assert not exists(select 1 from public.staff_roles where profile_id=member_id),'Invitation granted staff access';
 -- Use a synthetic locale to isolate this fixture from historical seeded courses.
 insert into public.courses(id,slug,title,status,translation_key,language_code)
 values(fixture_course,'fixture-'||fixture_course,'Synthetic foundational course','draft','getting-a-grip-on-the-basics','zz');
 update public.profiles set locale='zz' where id=member_id;
 insert into public.faith_profiles(profile_id,growth_interests) values(member_id,array['biblical-foundations']);
 assert not exists(select 1 from public.course_enrollments where profile_id=member_id and course_enrollments.course_id=fixture_course),'Draft course enrolled';
 for i in 1..13 loop
  insert into public.lessons(course_id,position,slug,title,worksheet_schema,translation_key)
  values(fixture_course,i,'fixture-'||i,'Synthetic lesson '||i,'{"questions":[{"id":"reflection","prompt":"Reflect"}]}','fixture-'||i) returning id into lesson_id;
  insert into storage.objects(bucket_id,name,metadata) values('lesson-assets','fixture-'||lesson_id||'.pdf','{"mimetype":"application/pdf"}');
  insert into public.lesson_assets(lesson_id,asset_type,storage_path,status) values(lesson_id,'pdf','fixture-'||lesson_id||'.pdf','active');
  if i<=10 then insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status) values(lesson_id,'video','youtube','synthetic01','active');end if;
 end loop;
 assert app_private.grip_course_release_ready(fixture_course),'Synthetic release readiness failed';
 update public.courses set status='published' where id=fixture_course;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',member_id,'role','authenticated','aal','aal1')::text,true);
 execute 'set local role authenticated';
 update public.faith_profiles set growth_interests=array['prayer'] where profile_id=member_id;
 update public.faith_profiles set growth_interests=array['biblical-foundations'] where profile_id=member_id;
 assert (select count(*)=1 from public.course_enrollments e where e.profile_id=member_id and e.course_id=fixture_course),'Existing enrollment missing or duplicated';
 assert (select count(*)=13 from public.lessons l where l.course_id=fixture_course),'Enrolled member cannot reach lessons';
 assert not exists(select 1 from public.reach_contacts where id=contact_id),'Recipient received inviter private notes';
 rejected:=false;
 begin update public.profiles set original_inviter_id=outsider where id=member_id;exception when others then rejected:=true;end;
 assert rejected,'Original inviter mutable';
 execute 'reset role';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',outsider,'role','authenticated','aal','aal1')::text,true);
 execute 'set local role authenticated';
 assert not exists(select 1 from public.course_enrollments e where e.profile_id=member_id),'Another enrollment exposed';
 assert not exists(select 1 from public.lessons l where l.course_id=fixture_course),'Unenrolled member can read lessons';
 execute 'reset role';
end;
$test$;
