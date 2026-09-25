
alter table public.staff_roles
  drop constraint if exists staff_roles_role_check;

alter table public.staff_roles
  add constraint staff_roles_role_check
  check(role in (
    'super_admin',
    'admin',
    'discipleship_admin',
    'founders50_reviewer',
    'group_leader',
    'finance_admin',
    'content_admin',
    'fulfillment_admin'
  ));

create table public.order_fulfillment_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 actor_profile_id uuid references public.profiles(id) on delete set null,
 event_type text not null check(event_type in ('processing','packed','shipped','delivered','fulfilled','note')),
 carrier text,
 tracking_number text,
 note text,
 created_at timestamptz not null default now()
);
create index order_fulfillment_events_order_idx
  on public.order_fulfillment_events(order_id,created_at desc);
create index order_fulfillment_events_actor_idx
  on public.order_fulfillment_events(actor_profile_id,created_at desc);

alter table public.order_fulfillment_events enable row level security;

drop policy if exists "orders_self_read" on public.orders;
create policy "orders_combined_read" on public.orders for select to authenticated
using(
  profile_id=(select auth.uid())
  or app_private.has_staff_role(array['super_admin','admin','finance_admin','fulfillment_admin'])
);

drop policy if exists "order_items_owner_read" on public.order_items;
create policy "order_items_combined_read" on public.order_items for select to authenticated
using(
  exists(
    select 1 from public.orders o
    where o.id=order_id
      and (
        o.profile_id=(select auth.uid())
        or app_private.has_staff_role(array['super_admin','admin','finance_admin','fulfillment_admin'])
      )
  )
);

drop policy if exists "shipping_owner_read" on public.order_shipping_addresses;
create policy "shipping_combined_read" on public.order_shipping_addresses for select to authenticated
using(
  exists(
    select 1 from public.orders o
    where o.id=order_id
      and (
        o.profile_id=(select auth.uid())
        or app_private.has_staff_role(array['super_admin','admin','finance_admin','fulfillment_admin'])
      )
  )
);

create policy "orders_fulfillment_update" on public.orders for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','fulfillment_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','fulfillment_admin']));

create policy "fulfillment_events_member_read" on public.order_fulfillment_events for select to authenticated
using(
  exists(
    select 1 from public.orders o
    where o.id=order_id
      and (
        o.profile_id=(select auth.uid())
        or app_private.has_staff_role(array['super_admin','admin','finance_admin','fulfillment_admin'])
      )
  )
);

create policy "fulfillment_events_staff_insert" on public.order_fulfillment_events for insert to authenticated
with check(
  actor_profile_id=(select auth.uid())
  and app_private.has_staff_role(array['super_admin','admin','fulfillment_admin'])
);

grant select,update on public.orders to authenticated;
grant select on public.order_items,public.order_shipping_addresses,public.order_fulfillment_events to authenticated;
grant insert on public.order_fulfillment_events to authenticated;

create or replace function app_private.sync_order_fulfillment_status()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.event_type='fulfilled' then
    update public.orders
    set status='fulfilled',
        fulfilled_at=coalesce(fulfilled_at,now())
    where id=new.order_id;

    insert into public.notifications(profile_id,notification_type,title,body,href)
    select
      o.profile_id,
      'order',
      'Your Lockliel order is fulfilled',
      'Your order has been marked fulfilled in My Lockliel.',
      '/my-lockliel/orders'
    from public.orders o
    where o.id=new.order_id and o.profile_id is not null;
  elsif new.event_type='shipped' then
    insert into public.notifications(profile_id,notification_type,title,body,href)
    select
      o.profile_id,
      'order',
      'Your Lockliel order has shipped',
      case
        when nullif(trim(coalesce(new.tracking_number,'')),'') is not null
          then 'Your order has shipped. Tracking: ' || new.tracking_number
        else 'Your order has shipped.'
      end,
      '/my-lockliel/orders'
    from public.orders o
    where o.id=new.order_id and o.profile_id is not null;
  end if;

  return new;
end;
$$;
revoke all on function app_private.sync_order_fulfillment_status() from public,anon,authenticated;

drop trigger if exists sync_order_fulfillment_status_trigger on public.order_fulfillment_events;
create trigger sync_order_fulfillment_status_trigger
after insert on public.order_fulfillment_events
for each row execute function app_private.sync_order_fulfillment_status();
