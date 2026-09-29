alter table public.privacy_requests
  add constraint privacy_requests_completed_deletion_profile_removed
    check (
      request_type<>'account_deletion'
      or status<>'completed'
      or profile_id is null
    );

create or replace function app_private.account_deletion_responsibility_counts(
  target_profile uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  staff_role_count integer:=0;
  primary_group_count integer:=0;
  active_assignment_count integer:=0;
  leadership_membership_count integer:=0;
  active_founder_host_count integer:=0;
  assigned_followup_count integer:=0;
  blocker_total integer:=0;
begin
  if target_profile is null then
    return jsonb_build_object(
      'profile_exists',false,
      'ready_for_profile_deletion',true,
      'blocker_count',0,
      'staff_roles',0,
      'primary_groups',0,
      'active_leader_assignments',0,
      'active_leader_or_host_memberships',0,
      'active_founders_host_records',0,
      'open_assigned_followups',0
    );
  end if;

  select count(*)::integer into staff_role_count
  from public.staff_roles sr
  where sr.profile_id=target_profile;

  select count(*)::integer into primary_group_count
  from public.groups g
  where g.leader_id=target_profile
    and g.status in ('forming','active');

  select count(*)::integer into active_assignment_count
  from public.leader_assignments la
  where la.leader_id=target_profile
    and la.status='active';

  select count(*)::integer into leadership_membership_count
  from public.group_members gm
  where gm.profile_id=target_profile
    and gm.status='active'
    and gm.role in ('leader','host');

  select count(*)::integer into active_founder_host_count
  from public.founders50_applications f
  where f.profile_id=target_profile
    and f.status='active_host';

  select count(*)::integer into assigned_followup_count
  from public.follow_up_tasks ft
  where ft.assigned_to=target_profile
    and ft.status in ('open','in_progress');

  blocker_total:=
    staff_role_count
    + primary_group_count
    + active_assignment_count
    + leadership_membership_count
    + active_founder_host_count
    + assigned_followup_count;

  return jsonb_build_object(
    'profile_exists',
      exists(select 1 from public.profiles p where p.id=target_profile),
    'ready_for_profile_deletion',blocker_total=0,
    'blocker_count',blocker_total,
    'staff_roles',staff_role_count,
    'primary_groups',primary_group_count,
    'active_leader_assignments',active_assignment_count,
    'active_leader_or_host_memberships',leadership_membership_count,
    'active_founders_host_records',active_founder_host_count,
    'open_assigned_followups',assigned_followup_count
  );
end;
$function$;

revoke all on function app_private.account_deletion_responsibility_counts(uuid)
from public,anon,authenticated;

create or replace function public.lockliel_account_deletion_preflight(
  target_profile uuid
)
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Administrator access required';
  end if;

  return app_private.account_deletion_responsibility_counts(target_profile);
end;
$function$;

revoke all on function public.lockliel_account_deletion_preflight(uuid)
from public,anon;

grant execute on function public.lockliel_account_deletion_preflight(uuid)
to authenticated;

create or replace function app_private.guard_profile_deletion_responsibilities()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  health jsonb;
begin
  health:=app_private.account_deletion_responsibility_counts(old.id);

  if coalesce((health->>'blocker_count')::integer,0)>0 then
    raise exception
      'Profile deletion blocked until staff, leadership, hosting, and assigned follow-up responsibilities are resolved.';
  end if;

  return old;
end;
$function$;

revoke execute on function app_private.guard_profile_deletion_responsibilities()
from public,anon,authenticated;

drop trigger if exists guard_profile_deletion_responsibilities_trigger
on public.profiles;

create trigger guard_profile_deletion_responsibilities_trigger
before delete
on public.profiles
for each row
execute function app_private.guard_profile_deletion_responsibilities();
