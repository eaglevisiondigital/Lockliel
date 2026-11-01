import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result=await build({entryPoints:[new URL('../lib/share-review/adapter.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const {SHARE_FIXTURE_EPOCH,epochToCatalogTime,shareBoundary,createShareSnapshot,projectShareWorkspace,buildSharePreview,confirmSharePreview}=api;
const context=(overrides={})=>({schemaVersion:'lockliel-synthetic-v1',mode:'synthetic',organizationId:'synthetic-lockliel',actorId:'synthetic-a',aal:1,sessionActive:true,grants:['connections:read','connections:share','member:read'],...overrides});
const selection=(overrides={})=>({resourceId:'synthetic-share-encouragement',contactId:'synthetic-share-person-one',channel:'in-app',message:'Synthetic example: A little encouragement for today.',...overrides});
const snapshot=()=>createShareSnapshot(context());
const preview=()=>{const result=buildSharePreview(context(),snapshot(),selection());assert.equal(result.status,'draft-preview');return result.preview;};
function noEffects(result){assert.deepEqual(result.effects,{save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false});}
function blocked(result){assert.equal(result.status,'blocked');noEffects(result);assert.doesNotMatch(JSON.stringify(result),/private-sentinel|access_token|555-123|real@example/);assert.equal(result.preview,undefined);}
function mutateConsent(change){const s=snapshot();s.contacts[0].consent={...s.contacts[0].consent,...change};return s;}
function mutateResource(change){const s=snapshot();s.resources[0]={...s.resources[0],...change};return s;}

test('explicit fixture epoch is converted exactly for actual L6 and stays numeric for L5',()=>{assert.equal(epochToCatalogTime(SHARE_FIXTURE_EPOCH),'2026-11-01T12:00:00.000Z');assert.equal(snapshot().now,SHARE_FIXTURE_EPOCH);});
for(const value of [null,undefined,NaN,Infinity,-1,1.5,'1793534400000',new Number(SHARE_FIXTURE_EPOCH)])test('clock rejects '+String(value),()=>assert.equal(epochToCatalogTime(value),null));
test('resource/recipient projection uses actual contracts and excludes arbitrary private source fields',()=>{
 const s=snapshot();s.contacts[0].relationship={...s.contacts[0].relationship,prayer:'private-sentinel',note:'private-sentinel',email:'real@example',finance:{secret:'private-sentinel'}};
 const result=projectShareWorkspace(context(),s);assert.equal(result.status,'ready');assert.equal(result.resources.length,2);assert.equal(result.recipients.length,2);assert.deepEqual(result.recipients[0],{id:'synthetic-share-person-one',label:'Alex Sample'});assert.doesNotMatch(JSON.stringify(result),/private-sentinel|real@example|ownerId|revision|entitlement/);noEffects(result);
});
for(const [name,ctx] of [['none',null],['other org',context({organizationId:'synthetic-sowgo'})],['revoked session',context({sessionActive:false})],['no read',context({grants:['connections:share']})],['no share',context({grants:['connections:read']})]])test('projection blocks '+name+' without private choices',()=>{const result=projectShareWorkspace(ctx,snapshot());assert.equal(result.status,'blocked');assert.deepEqual(result.resources,[]);assert.deepEqual(result.recipients,[]);});
for(const scenario of ['loading','empty','error','revoked','stale'])test('honest '+scenario+' fixture has no actionable resource or recipient projection',()=>{const result=projectShareWorkspace(context(),createShareSnapshot(context(),scenario));assert.equal(result.status,scenario);assert.deepEqual(result.resources,[]);assert.deepEqual(result.recipients,[]);});
test('complete synthetic preview requires a separate explicit final confirmation and creates no delivery event',()=>{
 const ready=preview();assert.equal(ready.resourceLabel,'Synthetic Everyday Encouragement');assert.equal(ready.resourceType,'Resource invitation');assert.equal(ready.recipientLabel,'Alex Sample');assert.equal(ready.reviewedAt,'2026-11-01T12:00:00.000Z');
 blocked(confirmSharePreview(context(),snapshot(),ready,false));blocked(confirmSharePreview(context(),snapshot(),ready,'true'));
 const confirmed=confirmSharePreview(context(),snapshot(),ready,true);assert.equal(confirmed.status,'preview-confirmed');assert.equal(confirmed.delivery,'not-sent');assert.equal(confirmed.message,'Nothing was sent.');assert.deepEqual(confirmed.preview,ready);noEffects(confirmed);assert.equal(confirmed.event,undefined);assert.equal(confirmed.id,undefined);
});
for(const channel of ['in-app','email','sms'])test(channel+' remains an address-free local preview',()=>{
 const result=buildSharePreview(context(),snapshot(),selection({channel}));assert.equal(result.status,'draft-preview');const confirmed=confirmSharePreview(context(),snapshot(),result.preview,true);assert.equal(confirmed.status,'preview-confirmed');assert.doesNotMatch(JSON.stringify(confirmed),/real@example|phone|address|href|mailto|sms:/);noEffects(confirmed);
});
for(const [field,value] of Object.entries({state:'revoked',scope:'follow-up',ownerId:'synthetic-b',contactId:'synthetic-other',organizationId:'synthetic-sowgo',expiresAt:SHARE_FIXTURE_EPOCH,revision:-1}))test('current consent '+field+' denies before preview and again at confirmation',()=>{
 const changed=mutateConsent({[field]:value});blocked(buildSharePreview(context(),changed,selection()));blocked(confirmSharePreview(context(),changed,preview(),true));
});
for(const state of ['invited','declined'])test(state+' consent is not created by selecting recipient or checking confirmation',()=>{const s=mutateConsent({state});blocked(buildSharePreview(context(),s,selection()));blocked(confirmSharePreview(context(),s,preview(),true));});
for(const stage of ['paused','completed'])test('inactive '+stage+' relationship denies before complete preview',()=>{const s=snapshot();s.contacts[0].relationship.stage=stage;blocked(buildSharePreview(context(),s,selection()));blocked(confirmSharePreview(context(),s,preview(),true));});
test('A preview cannot be confirmed in B context, with missing share grant or inactive session',()=>{
 const p=preview();for(const ctx of [context({actorId:'synthetic-b'}),context({grants:['connections:read','member:read']}),context({sessionActive:false}),context({organizationId:'synthetic-sowgo'})])blocked(confirmSharePreview(ctx,snapshot(),p,true));
});
test('member-visible actual producer/consumer flow requires independent member-read grant at both stages',()=>{
 const draft=selection({resourceId:'synthetic-share-together'});const noMember=context({grants:['connections:read','connections:share']});
 blocked(buildSharePreview(noMember,createShareSnapshot(noMember),draft));
 const result=buildSharePreview(context(),snapshot(),draft);assert.equal(result.status,'draft-preview');assert.equal(confirmSharePreview(context(),snapshot(),result.preview,true).status,'preview-confirmed');blocked(confirmSharePreview(noMember,createShareSnapshot(noMember),result.preview,true));
});
for(const change of [{revision:2},{publication:'inactive'},{availability:'unavailable'},{shareable:false},{visibility:'entitled'},{organizationId:'synthetic-sowgo'},{schemaVersion:'unrecognized'},{storagePath:'private-sentinel'}])test('current resource '+JSON.stringify(change)+' cannot reuse an earlier preview',()=>blocked(confirmSharePreview(context(),mutateResource(change),preview(),true)));
test('changed contact/consent revisions and elapsed expiry cannot reuse an earlier explicit confirmation',()=>{
 const p=preview(),contact=snapshot();contact.contacts[0].relationship.revision++;
 blocked(confirmSharePreview(context(),contact,p,true));blocked(confirmSharePreview(context(),mutateConsent({revision:2}),p,true));
 const expired=snapshot();expired.now+=3600000;blocked(confirmSharePreview(context(),expired,p,true));
});
test('duplicate resource/contact identities deny instead of selecting arbitrary matches',()=>{const s=snapshot();s.resources.push({...s.resources[0]});blocked(buildSharePreview(context(),s,selection()));const c=snapshot();c.contacts.push({...c.contacts[0]});blocked(buildSharePreview(context(),c,selection()));});
for(const change of [{resourceLabel:'private-sentinel'},{recipientLabel:'private-sentinel'},{resourceType:'private-sentinel'},{channelLabel:'private-sentinel'},{reviewedAt:'2026-10-01T00:00:00.000Z'},{extra:'private-sentinel'},{ownerId:'synthetic-b'},{resourceRevision:0}])test('forged prepared preview '+Object.keys(change)[0]+' is generically blocked',()=>blocked(confirmSharePreview(context(),snapshot(),{...preview(),...change},true)));
for(const change of [{channel:{toString:()=> 'email',private:'private-sentinel'}},{contactId:'synthetic-other'},{resourceId:'synthetic-other'},{message:'real@example.com'},{message:'+1 555-123-4567'},{message:'https://example.invalid'},{message:'<script>'},{message:'x'.repeat(241)},{private:'private-sentinel'}])test('unverified draft '+Object.keys(change)[0]+' cannot leak contact/private data',()=>blocked(buildSharePreview(context(),snapshot(),selection(change))));
test('empty optional message remains empty, safe final output is reconstructed, and inputs stay unchanged',()=>{
 const s=snapshot(),draft=selection({message:''}),before=structuredClone(s),d=buildSharePreview(context(),s,draft);assert.equal(d.status,'draft-preview');const result=confirmSharePreview(context(),s,d.preview,true);assert.equal(result.status,'preview-confirmed');assert.equal(result.preview.message,'');assert.notEqual(result.preview,d.preview);assert.deepEqual(s,before);assert.deepEqual(draft,selection({message:''}));
});
test('private boundary changes for actor, org, grants, AAL and host epoch; grant order alone is stable',()=>{
 const a=shareBoundary(context(),'visit-1');assert.notEqual(a,shareBoundary(context(),'visit-2'));assert.notEqual(a,shareBoundary(context({actorId:'synthetic-b'}),'visit-1'));assert.notEqual(a,shareBoundary(context({grants:['connections:read']}),'visit-1'));assert.notEqual(a,shareBoundary(context({aal:2}),'visit-1'));assert.equal(shareBoundary(context({organizationId:'synthetic-sowgo'}),'visit-1'),null);assert.equal(a,shareBoundary(context({grants:[...context().grants].reverse()}),'visit-1'));
});
test('malformed boundary/snapshot is unavailable without raw-string retention',()=>{for(const value of ['',null,'x'.repeat(161),'bad\nkey'])assert.equal(shareBoundary(context(),value),null);for(const value of [null,{},[],{...snapshot(),extra:'private-sentinel'},{...snapshot(),now:NaN}])blocked(buildSharePreview(context(),value,selection()));});
