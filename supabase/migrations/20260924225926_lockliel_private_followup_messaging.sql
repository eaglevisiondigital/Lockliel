
create table public.conversations (
 id uuid primary key default gen_random_uuid(),
 conversation_type text not null default 'direct' check(conversation_type in ('direct','inviter_followup','leader_followup','group')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.conversation_members (
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 profile_id uuid not null references public.profiles(id) on delete cascade,
 member_role text not null default 'member',
 joined_at timestamptz not null default now(),
 left_at timestamptz,
 primary key(conversation_id,profile_id)
);
create table public.messages (
 id bigint generated always as identity primary key,
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 5000),
 created_at timestamptz not null default now(),
 edited_at timestamptz
);
create index idx_conversation_members_profile on public.conversation_members(profile_id);
create index idx_messages_conversation_created on public.messages(conversation_id,created_at desc);
create index idx_messages_sender on public.messages(sender_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create or replace function app_private.is_conversation_member(target_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
 select (select auth.uid()) is not null and exists(
  select 1 from public.conversation_members cm
  where cm.conversation_id=target_conversation
    and cm.profile_id=(select auth.uid())
    and cm.left_at is null
 );
$$;
revoke all on function app_private.is_conversation_member(uuid) from public,anon;
grant execute on function app_private.is_conversation_member(uuid) to authenticated;

create policy "conversation_member_read" on public.conversations for select to authenticated
using(app_private.is_conversation_member(id));
create policy "conversation_members_self_read" on public.conversation_members for select to authenticated
using(profile_id=(select auth.uid()));
create policy "messages_member_read" on public.messages for select to authenticated
using(app_private.is_conversation_member(conversation_id));
create policy "messages_member_insert" on public.messages for insert to authenticated
with check(sender_id=(select auth.uid()) and app_private.is_conversation_member(conversation_id));

grant select on public.conversations,public.conversation_members,public.messages to authenticated;
grant insert on public.messages to authenticated;
grant usage,select on sequence public.messages_id_seq to authenticated;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inviter uuid;
  referral text;
  referral_link_id uuid;
  referral_content_id text;
  referral_asset_slug text;
  convo uuid;
begin
  referral := nullif(trim(new.raw_user_meta_data->>'referral_code'),'');
  if referral is not null then
    select rl.owner_id, rl.id, rl.content_id
      into inviter, referral_link_id, referral_content_id
    from public.referral_links rl
    where rl.code = referral and rl.active = true
    limit 1;

    if referral_content_id is not null then
      select sa.slug into referral_asset_slug
      from public.share_assets sa
      where sa.id::text=referral_content_id
      limit 1;
    end if;
  end if;

  insert into public.profiles(id,first_name,last_name,email,phone,city,region,country,original_inviter_id,onboarding_status)
  values(
    new.id,
    nullif(trim(new.raw_user_meta_data->>'first_name'),''),
    nullif(trim(new.raw_user_meta_data->>'last_name'),''),
    new.email,
    nullif(trim(new.raw_user_meta_data->>'phone'),''),
    nullif(trim(new.raw_user_meta_data->>'city'),''),
    nullif(trim(new.raw_user_meta_data->>'region'),''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'country'),''),'United States'),
    inviter,
    'new'
  )
  on conflict(id) do nothing;

  insert into public.member_journey(profile_id,next_step_type,next_step_title,next_step_path)
  values(new.id,'onboarding','Complete your Lockliel profile','/my-lockliel/profile')
  on conflict(profile_id) do nothing;

  if referral_link_id is not null then
    insert into public.referral_events(referral_link_id,event_type,member_id,metadata)
    values(referral_link_id,'signup',new.id,jsonb_build_object('source','auth_signup'));

    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'referral' from public.tags t where t.slug='personal-invitation'
    on conflict do nothing;

    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'referral-content'
    from public.tags t
    where t.slug = case referral_asset_slug
      when 'faith-boost' then 'faith-boost'
      when 'founders-50' then 'founders-50'
      when 'heart-for-the-lost' then 'book-interest'
      else null
    end
    on conflict do nothing;

    if inviter is not null and inviter <> new.id then
      insert into public.contact_permissions(profile_id,other_profile_id,permission_type)
      values(new.id,inviter,'inviter_followup')
      on conflict(profile_id,other_profile_id,permission_type) do update set revoked_at=null;

      insert into public.conversations(conversation_type) values('inviter_followup') returning id into convo;
      insert into public.conversation_members(conversation_id,profile_id,member_role)
      values(convo,inviter,'inviter'),(convo,new.id,'invitee');

      update public.member_journey
      set active_connections_count=active_connections_count+1,
          reach_one_count=reach_one_count+1,
          updated_at=now()
      where profile_id=inviter;

      insert into public.follow_up_tasks(subject_profile_id,assigned_to,task_type,status,due_at,notes)
      values(new.id,inviter,'welcome_invited_person','open',now()+interval '2 days','Welcome the person who joined through your Lockliel invitation.');
    end if;
  else
    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'signup' from public.tags t where t.slug='direct-website'
    on conflict do nothing;
  end if;

  return new;
end;
$$;
