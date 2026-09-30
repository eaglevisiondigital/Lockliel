// Temporary course-only gate. No environment override permits an unknown state.
import {SUPABASE_URL,dbHeaders,json} from './lockliel-core.mjs';
export const COURSE_PROTOCOL='278-v1';
export const courseMaintenanceMessage='Getting a Grip is being updated. Your saved progress is safe. Please check back in a few minutes. Keep this tab open if you have unsaved changes.';
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
