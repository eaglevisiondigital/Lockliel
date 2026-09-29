
update public.lessons l
set worksheet_schema = jsonb_build_object(
  'version',1,
  'questions',jsonb_build_array(
    jsonb_build_object(
      'number',1,
      'text','After working through this lesson, write your notes and key takeaways.',
      'type','text',
      'required',true
    )
  )
)
from public.courses c
where l.course_id=c.id
  and c.slug='getting-a-grip-on-the-basics'
  and l.position between 5 and 13
  and jsonb_array_length(coalesce(l.worksheet_schema->'questions','[]'::jsonb))=0;
