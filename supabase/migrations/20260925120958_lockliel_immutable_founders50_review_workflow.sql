revoke all privileges on table public.founders50_applications from anon;
revoke insert, update, delete on table public.founders50_applications from authenticated;
grant select on table public.founders50_applications to authenticated;

drop policy if exists founders50_staff_update
on public.founders50_applications;

revoke all privileges on table public.founders50_reviews from anon;
revoke insert, update, delete on table public.founders50_reviews from authenticated;
grant select on table public.founders50_reviews to authenticated;
grant insert (
  application_id,
  reviewer_id,
  decision,
  rationale
) on table public.founders50_reviews to authenticated;

alter table public.founders50_reviews
  drop constraint if exists founders50_reviews_decision_check,
  add constraint founders50_reviews_decision_check
    check (
      decision in (
        'note',
        'needs_info',
        'accept',
        'decline',
        'pause',
        'activate_host'
      )
    );

alter table public.founders50_reviews
  drop constraint if exists founders50_reviews_rationale_length,
  add constraint founders50_reviews_rationale_length
    check (
      rationale is null
      or char_length(rationale)<=5000
    );

alter table public.founders50_reviews
  drop constraint if exists founders50_reviews_decision_rationale,
  add constraint founders50_reviews_decision_rationale
    check (
      decision='note'
      or char_length(trim(coalesce(rationale,'')))>=20
    );

create or replace function app_private.apply_founders50_review_decision()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  applicant_profile uuid;
  current_status text;
  required_count integer;
  complete_count integer;
begin
  if new.decision='activate_host' then
    select f.profile_id,f.status
      into applicant_profile,current_status
    from public.founders50_applications f
    where f.id=new.application_id;

    if applicant_profile is null then
      raise exception
        'Active-host approval requires a linked My Lockliel account.';
    end if;

    if current_status<>'orientation' then
      raise exception
        'Active-host approval requires the application to be in orientation.';
    end if;

    select count(*)::integer
      into required_count
    from public.founder_orientation_steps s
    where s.active=true
      and s.required=true;

    select count(*)::integer
      into complete_count
    from public.founder_orientation_progress p
    join public.founder_orientation_steps s
      on s.id=p.step_id
    where p.profile_id=applicant_profile
      and p.completed_at is not null
      and s.active=true
      and s.required=true;

    if required_count=0 or complete_count<required_count then
      raise exception
        'Active-host approval requires all required Founder orientation steps.';
    end if;

    update public.founders50_applications
    set status='active_host',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='accept' then
    update public.founders50_applications
    set status='accepted',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='decline' then
    update public.founders50_applications
    set status='declined',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='needs_info' then
    update public.founders50_applications
    set status='needs_info',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='pause' then
    update public.founders50_applications
    set status='paused',
        updated_at=now()
    where id=new.application_id;
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    new.reviewer_id,
    'founders50_review_recorded',
    'founders50_application',
    new.application_id::text,
    'Founders 50 review recorded',
    jsonb_build_object('decision',new.decision)
  );

  return new;
end;
$function$;

revoke execute on function app_private.apply_founders50_review_decision()
from public, anon, authenticated;
