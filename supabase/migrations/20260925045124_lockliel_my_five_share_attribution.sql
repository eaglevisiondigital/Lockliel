alter table public.reach_contacts
  add constraint reach_contacts_id_owner_key unique (id, owner_id);

alter table public.referral_links
  add column reach_contact_id uuid;

alter table public.referral_links
  add constraint referral_links_reach_contact_owner_fkey
  foreign key (reach_contact_id, owner_id)
  references public.reach_contacts(id, owner_id);

create unique index referral_links_active_generic_resource_uidx
  on public.referral_links(owner_id, content_id)
  where active = true and reach_contact_id is null;

create unique index referral_links_active_reach_resource_uidx
  on public.referral_links(owner_id, content_id, reach_contact_id)
  where active = true and reach_contact_id is not null;

create index referral_links_reach_contact_idx
  on public.referral_links(reach_contact_id)
  where reach_contact_id is not null;

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
          reach_one_count=reach_one_count+1,
          updated_at=now()
      where profile_id=inviter;

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
