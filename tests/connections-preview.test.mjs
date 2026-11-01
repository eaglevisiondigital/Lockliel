import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Existing compiler only; no file output, transport, live imports or TS config mutation.
const bundle=await build({entryPoints:[new URL('../lib/connections-preview/index.ts',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const api=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const {projectRelationship,reviewCapacity,reviewPrivateNote,reviewReminder,isShareableCatalogItem,prepareShare,reviewGroupAction,projectMembership}=api;
const now=1000000;
const context=(overrides={})=>({schemaVersion:'lockliel-synthetic-v1',mode:'synthetic',organizationId:'synthetic-lockliel',actorId:'synthetic-a',aal:1,sessionActive:true,grants:['connections:read','connections:edit','connections:share','groups:request'],...overrides});
const contact=(overrides={})=>({mode:'synthetic',organizationId:'synthetic-lockliel',id:'synthetic-person',ownerId:'synthetic-a',revision:2,stage:'praying',originalInviterId:'synthetic-inviter',latestCampaignId:'synthetic-campaign',assignedMentorId:'synthetic-mentor',assignedGroupId:'synthetic-group',...overrides});
const consent=(overrides={})=>({mode:'synthetic',organizationId:'synthetic-lockliel',ownerId:'synthetic-a',contactId:'synthetic-person',state:'accepted',scope:'resource-share',revision:3,expiresAt:now+60000,...overrides});
const resource=(overrides={})=>({schemaVersion:'lockliel-catalog-preview-v1',mode:'synthetic',organizationId:'synthetic-lockliel',resourceId:'synthetic-resource',revision:4,label:'Synthetic encouragement',language:'en',kind:'resource-invitation',publication:'active',availability:'available',visibility:'public',shareable:true,...overrides});
const confirmation=(overrides={})=>({mode:'synthetic',organizationId:'synthetic-lockliel',ownerId:'synthetic-a',contactId:'synthetic-person',contactRevision:2,resourceId:'synthetic-resource',resourceRevision:4,consentRevision:3,confirmed:true,...overrides});
const share=(overrides={})=>prepareShare({context:context(),contact:contact(),consent:consent(),resource:resource(),confirmation:confirmation(),now,...overrides});
const group=(overrides={})=>({mode:'synthetic',organizationId:'synthetic-lockliel',requesterId:'synthetic-a',groupId:'synthetic-group',revision:0,confirmed:true,action:'join-request',...overrides});
function noEffects(result){assert.deepEqual(result.effects,{save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false});}
function denied(result){assert.deepEqual(result,{status:'denied',effects:{save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false}});}

test('owner allowlist separates inviter, campaign, mentor and group without exposing sensitive extras',()=>{
 const row=contact({email:'private-value',phone:'private-value',prayer:'private-value',finance:{secret:'private-value'},assessment:'private-value',tags:['leader'],application:'approved'});
 const result=projectRelationship(context(),row);assert.equal(result.status,'visible');assert.deepEqual(result.relationship,contact());assert.doesNotMatch(JSON.stringify(result),/private-value|tags|application|leadership/);noEffects(result);
});
for(const [name,ctx] of Object.entries({B:context({actorId:'synthetic-b'}),public:null,missing:undefined,otherOrg:context({organizationId:'synthetic-sowgo'}),inactive:context({sessionActive:false}),noGrant:context({grants:[]}),extraAuth:context({user:'forged'})}))test('owner projection denies '+name,()=>denied(projectRelationship(ctx,contact())));
test('missing/malformed relationship and wrong organization fail closed',()=>{for(const row of [null,[],{},contact({mode:'live'}),contact({organizationId:'synthetic-champion-life'}),contact({revision:NaN}),contact({stage:'leader'}),contact({ownerId:null})])denied(projectRelationship(context(),row));});
test('metadata never supplies missing access grant',()=>denied(projectRelationship(context({grants:[]}),contact({originalInviterId:'synthetic-a',assignedMentorId:'synthetic-a',tags:['leader'],application:'accepted'}))));
test('five active limit and existing update preserve exact current stage semantics',()=>{
 const rows=Array.from({length:5},(_,i)=>contact({id:'synthetic-p'+i,stage:api.ACTIVE_STAGES[i%4]}));
 assert.equal(reviewCapacity(context(),rows.slice(0,4),contact()).activeCountAfter,5);
 denied(reviewCapacity(context(),rows,contact()));
 assert.equal(reviewCapacity(context(),rows,rows[0]).activeCountAfter,5);
 assert.equal(reviewCapacity(context(),rows,contact({...rows[0],stage:'paused'})).activeCountAfter,4);
 denied(reviewCapacity(context(),[...rows,contact({stage:'paused'})],contact()));
});
test('paused/completed do not consume a slot and mixed ownership/duplicates/conflicts deny',()=>{
 assert.equal(reviewCapacity(context(),[contact({id:'synthetic-other',stage:'completed'})],contact()).activeCountAfter,1);
 for(const rows of [[contact(),contact()],[contact({ownerId:'synthetic-b'})],[contact({revision:3})]])denied(reviewCapacity(context(),rows,contact()));
});
test('private note draft is owner only, bounded and revision checked',()=>{
 const result=reviewPrivateNote(context(),contact(),'  Synthetic private reflection  ',2);assert.equal(result.note,'Synthetic private reflection');assert.equal(result.visibility,'owner-only');noEffects(result);
 for(const args of [[context({actorId:'synthetic-b'}),contact(),'x',2],[context(),contact(),'x',1],[context(),contact(),'x'.repeat(3001),2],[context(),contact(),'<script>',2]])denied(reviewPrivateNote(...args));
});
test('reminder is a bounded draft only and requires distinct follow-up consent',()=>{
 const c=consent({scope:'follow-up'});noEffects(reviewReminder(context(),contact(),c,2,now+1000,now));
 assert.equal(reviewReminder(context(),contact(),c,2,null,now).at,null);
 for(const at of [now,now-1,now+367*86400000,Infinity,'tomorrow'])denied(reviewReminder(context(),contact(),c,2,at,now));
 denied(reviewReminder(context(),contact(),consent(),2,now+1000,now));
 denied(reviewReminder(context(),contact({stage:'paused'}),c,2,now+1000,now));
 denied(reviewReminder(context(),contact(),consent({scope:'follow-up',state:'revoked'}),2,now+1000,now));
});
test('valid sharing stays preview-only and cannot send, schedule, save or grant',()=>{const result=share();assert.equal(result.status,'share-preview');assert.deepEqual(Object.keys(result).sort(),['contactId','effects','resourceId','status']);noEffects(result);});
for(const state of ['invited','declined','revoked',null])test('share denies consent '+state,()=>denied(share({consent:consent({state})})));
for(const [field,value] of Object.entries({ownerId:'synthetic-b',contactId:'synthetic-other',scope:'follow-up',expiresAt:now,revision:-1,organizationId:'synthetic-sowgo'}))test('share rejects wrong consent '+field,()=>denied(share({consent:consent({[field]:value})})));
for(const [field,value] of Object.entries({confirmed:false,ownerId:'synthetic-b',contactId:'synthetic-other',contactRevision:1,resourceId:'synthetic-other',resourceRevision:3,consentRevision:2,organizationId:'synthetic-sowgo'}))test('share rejects stale/forged confirmation '+field,()=>denied(share({confirmation:confirmation({[field]:value})})));
test('re-evaluation denies revocation after an earlier preview; no mutation or cached authority',()=>{const input={context:context(),contact:contact(),consent:consent(),resource:resource(),confirmation:confirmation(),now};const before=structuredClone(input);assert.equal(prepareShare(input).status,'share-preview');assert.deepEqual(input,before);denied(prepareShare({...input,consent:consent({state:'revoked'})}));});
for(const [field,value] of Object.entries({schemaVersion:'other',organizationId:'synthetic-sowgo',mode:'live',resourceId:'real-resource',revision:NaN,label:'<script>',language:'',kind:'payment',publication:'inactive',availability:'unavailable',visibility:'entitled',shareable:false,url:'https://example.invalid/private'}))test('catalog rejects '+field,()=>{assert.equal(isShareableCatalogItem(resource({[field]:value})),false);denied(share({resource:resource({[field]:value})}));});
test('catalog requires every field and accepts member/public projections only',()=>{const item=resource();delete item.language;assert.equal(isShareableCatalogItem(item),false);assert.equal(isShareableCatalogItem(resource({visibility:'member'})),true);});
test('share requires active stage, current synthetic session and explicit share grant',()=>{for(const ctx of [null,context({actorId:'synthetic-b'}),context({grants:['connections:read']}),context({aal:3})])denied(share({context:ctx}));for(const stage of ['paused','completed'])denied(share({contact:contact({stage})}));denied(share({now:NaN}));});
test('join and host applications require human review and never confer leadership',()=>{for(const action of ['join-request','host-request']){const result=reviewGroupAction(context(),group({action,tags:['leader'],application:'accepted'}),now);assert.equal(result.status,'human-review-required');noEffects(result);assert.equal(result.grantLeadership,undefined);}});
test('invitation acceptance/decline are proposals, require matching recipient and current invited state',()=>{
 const invitation=group({action:'invitation-response',invitationId:'synthetic-invite',invitationRecipientId:'synthetic-a',invitationState:'invited',expiresAt:now+100,response:'accept'});
 for(const response of ['accept','decline']){const result=reviewGroupAction(context(),{...invitation,response},now);assert.equal(result.status,'invitation-response-draft');noEffects(result);}
 for(const extra of [{invitationRecipientId:'synthetic-b'},{invitationState:'revoked'},{expiresAt:now},{response:'grant-leader'}])denied(reviewGroupAction(context(),{...invitation,...extra},now));
});
test('host/leader review requires explicit AAL2 grant, human review and different subject',()=>{
 const request=group({action:'review-leader',subjectId:'synthetic-b',humanReviewed:true,decision:'recommend'});
 const manager=context({aal:2,grants:['groups:request','groups:review']});assert.equal(reviewGroupAction(manager,request,now).status,'approval-proposal-only');
 for(const ctx of [context(),context({aal:1,grants:['groups:request','groups:review']}),context({aal:2,grants:['groups:request']})])denied(reviewGroupAction(ctx,request,now));
 for(const extra of [{humanReviewed:false},{subjectId:'synthetic-a'},{decision:'grant'}])denied(reviewGroupAction(manager,{...request,...extra},now));
 noEffects(reviewGroupAction(manager,{...request,action:'review-host'},now));
});
test('multiplication plans remain review-only and cannot self-create a duplicate group',()=>{
 const request=group({action:'growth-plan',proposedGroupId:'synthetic-newgroup',nextStep:'Synthetic consent review'});
 assert.equal(reviewGroupAction(context(),request,now).status,'multiplication-review-required');noEffects(reviewGroupAction(context(),request,now));
 denied(reviewGroupAction(context(),{...request,proposedGroupId:'synthetic-group'},now));denied(reviewGroupAction(context(),{...request,nextStep:''},now));
});
test('all group flows deny cross-owner/org/missing session and confirmation',()=>{for(const extra of [{requesterId:'synthetic-b'},{organizationId:'synthetic-sowgo'},{confirmed:false},{revision:-1},{action:'grant-admin'}])denied(reviewGroupAction(context(),group(extra),now));denied(reviewGroupAction(null,group(),now));});

test('membership projection is self-only, allowlisted and confers no role from state or metadata',()=>{
 const value={mode:'synthetic',organizationId:'synthetic-lockliel',memberId:'synthetic-a',groupId:'synthetic-group',revision:0,state:'active',role:'admin',roster:['private-member'],email:'private-value'};
 const ctx=context({grants:['groups:read-self']});const result=projectMembership(ctx,value);
 assert.deepEqual(result.membership,{groupId:'synthetic-group',memberId:'synthetic-a',revision:0,state:'active'});noEffects(result);assert.doesNotMatch(JSON.stringify(result),/admin|roster|private-value/);
 for(const extra of [{memberId:'synthetic-b'},{organizationId:'synthetic-sowgo'},{state:'leader'},{revision:-1}])denied(projectMembership(ctx,{...value,...extra}));
 denied(projectMembership(context(),value));denied(projectMembership(null,value));
});

const enumPaths=[
 ['catalog kind','resource-invitation',value=>{assert.equal(isShareableCatalogItem(resource({kind:value})),false);return share({resource:resource({kind:value})});}],
 ['catalog visibility','public',value=>{assert.equal(isShareableCatalogItem(resource({visibility:value})),false);return share({resource:resource({visibility:value})});}],
 ['membership state','active',value=>projectMembership(context({grants:['groups:read-self']}),{mode:'synthetic',organizationId:'synthetic-lockliel',memberId:'synthetic-a',groupId:'synthetic-group',revision:0,state:value})],
 ['invitation response','accept',value=>reviewGroupAction(context(),group({action:'invitation-response',invitationId:'synthetic-invite',invitationRecipientId:'synthetic-a',invitationState:'invited',expiresAt:now+100,response:value}),now)],
 ['review decision','recommend',value=>reviewGroupAction(context({aal:2,grants:['groups:request','groups:review']}),group({action:'review-leader',subjectId:'synthetic-b',humanReviewed:true,decision:value}),now)],
];
for(const [name,allowedValue,run] of enumPaths)for(const shape of ['plain-coercible','boxed-string','primitive-hook','throwing-hook'])test('strict enum rejects '+name+' '+shape+' without coercion or private echo',()=>{
 let coerced=0;
 let value;
 if(shape==='boxed-string')value=Object.assign(new String(allowedValue),{private:'synthetic-hidden-enum'});
 else if(shape==='primitive-hook')value={private:'synthetic-hidden-enum',[Symbol.toPrimitive](){coerced++;return allowedValue;}};
 else value={private:'synthetic-hidden-enum',toString(){coerced++;if(shape==='throwing-hook')throw Error('enum coercion must not run');return allowedValue;}};
 const result=run(value);denied(result);assert.equal(coerced,0);assert.doesNotMatch(JSON.stringify(result),/synthetic-hidden-enum/);
});

test('member catalog sharing requires member read in addition to independent connections share grant',()=>{
 denied(share({resource:resource({visibility:'member'})}));
});
test('member catalog sharing accepts both explicit grants and exact current confirmation',()=>{
 const ctx=context({grants:[...context().grants,'member:read']});
 const result=share({context:ctx,resource:resource({visibility:'member'})});assert.equal(result.status,'share-preview');noEffects(result);
});
test('member read alone never substitutes for relationship sharing permission; public remains independent',()=>{
 denied(share({context:context({grants:['connections:read','member:read']}),resource:resource({visibility:'member'})}));
 assert.equal(share({resource:resource({visibility:'public'})}).status,'share-preview');
 denied(share({context:context({grants:[...context().grants,'member:read']}),resource:resource({visibility:'entitled'})}));
});
test('member catalog eligibility cannot cross organization with either explicit grant present',()=>{
 const ctx=context({organizationId:'synthetic-sowgo',grants:[...context().grants,'member:read']});
 denied(share({context:ctx,resource:resource({visibility:'member'})}));
 denied(share({context:context({grants:[...context().grants,'member:read']}),resource:resource({visibility:'member',organizationId:'synthetic-sowgo'})}));
});
test('member read does not bypass stale catalog or confirmation revisions',()=>{
 const ctx=context({grants:[...context().grants,'member:read']});
 denied(share({context:ctx,resource:resource({visibility:'member',revision:5})}));
 denied(share({context:ctx,resource:resource({visibility:'member'}),confirmation:confirmation({resourceRevision:3})}));
});
