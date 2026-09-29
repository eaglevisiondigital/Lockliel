drop policy if exists connection_requests_self_cancel on public.connection_requests;
drop policy if exists connection_requests_staff_update on public.connection_requests;

create policy connection_requests_combined_update
on public.connection_requests
for update
to authenticated
using (
  app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
  or (
    requester_id = (select auth.uid())
    and status = 'open'
  )
)
with check (
  app_private.has_staff_role(array['super_admin','admin','discipleship_admin','founders50_reviewer'])
  or (
    requester_id = (select auth.uid())
    and status = any (array['open','closed'])
  )
);

drop policy if exists orders_finance_update on public.orders;
drop policy if exists orders_fulfillment_update on public.orders;

create policy orders_staff_update
on public.orders
for update
to authenticated
using (
  app_private.has_staff_role(array['super_admin','admin','finance_admin','fulfillment_admin'])
)
with check (
  app_private.has_staff_role(array['super_admin','admin','finance_admin','fulfillment_admin'])
);

drop policy if exists privacy_requests_admin_read on public.privacy_requests;
drop policy if exists privacy_requests_self_read on public.privacy_requests;

create policy privacy_requests_combined_read
on public.privacy_requests
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or app_private.has_staff_role(array['super_admin','admin'])
);

drop policy if exists privacy_requests_admin_update on public.privacy_requests;
drop policy if exists privacy_requests_self_cancel on public.privacy_requests;

create policy privacy_requests_combined_update
on public.privacy_requests
for update
to authenticated
using (
  app_private.has_staff_role(array['super_admin','admin'])
  or (
    profile_id = (select auth.uid())
    and status = 'submitted'
  )
)
with check (
  app_private.has_staff_role(array['super_admin','admin'])
  or (
    profile_id = (select auth.uid())
    and status = any (array['submitted','cancelled'])
  )
);
