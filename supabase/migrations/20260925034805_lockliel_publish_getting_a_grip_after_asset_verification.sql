
update public.courses
set status='published'
where slug='getting-a-grip-on-the-basics'
  and (
    select count(*)
    from public.lessons l
    where l.course_id=public.courses.id
  )=13
  and (
    select count(*)
    from public.lesson_assets a
    join public.lessons l on l.id=a.lesson_id
    where l.course_id=public.courses.id
      and a.asset_type='video'
      and a.status='active'
  )>=13
  and (
    select count(*)
    from public.lesson_assets a
    join public.lessons l on l.id=a.lesson_id
    where l.course_id=public.courses.id
      and a.asset_type='pdf'
      and a.status='active'
      and a.storage_path is not null
  )=13;
