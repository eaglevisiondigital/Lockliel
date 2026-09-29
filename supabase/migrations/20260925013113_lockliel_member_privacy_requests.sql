
create table public.privacy_requests (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.profiles(id) on delete cascade,
 request_type text not null check(request_type in ('data_export','account_deletion')),
 status text not null default 'submitted' check(status in ('submitted','in_review','completed','cancelled','declined')),
 member_note text,
 admin_note text,
 requested_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 resolved_at timestamptz,
 handled_by uuid references public.profiles(id) on delete set null
);
create index privacy_requests_profile_idx on public.privacy_requests(profile_id,requested_at desc);
create index privacy_requests_status_idx on public.privacy_requests(status,requested_at asc);
create index privacy_requests_handler_idx on public.privacy_requests(handled_by,status);

alter table public.privacy_requests enable row level security;

create policy "privacy_requests_self_read" on public.privacy_requests for select to authenticated
using(profile_id=(select auth.uid()));

create policy "privacy_requests_self_insert" on public.privacy_requests for insert to authenticated
with check(profile_id=(select auth.uid()) and status='submitted');

create policy "privacy_requests_self_cancel" on public.privacy_requests for update to authenticated
using(profile_id=(select auth.uid()) and status='submitted')
with check(profile_id=(select auth.uid()) and status in ('submitted','cancelled'));

create policy "privacy_requests_admin_read" on public.privacy_requests for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));

create policy "privacy_requests_admin_update" on public.privacy_requests for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin']))
with check(app_private.has_staff_role(array['super_admin','admin']));

grant select,insert,update on public.privacy_requests to authenticated;

create or replace function app_private.audit_privacy_request()
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
   coalesce((select auth.uid()),new.profile_id),
   case when tg_op='INSERT' then 'privacy_request_created' else 'privacy_request_changed' end,
   'privacy_request',
   new.id::text,
   'Member privacy request changed',
   jsonb_build_object(
     'request_type',new.request_type,
     'status',new.status
   )
 );
 return new;
end;
$$;
revoke all on function app_private.audit_privacy_request() from public,anon,authenticated;

drop trigger if exists audit_privacy_request_trigger on public.privacy_requests;
create trigger audit_privacy_request_trigger
after insert or update of status on public.privacy_requests
for each row execute function app_private.audit_privacy_request();
