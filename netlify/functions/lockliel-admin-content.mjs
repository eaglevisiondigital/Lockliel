import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.some(r=>["super_admin","admin","discipleship_admin","content_admin"].includes(r)))return json({error:"Content administration access required"},403);

 if(request.method==="POST"){
   const b=await request.json().catch(()=>({}));
   if(b.action==="createAsset"){
     const lessonId=String(b.lessonId||""),assetType=String(b.assetType||""),title=String(b.title||"").trim(),provider=String(b.provider||"").trim()||null,providerRef=String(b.providerRef||"").trim()||null,externalUrl=String(b.externalUrl||"").trim()||null,storagePath=String(b.storagePath||"").trim()||null,duration=Number(b.durationSeconds)||null;
     if(!lessonId||!["video","audio","pdf","worksheet","external_link"].includes(assetType))return json({error:"Lesson and asset type are required."},400);
     if(!providerRef&&!externalUrl&&!storagePath)return json({error:"Add a provider reference, external URL, or storage path."},400);
     const r=await fetch(SUPABASE_URL+"/rest/v1/lesson_assets",{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({lesson_id:lessonId,asset_type:assetType,title:title||null,provider,provider_ref:providerRef,external_url:externalUrl,storage_path:storagePath,duration_seconds:duration,status:"active"})});
     if(!r.ok)return json({error:"Unable to add lesson asset."},r.status);
     return json({ok:true,asset:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   if(b.action==="setCourseStatus"){
     const courseId=String(b.courseId||""),status=String(b.status||"");
     if(!courseId||!["draft","published","archived"].includes(status))return json({error:"Invalid course status."},400);
     const r=await fetch(SUPABASE_URL+"/rest/v1/courses?id=eq."+encodeURIComponent(courseId),{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({status})});
     if(!r.ok)return json({error:"Unable to update course."},r.status);
     return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   return json({error:"Unknown action"},400);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const [cr,lr,ar]=await Promise.all([
  fetch(SUPABASE_URL+"/rest/v1/courses?select=id,slug,title,description,status,created_at&order=created_at.asc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lessons?select=id,course_id,position,slug,title,video_provider,video_ref,worksheet_schema&order=course_id.asc,position.asc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lesson_assets?select=id,lesson_id,asset_type,title,provider,provider_ref,storage_path,external_url,duration_seconds,sort_order,status,created_at&order=lesson_id.asc,sort_order.asc",{headers:h})
 ]);
 return json({roles,courses:cr.ok?await cr.json():[],lessons:lr.ok?await lr.json():[],assets:ar.ok?await ar.json():[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/content"};