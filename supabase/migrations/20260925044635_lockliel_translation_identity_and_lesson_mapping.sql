alter table public.courses
  alter column translation_key set not null;

alter table public.products
  alter column translation_key set not null;

alter table public.share_assets
  alter column translation_key set not null;

alter table public.courses
  add constraint courses_translation_language_unique
  unique (translation_key, language_code);

alter table public.products
  add constraint products_translation_language_unique
  unique (translation_key, language_code);

alter table public.share_assets
  add constraint share_assets_translation_language_unique
  unique (translation_key, language_code);

alter table public.lessons
  add column translation_key text;

update public.lessons
set translation_key = slug
where translation_key is null or trim(translation_key) = '';

alter table public.lessons
  alter column translation_key set not null;

alter table public.lessons
  add constraint lessons_course_translation_key_unique
  unique (course_id, translation_key);

create trigger default_lesson_translation_key_trigger
before insert or update on public.lessons
for each row
execute function app_private.default_translation_key_from_slug();

create or replace function app_private.resolve_course_translation(
  source_course uuid,
  target_locale text
)
returns uuid
language sql
stable
set search_path = ''
as $$
  with source as (
    select c.id, c.translation_key
    from public.courses c
    where c.id = source_course
  ),
  requested as (
    select lower(replace(nullif(trim(target_locale), ''), '_', '-')) as locale
  ),
  candidates as (
    select c.id,
           case
             when c.language_code = r.locale then 1
             when c.language_code = split_part(r.locale, '-', 1) then 2
             when c.language_code = 'en' then 3
             when c.id = s.id then 4
             else 5
           end as preference
    from source s
    cross join requested r
    join public.courses c
      on c.translation_key = s.translation_key
    where c.status = 'published'
  )
  select coalesce(
    (select id from candidates order by preference, id limit 1),
    source_course
  );
$$;

create or replace function app_private.resolve_equivalent_lesson(
  source_lesson uuid,
  target_locale text
)
returns uuid
language sql
stable
set search_path = ''
as $$
  with source as (
    select l.id,
           l.translation_key,
           l.course_id
    from public.lessons l
    where l.id = source_lesson
  ),
  target_course as (
    select app_private.resolve_course_translation(s.course_id, target_locale) as course_id
    from source s
  )
  select coalesce(
    (
      select target_lesson.id
      from source s
      cross join target_course tc
      join public.lessons target_lesson
        on target_lesson.course_id = tc.course_id
       and target_lesson.translation_key = s.translation_key
      limit 1
    ),
    source_lesson
  );
$$;
