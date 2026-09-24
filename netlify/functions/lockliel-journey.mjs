import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
function inFilter(ids){return "in.("+ids.join(",")+")";}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=s.user.id;
 if(request.method==="POST"){
   const b=await request.json().catch(()=>({}));
   if(b.assetId){
     const assetId=String(b.assetId||"");
     const payload={profile_id:uid,asset_id:assetId,last_position_seconds:Math.max(0,Number(b.lastPositionSeconds)||0),played_seconds:Math.max(0,Number(b.playedSeconds)||0),percent_watched:Math.min(100,Math.max(0,Number(b.percentWatched)||0)),covered_intervals:Array.isArray(b.coveredIntervals)?b.coveredIntervals.slice(0,250):[],first_started_at:b.firstStartedAt||new Date().toISOString(),last_activity_at:new Date().toISOString(),completed_at:Number(b.percentWatched)>=95?new Date().toISOString():null};
     const r=await fetch(SUPABASE_URL+"/rest/v1/media_progress?on_conflict=profile_id,asset_id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
     if(!r.ok)return json({error:"We couldn't save media progress."},r.status);
     return json({ok:true,mediaProgress:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   const lessonId=String(b.lessonId||"");
   if(!lessonId)return json({error:"Lesson required"},400);
   const payload={profile_id:uid,lesson_id:lessonId,status:String(b.status||"in_progress"),last_position_seconds:Math.max(0,Number(b.lastPositionSeconds)||0),watched_seconds:Math.max(0,Number(b.watchedSeconds)||0),worksheet_status:String(b.worksheetStatus||"not_started"),worksheet_answers:b.worksheetAnswers&&typeof b.worksheetAnswers==="object"?b.worksheetAnswers:{},started_at:b.status==="in_progress"?new Date().toISOString():undefined,last_activity_at:new Date().toISOString(),completed_at:b.status==="completed"?new Date().toISOString():null};
   Object.keys(payload).forEach(k=>payload[k]===undefined&&delete payload[k]);
   const r=await fetch(SUPABASE_URL+"/rest/v1/lesson_progress?on_conflict=profile_id,lesson_id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
   if(!r.ok)return json({error:"We couldn't save lesson progress."},r.status);
   return json({ok:true,progress:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const er=await fetch(SUPABASE_URL+"/rest/v1/course_enrollments?profile_id=eq."+encodeURIComponent(uid)+"&status=in.(active,completed)&select=course_id,status,enrolled_at,completed_at&order=enrolled_at.asc&limit=1",{headers:h});
 const enrollments=er.ok?await er.json():[],enrollment=enrollments?.[0];
 if(!enrollment)return json({course:null,lessons:[],progress:[],assets:[],mediaProgress:[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
 const cid=encodeURIComponent(enrollment.course_id);
 const [cr,lr,pr]=await Promise.all([
  fetch(SUPABASE_URL+"/rest/v1/courses?id=eq."+cid+"&select=id,slug,title,description,status&limit=1",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lessons?course_id=eq."+cid+"&select=id,position,slug,title,video_provider,video_ref,worksheet_schema&order=position.asc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lesson_progress?profile_id=eq."+encodeURIComponent(uid)+"&select=lesson_id,status,last_position_seconds,watched_seconds,worksheet_status,started_at,last_activity_at,completed_at",{headers:h})
 ]);
 const courses=cr.ok?await cr.json():[],lessons=lr.ok?await lr.json():[],progress=pr.ok?await pr.json():[],lessonIds=lessons.map(x=>x.id);
 let assets=[],mediaProgress=[];
 if(lessonIds.length){
   const ar=await fetch(SUPABASE_URL+"/rest/v1/lesson_assets?lesson_id="+encodeURIComponent(inFilter(lessonIds))+"&status=eq.active&select=id,lesson_id,asset_type,title,provider,provider_ref,storage_path,external_url,duration_seconds,sort_order&order=sort_order.asc",{headers:h});
   assets=ar.ok?await ar.json():[];
   const assetIds=assets.map(x=>x.id);
   if(assetIds.length){
     const mr=await fetch(SUPABASE_URL+"/rest/v1/media_progress?profile_id=eq."+encodeURIComponent(uid)+"&asset_id="+encodeURIComponent(inFilter(assetIds))+"&select=asset_id,last_position_seconds,played_seconds,percent_watched,covered_intervals,first_started_at,last_activity_at,completed_at",{headers:h});
     mediaProgress=mr.ok?await mr.json():[];
   }
 }
 return json({course:courses?.[0]||null,enrollment,lessons,progress,assets,mediaProgress},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/journey"};