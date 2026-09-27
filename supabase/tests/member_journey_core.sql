-- Disposable PostgreSQL only, rolled back by npm run test:sql.
do $test$
declare
  member_a uuid:=gen_random_uuid();
  member_b uuid:=gen_random_uuid();
  affected integer;
  rejected boolean;
  original_request_count integer;
begin
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
    (member_a,'journey-a-'||member_a||'@example.invalid',now(),'{"first_name":"Journey A"}'),
    (member_b,'journey-b-'||member_b||'@example.invalid',now(),'{"first_name":"Journey B"}');
  insert into public.faith_profiles(profile_id,faith_stage,church_background,ministry_experience,wants_host,preferred_connection,growth_interests)
    values(member_a,'established','Preserve private background','Preserve private experience',true,'online',array['leadership']);
  insert into public.faith_profiles(profile_id,church_background) values(member_b,'Never expose another member');
  insert into public.reach_contacts(owner_id,display_name,private_notes) values(member_b,'Private other person','Never expose another note');

  select count(*) into original_request_count from public.connection_requests where requester_id=member_a;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',member_a,'role','authenticated','aal','aal1')::text,true);
  execute 'set local role authenticated';
  assert (select onboarding_status='new' from public.profiles where id=member_a),'Unexpected pre-onboarding state';
  rejected:=false;
  begin update public.profiles set onboarding_status='active' where id=member_a;
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected,'Caller can forge onboarding completion';
  update public.profiles set first_name='Journey',last_name='Fixture',city='Test City',region='Test Region',country='Test Country' where id=member_a;
  assert (select onboarding_status='active' from public.profiles where id=member_a),'Existing profile completion trigger did not run';

  -- Same explicit minimal column list used by the guided onboarding REST upsert.
  insert into public.faith_profiles(profile_id,growth_interests)
    values(member_a,'{}')
    on conflict(profile_id) do update set growth_interests=excluded.growth_interests;
  assert (select church_background='Preserve private background' and ministry_experience='Preserve private experience' and faith_stage='established' and wants_host and preferred_connection='online' and cardinality(growth_interests)=0 from public.faith_profiles where profile_id=member_a),'Minimal onboarding erased private answers';
  assert not exists(select 1 from public.faith_profiles where profile_id=member_b),'Another member faith profile leaked';
  assert not exists(select 1 from public.reach_contacts where owner_id=member_b),'Another member My Five leaked';
  update public.faith_profiles set growth_interests=array['prayer'] where profile_id=member_b;
  get diagnostics affected=row_count;
  assert affected=0,'Cross-member faith update succeeded';
  rejected:=false;
  begin insert into public.faith_profiles(profile_id,growth_interests) values(member_b,array['prayer']) on conflict(profile_id) do update set growth_interests=excluded.growth_interests;
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected,'Cross-member faith upsert succeeded';

  update public.faith_profiles set growth_interests=array['leadership'],faith_stage='serving-leading' where profile_id=member_a;
  assert not exists(select 1 from public.staff_roles where profile_id=member_a),'Faith or hosting preference granted staff role';
  assert not exists(select 1 from public.group_members where profile_id=member_a),'Preference granted group membership';
  assert (select count(*)=original_request_count from public.connection_requests where requester_id=member_a),'Private onboarding changed existing connection requests';
  assert not exists(select 1 from public.contact_permissions where profile_id=member_a),'Private preference granted contact consent';
  rejected:=false;
  begin update public.member_journey set next_step_type='admin' where profile_id=member_a;
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected,'Member can turn journey state into a privileged path';
  for affected in 1..5 loop
    insert into public.reach_contacts(owner_id,display_name) values(member_a,'Private fixture '||affected);
  end loop;
  rejected:=false;
  begin insert into public.reach_contacts(owner_id,display_name) values(member_a,'Sixth active fixture');
  exception when others then rejected:=true; end;
  assert rejected,'My Five active limit exceeded';
  execute 'reset role';
  assert (select church_background='Never expose another member' from public.faith_profiles where profile_id=member_b),'Other member modified';
end;
$test$;
