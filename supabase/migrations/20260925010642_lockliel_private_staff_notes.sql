
create table public.member_staff_notes (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.profiles(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 visibility text not null default 'ministry_staff'
   check(visibility in ('admin_only','ministry_staff','finance_only')),
 note_type text not null default 'general'
   check(note_type in ('general','follow_up','discipleship','founders50','group','finance')),
 body text not null check(char_length(body) between 1 and 5000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index member_staff_notes_profile_idx on public.member_staff_notes(profile_id,created_at desc);
create index member_staff_notes_author_idx on public.member_staff_notes(author_id,created_at desc);

alter table public.member_staff_notes enable row level security;

create policy "member_staff_notes_read" on public.member_staff_notes for select to authenticated
using(
  case visibility
    when 'admin_only' then app_private.has_staff_role(array['super_admin','admin'])
    when 'finance_only' then app_private.has_staff_role(array['super_admin','admin','finance_admin'])
    else app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
  end
);

create policy "member_staff_notes_insert" on public.member_staff_notes for insert to authenticated
with check(
  author_id=(select auth.uid())
  and (
    (visibility='admin_only' and app_private.has_staff_role(array['super_admin','admin']))
    or (visibility='finance_only' and app_private.has_staff_role(array['super_admin','admin','finance_admin']))
    or (visibility='ministry_staff' and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer']))
  )
);

create policy "member_staff_notes_author_update" on public.member_staff_notes for update to authenticated
using(
  author_id=(select auth.uid())
  or app_private.has_staff_role(array['super_admin','admin'])
)
with check(
  author_id=(select auth.uid())
  or app_private.has_staff_role(array['super_admin','admin'])
);

grant select,insert,update on public.member_staff_notes to authenticated;

create or replace function app_private.audit_member_staff_note()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.audit_events(
    actor_profile_id,event_type,entity_type,entity_id,summary,metadata
  )
  values(
    new.author_id,
    case when tg_op='INSERT' then 'member_staff_note_created' else 'member_staff_note_updated' end,
    'member_staff_note',
    new.id::text,
    'Private staff note changed',
    jsonb_build_object(
      'profile_id',new.profile_id,
      'visibility',new.visibility,
      'note_type',new.note_type
    )
  );
  return new;
end;
$$;
revoke all on function app_private.audit_member_staff_note() from public,anon,authenticated;

drop trigger if exists audit_member_staff_note_trigger on public.member_staff_notes;
create trigger audit_member_staff_note_trigger
after insert or update on public.member_staff_notes
for each row execute function app_private.audit_member_staff_note();
