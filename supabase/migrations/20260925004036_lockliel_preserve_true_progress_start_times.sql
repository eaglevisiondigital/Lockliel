
create or replace function app_private.preserve_lesson_start_time()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  new.started_at:=coalesce(old.started_at,new.started_at,now());
  return new;
end;
$$;

drop trigger if exists preserve_lesson_start_time_trigger on public.lesson_progress;
create trigger preserve_lesson_start_time_trigger
before update on public.lesson_progress
for each row execute function app_private.preserve_lesson_start_time();

create or replace function app_private.preserve_media_start_time()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  new.first_started_at:=coalesce(old.first_started_at,new.first_started_at,now());
  return new;
end;
$$;

drop trigger if exists preserve_media_start_time_trigger on public.media_progress;
create trigger preserve_media_start_time_trigger
before update on public.media_progress
for each row execute function app_private.preserve_media_start_time();
