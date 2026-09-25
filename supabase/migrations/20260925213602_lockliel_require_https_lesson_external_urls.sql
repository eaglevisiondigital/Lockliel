
alter table public.lesson_assets
  drop constraint if exists lesson_assets_external_url_length,
  add constraint lesson_assets_external_url_length
    check (
      external_url is null
      or char_length(external_url)<=2000
    );

alter table public.lesson_assets
  drop constraint if exists lesson_assets_external_url_https,
  add constraint lesson_assets_external_url_https
    check (
      external_url is null
      or external_url ~* '^https://[^[:space:]]+$'
    );

create or replace function app_private.normalize_lesson_asset()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' and old.lesson_id is distinct from new.lesson_id then
    raise exception 'Lesson asset identity cannot be moved to another lesson.';
  end if;

  new.external_url:=nullif(trim(coalesce(new.external_url,'')),'');
  new.provider:=nullif(lower(trim(coalesce(new.provider,''))),'');
  new.provider_ref:=nullif(trim(coalesce(new.provider_ref,'')),'');
  new.storage_path:=nullif(trim(coalesce(new.storage_path,'')),'');

  if new.external_url is not null
     and new.external_url !~* '^https://[^[:space:]]+$' then
    raise exception 'Lesson external URLs must use HTTPS.';
  end if;

  if new.status='active' then
    if new.asset_type='video' then
      if coalesce(new.provider,'')<>'youtube'
         or new.provider_ref is null then
        raise exception 'Active video assets require a YouTube provider and video reference.';
      end if;
    elsif new.asset_type in ('pdf','worksheet') then
      if new.storage_path is null
         and new.external_url is null then
        raise exception 'Active document assets require a private storage path or external URL.';
      end if;
    elsif new.asset_type='external_link' then
      if new.external_url is null then
        raise exception 'Active external-link assets require an external URL.';
      end if;
    elsif new.asset_type='audio' then
      if new.provider_ref is null
         and new.storage_path is null
         and new.external_url is null then
        raise exception 'Active audio assets require a provider reference, storage path, or external URL.';
      end if;
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_lesson_asset()
from public, anon, authenticated;
