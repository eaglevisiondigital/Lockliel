
with lesson_map as (
  select l.id,l.position
  from public.lessons l
  join public.courses c on c.id=l.course_id
  where c.slug='getting-a-grip-on-the-basics'
),
videos(position,sort_order,video_id,title) as (
  values
  (1,0,'SJ5Ee7OXkkM','Getting a Grip on the Basics - Week 1'),
  (2,0,'AEfPf609RgU','Getting a Grip on the Basics - Week 2'),
  (3,0,'3CSBKubDefw','Getting a Grip on the Basics - Week 3'),
  (4,0,'_NSjbNFcqQA','Getting a Grip on the Basics - Week 4'),
  (5,0,'nWS8Km2kfKg','Getting a Grip on the Basics - Week 5'),
  (6,0,'enGySOvV4jg','Getting a Grip on the Basics - Week 6 Part 1'),
  (6,1,'TjuLVCy4gnQ','Getting a Grip on the Basics - Week 6 Part 2'),
  (7,0,'q_vUBJ8EgaU','Getting a Grip on the Basics - Week 7'),
  (8,0,'2VDVveA4RUQ','Getting a Grip on the Basics - Week 8 Part 1'),
  (8,1,'g8b964SWekE','Getting a Grip on the Basics - Week 8 Part 2'),
  (9,0,'HY1OyDdODL8','Getting a Grip on the Basics - Week 9 Part 1'),
  (9,1,'vjY2BTUzxGU','Getting a Grip on the Basics - Week 9 Part 2'),
  (10,0,'5-1B6IouUNk','Getting a Grip on the Basics - Week 10')
)
insert into public.lesson_assets(lesson_id,asset_type,title,provider,provider_ref,sort_order,status)
select lm.id,'video',v.title,'youtube',v.video_id,v.sort_order,'active'
from videos v
join lesson_map lm on lm.position=v.position
where not exists(
  select 1 from public.lesson_assets la
  where la.lesson_id=lm.id and la.asset_type='video' and la.provider='youtube' and la.provider_ref=v.video_id
);

with lesson_map as (
  select l.id,l.position,l.slug,l.title
  from public.lessons l
  join public.courses c on c.id=l.course_id
  where c.slug='getting-a-grip-on-the-basics'
)
insert into public.lesson_assets(lesson_id,asset_type,title,provider,external_url,sort_order,status)
select
  lm.id,
  'pdf',
  'Lesson '||lm.position||' PDF',
  'champion-life',
  'https://championlifefwb.com/assets/downloads/grip/getting-a-grip-lesson-'||lm.position||'-'||lm.slug||'.pdf',
  20,
  'active'
from lesson_map lm
where not exists(
  select 1 from public.lesson_assets la
  where la.lesson_id=lm.id and la.asset_type='pdf' and la.title='Lesson '||lm.position||' PDF'
);

with first_lesson as (
  select l.id
  from public.lessons l
  join public.courses c on c.id=l.course_id
  where c.slug='getting-a-grip-on-the-basics'
  order by l.position
  limit 1
)
insert into public.lesson_assets(lesson_id,asset_type,title,provider,external_url,sort_order,status)
select
  fl.id,
  'pdf',
  'Getting a Grip on the Basics - Full Workbook',
  'champion-life',
  'https://championlifefwb.com/assets/downloads/grip/getting-a-grip-on-the-basics-full-workbook.pdf',
  30,
  'active'
from first_lesson fl
where not exists(
  select 1 from public.lesson_assets la
  where la.lesson_id=fl.id and la.title='Getting a Grip on the Basics - Full Workbook'
);
