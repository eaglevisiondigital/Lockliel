import assert from 'node:assert/strict';
import test from 'node:test';
import {buildMemberJourney,courseState,safeResourcePath} from '../netlify/lib/member-journey.mjs';
import {loadCourseJourney} from '../netlify/lib/course-journey.mjs';
import {createNextStepHandler} from '../netlify/functions/lockliel-next-step.mjs';
import {createOnboardingHandler} from '../netlify/functions/lockliel-onboarding.mjs';
import {journeyEvent} from '../lib/member-journey-events.mjs';
const now=new Date('2026-09-27T12:00:00Z');
const uid='10000000-0000-4000-8000-000000000001';
const session={user:{id:uid},access:'synthetic-member-token'};
const resource={id:'resource-1',slug:'faith-boost',title:'Faith Boost',description:'Encouragement',destination_path:'/faith-boost',status:'active',language_code:'en',category:'faith-development'};
function base(){
  const lessons=Array.from({length:13},(_,i)=>({id:'lesson-'+i,slug:'lesson-'+i,title:'Lesson '+(i+1),position:i+1,worksheet_schema:{questions:[{number:1,text:'Reflect'}]}}));
  return {profile:{onboarding_status:'active',locale:'en-US'},faith:{growth_interests:[]},course:{course:{id:'course',title:'Getting a Grip',status:'published'},lessons,progress:lessons.map(lesson=>({lesson_id:lesson.id,status:'completed',worksheet_status:'completed'})),assets:[],mediaProgress:[]},reach:[{status:'praying',next_follow_up_at:'2026-10-01T00:00:00Z'}],groups:[],requests:[],resources:[resource]};
}
function active(){const state=base();state.course.progress[0]={lesson_id:'lesson-0',status:'in_progress',worksheet_status:'completed'};return state;}
const next=state=>buildMemberJourney(state,now).nextStep;

