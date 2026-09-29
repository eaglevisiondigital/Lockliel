import {withProductionBackend} from '../lib/deployment-safety.mjs';
import {loadCourseJourney} from '../lib/course-journey.mjs';
import {lessonExport} from '../lib/course-engine.mjs';
import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from '../lib/lockliel-core.mjs';

export function createJourneyHandler({sessionFor=requireSession,fetcher=globalThis.fetch,loader=loadCourseJourney}={}) {
 return async request=>{
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
  const s=await sessionFor(request);
  if(!s.user||!s.access)return json({error:'Unauthorized'},401);
  const cookies=s.refreshed?sessionCookies(s.refreshed):[];
  if(request.method==='GET'){
   try {
    const data=await loader(s.access,s.user.id,{fetcher});
    const url=new URL(request.url);
    if(url.searchParams.has('export'))return new Response(lessonExport(data,url.searchParams.get('export'),{includeNotes:url.searchParams.get('notes')==='1'}),{
     headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="my-lesson-answers.txt"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
    return json({...data,learnerId:s.user.id},200,cookies);
   }catch{return json({error:'We could not load your course. Please try again.'},503);}
  }
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return json({error:'Request origin rejected.'},403);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>80000)return json({error:'Lesson response is too large.'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid response.'},400);}
  if(!body||body.expectedUserId!==s.user.id)return json({error:'Your account changed. Reload to continue.',code:'account_changed'},409);
  const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  let rpc,payload;
  if(body.assetId){
   if(!uuid.test(body.assetId)||!Number.isFinite(body.positionSeconds)||typeof body.playing!=='boolean')return json({error:'Invalid media sample.'},400);
   rpc='lockliel_sample_media';payload={expected_user:s.user.id,target_asset:body.assetId,position_seconds:body.positionSeconds,playing:body.playing};
  }else{
   if(!uuid.test(body.lessonId)||!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<0||typeof body.notes!=='string'||body.notes.length>12000||!body.answers||Array.isArray(body.answers)||typeof body.answers!=='object'||Object.keys(body.answers).length>100||Object.values(body.answers).some(v=>typeof v!=='string'||v.length>4000))return json({error:'Invalid lesson response.'},400);
   rpc='lockliel_save_lesson';payload={expected_user:s.user.id,target_lesson:body.lessonId,expected_revision:body.expectedRevision,answers:body.answers,notes:body.notes,complete:body.complete===true};
  }
  try{
   const r=await fetcher(SUPABASE_URL+'/rest/v1/rpc/'+rpc,{method:'POST',headers:dbHeaders(s.access),body:JSON.stringify(payload)});
   const value=await r.json();
   if(!r.ok){
    const status=value.code==='40001'?409:value.code==='54000'?429:r.status;
    return json({error:status===409?'Newer cloud work exists. Reload before saving.':status===429?'Save paused briefly. Retrying.':'We could not save. Your draft is retained.',code:status===409?'revision_conflict':'save_failed'},status,cookies);
   }
   return json({ok:true,...(body.assetId?{mediaProgress:value}:{progress:value})},200,cookies);
  }catch{return json({error:'Cloud unavailable. Your draft is retained.',code:'save_failed'},503,cookies);}
 };
}
export default withProductionBackend(createJourneyHandler());
export const config={path:'/api/lockliel/journey'};
