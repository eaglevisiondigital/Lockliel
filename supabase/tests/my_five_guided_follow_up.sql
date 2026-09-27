-- Disposable PostgreSQL only. The runner wraps this file in rollback.
do $test$
declare
  a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); staff uuid:=gen_random_uuid(); staff_session uuid:=gen_random_uuid();
  contact_a uuid; contact_b uuid; private_object uuid; asset public.share_assets%rowtype; link_a uuid; link_b uuid;
  denied boolean; affected integer;
begin
  insert into auth.users(id,email) values (a,'five-a-'||a||'@example.invalid'),(b,'five-b-'||b||'@example.invalid'),(staff,'five-staff-'||staff||'@example.invalid');
  insert into public.staff_roles(profile_id,role) values(staff,'admin');
  insert into auth.sessions(id,user_id,aal) values(staff_session,staff,'aal2');
  insert into public.reach_contacts(owner_id,display_name,private_notes) values(a,'Person A','Owner A private note') returning id into contact_a;
  insert into public.reach_contacts(owner_id,display_name,private_notes) values(b,'Person B','Owner B private note') returning id into contact_b;
  insert into storage.objects(bucket_id,name,metadata) values('member-resources','five-fixture-'||a||'.pdf','{"mimetype":"application/pdf","size":10}') returning id into private_object;
  select * into asset from public.share_assets where status='active' limit 1;
  assert asset.id is not null,'No active fixture resource';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal1')::text,true);
  execute 'set local role authenticated';
  assert (select private_notes='Owner A private note' from public.reach_contacts where id=contact_a),'Owner note unavailable';
  assert not exists(select 1 from public.reach_contacts where id=contact_b),'Other private contact exposed';
  update public.reach_contacts set private_notes='Changed' where id=contact_b;
  get diagnostics affected=row_count;assert affected=0,'Cross-owner note update allowed';
  update public.reach_contacts set private_notes='<b>Private reflection</b>',next_follow_up_at=now()+interval '3 days',status='growing' where id=contact_a;
  assert not exists(select 1 from public.staff_roles where profile_id=a),'Stage granted staff';
  assert not exists(select 1 from public.contact_permissions where other_profile_id=a),'Stage granted follow-up consent';
  denied:=false;begin update public.reach_contacts set private_notes=repeat('x',3001) where id=contact_a;exception when check_violation then denied:=true;end;assert denied,'Unbounded private note';
  denied:=false;begin update public.reach_contacts set linked_profile_id=b where id=contact_a;exception when insufficient_privilege then denied:=true;end;assert denied,'Member forged linked identity';
  insert into public.referral_links(owner_id,code,campaign,content_type,content_id,destination_path,reach_contact_id)
    values(a,'fivea'||left(replace(a::text,'-',''),12),'share-center-my-five',asset.asset_type,asset.id,asset.destination_path,contact_a) returning id into link_a;
  denied:=false;
  begin insert into public.referral_links(owner_id,code,campaign,content_type,content_id,destination_path,reach_contact_id)
    values(a,'cross'||left(replace(a::text,'-',''),12),'share-center-my-five',asset.asset_type,asset.id,asset.destination_path,contact_b);
  exception when foreign_key_violation or insufficient_privilege then denied:=true;end;
  assert denied,'Person link crossed owner boundary';
  insert into public.referral_events(referral_link_id,event_type,member_id) values(link_a,'share_initiated',a);
  denied:=false;begin insert into public.referral_events(referral_link_id,event_type,member_id) values(link_a,'signup',b);exception when insufficient_privilege then denied:=true;end;assert denied,'Owner forged recipient engagement';
  assert not exists(select 1 from public.entitlements where profile_id=a),'Sharing created entitlement';
  assert not exists(select 1 from storage.objects where id=private_object),'Sharing bypassed private resource delivery';
  assert (select original_inviter_id is null from public.profiles where id=a),'Sharing rewrote original inviter';
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated','aal','aal1')::text,true);
  execute 'set local role authenticated';
  assert not exists(select 1 from public.referral_links where id=link_a),'Other member link exposed';
  assert not exists(select 1 from public.referral_events where referral_link_id=link_a),'Other member timeline exposed';
  insert into public.referral_links(owner_id,code,campaign,content_type,content_id,destination_path,reach_contact_id)
    values(b,'fiveb'||left(replace(b::text,'-',''),12),'share-center-my-five',asset.asset_type,asset.id,asset.destination_path,contact_b) returning id into link_b;
  execute 'reset role';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',staff,'role','authenticated','aal','aal2','session_id',staff_session)::text,true);
  execute 'set local role authenticated';
  assert not exists(select 1 from public.reach_contacts where id in(contact_a,contact_b)),'Staff gained private My Five notes';
  execute 'reset role';
  perform set_config('request.jwt.claims','{}',true);execute 'set local role anon';
  denied:=false;begin perform private_notes from public.reach_contacts;exception when insufficient_privilege then denied:=true;end;assert denied,'Anonymous private note read';
  denied:=false;begin perform id from public.referral_events;exception when insufficient_privilege then denied:=true;end;assert denied,'Anonymous timeline read';
  execute 'reset role';
end;
$test$;
