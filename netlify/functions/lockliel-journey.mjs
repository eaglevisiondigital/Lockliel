import { withProductionBackend } from "../lib/deployment-safety.mjs";
import {loadCourseJourney} from "../lib/course-journey.mjs";
import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default withProductionBackend(async(request)=>{
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

 try {
   const data=await loadCourseJourney(s.access,uid);
   return json(data,200,s.refreshed?sessionCookies(s.refreshed):[]);
 } catch {
   return json({error:"We couldn't load your journey. Please try again."},503);
 }

});

export const config={path:"/api/lockliel/journey"};
