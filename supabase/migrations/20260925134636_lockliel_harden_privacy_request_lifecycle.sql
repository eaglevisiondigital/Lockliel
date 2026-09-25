revoke insert, update on table public.privacy_requests
from authenticated;

grant insert (
  profile_id,
  request_type,
  status,
  member_note
) on table public.privacy_requests
to authenticated;

grant update (
  status,
  admin_note
) on table public.privacy_requests
to authenticated;

alter table public.privacy_requests
  drop constraint if exists privacy_requests_member_note_length,
  add constraint privacy_requests_member_note_length
    check (
      member_note is null
      or char_length(member_note)<=3000
    );

alter table public.privacy_requests
  drop constraint if exists privacy_requests_admin_note_length,
  add constraint privacy_requests_admin_note_length
    check (
      admin_note is null
      or char_length(admin_note)<=5000
    );

create unique index if not exists privacy_requests_one_open_type_uidx
on public.privacy_requests(profile_id,request_type)
where status in ('submitted','in_review');

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
    new.requested_at:=now();
    new.updated_at:=now();
    new.resolved_at:=null;
    new.handled_by:=null;

    if actor is not null
       and actor=new.profile_id
       and not is_admin then
      if new.status<>'submitted'
         or new.admin_note is not null then
        raise exception 'Member privacy requests must begin as submitted without staff processing fields.';
      end if;
    end if;

    return new;
  end if;

  if old.id is distinct from new.id
     or old.profile_id is distinct from new.profile_id
     or old.request_type is distinct from new.request_type
     or old.member_note is distinct from new.member_note
     or old.requested_at is distinct from new.requested_at then
    raise exception 'Privacy request identity and member submission fields cannot be changed after submission.';
  end if;

  if actor is not null
     and actor=old.profile_id
     and not is_admin then
    if new.admin_note is distinct from old.admin_note then
      raise exception 'Members cannot change staff processing fields.';
    end if;

    if new.status is distinct from old.status
       and not (old.status='submitted' and new.status='cancelled') then
      raise exception 'Members may only cancel a submitted privacy request.';
    end if;

    new.handled_by:=old.handled_by;
    new.updated_at:=now();

    if old.status='submitted' and new.status='cancelled' then
      new.resolved_at:=coalesce(old.resolved_at,now());
    else
      new.resolved_at:=old.resolved_at;
    end if;

    return new;
  end if;

  if not is_admin then
    raise exception 'Administrator access required for privacy request processing.';
  end if;

  new.updated_at:=now();

  if new.status='in_review' then
    new.handled_by:=actor;
    new.resolved_at:=null;
  elsif new.status in ('completed','declined') then
    new.handled_by:=actor;
    new.resolved_at:=coalesce(old.resolved_at,now());
  elsif new.status='submitted' then
    new.handled_by:=null;
    new.resolved_at:=null;
  elsif new.status='cancelled' then
    new.handled_by:=coalesce(old.handled_by,actor);
    new.resolved_at:=coalesce(old.resolved_at,now());
  end if;

  if new.request_type='account_deletion'
     and new.status='completed'
     and char_length(trim(coalesce(new.admin_note,'')))<20 then
    raise exception 'Completed account deletion requests require documented processing details.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.guard_privacy_request_update()
from public, anon, authenticated;
