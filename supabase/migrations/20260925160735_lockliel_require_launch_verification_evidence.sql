
alter table public.launch_verifications
  drop constraint if exists launch_verifications_note_length,
  add constraint launch_verifications_note_length
    check (
      note is null
      or char_length(note)<=3000
    );

alter table public.launch_verifications
  drop constraint if exists launch_verifications_verified_note_required,
  add constraint launch_verifications_verified_note_required
    check (
      verified=false
      or (
        note is not null
        and char_length(trim(note)) between 20 and 3000
      )
    );

create or replace function app_private.audit_launch_verification()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  new.note:=nullif(trim(coalesce(new.note,'')),'');

  if new.verified
     and (new.note is null or char_length(new.note)<20) then
    raise exception
      'Verified launch checks require a verification note of at least 20 characters.';
  end if;

  if old.verified is distinct from new.verified
     or old.note is distinct from new.note then
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
      'launch_verification_changed',
      'launch_verification',
      new.key,
      'Launch verification changed',
      jsonb_build_object(
        'verified_from',old.verified,
        'verified_to',new.verified,
        'note_changed',old.note is distinct from new.note
      )
    );
  end if;

  new.verified_by:=case
    when new.verified then (select auth.uid())
    else null
  end;

  new.verified_at:=case
    when new.verified then now()
    else null
  end;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.audit_launch_verification()
from public, anon, authenticated;
