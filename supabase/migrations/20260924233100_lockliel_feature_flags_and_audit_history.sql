
create table public.feature_flags (
 key text primary key,
 enabled boolean not null default false,
 description text,
 updated_at timestamptz not null default now()
);
alter table public.feature_flags enable row level security;
create policy "feature_flags_authenticated_read" on public.feature_flags for select to authenticated using(true);
create policy "feature_flags_admin_update" on public.feature_flags for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin']))
with check(app_private.has_staff_role(array['super_admin','admin']));
grant select,update on public.feature_flags to authenticated;

insert into public.feature_flags(key,enabled,description) values
('partner_checkout',false,'Live online giving checkout is available.'),
('digital_book_delivery',false,'Digital book fulfillment is publicly ready.'),
('heart_book_gift_benefit',false,'The approved qualifying-gift book benefit is active.'),
('founders50_public_recruiting',true,'Founders 50 public application flow is open.'),
('internal_messaging',true,'Private inviter/member messaging is available.')
on conflict(key) do nothing;

create table public.audit_events (
 id bigint generated always as identity primary key,
 actor_profile_id uuid references public.profiles(id) on delete set null,
 event_type text not null,
 entity_type text not null,
 entity_id text,
 summary text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index audit_events_actor_idx on public.audit_events(actor_profile_id,created_at desc);
create index audit_events_entity_idx on public.audit_events(entity_type,entity_id,created_at desc);
create index audit_events_type_idx on public.audit_events(event_type,created_at desc);

alter table public.audit_events enable row level security;
create policy "audit_admin_read" on public.audit_events for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));
grant select on public.audit_events to authenticated;

create or replace function app_private.audit_founders50_status()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if old.status is distinct from new.status then
   insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
   values((select auth.uid()),'founders50_status_changed','founders50_application',new.id::text,
     'Founders 50 status changed',
     jsonb_build_object('from',old.status,'to',new.status));
 end if;
 return new;
end;
$$;

create or replace function app_private.audit_gift_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values((select auth.uid()),'gift_recorded','gift',new.id::text,
   'Gift record created',
   jsonb_build_object('provider',new.provider,'amount_cents',new.amount_cents,'status',new.status,'designation',new.designation));
 return new;
end;
$$;

create or replace function app_private.audit_entitlement_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
 values((select auth.uid()),'resource_entitlement_granted','entitlement',new.id::text,
   'Resource entitlement granted',
   jsonb_build_object('profile_id',new.profile_id,'product_id',new.product_id,'reason',new.reason,'source_ref',new.source_ref));
 return new;
end;
$$;

revoke all on function app_private.audit_founders50_status() from public,anon,authenticated;
revoke all on function app_private.audit_gift_insert() from public,anon,authenticated;
revoke all on function app_private.audit_entitlement_insert() from public,anon,authenticated;

drop trigger if exists audit_founders50_status_trigger on public.founders50_applications;
create trigger audit_founders50_status_trigger after update of status on public.founders50_applications
for each row execute function app_private.audit_founders50_status();

drop trigger if exists audit_gift_insert_trigger on public.gifts;
create trigger audit_gift_insert_trigger after insert on public.gifts
for each row execute function app_private.audit_gift_insert();

drop trigger if exists audit_entitlement_insert_trigger on public.entitlements;
create trigger audit_entitlement_insert_trigger after insert on public.entitlements
for each row execute function app_private.audit_entitlement_insert();
