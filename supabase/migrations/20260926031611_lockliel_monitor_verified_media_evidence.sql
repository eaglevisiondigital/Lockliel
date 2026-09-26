create or replace function app_private.lockliel_media_evidence_health_internal()
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  verified_media_evidence_mismatches integer:=0;
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Administrator access required';
  end if;

  select count(*)::integer
    into verified_media_evidence_mismatches
  from public.media_progress mp
  join public.lesson_assets a on a.id=mp.asset_id
  where a.duration_seconds is not null
    and a.duration_verified_at is not null
    and (
      abs(
        mp.played_seconds
        - least(
            app_private.media_covered_seconds(mp.covered_intervals),
            a.duration_seconds
          )
      )>0.01
      or
      abs(
        mp.percent_watched
        - least(
            100::numeric,
            round(
              (
                least(
                  app_private.media_covered_seconds(mp.covered_intervals),
                  a.duration_seconds
                )
                / a.duration_seconds
              )*100,
              2
            )
          )
      )>0.01
      or mp.last_position_seconds>a.duration_seconds+5
      or exists(
        select 1
        from jsonb_array_elements(mp.covered_intervals) x
        where (x->>1)::numeric>a.duration_seconds+5
      )
      or (
        mp.percent_watched>=95
        and mp.completed_at is null
      )
      or (
        mp.percent_watched<95
        and mp.completed_at is not null
      )
    );

  return jsonb_build_object(
    'media_evidence_issue_count',verified_media_evidence_mismatches,
    'verified_media_evidence_mismatches',verified_media_evidence_mismatches
  );
end;
$function$;

revoke all on function app_private.lockliel_media_evidence_health_internal()
from public,anon,authenticated;

create or replace function public.lockliel_integrity_health()
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
declare
  base jsonb;
  security_health jsonb;
  media_health jsonb;
  base_issues integer:=0;
  security_issues integer:=0;
  media_issues integer:=0;
begin
  base:=app_private.lockliel_integrity_health_internal();
  security_health:=app_private.lockliel_security_health_internal();
  media_health:=app_private.lockliel_media_evidence_health_internal();

  base_issues:=coalesce((base->>'issue_count')::integer,0);
  security_issues:=coalesce((security_health->>'security_issue_count')::integer,0);
  media_issues:=coalesce((media_health->>'media_evidence_issue_count')::integer,0);

  return
    base
    || security_health
    || media_health
    || jsonb_build_object(
      'healthy',(base_issues+security_issues+media_issues)=0,
      'issue_count',base_issues+security_issues+media_issues
    );
end;
$function$;

revoke all on function public.lockliel_integrity_health()
from public,anon;

grant execute on function public.lockliel_integrity_health()
to authenticated;
