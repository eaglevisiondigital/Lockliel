import {SUPABASE_URL,dbHeaders} from "./lockliel-core.mjs";

function inFilter(ids){return "in.("+ids.join(",")+")";}

function normalizeLocale(value){
  return String(value||"en-US").trim().toLowerCase().replaceAll("_","-")||"en-us";
}

function chooseTranslation(rows,locale,sourceId){
  const exact=normalizeLocale(locale);
  const base=exact.split("-")[0];
  return rows.find(row=>String(row.language_code||"").toLowerCase()===exact)
    ||rows.find(row=>String(row.language_code||"").toLowerCase()===base)
    ||rows.find(row=>String(row.language_code||"").toLowerCase()==="en")
    ||rows.find(row=>row.id===sourceId)
    ||rows[0]
    ||null;
}

// Shared canonical/translated course projection used by the player and dashboard.
// A failed upstream read is never evidence that a member has no progress.
export async function loadCourseJourney(access,uid,{fetcher=globalThis.fetch,summary=false}={}) {
 const h=dbHeaders(access);
 const fetch=async(url,options)=>{
   const response=await fetcher(url,options);
   if(!response.ok)throw new Error("Course data unavailable");
   return response;
 };
 const [er,profileRes]=await Promise.all([
   fetch(SUPABASE_URL+"/rest/v1/course_enrollments?profile_id=eq."+encodeURIComponent(uid)+"&status=in.(active,completed)&select=course_id,status,enrolled_at,completed_at"+(summary?",courses!inner(translation_key)&courses.translation_key=eq.getting-a-grip-on-the-basics":"")+"&order=enrolled_at.asc&limit=1",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/profiles?id=eq."+encodeURIComponent(uid)+"&select=locale&limit=1",{headers:h})
 ]);

 const enrollments=er.ok?await er.json():[],enrollment=enrollments?.[0];
 const profile=(profileRes.ok?await profileRes.json():[])?.[0]||null;
 const locale=normalizeLocale(profile?.locale||"en-US");

 if(!enrollment){
   return {course:null,lessons:[],progress:[],assets:[],mediaProgress:[],preferredLocale:locale};
 }

 const sourceCourseRes=await fetch(
   SUPABASE_URL+"/rest/v1/courses?id=eq."+encodeURIComponent(enrollment.course_id)+"&select=id,slug,title,description,status,language_code,translation_key,learning_rules&limit=1",
   {headers:h}
 );
 const sourceCourse=(sourceCourseRes.ok?await sourceCourseRes.json():[])?.[0]||null;

 if(!sourceCourse){
   return {course:null,lessons:[],progress:[],assets:[],mediaProgress:[],preferredLocale:locale};
 }

 let courseVariants=[];
 if(sourceCourse.translation_key){
   const variantsRes=await fetch(
     SUPABASE_URL+"/rest/v1/courses?translation_key=eq."+encodeURIComponent(sourceCourse.translation_key)+"&status=eq.published&select=id,slug,title,description,status,language_code,translation_key,learning_rules",
     {headers:h}
   );
   courseVariants=variantsRes.ok?await variantsRes.json():[];
 }

 const displayCourse=chooseTranslation(
   [...courseVariants,sourceCourse].filter((row,index,rows)=>rows.findIndex(other=>other.id===row.id)===index),
   locale,
   sourceCourse.id
 )||sourceCourse;

 const [sourceLessonsRes,displayLessonsRes]=await Promise.all([
   fetch(
     SUPABASE_URL+"/rest/v1/lessons?course_id=eq."+encodeURIComponent(sourceCourse.id)+"&select=id,position,slug,title,video_provider,video_ref,worksheet_schema,translation_key,configuration_version&order=position.asc",
     {headers:h}
   ),
   displayCourse.id===sourceCourse.id
     ? Promise.resolve(null)
     : fetch(
         SUPABASE_URL+"/rest/v1/lessons?course_id=eq."+encodeURIComponent(displayCourse.id)+"&select=id,position,slug,title,video_provider,video_ref,worksheet_schema,translation_key,configuration_version&order=position.asc",
         {headers:h}
       )
 ]);

 const sourceLessons=sourceLessonsRes.ok?await sourceLessonsRes.json():[];
 const translatedLessons=displayLessonsRes&&displayLessonsRes.ok?await displayLessonsRes.json():[];
 const translatedByKey=new Map(translatedLessons.map(lesson=>[lesson.translation_key,lesson]));

 const contentToCanonical=new Map();
 const lessons=sourceLessons.map(sourceLesson=>{
   const contentLesson=translatedByKey.get(sourceLesson.translation_key)||sourceLesson;
   contentToCanonical.set(contentLesson.id,sourceLesson.id);
   return {
     ...contentLesson,
     id:sourceLesson.id,
     position:sourceLesson.position,
     canonical_lesson_id:sourceLesson.id,
     content_lesson_id:contentLesson.id,
     translation_key:sourceLesson.translation_key
   };
 });

 const sourceLessonIds=sourceLessons.map(lesson=>lesson.id);
 let progress=[];
 if(sourceLessonIds.length){
   const pr=await fetch(
     SUPABASE_URL+"/rest/v1/lesson_progress?profile_id=eq."+encodeURIComponent(uid)+"&lesson_id="+encodeURIComponent(inFilter(sourceLessonIds))+"&select=lesson_id,status,last_position_seconds,watched_seconds,worksheet_status,started_at,last_activity_at,completed_at,revision,watch_requirement_met_at"+(summary?"":",worksheet_answers,content_snapshot"),
     {headers:h}
   );
   progress=pr.ok?await pr.json():[];
 }

 const contentLessonIds=[...new Set(lessons.map(lesson=>lesson.content_lesson_id))];
 let assets=[],mediaProgress=[];

 if(contentLessonIds.length){
   const ar=await fetch(
     SUPABASE_URL+"/rest/v1/lesson_assets?lesson_id="+encodeURIComponent(inFilter(contentLessonIds))+"&status=eq.active&select=id,lesson_id,asset_type,title,provider,provider_ref,duration_seconds,sort_order"+"&order=sort_order.asc",
     {headers:h}
   );
   const rawAssets=ar.ok?await ar.json():[];
   assets=rawAssets.map(asset=>({
     ...asset,
     content_lesson_id:asset.lesson_id,
     lesson_id:contentToCanonical.get(asset.lesson_id)||asset.lesson_id
   }));

   const assetIds=assets.map(asset=>asset.id);
   if(assetIds.length){
     const mr=await fetch(
       SUPABASE_URL+"/rest/v1/media_progress?profile_id=eq."+encodeURIComponent(uid)+"&asset_id="+encodeURIComponent(inFilter(assetIds))+"&select=asset_id,last_position_seconds,played_seconds,percent_watched,first_started_at,last_activity_at,completed_at"+(summary?"":",covered_intervals"),
       {headers:h}
     );
     mediaProgress=mr.ok?await mr.json():[];
   }
 }

 let gates=[],notes=[];
 if(sourceCourse.learning_rules?.model){
  const gr=await fetch(SUPABASE_URL+"/rest/v1/rpc/lockliel_course_gates",{method:"POST",headers:h,body:"{}"});
  gates=await gr.json();
  if(!summary){const nr=await fetch(SUPABASE_URL+"/rest/v1/lesson_private_notes?profile_id=eq."+encodeURIComponent(uid)+"&select=lesson_id,body,updated_at",{headers:h});notes=await nr.json();}
 }

 return {
   course:{
     ...displayCourse,
     learning_rules:sourceCourse.learning_rules,
     id:sourceCourse.id,
     canonical_course_id:sourceCourse.id,
     content_course_id:displayCourse.id
   },
   enrollment,
   gates,
   notes,
   lessons,
   progress,
   assets,
   mediaProgress,
   preferredLocale:locale,
   contentLanguage:displayCourse.language_code||"en"
 };
}
