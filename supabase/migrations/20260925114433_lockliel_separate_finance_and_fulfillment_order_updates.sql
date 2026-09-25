drop policy if exists orders_staff_update on public.orders;

create policy orders_finance_update
on public.orders
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','finance_admin']
  )
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','finance_admin']
  )
);
