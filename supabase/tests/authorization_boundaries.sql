-- Executed only by scripts/test-sql.mjs inside a disposable cluster/rollback.
do $test$
declare
  member_a uuid := gen_random_uuid();
  member_b uuid := gen_random_uuid();
  staff uuid := gen_random_uuid();
  staff_session uuid := gen_random_uuid();
  affected integer;
  rejected boolean;
begin
  -- Regression: ordinary email addresses must survive Auth profile bootstrap.
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
    (member_a,'member-a-'||member_a||'@example.invalid',now(),'{"first_name":"Member A"}'),
    (member_b,'member-b-'||member_b||'@example.invalid',now(),'{"first_name":"Member B"}'),
    (staff,'staff-'||staff||'@example.invalid',now(),'{"first_name":"Staff"}');
  assert (select count(*)=3 from public.profiles where id in (member_a,member_b,staff)), 'Valid email bootstrap failed';
  -- Check the deployed expression, without defeating the profile identity trigger.
  assert ('valid@example.invalid' ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$');
  rejected := false;
  begin
    insert into auth.users(id,email,raw_user_meta_data) values(gen_random_uuid(),'no-at-sign.invalid','{}');
  exception when check_violation then rejected := true; end;
  assert rejected, 'Malformed email bootstrap accepted';

  insert into public.staff_roles(profile_id,role) values(staff,'admin');
  insert into auth.sessions(id,user_id,aal) values(staff_session,staff,'aal2');

  perform set_config('request.jwt.claims','{}',true);
  execute 'set local role anon';
  rejected := false;
  begin perform id from public.profiles; exception when insufficient_privilege then rejected := true; end;
  assert rejected, 'Anonymous profile read allowed';
  rejected := false;
  begin perform public.lockliel_integrity_health(); exception when insufficient_privilege then rejected := true; end;
  assert rejected, 'Anonymous privileged RPC allowed';
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',member_a,'role','authenticated','aal','aal1')::text,true);
  execute 'set local role authenticated';
  assert current_user='authenticated' and not (select rolbypassrls from pg_roles where rolname=current_user), 'Test bypasses RLS';
  assert (select count(*)=1 from public.profiles where id in (member_a,member_b)), 'Member isolation failed';
  assert exists(select 1 from public.profiles where id=member_a), 'Own profile not readable';
  update public.profiles set first_name='Updated fixture' where id=member_a;
  get diagnostics affected = row_count;
  assert affected=1, 'Own profile update denied';
  update public.profiles set first_name='Unauthorized' where id=member_b;
  get diagnostics affected = row_count;
  assert affected=0, 'Cross-member update allowed';
  rejected := false;
  begin update public.profiles set original_inviter_id=member_b where id=member_a;
  exception when insufficient_privilege then rejected := true; end;
  assert rejected, 'Member can rewrite original inviter';
  rejected := false;
  begin insert into public.staff_roles(profile_id,role) values(member_a,'admin');
  exception when insufficient_privilege then rejected := true; end;
  assert rejected, 'Member can grant staff privileges';
  rejected := false;
  begin perform public.lockliel_integrity_health(); exception when insufficient_privilege then rejected := true; end;
  assert rejected, 'Member can call staff integrity RPC';
  execute 'reset role';
  assert (select first_name='Member B' from public.profiles where id=member_b), 'Cross-member data changed';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',staff,'role','authenticated','aal','aal1','session_id',staff_session)::text,true);
  execute 'set local role authenticated';
  assert not app_private.has_staff_role(array['admin']), 'AAL1 grants staff access';
  assert not exists(select 1 from public.profiles where id=member_b), 'AAL1 staff can read another profile';
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',staff,'role','authenticated','aal','aal2','session_id',staff_session)::text,true);
  execute 'set local role authenticated';
  assert app_private.has_staff_role(array['admin']), 'Active AAL2 staff denied';
  assert exists(select 1 from public.profiles where id=member_b), 'Authorized staff read denied';
  perform public.lockliel_integrity_health();
  execute 'reset role';
  delete from auth.sessions where id=staff_session;
  execute 'set local role authenticated';
  assert not app_private.has_staff_role(array['admin']), 'Revoked staff session accepted';
  assert not exists(select 1 from public.profiles where id=member_b), 'Revoked staff session can read another profile';
  execute 'reset role';
end;
$test$;
