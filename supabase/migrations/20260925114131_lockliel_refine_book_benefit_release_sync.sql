create or replace function app_private.sync_digital_delivery_release_flags()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  digital_ready boolean;
  heart_ready boolean;
begin
  select exists(
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
  )
  into digital_ready;

  select exists(
    select 1
    from public.benefit_rules br
    join public.products p on p.id=br.product_id
    where br.slug='heart-for-the-lost-gift-20'
      and p.status='active'
      and p.storage_path is not null
      and exists(
        select 1
        from storage.objects o
        where o.bucket_id='member-resources'
          and o.name=p.storage_path
      )
  )
  into heart_ready;

  if not digital_ready then
    update public.feature_flags
    set enabled=false,
        updated_at=now()
    where key='digital_book_delivery'
      and enabled=true;
  end if;

  if not digital_ready or not heart_ready then
    update public.feature_flags
    set enabled=false,
        updated_at=now()
    where key='heart_book_gift_benefit'
      and enabled=true;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_digital_delivery_release_flags()
from public, anon, authenticated;
