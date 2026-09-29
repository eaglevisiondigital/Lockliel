revoke insert, update on table public.leader_assignments from authenticated;

grant insert (
  member_id,
  leader_id,
  assignment_type,
  status,
  assigned_by
) on table public.leader_assignments to authenticated;

grant update (
  leader_id,
  assignment_type,
  status,
  assigned_by
) on table public.leader_assignments to authenticated;

create or replace function app_private.normalize_leader_assignment_lifecycle()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  actor uuid;
begin
  actor:=(select auth.uid());

  if tg_op='UPDATE' and old.member_id is distinct from new.member_id then
    raise exception 'Leader assignment member identity cannot be changed.';
  end if;

  if tg_op='INSERT' then
    new.assigned_by:=coalesce(actor,new.assigned_by);
    new.assigned_at:=now();
  elsif old.leader_id is distinct from new.leader_id
     or old.assignment_type is distinct from new.assignment_type
     or (old.status<>'active' and new.status='active') then
    new.assigned_by:=coalesce(actor,new.assigned_by,old.assigned_by);
    new.assigned_at:=now();
  else
    new.assigned_by:=old.assigned_by;
    new.assigned_at:=old.assigned_at;
  end if;

  if new.status='active' then
    new.ended_at:=null;
  elsif old.status='active' and new.status<>'active' then
    new.ended_at:=now();
  else
    new.ended_at:=coalesce(old.ended_at,new.ended_at);
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_leader_assignment_lifecycle()
from public, anon, authenticated;

drop trigger if exists normalize_leader_assignment_lifecycle_trigger
on public.leader_assignments;

create trigger normalize_leader_assignment_lifecycle_trigger
before insert or update on public.leader_assignments
for each row
execute function app_private.normalize_leader_assignment_lifecycle();
