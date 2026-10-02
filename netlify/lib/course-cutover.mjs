// Temporary course-only gate. No environment override permits an unknown state.
import {backendConfig} from './backend-config.mjs';
import {SUPABASE_URL,dbHeaders,json} from './lockliel-core.mjs';
export const COURSE_PROTOCOL='278-v1';
export const courseMaintenanceMessage='Getting a Grip is being updated. Your progress is safe. Please check back in a few minutes.';
export async function courseCutover(access,{fetcher=globalThis.fetch}={}){
 try{const r=await fetcher(SUPABASE_URL+'/rest/v1/rpc/lockliel_course_cutover_status',{method:'POST',headers:dbHeaders(access),body:'{}'});const s=await r.json();
 if(!r.ok||s?.paused!==false||s?.protocol!==COURSE_PROTOCOL)return json({error:courseMaintenanceMessage,code:'course_maintenance'},503);
 return null;
 }catch{return json({error:courseMaintenanceMessage,code:'course_maintenance'},503);}
}
export function staleCourseClient(request){
 return request.method==='POST'&&request.headers.get('x-lockliel-course-protocol')!==COURSE_PROTOCOL
 ?json({error:'Getting a Grip has been updated. Keep a copy of unsaved answers, then reload to continue.',code:'course_reload_required'},426):null;
}
export function courseHeaders(access){return {...dbHeaders(access),'x-lockliel-course-protocol':COURSE_PROTOCOL};}

// Paused reads are enabled only in the pinned isolated rehearsal binding.
// This is not an environment/header override and never opens the write gate.
export async function courseReadState(access,{fetcher=globalThis.fetch,binding=backendConfig}={}){
 try {
  const r=await fetcher(SUPABASE_URL+'/rest/v1/rpc/lockliel_course_cutover_status',{method:'POST',headers:dbHeaders(access),body:'{}'});
  const state=await r.json();
  const isolated=binding.mode==='isolated-course-rehearsal'&&binding.url==='https://qjksggxorghaxvpyslip.supabase.co'&&binding.site==='70b03a42-6329-476e-bf4b-2b1ce30e9567';
  if(!r.ok||state?.protocol!==COURSE_PROTOCOL||state.schemaReady!==true||typeof state.paused!=='boolean'||(state.paused&&!isolated))throw Error('Unavailable');
  return {paused:state.paused,schemaReady:true,protocol:COURSE_PROTOCOL};
 }catch{return {response:json({error:courseMaintenanceMessage,code:'course_maintenance'},503)};}
}
