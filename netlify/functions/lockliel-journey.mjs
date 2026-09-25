import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

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

export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=s.user.id;

 if(request.method==="POST"){
   const b=await request.json().catch(()=>({}));
   if(b.assetId){
     const assetId=String(b.assetId||"");
     const payload={profile_id:uid,asset_id:assetId,last_position_seconds:Math.max(0,Number(b.lastPositionSeconds)||0),played_seconds:Math.max(0,Number(b.playedSeconds)||0),percent_watched:Math.min(100,Math.max(0,Number(b.percentWatched)||0)),covered_intervals:Array.isArray(b.coveredIntervals)?b.coveredIntervals.slice(0,250):[]};
     const r=await fetch(SUPABASE_URL+"/rest/v1/media_progress?on_conflict=profile_id,asset_id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
     if(!r.ok)return json({error:"We couldn't save media progress."},r.status);
     return json({ok:true,mediaProgress:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }

   const lessonId=String(b.lessonId||"");
   if(!lessonId)return json({error:"Lesson required"},400);

   const rawWorksheetAnswers=b.worksheetAnswers;
   if(rawWorksheetAnswers!==undefined&&(
     rawWorksheetAnswers===null||
     typeof rawWorksheetAnswers!=="object"||
     Array.isArray(rawWorksheetAnswers)
   )){
     return json({error:"Worksheet answers must be an object."},400);
   }

   const worksheetAnswers=rawWorksheetAnswers||{};
   const worksheetBytes=new TextEncoder().encode(JSON.stringify(worksheetAnswers)).length;
   if(worksheetBytes>60000){
     return json({error:"Worksheet answers are too large. Keep responses concise and try again."},400);
   }

   const payload={profile_id:uid,lesson_id:lessonId,status:String(b.status||"in_progress"),last_position_seconds:Math.max(0,Number(b.lastPositionSeconds)||0),watched_seconds:Math.max(0,Number(b.watchedSeconds)||0),worksheet_status:String(b.worksheetStatus||"not_started"),worksheet_answers:worksheetAnswers};

   const r=await fetch(SUPABASE_URL+"/rest/v1/lesson_progress?on_conflict=profile_id,lesson_id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
   if(!r.ok)return json({error:"We couldn't save lesson progress."},r.status);
   return json({ok:true,progress:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
 }

 if(request.method!=="GET")return json({error:"Method not allowed"},405);

 const [er,profileRes]=await Promise.all([
   fetch(SUPABASE_URL+"/rest/v1/course_enrollments?profile_id=eq."+encodeURIComponent(uid)+"&status=in.(active,completed)&select=course_id,status,enrolled_at,completed_at&order=enrolled_at.asc&limit=1",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/profiles?id=eq."+encodeURIComponent(uid)+"&select=locale&limit=1",{headers:h})
 ]);

 const enrollments=er.ok?await er.json():[],enrollment=enrollments?.[0];
 const profile=(profileRes.ok?await profileRes.json():[])?.[0]||null;
 const locale=normalizeLocale(profile?.locale||"en-US");

 if(!enrollment){
   return json({course:null,lessons:[],progress:[],assets:[],mediaProgress:[],preferredLocale:locale},200,s.refreshed?sessionCookies(s.refreshed):[]);
 }

 const sourceCourseRes=await fetch(
   SUPABASE_URL+"/rest/v1/courses?id=eq."+encodeURIComponent(enrollment.course_id)+"&select=id,slug,title,description,status,language_code,translation_key&limit=1",
   {headers:h}
 );
 const sourceCourse=(sourceCourseRes.ok?await sourceCourseRes.json():[])?.[0]||null;

 if(!sourceCourse){
   return json({course:null,lessons:[],progress:[],assets:[],mediaProgress:[],preferredLocale:locale},200,s.refreshed?sessionCookies(s.refreshed):[]);
 }

 let courseVariants=[];
 if(sourceCourse.translation_key){
   const variantsRes=await fetch(
     SUPABASE_URL+"/rest/v1/courses?translation_key=eq."+encodeURIComponent(sourceCourse.translation_key)+"&status=eq.published&select=id,slug,title,description,status,language_code,translation_key",
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
     SUPABASE_URL+"/rest/v1/lessons?course_id=eq."+encodeURIComponent(sourceCourse.id)+"&select=id,position,slug,title,video_provider,video_ref,worksheet_schema,translation_key&order=position.asc",
     {headers:h}
   ),
   displayCourse.id===sourceCourse.id
     ? Promise.resolve(null)
     : fetch(
         SUPABASE_URL+"/rest/v1/lessons?course_id=eq."+encodeURIComponent(displayCourse.id)+"&select=id,position,slug,title,video_provider,video_ref,worksheet_schema,translation_key&order=position.asc",
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
     SUPABASE_URL+"/rest/v1/lesson_progress?profile_id=eq."+encodeURIComponent(uid)+"&lesson_id="+encodeURIComponent(inFilter(sourceLessonIds))+"&select=lesson_id,status,last_position_seconds,watched_seconds,worksheet_status,worksheet_answers,started_at,last_activity_at,completed_at",
     {headers:h}
   );
   progress=pr.ok?await pr.json():[];
 }

 const contentLessonIds=[...new Set(lessons.map(lesson=>lesson.content_lesson_id))];
 let assets=[],mediaProgress=[];

 if(contentLessonIds.length){
   const ar=await fetch(
     SUPABASE_URL+"/rest/v1/lesson_assets?lesson_id="+encodeURIComponent(inFilter(contentLessonIds))+"&status=eq.active&select=id,lesson_id,asset_type,title,provider,provider_ref,storage_path,external_url,duration_seconds,sort_order&order=sort_order.asc",
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
       SUPABASE_URL+"/rest/v1/media_progress?profile_id=eq."+encodeURIComponent(uid)+"&asset_id="+encodeURIComponent(inFilter(assetIds))+"&select=asset_id,last_position_seconds,played_seconds,percent_watched,covered_intervals,first_started_at,last_activity_at,completed_at",
       {headers:h}
     );
     mediaProgress=mr.ok?await mr.json():[];
   }
 }

 return json({
   course:{
     ...displayCourse,
     id:sourceCourse.id,
     canonical_course_id:sourceCourse.id,
     content_course_id:displayCourse.id
   },
   enrollment,
   lessons,
   progress,
   assets,
   mediaProgress,
   preferredLocale:locale,
   contentLanguage:displayCourse.language_code||"en"
 },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/journey"};
