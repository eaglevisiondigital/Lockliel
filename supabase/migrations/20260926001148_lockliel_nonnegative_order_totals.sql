alter table public.orders
  drop constraint if exists orders_subtotal_nonnegative,
  add constraint orders_subtotal_nonnegative
    check (subtotal_cents>=0);

alter table public.orders
  drop constraint if exists orders_shipping_nonnegative,
  add constraint orders_shipping_nonnegative
    check (shipping_cents>=0);

alter table public.orders
  drop constraint if exists orders_tax_nonnegative,
  add constraint orders_tax_nonnegative
    check (tax_cents>=0);

alter table public.orders
  drop constraint if exists orders_total_nonnegative,
  add constraint orders_total_nonnegative
    check (total_cents>=0);
