import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonReadiness,courseReadiness,learningState} from '../netlify/lib/course-engine.mjs';
import {createContentHandler} from '../netlify/functions/lockliel-admin-content.mjs';
import {createLessonSaver} from '../lib/course/autosave.mjs';
const course={translation_key:'getting-a-grip-on-the-basics',status:'published',learning_rules:{model:'watch_answer',watch_threshold:95,minimum_score:0}};
const lesson={id:'lesson',worksheet_schema:{questions:[{number:1,text:'Reflection'}]}};
const video={id:'video',lesson_id:'lesson',asset_type:'video',provider:'youtube',provider_ref:'approved-id',duration_seconds:100,duration_verified_at:'2026-09-30T00:00:00Z',duration_verification_source:'Manual provider verification'};
const resource={lesson_id:'lesson',asset_type:'pdf',resource_mapped:true};
test('trusted video and worksheet/resource mapping are all independently ready',()=>{assert.equal(lessonReadiness(course,lesson,[video,resource]).ready,true);});
for(const key of ['duration_seconds','duration_verified_at','duration_verification_source'])test('missing '+key+' blocks readiness without member technical jargon',()=>{const r=lessonReadiness(course,lesson,[{...video,[key]:null},resource]);assert.equal(r.state,'duration_pending');assert.equal(r.publishedBlocked,true);assert.doesNotMatch(r.label+' '+r.message,/duration|configuration|schema/i);});
for(const position of [11,12,13])test('lesson '+position+' stays media-required without fake Model C completion',()=>{const r=lessonReadiness(course,{...lesson,position},[resource]);assert.equal(r.label,'Media Coming Soon');assert.equal(r.requiredMedia,true);assert.equal(r.ready,false);assert.equal(course.learning_rules.model,'watch_answer');});
test('readiness does not grant unlock to a locked media-pending lesson',()=>{const r=learningState({course,lessons:[lesson],assets:[resource],gates:[{lesson_id:lesson.id,unlocked:false}]});assert.equal(r.lessons[0].unlocked,false);assert.equal(r.lessons[0].readiness.state,'media_pending');});
test('duration pending retains historical completion without inventing fresh server watch permission',()=>{
 const progress={lesson_id:lesson.id,status:'completed',completed_at:'2026-09-30T00:00:00Z',watch_requirement_met_at:'2026-09-29T00:00:00Z'};
 const r=learningState({course,lessons:[lesson],assets:[{...video,duration_seconds:null,duration_verified_at:null,duration_verification_source:null},resource],progress:[progress],gates:[{lesson_id:lesson.id,unlocked:true,watch_met:false}]});
 assert.equal(r.lessons[0].state,'completed');assert.equal(r.lessons[0].watchMet,false);
 assert.equal(r.lessons[0].readiness.label,'Lesson Being Prepared');assert.equal(r.lessons[0].readiness.ready,false);
 assert.deepEqual(r.lessons[0].progress,progress);
});
test('historical timestamps do not override denied server progression in the presentation model',()=>{
 const next={...lesson,id:'next',position:2};
 const r=learningState({course,lessons:[{...lesson,position:1},next],assets:[{...video,duration_seconds:null},resource],
  progress:[{lesson_id:lesson.id,status:'in_progress',watch_requirement_met_at:'2026-09-29T00:00:00Z'}],
  gates:[{lesson_id:lesson.id,unlocked:true,watch_met:false},{lesson_id:'next',unlocked:false,watch_met:false}]});
 assert.equal(r.lessons[0].state,'in_progress');assert.equal(r.lessons[0].readiness.label,'Lesson Being Prepared');
 assert.equal(r.lessons[1].unlocked,false);assert.equal(r.lessons[1].state,'locked');
});
test('missing worksheet and protected resource remain independently visible to managers',()=>{const r=lessonReadiness(course,{...lesson,worksheet_schema:{}},[video]);assert.equal(r.state,'content_pending');assert.equal(r.worksheetReady,false);assert.equal(r.resourceReady,false);});
test('unsupported/draft media never establishes readiness',()=>{for(const replacement of [{provider:'vimeo'},{status:'draft'},{provider_ref:''}])assert.equal(lessonReadiness(course,lesson,[{...video,...replacement},resource]).mediaReady,false);});
test('13 lesson readiness reports ten unverified and three media pending',()=>{const lessons=Array.from({length:13},(_,i)=>({...lesson,id:String(i),position:i+1}));const assets=lessons.flatMap((l,i)=>[{...resource,lesson_id:l.id},...(i<10?[{...video,lesson_id:l.id,duration_seconds:null}]:[])]);const r=courseReadiness(course,lessons,assets);assert.equal(r.ready,false);assert.equal(r.lessons.filter(x=>x.state==='duration_pending').length,10);assert.equal(r.lessons.filter(x=>x.state==='media_pending').length,3);});
test('explicit optional worksheet and simple model do not invent requirements',()=>{assert.equal(lessonReadiness({learning_rules:{model:'simple'}},{id:'s'}).ready,true);assert.equal(lessonReadiness({learning_rules:{model:'watch_answer',worksheet_required:false}},{id:'lesson'},[video]).ready,true);});
const token=aal=>'e30.'+Buffer.from(JSON.stringify({aal})).toString('base64url')+'.synthetic';
const req=b=>new Request('https://lockliel.com/api/lockliel/admin/content',{method:'POST',body:JSON.stringify(b)});
const payload={action:'updateAssetDuration',assetId:'video',durationSeconds:100,verificationSource:'Checked against approved provider video'};
const handler=(fetcher,session={user:{id:'admin'},access:token('aal2')})=>createContentHandler({sessionFor:async()=>session,fetcher});
test('duration edit needs signed-in MFA content staff',async()=>{for(const s of [{},{user:{id:'admin'},access:token('aal1')}]){let calls=0;const r=await handler(async()=>{calls++;},s)(req(payload));assert.ok([401,403].includes(r.status));assert.equal(calls,0);}assert.equal((await handler(async()=>Response.json([{role:'mentor'}]))(req(payload))).status,403);});
test('manual duration verification persists provenance and requires database acknowledgement',async()=>{let body;const h=handler(async(url,o)=>{if(url.includes('staff_roles'))return Response.json([{role:'content_admin'}]);body=JSON.parse(o.body);return Response.json([{id:'video',duration_seconds:body.duration_seconds,duration_verification_source:body.duration_verification_source,duration_verified_at:'2026-09-30'}]);});assert.equal((await h(req(payload))).status,200);assert.deepEqual(body,{duration_seconds:100,duration_verification_source:payload.verificationSource});});
test('duration input rejects missing source, invalid range and cross-origin writes',async()=>{let calls=0;const h=handler(async()=>{calls++;return Response.json([{role:'admin'}]);});for(const b of [{...payload,verificationSource:''},{...payload,durationSeconds:0},{...payload,durationSeconds:86401}])assert.equal((await h(req(b))).status,400);assert.equal(calls,3);assert.equal((await h(new Request(req(payload),{headers:{origin:'https://example.invalid'}}))).status,403);});
test('missing verification acknowledgement is never reported as success',async()=>{const h=handler(async url=>Response.json(url.includes('staff_roles')?[{role:'admin'}]:[{id:'video',duration_seconds:100}]));assert.equal((await h(req(payload))).status,502);});
test('PDF importer stays disabled before any asset/storage request',async()=>{let calls=0;const h=handler(async()=>{calls++;return Response.json([{role:'admin'}]);});assert.equal((await h(req({action:'importGripPdfs'}))).status,403);assert.equal(calls,1);});
test('failed configuration read cannot become a false empty readiness success',async()=>{const h=handler(async url=>url.includes('staff_roles')?Response.json([{role:'admin'}]):new Response('',{status:500}));assert.equal((await h(new Request('https://lockliel.com/api/lockliel/admin/content'))).status,503);});
for(const revision of [undefined,0,1,3,'2'])test('autosave rejects malformed acknowledgement revision '+revision,async()=>{const s=createLessonSaver({user:'a',lesson:'l',cloud:{revision:1},storage:{getItem:()=>null,setItem:()=>{}},send:async()=>({revision}),delay:60000});s.update({answers:{1:'Keep'},notes:'Keep'});assert.equal(await s.flush(),false);assert.equal(s.snapshot().dirty,true);assert.notEqual(s.snapshot().state,'Saved');s.close();});