test('onboarding wins when profile is incomplete or faith choices have not been confirmed',()=>{
  for(const field of ['profile','faith']){const state=active();state[field]=null;state.reach=[];assert.equal(next(state).type,'onboarding');}
});
test('empty optional faith choices complete onboarding once the existing profile is active',()=>{
  const state=base();state.faith=null;assert.equal(next(state).type,'onboarding');state.faith={growth_interests:[]};assert.notEqual(next(state).type,'onboarding');
});
test('active course continues the last active unfinished lesson before lower-priority actions',()=>{
  const state=active();state.reach=[];state.faith.wants_group=true;
  state.course.progress[1]={lesson_id:'lesson-1',status:'in_progress',worksheet_status:'completed',last_activity_at:now.toISOString()};
  assert.equal(next(state).type,'course_continue');assert.equal(next(state).cta.href,'/my-lockliel/journey/lesson?lesson=lesson-1');assert.equal(next(state).priority,2);
});
test('video under 95 percent takes precedence over unfinished worksheet within active lesson',()=>{
  const state=active();state.course.assets=[{id:'video',lesson_id:'lesson-0',asset_type:'video'}];state.course.mediaProgress=[{asset_id:'video',percent_watched:94.99}];state.course.progress[0].worksheet_status='in_progress';
  assert.equal(next(state).type,'lesson_video');state.course.mediaProgress[0].percent_watched=95;assert.equal(next(state).type,'lesson_worksheet');
});
test('every required video must be complete and no-video lessons still require their worksheet',()=>{
  const state=active();state.course.progress[0].worksheet_status='not_started';assert.equal(next(state).type,'lesson_worksheet');
  state.course.assets=[{id:'a',lesson_id:'lesson-0',asset_type:'video'},{id:'b',lesson_id:'lesson-0',asset_type:'video'}];state.course.mediaProgress=[{asset_id:'a',percent_watched:100}];assert.equal(next(state).type,'lesson_video');
});
test('unfinished requirement and unstarted enrollment are distinguished',()=>{
  const state=base();state.course.progress=[];assert.equal(next(state).type,'grip_start');assert.equal(next(state).priority,4);
  state.course.progress=[{lesson_id:'lesson-0',status:'not_started',worksheet_status:'in_progress'}];assert.equal(next(state).type,'lesson_requirement');assert.equal(next(state).priority,3);
});
test('completed Grip advances to My Five and never marks lessons complete from enrollment alone',()=>{
  const state=base();state.reach=[];assert.equal(next(state).type,'my_five_empty');
  state.course.progress=[];state.course.enrollment={status:'completed'};assert.equal(courseState(state.course).complete,false);assert.equal(next(state).type,'grip_start');
});
test('unpublished or unavailable course does not fabricate a lesson recommendation',()=>{
  const state=active();state.course.course.status='draft';assert.equal(next(state).type,'resource');state.course={};assert.equal(next(state).type,'resource');
});
test('My Five counts only active people and preserves the maximum of five',()=>{
  const state=base();state.reach=[{status:'paused'},{status:'completed'}];const view=buildMemberJourney(state,now);assert.equal(view.nextStep.type,'my_five_empty');assert.equal(view.myFive.maximum,5);assert.equal(view.myFive.activeCount,0);
});
test('meaningful My Five follow-up requires a due date, without exposing names or notes',()=>{
  const state=base();state.reach[0]={status:'growing',next_follow_up_at:now.toISOString(),display_name:'Private person',private_notes:'Sensitive note'};const view=buildMemberJourney(state,now);assert.equal(view.nextStep.type,'my_five_followup');assert.equal(view.myFive.dueCount,1);assert.doesNotMatch(JSON.stringify(view),/Private person|Sensitive note/);
});
test('community request is offered only when wanted and no pending or active connection exists',()=>{
  const state=base();state.faith.wants_group=true;assert.equal(next(state).type,'community');
  state.faith.preferred_connection='not-now';assert.equal(next(state).type,'resource');
  state.faith.preferred_connection='local';state.requests=[{request_type:'find_local_group',status:'open'}];assert.equal(buildMemberJourney(state,now).community.state,'forming');assert.equal(next(state).type,'resource');
  state.groups=[{status:'active',myRole:'participant'}];assert.equal(buildMemberJourney(state,now).community.state,'active');
});
test('host check-in precedes orientation, and orientation requires reviewed eligibility',()=>{
  const state=base();state.orientationPending=true;state.founderStatus='applied';assert.equal(next(state).type,'resource');
  state.founderStatus='accepted';assert.equal(next(state).type,'founder_orientation');state.groupCheckinDue=true;assert.equal(next(state).type,'group_checkin');
});
test('personalization ranks active matching categories and locale without returning a reason trace',()=>{
  const state=base();state.faith.growth_interests=['family-relationships'];state.profile.locale='es-MX';state.resources=[resource,{...resource,id:'family-en',slug:'family',translation_key:'family',category:'family-relationships'},{...resource,id:'family-es',slug:'familia',translation_key:'family',category:'family-relationships',language_code:'es',title:'Familia'},{...resource,id:'draft',status:'draft'}];
  const view=buildMemberJourney(state,now);assert.equal(view.resources[0].id,'family-es');assert.equal(view.nextStep.priority,9);assert.doesNotMatch(JSON.stringify(view),/growth_interests|family-relationships|preferred_connection|faith_stage/);
});
test('healthy growth state is explicit when there is no higher-priority action or released resource',()=>{
  const state=base();state.resources=[];assert.equal(next(state).type,'healthy_growth');assert.equal(next(state).priority,10);
});
test('journey labels and submitted spiritual interests never grant authorization',()=>{
  const state=base();state.faith={faith_stage:'serving-leading',wants_host:true,growth_interests:['leadership']};state.founderStatus='active_host';
  let view=buildMemberJourney(state,now);assert.equal(view.journey.stage,'Growing');assert.equal(view.roles,undefined);assert.equal(view.permissions,undefined);
  state.groups=[{status:'active',myRole:'host'}];view=buildMemberJourney(state,now);assert.equal(view.journey.stage,'Leading');assert.equal(view.roles,undefined);assert.doesNotMatch(JSON.stringify(view),/super_admin|staff_roles|access_token/);
});
test('resource destinations reject external, script, encoded-host and connected API targets',()=>{
  for(const value of ['https://evil.invalid','//evil.invalid','javascript:alert(1)','/\\evil.invalid','/%2f%2fevil.invalid','/api/lockliel/profile','/.netlify/functions/test','/r/code','/x/../api/test','/%61pi/lockliel/profile','/%252f%252fevil.invalid'])assert.equal(safeResourcePath(value),null,value);
  assert.equal(safeResourcePath('/faith-boost'),'/#faith-boost');assert.equal(safeResourcePath('/who-god-says-you-are'),'/who-god-says-you-are');
});

