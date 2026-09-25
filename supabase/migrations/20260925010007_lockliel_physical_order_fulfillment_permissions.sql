
create policy "orders_finance_update" on public.orders for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','finance_admin']));

grant update on public.orders to authenticated;

create or replace function app_private.audit_order_status()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'order_status_changed',
      'order',
      new.id::text,
      'Order status changed',
      jsonb_build_object('from',old.status,'to',new.status)
    );
  end if;
  return new;
end;
$$;

revoke all on function app_private.audit_order_status() from public,anon,authenticated;

drop trigger if exists audit_order_status_trigger on public.orders;
create trigger audit_order_status_trigger
after update of status on public.orders
for each row execute function app_private.audit_order_status();
