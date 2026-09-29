drop policy if exists privacy_requests_self_insert
on public.privacy_requests;

create policy privacy_requests_self_insert
on public.privacy_requests
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and status = 'submitted'
  and admin_note is null
  and handled_by is null
  and resolved_at is null
);

create or replace function app_private.guard_privacy_request_update()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  actor uuid := (select auth.uid());
  is_admin boolean := false;
begin
  if actor is not null then
    select exists(
      select 1
      from public.staff_roles sr
      where sr.profile_id=actor
        and sr.role in ('super_admin','admin')
    )
    into is_admin;
  end if;

  if tg_op='INSERT' then
    if actor is not null
       and actor=new.profile_id
       and not is_admin then

      if new.status<>'submitted'
         or new.admin_note is not null
         or new.handled_by is not null
         or new.resolved_at is not null then
        raise exception 'Member privacy requests must begin as submitted without staff processing fields.';
      end if;

      new.requested_at:=now();
      new.updated_at:=now();
      new.resolved_at:=null;
      new.handled_by:=null;
      new.admin_note:=null;
    end if;

    return new;
  end if;

  if actor is not null
     and actor=old.profile_id
     and not is_admin then

    if new.profile_id is distinct from old.profile_id
       or new.request_type is distinct from old.request_type
       or new.member_note is distinct from old.member_note
       or new.admin_note is distinct from old.admin_note
       or new.handled_by is distinct from old.handled_by
       or new.requested_at is distinct from old.requested_at then
      raise exception 'Members cannot change protected privacy-request fields after submission.';
    end if;

    if new.status is distinct from old.status
       and not (old.status='submitted' and new.status='cancelled') then
      raise exception 'Members may only cancel a submitted privacy request.';
    end if;

    new.updated_at:=now();

    if old.status='submitted' and new.status='cancelled' then
      new.resolved_at:=now();
    else
      new.resolved_at:=old.resolved_at;
    end if;

    return new;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.guard_privacy_request_update()
from public, anon, authenticated;

drop trigger if exists guard_privacy_request_update_trigger
on public.privacy_requests;

create trigger guard_privacy_request_update_trigger
before insert or update on public.privacy_requests
for each row
execute function app_private.guard_privacy_request_update();
