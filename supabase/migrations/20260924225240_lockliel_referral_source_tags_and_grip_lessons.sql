
insert into public.tags(slug,label,category) values
('direct-website','Direct Website','source')
on conflict(slug) do nothing;

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
    select new.id,t.id,'referral'
    from public.tags t where t.slug='personal-invitation'
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
  else
    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'signup'
    from public.tags t where t.slug='direct-website'
    on conflict do nothing;
  end if;

  return new;
end;
$$;

insert into public.lessons(course_id,position,slug,title)
select c.id,v.position,v.slug,v.title
from public.courses c
cross join (values
(1,'how-to-become-a-christian','How to Become a Christian'),
(2,'how-to-be-sure-you-are-a-christian','How to Be Sure You Are a Christian'),
(3,'how-to-develop-your-relationship-with-god','How to Develop Your Relationship with God'),
(4,'how-to-talk-to-god','How to Talk to God'),
(5,'how-to-hear-from-god','How to Hear from God'),
(6,'how-to-obey-god','How to Obey God'),
(7,'how-to-experience-gods-love-and-forgiveness','How to Experience God''s Love and Forgiveness'),
(8,'how-to-be-filled-with-the-holy-spirit','How to Be Filled with the Holy Spirit'),
(9,'how-to-be-sure-you-are-filled-with-the-spirit','How to Be Sure You Are Filled with the Spirit'),
(10,'how-to-grow-and-develop-your-faith','How to Grow and Develop Your Faith'),
(11,'how-to-experience-the-abundant-life','How to Experience the Abundant Life'),
(12,'how-to-be-an-overcomer','How to Be an Overcomer'),
(13,'how-to-serve-god','How to Serve God')
) as v(position,slug,title)
where c.slug='getting-a-grip-on-the-basics'
on conflict(course_id,position) do update set slug=excluded.slug,title=excluded.title;
