create or replace function app_private.sync_payment_release_flag()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if exists(
    select 1
    from public.payment_provider_connections p
    where p.status='active'
      and p.checkout_adapter_ready=true
      and p.webhook_ready=true
  ) then
    return new;
  end if;

  update public.feature_flags
  set enabled=false,
      updated_at=now()
  where key='partner_checkout'
    and enabled=true;

  return new;
end;
$function$;

revoke execute on function app_private.sync_payment_release_flag()
from public, anon, authenticated;

drop trigger if exists sync_payment_release_flag_trigger
on public.payment_provider_connections;

create trigger sync_payment_release_flag_trigger
after update of status, checkout_adapter_ready, webhook_ready
on public.payment_provider_connections
for each row
execute function app_private.sync_payment_release_flag();

create or replace function app_private.sync_digital_delivery_release_flags()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if exists(
    select 1
    from public.products p
    where p.product_type='digital_book'
      and p.status='active'
      and p.storage_path is not null
      and exists(
        select 1
        from storage.objects o
        where o.bucket_id='member-resources'
          and o.name=p.storage_path
      )
  ) then
    return new;
  end if;

  update public.feature_flags
  set enabled=false,
      updated_at=now()
  where key in ('digital_book_delivery','heart_book_gift_benefit')
    and enabled=true;

  return new;
end;
$function$;

revoke execute on function app_private.sync_digital_delivery_release_flags()
from public, anon, authenticated;

drop trigger if exists sync_digital_delivery_release_flags_trigger
on public.products;

create trigger sync_digital_delivery_release_flags_trigger
after update of status, storage_path
on public.products
for each row
execute function app_private.sync_digital_delivery_release_flags();

create or replace function app_private.sync_operational_feature_flags()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.key='digital_book_delivery'
     and old.enabled is distinct from new.enabled
     and new.enabled=false then
    update public.feature_flags
    set enabled=false,
        updated_at=now()
    where key='heart_book_gift_benefit'
      and enabled=true;
  end if;

  if new.key='heart_book_gift_benefit'
     and old.enabled is distinct from new.enabled then
    if new.enabled then
      update public.benefit_rules
      set status='active'
      where slug='heart-for-the-lost-gift-20';
    else
      update public.benefit_rules
      set status=case when status='active' then 'paused' else status end
      where slug='heart-for-the-lost-gift-20';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_operational_feature_flags()
from public, anon, authenticated;
