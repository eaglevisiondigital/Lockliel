alter table public.benefit_rules
  drop constraint if exists benefit_rules_date_window_check,
  add constraint benefit_rules_date_window_check
    check (
      starts_at is null
      or ends_at is null
      or ends_at>=starts_at
    );

create or replace function app_private.audit_benefit_rule_status()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is not distinct from new.status then
    return new;
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
    (select auth.uid()),
    'benefit_rule_status_changed',
    'benefit_rule',
    new.id::text,
    'Benefit rule status changed',
    jsonb_build_object(
      'slug',new.slug,
      'status_from',old.status,
      'status_to',new.status
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_benefit_rule_status()
from public, anon, authenticated;

drop trigger if exists audit_benefit_rule_status_trigger
on public.benefit_rules;

create trigger audit_benefit_rule_status_trigger
after update of status
on public.benefit_rules
for each row
execute function app_private.audit_benefit_rule_status();
