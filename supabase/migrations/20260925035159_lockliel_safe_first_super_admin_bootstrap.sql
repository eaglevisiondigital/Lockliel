
create or replace function app_private.bootstrap_first_super_admin(target_profile uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  confirmed_at timestamptz;
begin
  if target_profile is null then
    raise exception 'Target profile is required';
  end if;

  if exists(select 1 from public.staff_roles where role='super_admin') then
    raise exception 'A super administrator already exists';
  end if;

  if not exists(select 1 from public.profiles p where p.id=target_profile) then
    raise exception 'Target profile does not exist';
  end if;

  select u.email_confirmed_at
    into confirmed_at
  from auth.users u
  where u.id=target_profile;

  if confirmed_at is null then
    raise exception 'Target account email must be confirmed first';
  end if;

  insert into public.staff_roles(profile_id,role)
  values(target_profile,'super_admin')
  on conflict(profile_id,role) do nothing;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    null,
    'first_super_admin_bootstrapped',
    'profile',
    target_profile::text,
    'Initial Lockliel super administrator bootstrapped',
    jsonb_build_object('profile_id',target_profile)
  );

  insert into public.notifications(
    profile_id,
    notification_type,
    title,
    body,
    href
  )
  values(
    target_profile,
    'account',
    'Lockliel administrator access is ready',
    'Your account has been assigned the initial Lockliel super administrator role. Set up MFA before opening Admin.',
    '/my-lockliel/security?required=staff&next=%2Fmy-lockliel%2Fadmin'
  );
end;
$$;

revoke all on function app_private.bootstrap_first_super_admin(uuid)
from public,anon,authenticated;
