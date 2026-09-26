create or replace function app_private.recalculate_member_reach_count(target_profile uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  manual_count int;
  referral_count int;
begin
  if target_profile is null then
    return;
  end if;

  select count(*)::int
    into manual_count
  from public.reach_contacts rc
  where rc.owner_id=target_profile
    and rc.status in ('invited','connected','growing','completed');

  select count(distinct re.member_id)::int
    into referral_count
  from public.referral_events re
  join public.referral_links rl
    on rl.id=re.referral_link_id
  where rl.owner_id=target_profile
    and re.event_type='signup'
    and re.member_id is not null
    and not exists(
      select 1
      from public.reach_contacts rc
      where rc.owner_id=target_profile
        and rc.linked_profile_id=re.member_id
        and rc.status in ('invited','connected','growing','completed')
    );

  update public.member_journey
  set reach_one_count=coalesce(manual_count,0)+coalesce(referral_count,0),
      updated_at=now()
  where profile_id=target_profile;
end;
$function$;

revoke execute on function app_private.recalculate_member_reach_count(uuid)
from public, anon, authenticated;

create or replace function app_private.sync_member_reach_counts()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid;
begin
  uid:=coalesce(new.owner_id,old.owner_id);
  perform app_private.recalculate_member_reach_count(uid);
  return coalesce(new,old);
end;
$function$;

revoke execute on function app_private.sync_member_reach_counts()
from public, anon, authenticated;

create or replace function app_private.sync_referral_signup_reach_count()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  inviter uuid;
begin
  if new.event_type<>'signup' or new.referral_link_id is null then
    return new;
  end if;

  select rl.owner_id
    into inviter
  from public.referral_links rl
  where rl.id=new.referral_link_id;

  perform app_private.recalculate_member_reach_count(inviter);
  return new;
end;
$function$;

revoke execute on function app_private.sync_referral_signup_reach_count()
from public, anon, authenticated;

drop trigger if exists sync_referral_signup_reach_count_trigger
on public.referral_events;

create trigger sync_referral_signup_reach_count_trigger
after insert on public.referral_events
for each row
when (new.event_type='signup')
execute function app_private.sync_referral_signup_reach_count();

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  inviter uuid;
  referral text;
  referral_link_id uuid;
  referral_content_id text;
  referral_asset_slug text;
  referral_reach_contact_id uuid;
  convo uuid;
begin
  referral := nullif(trim(new.raw_user_meta_data->>'referral_code'),'');

  if referral is not null then
    select rl.owner_id, rl.id, rl.content_id, rl.reach_contact_id
      into inviter, referral_link_id, referral_content_id, referral_reach_contact_id
    from public.referral_links rl
    where rl.code = referral
      and rl.active = true
    limit 1;

    if referral_content_id is not null then
      select sa.slug
        into referral_asset_slug
      from public.share_assets sa
      where sa.id::text = referral_content_id
      limit 1;
    end if;
  end if;

  insert into public.profiles(
    id, first_name, last_name, email, phone, city, region, country,
    original_inviter_id, onboarding_status
  )
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

  insert into public.member_journey(
    profile_id, next_step_type, next_step_title, next_step_path
  )
  values(
    new.id,
    'onboarding',
    'Complete your Lockliel profile',
    '/my-lockliel/profile'
  )
  on conflict(profile_id) do nothing;

  if referral_link_id is not null then
    insert into public.referral_events(
      referral_link_id, event_type, member_id, metadata
    )
    values(
      referral_link_id,
      'signup',
      new.id,
      jsonb_build_object('source','auth_signup')
    );

    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'referral'
    from public.tags t
    where t.slug='personal-invitation'
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
      if referral_reach_contact_id is not null then
        update public.reach_contacts
        set linked_profile_id = new.id,
            status = case
              when status in ('praying','invited') then 'connected'
              else status
            end,
            last_shared_at = coalesce(last_shared_at, now()),
            updated_at = now()
        where id = referral_reach_contact_id
          and owner_id = inviter
          and (linked_profile_id is null or linked_profile_id = new.id);
      end if;

      insert into public.contact_permissions(
        profile_id, other_profile_id, permission_type
      )
      values(new.id,inviter,'inviter_followup')
      on conflict(profile_id,other_profile_id,permission_type)
      do update set revoked_at=null;

      insert into public.conversations(conversation_type)
      values('inviter_followup')
      returning id into convo;

      insert into public.conversation_members(
        conversation_id, profile_id, member_role
      )
      values
        (convo,inviter,'inviter'),
        (convo,new.id,'invitee');

      update public.member_journey
      set active_connections_count=active_connections_count+1,
          updated_at=now()
      where profile_id=inviter;

      perform app_private.recalculate_member_reach_count(inviter);

      insert into public.follow_up_tasks(
        subject_profile_id, assigned_to, task_type, status, due_at, notes
      )
      values(
        new.id,
        inviter,
        'welcome_invited_person',
        'open',
        now()+interval '2 days',
        'Welcome the person who joined through your Lockliel invitation.'
      );
    end if;
  else
    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'signup'
    from public.tags t
    where t.slug='direct-website'
    on conflict do nothing;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.handle_new_user()
from public, anon, authenticated;
