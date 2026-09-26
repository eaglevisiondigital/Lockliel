create or replace function app_private.audit_product_release_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is not distinct from new.status
     and old.storage_path is not distinct from new.storage_path
     and old.price_cents is not distinct from new.price_cents then
    return new;
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    (select auth.uid()),
    'product_release_changed',
    'product',
    new.id::text,
    'Product release settings changed',
    jsonb_build_object(
      'slug',new.slug,
      'status_from',old.status,
      'status_to',new.status,
      'storage_path_changed',old.storage_path is distinct from new.storage_path,
      'price_cents_from',old.price_cents,
      'price_cents_to',new.price_cents
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_product_release_change()
from public, anon, authenticated;

drop trigger if exists audit_product_release_change_trigger
on public.products;

create trigger audit_product_release_change_trigger
after update of status, storage_path, price_cents on public.products
for each row
execute function app_private.audit_product_release_change();
