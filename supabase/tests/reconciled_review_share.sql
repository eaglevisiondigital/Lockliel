-- Actual restored policies and trigger behavior; disposable cluster, rollback only.
do $test$
declare
  member_id uuid := gen_random_uuid();
  reviewer_id_fixture uuid := gen_random_uuid();
  staff_session uuid := gen_random_uuid();
  application_id_fixture uuid;
  asset_id uuid;
  rejected boolean;
  affected integer;
begin
  insert into auth.users(id,email) values
    (member_id,'member-'||member_id||'@example.invalid'),
    (reviewer_id_fixture,'reviewer-'||reviewer_id_fixture||'@example.invalid');
  insert into public.staff_roles(profile_id,role) values(reviewer_id_fixture,'admin');
  insert into auth.sessions(id,user_id,aal) values(staff_session,reviewer_id_fixture,'aal2');
  insert into public.founders50_applications(profile_id,first_name,last_name,email,status,why_interested,what_excites_you)
    values(member_id,'Fixture','Member','member-'||member_id||'@example.invalid','applied','Fixture motivation','Fixture hopes')
    returning id into application_id_fixture;

  perform set_config('request.jwt.claims','{}',true);
  execute 'set local role anon';
  rejected:=false;
  begin perform id from public.founders50_reviews; exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'Anonymous review read allowed';
  rejected:=false;
  begin perform id from public.share_assets; exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'Anonymous Share Library read allowed';
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',member_id,'role','authenticated','aal','aal1')::text,true);
  execute 'set local role authenticated';
  assert exists(select 1 from public.share_assets where status='active'), 'Member cannot read active seeded assets';
  assert not exists(select 1 from public.share_assets where status<>'active'), 'Member reads draft assets';
  rejected:=false;
  begin
    insert into public.founders50_reviews(application_id,reviewer_id,decision,rationale)
      values(application_id_fixture,member_id,'accept','This is an unauthorized fixture review.');
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'Member can review an application';
  rejected:=false;
  begin
    insert into public.share_assets(slug,title,asset_type,destination_path,status)
      values('unauthorized-'||member_id,'Fixture','invitation','/','active');
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'Member can publish a share asset';
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',reviewer_id_fixture,'role','authenticated','aal','aal1','session_id',staff_session)::text,true);
  execute 'set local role authenticated';
  rejected:=false;
  begin
    insert into public.founders50_reviews(application_id,reviewer_id,decision,rationale)
      values(application_id_fixture,reviewer_id_fixture,'accept','This staff fixture lacks the required MFA.');
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'AAL1 staff can review an application';
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',reviewer_id_fixture,'role','authenticated','aal','aal2','session_id',staff_session)::text,true);
  execute 'set local role authenticated';
  rejected:=false;
  begin
    insert into public.founders50_reviews(application_id,reviewer_id,decision,rationale)
      values(application_id_fixture,member_id,'accept','This staff fixture impersonates another reviewer.');
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'Staff can impersonate a reviewer';
  insert into public.founders50_reviews(application_id,reviewer_id,decision,rationale)
    values(application_id_fixture,reviewer_id_fixture,'accept','This reviewed fixture satisfies the rationale length.');
  assert exists(select 1 from public.founders50_reviews where application_id=application_id_fixture), 'Authorized review not readable';
  assert (select status='accepted' from public.founders50_applications where id=application_id_fixture), 'Restored review trigger did not apply decision';
  rejected:=false;
  begin update public.founders50_reviews set rationale='Changed' where application_id=application_id_fixture;
  exception when insufficient_privilege then rejected:=true; end;
  assert rejected, 'Review history is mutable';
  insert into public.share_assets(slug,title,asset_type,destination_path,status)
    values('authorized-'||member_id,'Fixture','invitation','/','active') returning id into asset_id;
  update public.share_assets set title='Updated fixture' where id=asset_id;
  get diagnostics affected = row_count;
  assert affected=1, 'Authorized active-asset update failed';
  execute 'reset role';
  assert not exists(select 1 from public.staff_roles where profile_id=member_id), 'Application acceptance conferred staff rights';
  assert exists(select 1 from public.audit_events where event_type='founders50_review_recorded' and entity_id=application_id_fixture::text), 'Review audit event missing';
end;
$test$;
