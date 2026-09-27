import assert from 'node:assert/strict';
import test from 'node:test';
import {personStage,personAction,personTimeline,contactPatch,nextPersonAction} from '../netlify/lib/my-five.mjs';
import {guidedAsset,safeSharePath,shareLanes} from '../netlify/lib/share-guidance.mjs';
import {buildMemberJourney} from '../netlify/lib/member-journey.mjs';
import guarded,{createMyFiveHandler} from '../netlify/functions/lockliel-my-five.mjs';
import shareGuarded,{createShareLinkHandler} from '../netlify/functions/lockliel-share-link.mjs';
const now=new Date('2026-09-27T12:00:00Z'),uid='10000000-0000-4000-8000-000000000001',id='20000000-0000-4000-8000-000000000001',other='30000000-0000-4000-8000-000000000001';
const session={user:{id:uid},access:'synthetic-member-token'};
const person={id,display_name:'Sarah',status:'praying',created_at:'2026-09-26T12:00:00Z',updated_at:'2026-09-26T12:00:00Z',private_notes:'Private <script>text</script>',linked_profile_id:null};
const asset={id:'asset',slug:'encouragement',title:'Encouragement',asset_type:'faith_boost',destination_path:'/faith-boost',category:'faith-development'};
function request(body){return new Request('https://app.example.invalid/api/lockliel/my-five'+(body?'':'?id='+id),body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,version:person.updated_at,...body})}:{});}
function fixture({contact=person,consent=true,links=[],events=[],engagement=[],failTable,conflict=false}={}){
  const calls=[];
  const fetcher=async(url,options={})=>{
    const uri=new URL(url),table=uri.pathname.split('/').at(-1);calls.push({uri,table,options});
    assert.equal(options.headers.Authorization,'Bearer synthetic-member-token');
    if(table===failTable)return Response.json({secret:'never expose'}, {status:500});
    if(table==='reach_contacts')return Response.json(options.method==='PATCH'?(conflict?[]:[{id}]):contact?[contact]:[]);
    if(table==='contact_permissions')return Response.json(consent?[{id:'permission'}]:[]);
    if(table==='referral_links')return Response.json(options.method==='POST'?[{id:'link'}]:links);
    if(table==='share_assets')return Response.json([asset]);
    if(table==='referral_events')return Response.json(options.method==='POST'?[]:uri.searchParams.get('event_type')==='eq.share_initiated'?events:engagement);
    throw new Error('Unexpected table '+table);
  };
  return {calls,fetcher,handler:createMyFiveHandler({sessionFor:async()=>session,fetcher,clock:()=>now}),share:createShareLinkHandler({sessionFor:async()=>session,fetcher})};
}
for(const [status,label] of Object.entries({praying:'Praying',invited:'Invited',connected:'Connecting',growing:'Growing',paused:'Paused',completed:'Completed'}))test('truthful stage '+status,()=>{
  assert.equal(personStage({...person,status}),label);assert.equal(personStage({...person,status:'invited',last_shared_at:now.toISOString()}),'Shared');
});
test('prayer and private reflection do not invent progress or permissions',()=>{
  const action=personAction(person,now);assert.equal(action.type,'pray');assert.doesNotMatch(JSON.stringify(action),/role|grant|private_notes|linked_profile_id/);
  assert.equal(contactPatch({action:'prayed'},person,now),null);
});
test('due, overdue and future reminders are distinguished',()=>{
  for(const at of ['2026-09-26T00:00:00Z',now.toISOString()])assert.equal(personAction({...person,next_follow_up_at:at},now).urgent,true);
  assert.equal(personAction({...person,next_follow_up_at:'2026-10-01T00:00:00Z'},now).urgent,false);
});
test('confirmed sharing prompts follow-up until addressed or scheduled',()=>{
  const shared={...person,last_shared_at:now.toISOString()};assert.equal(personAction(shared,now).type,'follow_up');
  assert.equal(personAction({...shared,last_follow_up_at:now.toISOString()},now).type,'share');
  assert.equal(personAction({...shared,next_follow_up_at:'2026-10-01T00:00:00Z'},now).type,'pray');
});
test('paused or consent-revoked people cannot generate outreach recommendations',()=>{
  assert.equal(personAction({...person,status:'paused'},now).type,'review');
  assert.equal(personAction({...person,followupAllowed:false,next_follow_up_at:now.toISOString()},now).type,'pray');
  assert.equal(nextPersonAction([{...person,followupAllowed:false,last_shared_at:now.toISOString()}],now),null);
});
test('next action ordering is stable and does not return private reasoning',()=>{
  const candidates=[{...person,id:other,next_follow_up_at:'2026-09-26T00:00:00Z'},{...person,next_follow_up_at:'2026-09-25T00:00:00Z'}];
  assert.equal(nextPersonAction(candidates,now).person.id,id);
  assert.deepEqual(nextPersonAction([...candidates].reverse(),now),nextPersonAction(candidates,now));
});
test('NBS priority six surfaces a person without leaking their note or linkage',()=>{
  const state={profile:{onboarding_status:'active'},faith:{},reach:[{...person,next_follow_up_at:now.toISOString()}]};
  const view=buildMemberJourney(state,now);assert.equal(view.nextStep.priority,6);assert.match(view.nextStep.title,/Sarah/);assert.match(view.nextStep.cta.href,new RegExp(id));assert.doesNotMatch(JSON.stringify(view),/<script>|private_notes|linked_profile_id|updated_at/);
  assert.equal(buildMemberJourney({...state,faith:null},now).nextStep.priority,1);
  const course={course:{status:'published'},lessons:[{id:'lesson',slug:'one',title:'Lesson',position:1}],progress:[]};
  assert.equal(buildMemberJourney({...state,course},now).nextStep.priority,4);
  course.progress=[{lesson_id:'lesson',status:'in_progress'}];assert.equal(buildMemberJourney({...state,course},now).nextStep.priority,2);
});
test('timeline is durable evidence only and contains no raw analytics or note',()=>{
  const timeline=personTimeline({...person,last_shared_at:now.toISOString()},[{id:'event',occurred_at:'2026-09-27T10:00:00Z',title:'Resource',metadata:{secret:'hidden'},member_id:other}]);
  assert.equal(timeline[0].label,'You confirmed a share');assert.equal(timeline[1].label,'Link prepared');assert.doesNotMatch(JSON.stringify(timeline),/hidden|member_id|private_notes|script|sent|opened/);
});
test('bounded notes and dates reject malformed or forged patches',()=>{
  assert.deepEqual(contactPatch({action:'note',note:' <b>Private</b> ',owner_id:other,role:'admin'},person,now),{private_notes:'<b>Private</b>'});
  for(const note of [42,null,[], 'x'.repeat(3001)])assert.equal(contactPatch({action:'note',note},person,now),null);
  assert.equal(contactPatch({action:'note',note:'x'.repeat(3000)},person,now).private_notes.length,3000);
  for(const at of ['invalid',now.toISOString(),'2029-01-01T00:00:00Z',42])assert.equal(contactPatch({action:'schedule',at},person,now),null);
  assert.deepEqual(contactPatch({action:'schedule',at:null},person,now),{next_follow_up_at:null});
  assert.deepEqual(contactPatch({action:'followed_up'},person,now),{last_follow_up_at:now.toISOString(),next_follow_up_at:null});
});
test('lanes reuse categories and do not invent resources or diagnosis',()=>{
  assert.equal(shareLanes.length,10);assert.deepEqual(guidedAsset(asset).lanes,['hope','encouragement','growth']);
  assert.deepEqual(guidedAsset({...asset,category:'identity-in-christ',asset_type:'book'}).lanes,['identity']);
  assert.deepEqual(guidedAsset({...asset,category:'unmapped',asset_type:'book'}).lanes,[]);
});
test('share destinations cannot bypass protected delivery or tokens',()=>{
  for(const value of ['/api/lockliel/resources','//evil.invalid','/%2f%2fevil.invalid','/.netlify/functions/reader','/private/book.pdf','/private/book%252epdf','/storage/v1/object/file','/who-god-says-you-are/read','/download/book','/resource?token=secret'])assert.equal(safeSharePath(value),null,value);
  assert.equal(safeSharePath('/faith-boost'),'/#faith-boost');assert.equal(safeSharePath('/my-lockliel/journey'),'/my-lockliel/journey');
});
test('anonymous, invalid contact and unsupported method are denied before reads',async()=>{
  const f=fixture();const noSession=createMyFiveHandler({sessionFor:async()=>({}),fetcher:f.fetcher});assert.equal((await noSession(request())).status,401);
  assert.equal((await f.handler(new Request('https://app.example.invalid/api/lockliel/my-five?id=bad'))).status,400);
  assert.equal((await f.handler(new Request('https://app.example.invalid/api/lockliel/my-five',{method:'DELETE'}))).status,405);assert.equal(f.calls.length,0);
});
test('cross-member contact denial stops before timeline or other reads',async()=>{
  const f=fixture({contact:null});assert.equal((await f.handler(request())).status,404);assert.equal(f.calls.length,1);assert.equal(f.calls[0].uri.searchParams.get('owner_id'),'eq.'+uid);
});
test('private view constrains timeline to own links and own preparation events',async()=>{
  const f=fixture({links:[{id:'link',content_id:'asset'}],events:[{id:'event',referral_link_id:'link',occurred_at:now.toISOString()}]});const response=await f.handler(request());const data=await response.json();assert.equal(response.status,200);assert.equal(data.person.latestPreparedResource,'Encouragement');
  assert.equal(f.calls.find(call=>call.table==='referral_links').uri.searchParams.get('owner_id'),'eq.'+uid);
  const query=f.calls.find(call=>call.table==='referral_events').uri.searchParams;assert.equal(query.get('referral_link_id'),'in.(link)');assert.equal(query.get('member_id'),'eq.'+uid);assert.equal(query.get('select'),'id,referral_link_id,occurred_at');
  assert.doesNotMatch(JSON.stringify(data),/linked_profile_id|owner_id|synthetic-member-token/);
});
test('linked engagement requires current narrow consent and omits event timestamps',async()=>{
  const f=fixture({contact:{...person,linked_profile_id:other},links:[{id:'link'}],engagement:[{event_type:'signup'}]});const data=await (await f.handler(request())).json();assert.equal(data.person.engagement,'Engaged with your invitation');
  const permission=f.calls.find(call=>call.table==='contact_permissions').uri.searchParams;assert.equal(permission.get('other_profile_id'),'eq.'+uid);assert.equal(permission.get('profile_id'),'eq.'+other);assert.equal(permission.get('revoked_at'),'is.null');
  const query=f.calls.filter(call=>call.table==='referral_events').at(-1).uri.searchParams;assert.equal(query.get('member_id'),'eq.'+other);assert.equal(query.get('select'),'event_type');
});
test('revoked consent suppresses engagement query and prevents follow-up writes',async()=>{
  const f=fixture({contact:{...person,linked_profile_id:other},consent:false,links:[{id:'link'}]});const data=await (await f.handler(request())).json();assert.equal(data.person.engagement,null);assert.equal(data.person.followupAllowed,false);assert.equal(f.calls.filter(call=>call.table==='referral_events').length,1);
  assert.equal((await f.handler(request({action:'followed_up'}))).status,403);assert.ok(f.calls.every(call=>call.options.method!=='PATCH'));
  assert.equal((await f.handler(request({action:'note',note:'Still private'}))).status,200);
});
test('note save is owner scoped with optimistic concurrency and a narrow body',async()=>{
  const f=fixture();assert.equal((await f.handler(request({action:'note',note:'New note',owner_id:other,status:'growing'}))).status,200);const saved=f.calls.find(call=>call.options.method==='PATCH');assert.equal(saved.uri.searchParams.get('owner_id'),'eq.'+uid);assert.equal(saved.uri.searchParams.get('updated_at'),'eq.'+person.updated_at);assert.deepEqual(JSON.parse(saved.options.body),{private_notes:'New note'});
});
test('stale version and concurrent changes are not silently overwritten',async()=>{
  const f=fixture();assert.equal((await f.handler(request({action:'note',note:'New',version:'old'}))).status,409);assert.ok(f.calls.every(call=>call.options.method!=='PATCH'));
  assert.equal((await fixture({conflict:true}).handler(request({action:'note',note:'New'}))).status,409);
});
test('bad inputs and cross-origin requests produce no writes',async()=>{
  const f=fixture();for(const body of [{action:'note',note:'x'.repeat(3001)},{action:'schedule',at:'invalid'},{action:'staff',role:'admin'}])assert.equal((await f.handler(request(body))).status,400);
  const cross=request({action:'note',note:'New'});cross.headers.set('origin','https://evil.invalid');assert.equal((await f.handler(cross)).status,403);assert.ok(f.calls.every(call=>call.options.method!=='PATCH'));
});
test('failed data reads return generic errors without private diagnostics',async()=>{
  const response=await fixture({failTable:'reach_contacts'}).handler(request());assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/secret|never expose/);
});
function shareRequest(fields={}){return new Request('https://app.example.invalid/api/lockliel/share-link',{method:'POST',body:JSON.stringify({slug:asset.slug,channel:'copy',reachContactId:id,...fields})});}
test('person-specific sharing preserves approved attribution and records preparation only',async()=>{
  const f=fixture();const response=await f.share(shareRequest());assert.equal(response.status,200);const link=JSON.parse(f.calls.find(call=>call.table==='referral_links'&&call.options.method==='POST').options.body);assert.equal(link.owner_id,uid);assert.equal(link.reach_contact_id,id);assert.equal(link.campaign,'share-center-my-five');assert.equal(link.destination_path,asset.destination_path);assert.ok(f.calls.every(call=>!['profiles','staff_roles'].includes(call.table)&&call.options.method!=='PATCH'));assert.equal(JSON.parse(f.calls.find(call=>call.table==='referral_events').options.body).event_type,'share_initiated');assert.doesNotMatch((await response.json()).url,/Sarah/);
});
test('generic sharing remains separate from My Five attribution',async()=>{
  const f=fixture();assert.equal((await f.share(shareRequest({reachContactId:null}))).status,200);const link=JSON.parse(f.calls.find(call=>call.table==='referral_links'&&call.options.method==='POST').options.body);assert.equal(link.reach_contact_id,null);assert.equal(link.campaign,'share-center');
});
test('share rejects cross-member, malformed, and consent-revoked recipients',async()=>{
  assert.equal((await fixture({contact:null}).share(shareRequest())).status,400);
  assert.equal((await fixture().share(shareRequest({reachContactId:'bad'}))).status,400);
  const f=fixture({contact:{...person,linked_profile_id:other},consent:false});assert.equal((await f.share(shareRequest())).status,403);assert.ok(f.calls.every(call=>!call.options.method));
});
test('event-record failure is reported instead of falsely confirming preparation',async()=>{
  const response=await fixture({failTable:'referral_events'}).share(shareRequest());assert.equal(response.status,503);
});
test('preview and unknown contexts deny all new connected work before any session lookup',async()=>{
  for(const handler of [guarded,shareGuarded])for(const context of [undefined,{deploy:{context:'deploy-preview'}},{deploy:{context:'branch-deploy'}}]){const response=await handler(request({action:'note',note:'Synthetic'}),context);assert.equal(response.status,503);assert.equal((await response.json()).code,'production_backend_disabled');}
});
test('share read failures do not create links or events',async()=>{
  for(const failTable of ['reach_contacts','share_assets','referral_links','contact_permissions']){
    const f=fixture({failTable,contact:{...person,linked_profile_id:other}});assert.equal((await f.share(shareRequest())).status,503);assert.ok(f.calls.every(call=>call.options.method!=='POST'));
  }
});
test('malformed JSON and oversized notes stop before contact reads',async()=>{
  const f=fixture();for(const [body,status] of [['{',400],[JSON.stringify({id,note:'x'.repeat(14001)}),413]]){
    assert.equal((await f.handler(new Request('https://app.example.invalid/api/lockliel/my-five',{method:'POST',body}))).status,status);
  }assert.equal(f.calls.length,0);
});
test('future reminders and denied consent do not displace dashboard community',()=>{
  const state={profile:{onboarding_status:'active'},faith:{wants_group:true},reach:[{...person,next_follow_up_at:'2026-10-01T00:00:00Z'}]};
  assert.equal(buildMemberJourney(state,now).nextStep.type,'community');
  state.reach[0]={...person,followupAllowed:false,next_follow_up_at:now.toISOString()};assert.equal(buildMemberJourney(state,now).nextStep.type,'community');assert.equal(buildMemberJourney(state,now).myFive.dueCount,0);
});
test('bounded timeline reports when older link history may be omitted',async()=>{
  const links=Array.from({length:100},(_,index)=>({id:'link-'+index,content_id:'asset'}));
  const f=fixture({links,events:[{id:'event',referral_link_id:'link-0',occurred_at:now.toISOString()}]});
  const data=await (await f.handler(request())).json();assert.equal(data.person.historyLimited,true);
  const query=f.calls.find(call=>call.table==='referral_links').uri.searchParams;assert.equal(query.get('order'),'created_at.desc');assert.equal(query.get('limit'),'100');
});
test('timeline accepts database bigint event IDs with equal timestamps',()=>{
  const events=[{id:20,occurred_at:person.created_at},{id:21,occurred_at:person.created_at}];
  const timeline=personTimeline(person,events);assert.equal(timeline.length,3);assert.ok(timeline.every(event=>typeof event.id==='string'));assert.deepEqual(timeline,personTimeline(person,[...events].reverse()));
});
