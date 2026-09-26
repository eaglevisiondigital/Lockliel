create or replace function app_private.validate_product_release()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status='active'
     and new.product_type in ('digital_book','resource') then

    if new.storage_path is null
       or not exists(
         select 1
         from storage.objects o
         where o.bucket_id='member-resources'
           and o.name=new.storage_path
           and (
             new.product_type<>'digital_book'
             or lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
           )
       ) then
      raise exception
        'Digital products cannot be activated until the protected file exists in Lockliel storage with the required file type';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_product_release()
from public,anon,authenticated;

create or replace function app_private.validate_feature_activation()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.enabled is not true or old.enabled is true then
    return new;
  end if;

  if new.key='digital_book_delivery' then
    if not exists(
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
            and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
        )
    ) then
      raise exception
        'Digital book delivery cannot be enabled until an active protected PDF exists';
    end if;
  end if;

  if new.key='heart_book_gift_benefit' then
    if not exists(
      select 1
      from public.feature_flags f
      where f.key='digital_book_delivery'
        and f.enabled=true
    ) then
      raise exception
        'The book gift benefit cannot be enabled until digital book delivery is live';
    end if;

    if not exists(
      select 1
      from public.benefit_rules br
      join public.products p on p.id=br.product_id
      where br.slug='heart-for-the-lost-gift-20'
        and p.product_type='digital_book'
        and p.status='active'
        and p.storage_path is not null
        and exists(
          select 1
          from storage.objects o
          where o.bucket_id='member-resources'
            and o.name=p.storage_path
            and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
        )
    ) then
      raise exception
        'The book gift benefit cannot be enabled until the protected PDF book product is ready';
    end if;
  end if;

  if new.key='partner_checkout' then
    if not exists(
      select 1
      from public.payment_provider_connections p
      where p.status='active'
        and p.checkout_adapter_ready=true
        and p.webhook_ready=true
    ) then
      raise exception
        'Partner checkout cannot be enabled until a provider, checkout adapter, and webhook are all verified';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_feature_activation()
from public,anon,authenticated;

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
          and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
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
from public,anon,authenticated;
