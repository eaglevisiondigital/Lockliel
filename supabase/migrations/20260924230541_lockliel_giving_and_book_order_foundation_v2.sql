
create table if not exists public.payment_provider_connections (
 id uuid primary key default gen_random_uuid(),
 provider text unique not null check(provider in ('authorize_net','stripe','paypal','square')),
 label text not null,
 status text not null default 'not_connected' check(status in ('not_connected','sandbox','active','disabled')),
 supports_one_time boolean not null default true,
 supports_recurring boolean not null default false,
 checkout_mode text,
 updated_at timestamptz not null default now()
);
alter table public.payment_provider_connections enable row level security;
drop policy if exists "payment_provider_member_read" on public.payment_provider_connections;
create policy "payment_provider_member_read" on public.payment_provider_connections for select to authenticated using(true);
grant select on public.payment_provider_connections to authenticated;

insert into public.payment_provider_connections(provider,label,supports_one_time,supports_recurring,checkout_mode) values
('authorize_net','Authorize.net',true,true,'hosted'),
('stripe','Stripe',true,true,'hosted'),
('paypal','PayPal',true,true,'hosted'),
('square','Square',true,true,'hosted')
on conflict(provider) do nothing;

alter table public.gifts add column if not exists designation text not null default 'general';
alter table public.gifts add column if not exists campaign text;
alter table public.partner_commitments add column if not exists designation text not null default 'general';
alter table public.partner_commitments add column if not exists campaign text;
alter table public.partner_commitments add column if not exists started_at timestamptz;
alter table public.partner_commitments add column if not exists cancelled_at timestamptz;

create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid references public.profiles(id) on delete set null,
 provider text,
 provider_session_ref text,
 provider_transaction_ref text,
 status text not null default 'pending' check(status in ('pending','paid','failed','cancelled','refunded','partially_refunded','fulfilled')),
 currency text not null default 'USD',
 subtotal_cents bigint not null default 0,
 shipping_cents bigint not null default 0,
 tax_cents bigint not null default 0,
 total_cents bigint not null default 0,
 delivery_method text check(delivery_method in ('digital','shipping','mixed')),
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 fulfilled_at timestamptz
);
create unique index if not exists orders_provider_session_unique on public.orders(provider,provider_session_ref) where provider_session_ref is not null;
create unique index if not exists orders_provider_transaction_unique on public.orders(provider,provider_transaction_ref) where provider_transaction_ref is not null;
create index if not exists orders_profile_idx on public.orders(profile_id);

create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid not null references public.products(id),
 quantity int not null default 1 check(quantity>0 and quantity<=100),
 unit_price_cents bigint not null default 0,
 created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

create table if not exists public.order_shipping_addresses (
 order_id uuid primary key references public.orders(id) on delete cascade,
 recipient_name text not null,
 line1 text not null,
 line2 text,
 city text not null,
 region text not null,
 postal_code text not null,
 country text not null default 'US',
 created_at timestamptz not null default now()
);

create table if not exists public.benefit_rules (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 title text not null,
 rule_type text not null check(rule_type in ('gift_minimum_product_entitlement')),
 status text not null default 'draft' check(status in ('draft','active','paused','ended')),
 minimum_gift_cents bigint not null,
 product_id uuid not null references public.products(id),
 fulfillment_type text not null check(fulfillment_type in ('digital','physical')),
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_shipping_addresses enable row level security;
alter table public.benefit_rules enable row level security;

drop policy if exists "orders_self_read" on public.orders;
create policy "orders_self_read" on public.orders for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','finance_admin']));
drop policy if exists "order_items_owner_read" on public.order_items;
create policy "order_items_owner_read" on public.order_items for select to authenticated
using(exists(select 1 from public.orders o where o.id=order_id and (o.profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','finance_admin']))));
drop policy if exists "shipping_owner_read" on public.order_shipping_addresses;
create policy "shipping_owner_read" on public.order_shipping_addresses for select to authenticated
using(exists(select 1 from public.orders o where o.id=order_id and (o.profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin','finance_admin']))));
drop policy if exists "active_benefits_member_read" on public.benefit_rules;
create policy "active_benefits_member_read" on public.benefit_rules for select to authenticated
using(status='active' or app_private.has_staff_role(array['super_admin','admin','finance_admin']));

grant select on public.orders,public.order_items,public.order_shipping_addresses,public.benefit_rules to authenticated;

insert into public.benefit_rules(slug,title,rule_type,minimum_gift_cents,product_id,fulfillment_type,status)
select 'heart-for-the-lost-gift-20','A Heart for the Lost gift benefit','gift_minimum_product_entitlement',2000,p.id,'digital','draft'
from public.products p where p.slug='a-heart-for-the-lost-digital'
on conflict(slug) do nothing;
