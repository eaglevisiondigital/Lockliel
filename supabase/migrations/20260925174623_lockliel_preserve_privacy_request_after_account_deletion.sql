
alter table public.privacy_requests
  alter column profile_id drop not null;

alter table public.privacy_requests
  drop constraint if exists privacy_requests_profile_id_fkey,
  add constraint privacy_requests_profile_id_fkey
    foreign key(profile_id)
    references public.profiles(id)
    on delete set null;

create or replace function app_private.guard_privacy_request_update()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  actor uuid := (select auth.uid());
  is_admin boolean := false;
  system_fk_unlink boolean := false;
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
    if new.profile_id is null then
      raise exception 'Privacy request profile is required at submission.';
    end if;

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

  system_fk_unlink :=
    actor is null
    and (
      (old.profile_id is not null and new.profile_id is null)
      or (old.handled_by is not null and new.handled_by is null)
    )
    and old.id is not distinct from new.id
    and old.request_type is not distinct from new.request_type
    and old.member_note is not distinct from new.member_note
    and old.admin_note is not distinct from new.admin_note
    and old.status is not distinct from new.status
    and old.requested_at is not distinct from new.requested_at
    and old.resolved_at is not distinct from new.resolved_at
    and (
      old.profile_id is not distinct from new.profile_id
      or new.profile_id is null
    )
    and (
      old.handled_by is not distinct from new.handled_by
      or new.handled_by is null
    );

  if system_fk_unlink then
    new.updated_at:=now();
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
