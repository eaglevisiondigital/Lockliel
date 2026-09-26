revoke insert, update on table public.founder_orientation_progress
from authenticated;

grant insert (
  profile_id,
  step_id,
  completed_at
) on table public.founder_orientation_progress
to authenticated;

grant update (
  completed_at
) on table public.founder_orientation_progress
to authenticated;

drop policy if exists founder_orientation_progress_insert
on public.founder_orientation_progress;

create policy founder_orientation_progress_insert
on public.founder_orientation_progress
for insert
to authenticated
with check (
  profile_id=(select auth.uid())
  and app_private.is_founders50_member((select auth.uid()))
  and exists(
    select 1
    from public.founder_orientation_steps s
    where s.id=step_id
      and s.active=true
  )
);

drop policy if exists founder_orientation_progress_update
on public.founder_orientation_progress;

create policy founder_orientation_progress_update
on public.founder_orientation_progress
for update
to authenticated
using (
  profile_id=(select auth.uid())
  and app_private.is_founders50_member((select auth.uid()))
)
with check (
  profile_id=(select auth.uid())
  and app_private.is_founders50_member((select auth.uid()))
  and exists(
    select 1
    from public.founder_orientation_steps s
    where s.id=step_id
      and s.active=true
  )
);

create or replace function app_private.normalize_founder_orientation_progress()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  founder_status text;
begin
  if tg_op='UPDATE'
     and (
       old.profile_id is distinct from new.profile_id
       or old.step_id is distinct from new.step_id
     ) then
    raise exception 'Founder orientation progress identity cannot be changed.';
  end if;

  select f.status
    into founder_status
  from public.founders50_applications f
  where f.profile_id=new.profile_id
    and f.status in ('accepted','orientation','active_host')
  order by f.created_at desc
  limit 1;

  if founder_status is null then
    raise exception 'Founders 50 orientation is not available for this account.';
  end if;

  if not exists(
    select 1
    from public.founder_orientation_steps s
    where s.id=new.step_id
      and s.active=true
  ) then
    raise exception 'Founder orientation step is not active.';
  end if;

  if tg_op='UPDATE'
     and founder_status='active_host'
     and old.completed_at is not null
     and new.completed_at is null then
    raise exception 'Completed orientation history cannot be removed after active-host approval.';
  end if;

  if new.completed_at is not null then
    new.completed_at:=coalesce(
      case when tg_op='UPDATE' then old.completed_at else null end,
      now()
    );
  else
    new.completed_at:=null;
  end if;

  new.updated_at:=now();
  new.notes:=case when tg_op='UPDATE' then old.notes else null end;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_founder_orientation_progress()
from public, anon, authenticated;

drop trigger if exists normalize_founder_orientation_progress_trigger
on public.founder_orientation_progress;

create trigger normalize_founder_orientation_progress_trigger
before insert or update on public.founder_orientation_progress
for each row
execute function app_private.normalize_founder_orientation_progress();

create or replace function app_private.audit_founder_orientation_progress()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and old.completed_at is not distinct from new.completed_at then
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
    new.profile_id,
    case when new.completed_at is null
      then 'founder_orientation_step_reopened'
      else 'founder_orientation_step_completed'
    end,
    'founder_orientation_progress',
    new.profile_id::text||':'||new.step_id::text,
    case when new.completed_at is null
      then 'Founder orientation step marked incomplete'
      else 'Founder orientation step completed'
    end,
    jsonb_build_object(
      'step_id',new.step_id,
      'completed',new.completed_at is not null
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_founder_orientation_progress()
from public, anon, authenticated;

drop trigger if exists audit_founder_orientation_progress_trigger
on public.founder_orientation_progress;

create trigger audit_founder_orientation_progress_trigger
after insert or update of completed_at
on public.founder_orientation_progress
for each row
execute function app_private.audit_founder_orientation_progress();
