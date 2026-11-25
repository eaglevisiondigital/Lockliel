import test from 'node:test';
import assert from 'node:assert/strict';
import {courseReadState,courseCutover} from '../netlify/lib/course-cutover.mjs';
import {createJourneyHandler} from '../netlify/functions/lockliel-journey.mjs';
import {loadCourseJourney} from '../netlify/lib/course-journey.mjs';
import {createContentHandler} from '../netlify/functions/lockliel-admin-content.mjs';
const binding={mode:'isolated-course-rehearsal',site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',url:'https://qjksggxorghaxvpyslip.supabase.co'};
const state={paused:true,schemaReady:true,protocol:'278-v1'};
const session={user:{id:'synthetic-a'},access:'synthetic'};
const request=(method='GET',query='')=>new Request('https://synthetic.invalid/api/lockliel/journey'+query,{method,...(method==='POST'?{headers:{'x-lockliel-course-protocol':'278-v1'},body:'{}'}:{})});
test('only the pinned isolated binding admits a ready paused read; never a write',async()=>{
 const fetcher=async()=>Response.json(state);
 assert.deepEqual(await courseReadState('synthetic',{fetcher,binding}),state);
 for(const bad of [{mode:'production'},{site:'other'},{url:'https://other.invalid'}])assert.equal((await courseReadState('synthetic',{fetcher,binding:{...binding,...bad}})).response.status,503);
 assert.equal((await courseCutover('synthetic',{fetcher})).status,503);
});
for(const bad of [{schemaReady:false},{schemaReady:undefined},{protocol:'old'},{paused:undefined}])test('paused read fails closed for '+JSON.stringify(bad),async()=>{
 assert.equal((await courseReadState('synthetic',{binding,fetcher:async()=>Response.json({...state,...bad})})).response.status,503);
});
test('paused GET carries maintenance and excludes exports, POST never reaches loader',async()=>{
 let reads=0;const h=createJourneyHandler({sessionFor:async()=>session,readStateFor:async()=>state,cutoverFor:async()=>Response.json({code:'course_maintenance'},{status:503}),loader:async(_a,id,o)=>{reads++;assert.equal(id,'synthetic-a');assert.equal(o.paused,true);return {notes:[]};}});
 const data=await (await h(request())).json();assert.deepEqual(data.maintenance,state);assert.deepEqual(data.notes,[]);
 assert.equal((await h(request('POST'))).status,503);assert.equal(reads,1);
 assert.equal((await h(request('GET','?export=lesson&notes=1'))).status,503);
});
test('paused loader fetches only reads plus stable gates, never notes or saved answer content',async()=>{
 const calls=[];
 const fetcher=async(url,options={})=>{
  const u=new URL(url);calls.push({path:u.pathname,query:u.search,method:options.method||'GET'});
  if(u.pathname.endsWith('course_enrollments'))return Response.json([{course_id:'course',status:'active'}]);
  if(u.pathname.endsWith('profiles'))return Response.json([{locale:'en'}]);
  if(u.pathname.endsWith('courses'))return Response.json([{id:'course',status:'published',language_code:'en',learning_rules:{model:'watch_answer'}}]);
  if(u.pathname.endsWith('lessons'))return Response.json([{id:'lesson',position:1,worksheet_schema:{questions:[{number:1,text:'Synthetic'}]}}]);
  if(u.pathname.endsWith('lesson_assets'))return Response.json([{id:'asset',lesson_id:'lesson',asset_type:'pdf',storage_path:'hidden/file.pdf'}]);
  return Response.json([]);
 };
 const result=await loadCourseJourney('synthetic','synthetic-a',{fetcher,paused:true});
 assert.deepEqual(result.notes,[]);assert.equal(result.assets[0].storage_path,undefined);assert.equal(result.assets[0].resource_mapped,true);
 assert.ok(calls.every(c=>c.method==='GET'||c.path==='/rest/v1/rpc/lockliel_course_gates'));
 assert.ok(!calls.some(c=>/private_notes|worksheet_answers|content_snapshot/.test(c.path+c.query)));
 assert.ok(calls.filter(c=>c.path.endsWith('/courses')).every(c=>c.query.includes('status=eq.published')));
});
test('manager paused reads strip storage locations; all management mutations stop before transport',async()=>{
 let changes=0;
 const access='e30.'+Buffer.from(JSON.stringify({aal:'aal2'})).toString('base64url')+'.synthetic';
 const h=createContentHandler({binding,readStateFor:async()=>state,sessionFor:async()=>({user:{id:'manager'},access}),fetcher:async(url,options={})=>{
  if(options.method&&options.method!=='GET')changes++;
  return Response.json(url.includes('staff_roles')?[{role:'content_admin'}]:url.includes('lesson_assets')?[{id:'asset',storage_path:'secret/file.pdf',external_url:'https://hidden.invalid'}]:[]);
 }});
 const result=await (await h(new Request('https://synthetic.invalid/api/lockliel/admin/content'))).json();
 assert.deepEqual(result.maintenance,state);assert.equal(result.assets[0].storage_path,undefined);assert.equal(result.assets[0].external_url,undefined);
 for(const method of ['POST','PATCH','DELETE'])assert.equal((await h(new Request('https://synthetic.invalid/api/lockliel/admin/content',{method,body:'{}'}))).status,503);
 assert.equal(changes,0);
});
