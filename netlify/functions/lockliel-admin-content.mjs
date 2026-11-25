import {backendConfig} from '../lib/backend-config.mjs';
import {courseReadState,courseMaintenanceMessage,courseHeaders} from '../lib/course-cutover.mjs';
import {courseReadiness} from "../lib/course-engine.mjs";
import { withProductionBackend } from "../lib/deployment-safety.mjs";
import {
  SUPABASE_URL,
  json,
  requireSession,
  sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

function safeHttpsUrl(value){
  if(!value)return null;
  try{
    const url=new URL(String(value));
    if(url.protocol!=="https:"||url.username||url.password)return null;
    return url.toString();
  }catch{
    return null;
  }
}

export function createContentHandler({sessionFor=requireSession,fetcher=(...args)=>globalThis.fetch(...args),binding=backendConfig,readStateFor=courseReadState}={}) {
 const fetch=fetcher;
 return async(request)=>{
  const s=await sessionFor(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=courseHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","discipleship_admin","content_admin"].includes(r))){
    return json({error:"Content administration access required"},403);
  }

  const maintenance=binding.mode==='isolated-course-rehearsal'?await readStateFor(s.access,{fetcher,binding}):null;
  if(maintenance?.response)return maintenance.response;
  if(maintenance?.paused&&request.method!=='GET')return json({error:courseMaintenanceMessage,code:'course_maintenance'},503);

  if(request.method==="POST"){
    const origin=request.headers.get('origin');
    if(origin&&origin!==new URL(request.url).origin)return json({error:'Request origin rejected.'},403);
    const raw=await request.text();if(new TextEncoder().encode(raw).length>12000)return json({error:'Request too large.'},413);
    let b;try{b=JSON.parse(raw);}catch{return json({error:'Invalid request.'},400);}
    if(!b||typeof b!=='object')return json({error:'Invalid request.'},400);

    if(b.action==="createAsset"){
      const lessonId=String(b.lessonId||"");
      const assetType=String(b.assetType||"");
      const title=String(b.title||"").trim();
      const provider=String(b.provider||"").trim()||null;
      const providerRef=String(b.providerRef||"").trim()||null;
      const rawExternalUrl=String(b.externalUrl||"").trim()||null;
      const externalUrl=rawExternalUrl?safeHttpsUrl(rawExternalUrl):null;
      const storagePath=String(b.storagePath||"").trim()||null;
      const rawDuration=String(b.durationSeconds??"").trim();
      const duration=rawDuration===""?null:Number(rawDuration);
      const verificationSource=String(b.verificationSource||"").trim();
      if(duration!==null&&(verificationSource.length<10||verificationSource.length>500))return json({error:"Describe the authoritative duration source (10–500 characters)."},400);

      if(!lessonId||!["video","audio","pdf","worksheet","external_link"].includes(assetType)){
        return json({error:"Lesson and asset type are required."},400);
      }
      if(rawExternalUrl&&!externalUrl){
        return json({error:"External lesson URLs must use HTTPS without embedded credentials."},400);
      }
      if(duration!==null&&(!Number.isFinite(duration)||duration<=0||duration>86400)){
        return json({error:"Media duration must be between 1 and 86,400 seconds."},400);
      }
      if(!providerRef&&!externalUrl&&!storagePath){
        return json({error:"Add a provider reference, external URL, or storage path."},400);
      }

      const r=await fetch(SUPABASE_URL+"/rest/v1/lesson_assets",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          lesson_id:lessonId,
          asset_type:assetType,
          title:title||null,
          provider,
          provider_ref:providerRef,
          external_url:externalUrl,
          storage_path:storagePath,
          duration_seconds:duration,
          duration_verification_source:duration===null?null:verificationSource,
          status:"active"
        })
      });
      if(!r.ok)return json({error:"Unable to add lesson asset."},r.status);
      return json({ok:true,asset:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="updateAssetDuration"){
      const assetId=String(b.assetId||"");
      const duration=Number(b.durationSeconds);
      const verificationSource=String(b.verificationSource||"").trim();
      if(verificationSource.length<10||verificationSource.length>500)return json({error:"Describe the authoritative duration source (10–500 characters)."},400);
      if(!assetId||!Number.isFinite(duration)||duration<=0||duration>86400){
        return json({error:"Choose a video and enter a duration between 1 and 86,400 seconds."},400);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/lesson_assets?id=eq."+encodeURIComponent(assetId)+"&asset_type=eq.video",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({duration_seconds:duration,duration_verification_source:verificationSource})
        }
      );
      if(!r.ok)return json({error:"Unable to verify video duration."},r.status);
      const asset=(await r.json())?.[0]||null;
      if(!asset)return json({error:"Video asset not found."},404);
      if(asset.id!==assetId||Number(asset.duration_seconds)!==duration||!asset.duration_verified_at||asset.duration_verification_source!==verificationSource)return json({error:"Duration verification could not be confirmed."},502);
      return json({ok:true,asset},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="setCourseStatus"){
      const courseId=String(b.courseId||"");
      const status=String(b.status||"");
      if(!courseId||!["draft","published","archived"].includes(status)){
        return json({error:"Invalid course status."},400);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/courses?id=eq."+encodeURIComponent(courseId),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status})
        }
      );
      if(!r.ok)return json({error:"Unable to update course."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="importGripPdfs")return json({error:"PDF import remains disabled."},403);

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [cr,lr,ar]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/courses?select=id,slug,title,description,status,learning_rules,translation_key,created_at&order=created_at.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lessons?select=id,course_id,position,slug,title,video_provider,video_ref,worksheet_schema&order=course_id.asc,position.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lesson_assets?select=id,lesson_id,asset_type,title,provider,provider_ref,storage_path,external_url,duration_seconds,duration_verified_at,duration_verification_source,sort_order,status,created_at&order=lesson_id.asc,sort_order.asc",
      {headers:h}
    )
  ]);

  if(!cr.ok||!lr.ok||!ar.ok)return json({error:"Course configuration is temporarily unavailable."},503);
  const courses=await cr.json(),lessons=await lr.json();
  const assets=(await ar.json()).map(asset=>maintenance?.paused?{...Object.fromEntries(Object.entries(asset).filter(([key])=>!['storage_path','external_url'].includes(key))),resource_mapped:Boolean(asset.storage_path)}:asset);
  return json({roles,courses,lessons,assets,maintenance,readiness:courses.map(course=>({course_id:course.id,...courseReadiness(course,lessons.filter(l=>l.course_id===course.id),assets)}))},200,s.refreshed?sessionCookies(s.refreshed):[]);
 };
}
export default withProductionBackend(createContentHandler());
export const config={path:"/api/lockliel/admin/content"};
