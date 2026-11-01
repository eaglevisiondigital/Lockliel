import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const bundle = await build({entryPoints:[new URL('../lib/content-readiness-preview/index.ts',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'esm',target:'es2022'});
const {
  CATALOG_SCHEMA, REQUEST_SCHEMA, ENTITLEMENT_SCHEMA, PUBLICATION_SCHEMA, INTAKE_SCHEMA, FOUNDERS_SCHEMA, CONSENT_VERSION,
  projectCatalogItem, buildCatalogItem, catalogReadiness, publicationReadiness, intakeReadiness, foundersReadiness,
} = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);
import { NO_EFFECTS, SYNTHETIC_SCHEMA, LOCKLIEL_ORG } from '../lib/synthetic-contracts/context.ts';

const now = '2026-11-01T12:00:00.000Z';
const context = (patch = {}) => ({ schemaVersion:SYNTHETIC_SCHEMA, mode:'synthetic', organizationId:LOCKLIEL_ORG,
  actorId:'synthetic-person-a', aal:1, sessionActive:true, grants:[], ...patch });
const item = (patch = {}) => ({ schemaVersion:CATALOG_SCHEMA, mode:'synthetic', organizationId:LOCKLIEL_ORG,
  resourceId:'synthetic-faith-boost', revision:2, label:'Synthetic resource invitation', language:'en',
  kind:'resource-invitation', publication:'active', availability:'available', visibility:'public', shareable:true, ...patch });
const request = (patch = {}) => ({ schemaVersion:REQUEST_SCHEMA, resourceId:'synthetic-faith-boost', revision:2, action:'discover', now, ...patch });
const entitlement = (patch = {}) => ({ schemaVersion:ENTITLEMENT_SCHEMA, organizationId:LOCKLIEL_ORG,
  ownerId:'synthetic-person-a', resourceId:'synthetic-faith-boost', revision:2,
  expiresAt:'2026-11-02T12:00:00.000Z', revoked:false, ...patch });
const publication = (patch = {}) => ({ schemaVersion:PUBLICATION_SCHEMA, organizationId:LOCKLIEL_ORG,
  resourceId:'synthetic-faith-boost', revision:2, reviewedRevision:2, rights:'invented-placeholder-only', decision:'approved-fixture', ...patch });
const intake = (patch = {}) => ({ schemaVersion:INTAKE_SCHEMA, organizationId:LOCKLIEL_ORG, ownerId:'synthetic-person-a', revision:2,
  purpose:'resource-updates', channel:'email', consent:'given', consentVersion:CONSENT_VERSION, leadAccess:'absent', ...patch });
const founders = (patch = {}) => ({ schemaVersion:FOUNDERS_SCHEMA, organizationId:LOCKLIEL_ORG, ownerId:'synthetic-person-a', revision:2,
  application:'submitted', orientation:'completed', humanReview:'pending', recruiting:'open', descriptiveTags:['founders-interest'], ...patch });
const blocked = (value) => { assert.deepEqual(value, { ok:false, state:'blocked', effects:NO_EFFECTS }); };
const synthetic = (value) => { assert.equal(value.ok,true); assert.equal(value.state,'synthetic-ready'); assert.deepEqual(value.effects,NO_EFFECTS); return value.value; };

test('catalog builder projects exactly the fixed shared DTO and freezes its copy', () => {
  const source=item(); const projected=synthetic(buildCatalogItem(source));
  assert.deepEqual(projected,source); assert.notEqual(projected,source); assert.ok(Object.isFrozen(projected));
  source.label='Synthetic changed'; assert.equal(projected.label,'Synthetic resource invitation');
});
for (const [name, patch] of Object.entries({
  'unknown version':{schemaVersion:'future'}, 'real mode':{mode:'production'}, 'cross organization':{organizationId:'synthetic-sowgo'},
  'real identifier':{resourceId:'real-resource'}, 'negative revision':{revision:-1}, 'fractional revision':{revision:1.5},
  'unsafe revision':{revision:Number.MAX_SAFE_INTEGER+1}, 'empty title':{label:''}, 'unmarked title':{label:'Real title'},
  'markup title':{label:'Synthetic <b>title</b>'}, 'URL title':{label:'Synthetic https://invalid.example'},
  'private path title':{label:'Synthetic private/book.pdf'}, 'unknown language':{language:''},
  'unknown kind':{kind:'gift'}, 'unknown publication':{publication:'approved'}, 'unknown availability':{availability:'unknown'},
  'unknown visibility':{visibility:'staff'}, 'unknown share state':{shareable:'true'},
})) test(`catalog rejects ${name}`, () => { assert.equal(projectCatalogItem(item(patch)),null); blocked(buildCatalogItem(item(patch))); });
for (const field of ['url','storagePath','token','email','recipientId','privateAssessment','role']) {
  test(`catalog rejects extra private/locator field ${field}`, () => blocked(buildCatalogItem(item({[field]:'synthetic-value'}))));
}
for (const malformed of [null,[],{},Object.create(null)]) {
  test(`catalog rejects malformed input ${JSON.stringify(malformed)}`, () => assert.equal(projectCatalogItem(malformed),null));
}
test('Faith Boost discovery/share return metadata only and no delivery, publication or recipient', () => {
  for(const action of ['discover','share']) {
    const result=synthetic(catalogReadiness(context(),item(),request({action})));
    assert.deepEqual(result,{resourceId:'synthetic-faith-boost',revision:2,action,metadataOnly:true,contentDelivered:false,productionActivation:false});
  }
});
for (const [name, fixture, req] of [
  ['inactive',item({publication:'inactive'}),request()], ['unavailable',item({availability:'unavailable'}),request()],
  ['unshareable',item({shareable:false}),request({action:'share'})], ['stale revision',item(),request({revision:1})],
  ['wrong identifier',item(),request({resourceId:'synthetic-other'})], ['wrong request version',item(),request({schemaVersion:'future'})],
  ['unknown action',item(),request({action:'download'})], ['invalid clock',item(),request({now:'yesterday'})],
  ['normalized invalid date',item(),request({now:'2026-02-30T12:00:00.000Z'})],
]) test(`catalog readiness blocks ${name}`,()=>blocked(catalogReadiness(context(),fixture,req)));
for (const ctx of [context({organizationId:'synthetic-champion-life'}),context({sessionActive:false}),context({actorId:'real-person'}),context({origin:'inviter'}),null]) {
  test(`catalog rejects malformed or unrelated context ${JSON.stringify(ctx)}`,()=>blocked(catalogReadiness(ctx,item(),request())));
}
test('member visibility requires its own explicit fixture grant, not resource cookie or application/tag metadata',()=>{
  const member=item({visibility:'member'});
  blocked(catalogReadiness(context(),member,request()));
  blocked(catalogReadiness(context({grants:['founders:applied']}),member,request()));
  blocked(catalogReadiness(context({leadAccess:true}),member,request()));
  synthetic(catalogReadiness(context({grants:['member:read']}),member,request()));
});
test('protected resource discovery/read require current independent entitlement, including public book read',()=>{
  const ctx=context({grants:['content:read']});
  const book=item({kind:'book',visibility:'entitled'});
  blocked(catalogReadiness(ctx,book,request({action:'read'})));
  synthetic(catalogReadiness(ctx,book,request({action:'read'}),entitlement()));
  blocked(catalogReadiness(context(),item({kind:'book'}),request({action:'read'}),entitlement()));
  blocked(catalogReadiness(ctx,item(),request({action:'read'}),entitlement()));
});
for (const [name, patch] of Object.entries({
  'other user':{ownerId:'synthetic-person-b'}, 'other organization':{organizationId:'synthetic-sowgo'},
  'wrong resource':{resourceId:'synthetic-other'}, 'stale revision':{revision:1}, 'revoked':{revoked:true},
  'expired':{expiresAt:'2026-10-31T12:00:00.000Z'}, 'expires now':{expiresAt:now},
  'unknown version':{schemaVersion:'future'}, 'secret field':{token:'synthetic-only'},
})) test(`protected reader blocks entitlement ${name}`,()=>blocked(catalogReadiness(context({grants:['content:read']}),item({kind:'training',visibility:'entitled'}),request({action:'read'}),entitlement(patch))));
test('B cannot reuse A entitlement; revocation or revision update blocks a previously ready preview',()=>{
  const a=context({grants:['content:read']}); const book=item({kind:'book',visibility:'entitled'});
  synthetic(catalogReadiness(a,book,request({action:'read'}),entitlement()));
  blocked(catalogReadiness(context({actorId:'synthetic-person-b',grants:['content:read']}),book,request({action:'read'}),entitlement()));
  blocked(catalogReadiness(a,book,request({action:'read'}),entitlement({revoked:true})));
  blocked(catalogReadiness(a,item({kind:'book',visibility:'entitled',revision:3}),request({action:'read',revision:3}),entitlement()));
});
test('review readiness needs explicit AAL2 review grant, current review and invented rights; never publishes',()=>{
  const ctx=context({aal:2,grants:['content:review']});
  assert.deepEqual(synthetic(publicationReadiness(ctx,item(),publication())),{reviewOnly:true,publish:false});
  for(const evidence of [publication({reviewedRevision:1}),publication({decision:'pending'}),publication({decision:'revoked'}),publication({rights:'licensed-assumed'}),publication({organizationId:'synthetic-sowgo'}),publication({schemaVersion:'future'})]) blocked(publicationReadiness(ctx,item(),evidence));
  blocked(publicationReadiness(context({grants:['content:review']}),item(),publication()));
  blocked(publicationReadiness(context({aal:2}),item(),publication()));
  blocked(publicationReadiness(ctx,item({publication:'inactive'}),publication()));
});
test('Getting a Grip future approval remains an inactive metadata fixture',()=>{
  const grip=item({resourceId:'synthetic-getting-a-grip',publication:'inactive',kind:'course-invitation'});
  assert.equal(synthetic(buildCatalogItem(grip)).publication,'inactive');
  blocked(catalogReadiness(context(),grip,request({resourceId:grip.resourceId,action:'share'})));
});
test('purpose consent prepares intake only; neither lead access nor syntax implies identity or verification',()=>{
  for(const leadAccess of ['absent','present']) {
    const result=synthetic(intakeReadiness(context(),intake({leadAccess}),2));
    assert.equal(result.delivery,'not-sent'); assert.equal(result.memberIdentity,'not-created');
    assert.equal(result.mailboxVerification,'not-verified-by-contract'); assert.equal(result.resourceCookieProvesIdentity,false);
    assert.equal(result.persistence,'none');
  }
  assert.equal(synthetic(intakeReadiness(context(),intake({purpose:'founders-followup'}),2)).purpose,'founders-followup');
});
for(const [name,patch] of Object.entries({
  'withdrawn consent':{consent:'withdrawn'}, 'missing purpose':{purpose:''}, 'different purpose':{purpose:'general-marketing'},
  'unknown consent version':{consentVersion:'future'}, 'sms':{channel:'sms'}, 'stale revision':{revision:1},
  'other owner':{ownerId:'synthetic-person-b'}, 'other organization':{organizationId:'synthetic-sowgo'},
  'unknown intake version':{schemaVersion:'future'}, 'email address':{email:'synthetic@example.invalid'},
  'forged mailbox proof':{mailboxVerified:true},
})) test(`intake blocks ${name}`,()=>blocked(intakeReadiness(context(),intake(patch),2)));
test('consent withdrawal immediately blocks a previously prepared draft and cannot leak it in denial',()=>{
  synthetic(intakeReadiness(context(),intake(),2));
  blocked(intakeReadiness(context(),intake({consent:'withdrawn'}),2));
  blocked(intakeReadiness(context({actorId:'synthetic-person-b'}),intake(),2));
});
test('Founders application, orientation and human review remain distinct with no role or resource entitlement',()=>{
  const fixtures=[
    [{application:'not-started',orientation:'not-started',humanReview:'not-reviewed'},'prepare-application'],
    [{application:'draft',orientation:'not-started',humanReview:'not-reviewed'},'submit-application'],
    [{orientation:'in-progress'},'complete-orientation'], [{},'await-human-review'],
    [{humanReview:'approved-fixture'},'review-fixture-complete'], [{humanReview:'declined-fixture'},'decision-held'],
    [{application:'withdrawn',orientation:'not-started',humanReview:'not-reviewed'},'withdrawn'],
  ];
  for(const [patch,nextStep] of fixtures) {
    const result=synthetic(foundersReadiness(context(),founders(patch),2)); assert.equal(result.nextStep,nextStep);
    assert.equal(result.rolesGranted,false); assert.equal(result.staffAccessGranted,false); assert.equal(result.facilitatorEntitlementGranted,false);
  }
});
for(const [name,patch] of Object.entries({
  'approval before orientation':{humanReview:'approved-fixture',orientation:'in-progress'},
  'orientation before submission':{application:'draft'}, 'closed recruiting':{recruiting:'closed'},
  'unknown recruiting':{recruiting:'unknown'}, 'role tag':{descriptiveTags:['leader']}, 'role injection':{role:'admin'},
  'real approval':{humanReview:'approved'}, 'stale revision':{revision:1}, 'other owner':{ownerId:'synthetic-person-b'},
  'other organization':{organizationId:'synthetic-sowgo'}, 'future version':{schemaVersion:'future'},
})) test(`Founders blocks ${name}`,()=>blocked(foundersReadiness(context(),founders(patch),2)));
test('descriptive tag, fixture approval and unrelated grants cannot give facilitator resources',()=>{
  const ctx=context({grants:['member:read','founders:facilitate']});
  synthetic(foundersReadiness(ctx,founders({humanReview:'approved-fixture'}),2));
  blocked(catalogReadiness(ctx,item({kind:'training',visibility:'entitled'}),request({action:'read'})));
});
test('shared no-effects declaration is frozen and all operation flags remain false',()=>{
  assert.ok(Object.isFrozen(NO_EFFECTS)); assert.equal(Object.values(NO_EFFECTS).every(v=>v===false),true);
});
