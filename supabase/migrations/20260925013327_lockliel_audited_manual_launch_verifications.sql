
create table public.launch_verifications (
 key text primary key,
 label text not null,
 verified boolean not null default false,
 verified_by uuid references public.profiles(id) on delete set null,
 verified_at timestamptz,
 note text,
 updated_at timestamptz not null default now()
);
alter table public.launch_verifications enable row level security;

create policy "launch_verifications_admin_read" on public.launch_verifications for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));

create policy "launch_verifications_admin_update" on public.launch_verifications for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin']))
with check(app_private.has_staff_role(array['super_admin','admin']));

grant select,update on public.launch_verifications to authenticated;

insert into public.launch_verifications(key,label)
values
('auth_url_configuration','Supabase Auth site URL and redirect URLs configured'),
('custom_smtp','Production custom SMTP configured')
on conflict(key) do nothing;

create or replace function app_private.audit_launch_verification()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if old.verified is distinct from new.verified
     or old.note is distinct from new.note then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'launch_verification_changed',
      'launch_verification',
      new.key,
      'Launch verification changed',
      jsonb_build_object(
        'verified',new.verified,
        'note',new.note
      )
    );
  end if;

  new.verified_by:=case when new.verified then (select auth.uid()) else null end;
  new.verified_at:=case when new.verified then now() else null end;
  new.updated_at:=now();
  return new;
end;
$$;
revoke all on function app_private.audit_launch_verification() from public,anon,authenticated;

drop trigger if exists audit_launch_verification_trigger on public.launch_verifications;
create trigger audit_launch_verification_trigger
before update on public.launch_verifications
for each row execute function app_private.audit_launch_verification();
