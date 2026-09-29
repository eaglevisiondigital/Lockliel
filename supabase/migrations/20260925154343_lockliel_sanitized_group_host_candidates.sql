create or replace function app_private.group_host_candidate_ids()
returns table(profile_id uuid)
language sql
stable
security definer
set search_path to ''
as $function$
  select candidate.profile_id
  from (
    select lp.profile_id
    from public.leader_profiles lp
    where lp.active=true
      and lp.leader_type in ('group_leader','regional_leader')

    union

    select f.profile_id
    from public.founders50_applications f
    where f.status='active_host'
      and f.profile_id is not null
  ) candidate
  where app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  );
$function$;

revoke execute on function app_private.group_host_candidate_ids()
from public, anon;

grant execute on function app_private.group_host_candidate_ids()
to authenticated;

create or replace function public.lockliel_group_host_candidates()
returns table(profile_id uuid)
language sql
stable
security invoker
set search_path to ''
as $function$
  select c.profile_id
  from app_private.group_host_candidate_ids() c;
$function$;

revoke execute on function public.lockliel_group_host_candidates()
from public, anon;

grant execute on function public.lockliel_group_host_candidates()
to authenticated;
