
create or replace function app_private.bootstrap_first_super_admin(target_profile uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  confirmed_at timestamptz;
  deleted_at_value timestamptz;
  banned_until_value timestamptz;
begin
  if target_profile is null then
    raise exception 'Target profile is required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('lockliel:first-super-admin',0)
  );

  if exists(select 1 from public.staff_roles where role='super_admin') then
    raise exception 'A super administrator already exists';
  end if;

  if not exists(select 1 from public.profiles p where p.id=target_profile) then
    raise exception 'Target profile does not exist';
  end if;

  select u.email_confirmed_at,u.deleted_at,u.banned_until
    into confirmed_at,deleted_at_value,banned_until_value
  from auth.users u
  where u.id=target_profile;

  if confirmed_at is null then
    raise exception 'Target account email must be confirmed first';
  end if;

  if deleted_at_value is not null then
    raise exception 'Deleted accounts cannot be assigned as the initial super administrator';
  end if;

  if banned_until_value is not null
     and banned_until_value>now() then
    raise exception 'Banned accounts cannot be assigned as the initial super administrator';
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
$function$;

revoke execute on function app_private.bootstrap_first_super_admin(uuid)
from public, anon, authenticated;
