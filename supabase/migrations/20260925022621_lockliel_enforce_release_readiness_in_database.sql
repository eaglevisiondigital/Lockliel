
create or replace function app_private.validate_course_release()
returns trigger
language plpgsql
set search_path=''
as $$
declare
  lesson_count int;
  structured_count int;
  active_video_count int;
  private_pdf_count int;
begin
  if new.status<>'published' or old.status='published' then
    return new;
  end if;

  if new.slug='getting-a-grip-on-the-basics' then
    select count(*)::int,
           count(*) filter(
             where jsonb_array_length(coalesce(l.worksheet_schema->'questions','[]'::jsonb))>0
           )::int
      into lesson_count,structured_count
    from public.lessons l
    where l.course_id=new.id;

    select count(*) filter(
             where a.asset_type='video' and a.status='active'
           )::int,
           count(*) filter(
             where a.asset_type='pdf'
               and a.status='active'
               and a.storage_path is not null
               and exists(
                 select 1
                 from storage.objects o
                 where o.bucket_id='lesson-assets'
                   and o.name=a.storage_path
               )
           )::int
      into active_video_count,private_pdf_count
    from public.lesson_assets a
    where a.lesson_id in (
      select l.id from public.lessons l where l.course_id=new.id
    );

    if lesson_count<>13
       or structured_count<>13
       or active_video_count<10
       or private_pdf_count<>13 then
      raise exception
        'Getting a Grip cannot be published until all 13 lessons are structured, the teaching media set is ready, and all 13 private workbooks exist in Lockliel storage';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_course_release_trigger on public.courses;
create trigger validate_course_release_trigger
before update of status on public.courses
for each row execute function app_private.validate_course_release();

create or replace function app_private.validate_product_release()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  if new.status='active'
     and new.product_type in ('digital_book','resource') then

    if new.storage_path is null
       or not exists(
         select 1
         from storage.objects o
         where o.bucket_id='member-resources'
           and o.name=new.storage_path
       ) then
      raise exception
        'Digital products cannot be activated until the protected file exists in Lockliel storage';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_product_release_trigger on public.products;
create trigger validate_product_release_trigger
before insert or update of status,storage_path on public.products
for each row execute function app_private.validate_product_release();

create or replace function app_private.validate_feature_activation()
returns trigger
language plpgsql
set search_path=''
as $$
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
          select 1 from storage.objects o
          where o.bucket_id='member-resources'
            and o.name=p.storage_path
        )
    ) then
      raise exception
        'Digital book delivery cannot be enabled until an active protected digital book file exists';
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
        and p.status='active'
        and p.storage_path is not null
        and exists(
          select 1 from storage.objects o
          where o.bucket_id='member-resources'
            and o.name=p.storage_path
        )
    ) then
      raise exception
        'The book gift benefit cannot be enabled until the protected book product is ready';
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
$$;

drop trigger if exists validate_feature_activation_trigger on public.feature_flags;
create trigger validate_feature_activation_trigger
before update of enabled on public.feature_flags
for each row execute function app_private.validate_feature_activation();
