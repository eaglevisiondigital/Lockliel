import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result=await build({entryPoints:[new URL('../lib/owner-privacy-preview/model.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const {PRIVATE_IDEAS,createPrivacyDraft,isPrivacyOwner,privacyBoundary,changePrivacyIdea,projectOwnerPrivacy}=api;
const context=(change={})=>({schemaVersion:'lockliel-synthetic-v1',mode:'synthetic',organizationId:'synthetic-lockliel',actorId:'synthetic-a',aal:1,sessionActive:true,grants:['member:read','connections:read','connections:share'],...change});
const draft=()=>createPrivacyDraft(context());
function noEffects(value){assert.deepEqual(value.effects,{save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false});}
function unavailable(value){assert.deepEqual(value,{status:'unavailable',liveStatus:'unknown',effects:{save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false}});}

test('default sample is owner-only with private visibility and no consent/delivery idea',()=>{
 assert.deepEqual(PRIVATE_IDEAS,{photo:'private',faithBanner:'private',sharing:'not-given',communications:'not-connected'});
 const model=projectOwnerPrivacy(context(),draft());assert.equal(model.status,'ready');assert.equal(model.areas.length,8);assert.equal(model.localIdeas,0);assert.equal(model.liveStatus,'unknown');assert.equal(model.audiencePermissionGranted,false);assert.equal(model.consentCreated,false);assert.equal(model.deliveryConnected,false);assert.equal(model.rolesGranted,false);noEffects(model);
 for(const area of model.areas)assert.equal(area.liveStatus,'unknown');for(const area of model.areas.slice(0,6))assert.equal(area.localStatus,'Private in this sample');
});
test('all approved areas are explicit, with no inferred lineage or sensitive member data',()=>{
 const model=projectOwnerPrivacy(context(),draft());assert.deepEqual(model.areas.map(area=>area.id),['photo','faithBanner','prayers','growth','anchors','myFive','sharing','communications']);
 assert.ok(model.areas.find(area=>area.id==='myFive').rule.includes('Original inviter, latest campaign, assigned mentor or group and actual access permissions remain separate.'));
 assert.ok(!JSON.stringify(model).includes('synthetic-a'));assert.ok(!JSON.stringify(model).includes('ownerId'));
});
for(const [name,ctx] of [['none',null],['public',{}],['B with A draft',context({actorId:'synthetic-b'})],['unknown owner',context({actorId:'synthetic-manager'})],['other org',context({organizationId:'synthetic-sowgo'})],['inactive',context({sessionActive:false})],['missing member read',context({grants:['ops:privacy-review']})],['bad schema',context({schemaVersion:'other'})],['live mode',context({mode:'live'})],['manufactured role',context({roles:['admin']})]])test('projection denies '+name+' generically without leaking owner details',()=>unavailable(projectOwnerPrivacy(ctx,draft())));
test('separate B starts independently private and cannot project A draft',()=>{
 const b=context({actorId:'synthetic-b'}),bDraft=createPrivacyDraft(b);assert.equal(projectOwnerPrivacy(b,bDraft).status,'ready');unavailable(projectOwnerPrivacy(b,draft()));assert.deepEqual(bDraft.ideas,PRIVATE_IDEAS);
});
for(const [field,value] of [['photo','approved-connections'],['faithBanner','approved-connections'],['sharing','review-idea'],['communications','review-idea']])test('local '+field+' idea never creates a permission, consent, channel or role',()=>{
 const original=draft(),before=structuredClone(original),result=changePrivacyIdea(context(),original,{field,value},0);assert.equal(result.status,'local-idea');assert.equal(result.liveStatus,'unknown');assert.equal(result.draft.revision,1);noEffects(result);assert.deepEqual(original,before);
 const model=projectOwnerPrivacy(context(),result.draft);assert.equal(model.localIdeas,1);assert.equal(model.liveStatus,'unknown');assert.equal(model.audiencePermissionGranted,false);assert.equal(model.consentCreated,false);assert.equal(model.deliveryConnected,false);assert.equal(model.rolesGranted,false);noEffects(model);
 for(const id of ['prayers','growth','anchors','myFive'])assert.equal(model.areas.find(area=>area.id===id).localStatus,'Private in this sample');
});
test('sequential local ideas can be reset with a fresh owner draft and cannot change defaults',()=>{
 let current=draft();for(const field of ['photo','faithBanner']){const result=changePrivacyIdea(context(),current,{field,value:'approved-connections'},current.revision);assert.equal(result.status,'local-idea');current=result.draft;}
 assert.equal(projectOwnerPrivacy(context(),current).localIdeas,2);assert.deepEqual(createPrivacyDraft(context()).ideas,PRIVATE_IDEAS);assert.equal(projectOwnerPrivacy(context(),createPrivacyDraft(context())).localIdeas,0);
});
for(const change of [{field:'prayers',value:'public'},{field:'growth',value:'approved-connections'},{field:'photo',value:'public'},{field:'sharing',value:'accepted'},{field:'communications',value:'subscribed'},{field:'communications',value:'email'},{field:'roles',value:'admin'},{field:'photo',value:'private',extra:'private-sentinel'}])test('disallowed local choice '+JSON.stringify(change)+' fails closed',()=>unavailable(changePrivacyIdea(context(),draft(),change,0)));
test('stale revision, maximum revision and wrong actor/grant cannot apply local idea',()=>{
 unavailable(changePrivacyIdea(context(),draft(),{field:'photo',value:'private'},1));unavailable(changePrivacyIdea(context(),{...draft(),revision:Number.MAX_SAFE_INTEGER},{field:'photo',value:'private'},Number.MAX_SAFE_INTEGER));unavailable(changePrivacyIdea(context({actorId:'synthetic-b'}),draft(),{field:'photo',value:'private'},0));unavailable(changePrivacyIdea(context({grants:[]}),draft(),{field:'photo',value:'private'},0));
});
for(const [name,value] of [['object',{toString:()=> 'approved-connections',private:'private-sentinel'}],['boxed',new String('approved-connections')],['primitive hook',{[Symbol.toPrimitive](){throw Error('must not run');},private:'private-sentinel'}]])test('strict enum rejects '+name+' without private echo or coercion',()=>{
 unavailable(changePrivacyIdea(context(),draft(),{field:'photo',value},0));unavailable(projectOwnerPrivacy(context(),{...draft(),ideas:{...PRIVATE_IDEAS,photo:value}}));
});
for(const change of [{private:'private-sentinel'},{ownerId:'synthetic-b'},{organizationId:'synthetic-sowgo'},{mode:'live'},{schemaVersion:'other'},{revision:-1},{revision:NaN},{ideas:{...PRIVATE_IDEAS,prayer:'private-sentinel'}}])test('untrusted raw draft '+Object.keys(change)[0]+' is not a display model',()=>unavailable(projectOwnerPrivacy(context(),{...draft(),...change})));
test('accessor-bearing data is denied without evaluating private value getters',()=>{
 let called=0;const input=draft();Object.defineProperty(input.ideas,'photo',{enumerable:true,get(){called++;return {private:'private-sentinel'};}});unavailable(projectOwnerPrivacy(context(),input));assert.equal(called,0);
 const ctx=context();Object.defineProperty(ctx,'actorId',{enumerable:true,get(){called++;return 'synthetic-a';}});assert.equal(isPrivacyOwner(ctx),false);assert.equal(called,0);
 const grantContext=context();Object.defineProperty(grantContext.grants,'0',{get(){called++;return 'member:read';}});assert.equal(isPrivacyOwner(grantContext),false);assert.equal(called,0);
});
for(const status of ['loading','empty','error'])test(status+' is distinct and never exposes cards/ideas as loaded',()=>{
 const model=projectOwnerPrivacy(context(),draft(),status);assert.equal(model.status,status);assert.equal(model.liveStatus,'unknown');assert.equal(model.areas,undefined);assert.equal(model.ideas,undefined);noEffects(model);
});
test('unknown scenario cannot be coerced into ready',()=>unavailable(projectOwnerPrivacy(context(),draft(),{toString:()=> 'ready',private:'private-sentinel'})));
test('context, grant and visit changes create a new private state boundary',()=>{
 const base=privacyBoundary(context(),'visit-1');assert.ok(base);for(const [ctx,visit] of [[context({actorId:'synthetic-b'}),'visit-1'],[context(),'visit-2'],[context({aal:2}),'visit-1'],[context({grants:['member:read']}),'visit-1']])assert.notEqual(privacyBoundary(ctx,visit),base);
 assert.equal(privacyBoundary(context({grants:[...context().grants].reverse()}),'visit-1'),base);assert.equal(privacyBoundary(context({grants:[]}),'visit-1'),null);assert.equal(privacyBoundary(context({sessionActive:false}),'visit-1'),null);
});
for(const value of ['',null,'x'.repeat(161),'line\nfeed'])test('invalid boundary is unavailable '+String(value),()=>assert.equal(privacyBoundary(context(),value),null));