function fixtureFetch({faith=null,profileStatus='active',failTable,course=false}={}){
  const calls=[];
  const fetcher=async(url,options={})=>{
    const uri=new URL(url),table=uri.pathname.split('/').at(-1);calls.push({table,uri,options});
    if(table===failTable)return new Response(JSON.stringify({private:'must not leak'}),{status:500});
    if(table==='profiles')return Response.json([{first_name:'Member',onboarding_status:profileStatus,locale:'en-US'}]);
    if(table==='faith_profiles'){
      if(options.method==='POST')return Response.json([{profile_id:JSON.parse(options.body).profile_id}]);
      return Response.json(faith?[faith]:[]);
    }
    if(table==='share_assets')return Response.json([resource]);
    if(table==='course_enrollments')return Response.json(course?[{course_id:'grip',status:'active'}]:[]);
    if(table==='courses')return Response.json([{id:'grip',status:'published',title:'Grip',language_code:'en',translation_key:'getting-a-grip-on-the-basics'}]);
    if(table==='lessons')return Response.json([{id:'l',slug:'one',position:1,worksheet_schema:{questions:[{number:1}]},translation_key:'one'}]);
    return Response.json([]);
  };
  return {fetcher,calls};
}
const req=(method='GET',body)=>new Request('https://lockliel.com/api/lockliel/onboarding?profile_id=someone-else',{method,...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
const preferences={growthInterests:['prayer'],newBeliever:false,privacyAcknowledged:true};

test('recommendation API uses only the authenticated member and narrow columns, with no writes',async()=>{
  const fixture=fixtureFetch({faith:{growth_interests:[]},course:true});const handler=createNextStepHandler({sessionFor:async()=>session,fetcher:fixture.fetcher,clock:()=>now});
  const response=await handler(req());assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
  for(const call of fixture.calls){
    assert.equal(call.options.method,undefined);assert.equal(call.options.headers.Authorization,'Bearer '+session.access);
    const key=call.table==='profiles'?'id':call.table==='reach_contacts'?'owner_id':call.table==='connection_requests'?'requester_id':['faith_profiles','group_members','founders50_applications','course_enrollments','lesson_progress','media_progress'].includes(call.table)?'profile_id':null;
    if(key)assert.equal(call.uri.searchParams.get(key),'eq.'+uid);
    assert.doesNotMatch(call.uri.searchParams.get('select'),/private_notes|worksheet_answers|church_background|faith_stage|phone|email/);
  }
  assert.equal((await response.json()).nextStep.type,'grip_start');
});
test('unauthorized recommendation and onboarding requests never read member state',async()=>{
  for(const create of [createNextStepHandler,createOnboardingHandler]){let reads=0;const handler=create({sessionFor:async()=>({user:null}),fetcher:async()=>{reads++;throw Error('No reads');}});assert.equal((await handler(req())).status,401);assert.equal(reads,0);}
});
test('upstream failure cannot become an empty-account recommendation or leak database details',async()=>{
  for(const failTable of ['profiles','faith_profiles','reach_contacts','course_enrollments','share_assets']){
    const fixture=fixtureFetch({failTable});const response=await createNextStepHandler({sessionFor:async()=>session,fetcher:fixture.fetcher})(req());assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/must not leak|nextStep|onboarding_status/);
  }
});
test('onboarding blocks direct completion before the protected profile transition',async()=>{
  const fixture=fixtureFetch({profileStatus:'new'});const response=await createOnboardingHandler({sessionFor:async()=>session,fetcher:fixture.fetcher})(req('POST',preferences));assert.equal(response.status,409);assert.equal(fixture.calls.filter(call=>call.options.method==='POST').length,0);
});
test('onboarding minimal upsert preserves unrelated private fields and ignores forged member/role fields',async()=>{
  const fixture=fixtureFetch({faith:{faith_stage:'established',church_background:'Private',wants_host:true}});const response=await createOnboardingHandler({sessionFor:async()=>session,fetcher:fixture.fetcher})(req('POST',{...preferences,profile_id:'other',wantsHost:false,roles:['admin'],churchBackground:'overwrite'}));
  assert.equal(response.status,200);assert.equal((await response.json()).complete,true);
  assert.deepEqual(JSON.parse(fixture.calls.find(call=>call.options.method==='POST').options.body),{profile_id:uid,growth_interests:['prayer']});
});
test('onboarding accepts declining optional answers but requires the privacy confirmation',async()=>{
  for(const patch of [{privacyAcknowledged:false},{growthInterests:['unsupported']},{newBeliever:'yes'}]){
    const fixture=fixtureFetch();const response=await createOnboardingHandler({sessionFor:async()=>session,fetcher:fixture.fetcher})(req('POST',{...preferences,...patch}));assert.equal(response.status,400);assert.equal(fixture.calls.filter(call=>call.options.method==='POST').length,0);
  }
  const fixture=fixtureFetch();assert.equal((await createOnboardingHandler({sessionFor:async()=>session,fetcher:fixture.fetcher})(req('POST',{...preferences,growthInterests:[]}))).status,200);
});
test('explicit new-believer selection can be changed without resetting another established stage',async()=>{
  for(const [faithStage,selected,expected] of [['established',true,'new-believer'],['new-believer',false,null],['established',false,undefined]]){
    const fixture=fixtureFetch({faith:{faith_stage:faithStage}});await createOnboardingHandler({sessionFor:async()=>session,fetcher:fixture.fetcher})(req('POST',{...preferences,newBeliever:selected}));const saved=JSON.parse(fixture.calls.find(call=>call.options.method==='POST').options.body);assert.equal(saved.faith_stage,expected);
  }
});
test('onboarding refuses cross-origin requests, oversized input and unconfirmed/failed writes',async()=>{
  const fixture=fixtureFetch();const handler=createOnboardingHandler({sessionFor:async()=>session,fetcher:fixture.fetcher});
  assert.equal((await handler(new Request('https://lockliel.com/api/lockliel/onboarding',{method:'POST',headers:{Origin:'https://evil.invalid'},body:'{}'}))).status,403);
  assert.equal((await handler(req('POST',{...preferences,extra:'x'.repeat(5000)}))).status,413);
  const failed=fixtureFetch({failTable:'faith_profiles'});const response=await createOnboardingHandler({sessionFor:async()=>session,fetcher:failed.fetcher})(req('POST',{...preferences,newBeliever:true}));assert.equal(response.status,503);
});
test('browser journey hooks contain only allowlisted event names and honor Do Not Track',()=>{
  const oldWindow=globalThis.window,oldEvent=globalThis.CustomEvent,nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');const seen=[];
  try{
    globalThis.window={dispatchEvent:event=>seen.push(event)};globalThis.CustomEvent=class{constructor(name,options){this.type=name;this.detail=options.detail;}};Object.defineProperty(globalThis,'navigator',{value:{doNotTrack:'0'},configurable:true});
    journeyEvent('onboarding_completed',{private:'discarded'});journeyEvent('private-answer');assert.deepEqual(seen.map(event=>event.detail),[{event:'onboarding_completed'}]);
    Object.defineProperty(globalThis,'navigator',{value:{doNotTrack:'1'},configurable:true});journeyEvent('next_step_viewed');assert.equal(seen.length,1);
  }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldEvent===undefined)delete globalThis.CustomEvent;else globalThis.CustomEvent=oldEvent;if(nav)Object.defineProperty(globalThis,'navigator',nav);else delete globalThis.navigator;}
});
test('shared course reader preserves canonical IDs and translated media progress',async()=>{
  const calls=[];
  const fetcher=async(url)=>{
    const uri=new URL(url),table=uri.pathname.split('/').at(-1);calls.push(uri);
    if(table==='profiles')return Response.json([{locale:'es-MX'}]);
    if(table==='course_enrollments')return Response.json([{course_id:'en',status:'active'}]);
    if(table==='courses')return Response.json(uri.searchParams.has('id')?[{id:'en',translation_key:'getting-a-grip-on-the-basics',language_code:'en',status:'published'}]:[{id:'es',translation_key:'getting-a-grip-on-the-basics',language_code:'es',status:'published'}]);
    if(table==='lessons'){const translated=uri.searchParams.get('course_id')==='eq.es';return Response.json([{id:translated?'es-lesson':'en-lesson',slug:translated?'leccion':'lesson',translation_key:'one',position:1,worksheet_schema:{questions:[{number:1}]}}]);}
    if(table==='lesson_progress')return Response.json([{lesson_id:'en-lesson',status:'in_progress',worksheet_status:'in_progress'}]);
    if(table==='lesson_assets')return Response.json([{id:'es-video',lesson_id:'es-lesson',asset_type:'video',provider:'youtube',storage_path:'private/never-return.pdf'}]);
    if(table==='media_progress')return Response.json([{asset_id:'es-video',percent_watched:95}]);
    throw Error('Unexpected '+table);
  };
  const data=await loadCourseJourney(session.access,uid,{fetcher,summary:true});assert.equal(data.lessons[0].id,'en-lesson');assert.equal(data.lessons[0].content_lesson_id,'es-lesson');assert.equal(data.assets[0].lesson_id,'en-lesson');assert.equal(data.course.id,'en');assert.equal(data.assets[0].storage_path,undefined);assert.equal(data.assets[0].resource_mapped,true);assert.equal(courseState(data).worksheetIncomplete,true);assert.equal(courseState(data).videoIncomplete,false);
  const mediaRead=calls.find(uri=>uri.pathname.endsWith('media_progress'));assert.equal(mediaRead.searchParams.get('profile_id'),'eq.'+uid);assert.equal(mediaRead.searchParams.get('asset_id'),'in.(es-video)');
});
