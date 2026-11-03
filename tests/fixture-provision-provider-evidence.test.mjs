import test from 'node:test';
import assert from 'node:assert/strict';
import {IDENTITY,sha256,canonical} from '../scripts/fixture-provision/contracts.mjs';
import {AUTH_HOOK_FIELDS,authHookState,validateCreationMechanisms} from '../scripts/fixture-provision/provider-evidence.mjs';
import {validateFixtureProviderEvidence,requireFixtureAuthority,fixtureOperatorReadiness} from '../scripts/fixture-provision/operator-authority.mjs';
const NOW=1793707200000,H=sha256('SYNTHETIC-NATIVE-GRAPH'),SOURCE='9bde7d74e3f8c303155ece75fd8148c0d45fd61a';
function data(){
 const a={issuedAt:NOW,triggerGraphSha256:H};
 const e={schema:'lockliel-fixture-provider-evidence-v2',project:IDENTITY.project,branch:IDENTITY.branch,branchId:IDENTITY.branchId,observedAt:NOW,collectorSourceSha:SOURCE,collectionReceiptSha256:sha256('SYNTHETIC-COLLECTOR-RECEIPT'),operatorScope:'isolated-auth-admin-create-only-in-worker',...Object.fromEntries(AUTH_HOOK_FIELDS.map(k=>[k,'disabled'])),authBinaryEvidence:'provider-version-reviewed',providerIdentity:'supabase-management-api',source:'independent-provider-observation',creationMechanisms:{triggerGraphSha256:H,dependencyReview:{status:'reviewed',reviewSha256:H,unresolvedDependencyCount:0},databaseTriggers:{state:'configured',effects:'reviewed-fixture-bootstrap-only'},bootstrapFunctions:{state:'configured',effects:'seven-owned-application-rows-per-user'},memberRoleDefaults:{state:'configured',effects:'ordinary-member-no-staff-grants'},automaticEnrollment:{state:'absent',effects:'no-enrollments'},customClaims:{state:'absent',effects:'no-custom-or-privileged-claims'}}};
 const s={collectorSourceSha:SOURCE};return pin({a,e,s});
}
function pin(d){d.a.providerEvidenceSha256=sha256(canonical(d.e));d.s.providerEvidenceSha256=d.a.providerEvidenceSha256;return d;}
function verify(d){return validateFixtureProviderEvidence(d.e,d.a,d.s,NOW);}
function rejected(change,repin=true){const d=data();change(d);if(repin)pin(d);assert.throws(()=>verify(d),e=>e.message==='DENIED');}
test('v2 complete synthetic evidence validates data only, no authority minted',()=>{const d=data(),r=verify(d);assert.equal(r.schema,'lockliel-fixture-provider-evidence-v2');assert.equal(Object.isFrozen(r.creationMechanisms),true);assert.throws(()=>requireFixtureAuthority(r));assert.equal(fixtureOperatorReadiness().installed,false);});
test('all seven documented hook types are required',()=>{assert.equal(AUTH_HOOK_FIELDS.length,7);assert.ok(AUTH_HOOK_FIELDS.includes('afterUserCreatedHook'));});
test('legacy four-hook v1 evidence cannot activate',()=>rejected(d=>{d.e.schema='lockliel-fixture-provider-evidence-v1';for(const k of ['afterUserCreatedHook','mfaVerificationAttemptHook','sendSmsHook'])delete d.e[k];}));
for(const hook of AUTH_HOOK_FIELDS){
 for(const state of ['configured','unknown','absent',null,false])test(hook+' rejects '+String(state),()=>rejected(d=>d.e[hook]=state));
 test(hook+' omission cannot imply disabled',()=>rejected(d=>delete d.e[hook]));
}
test('boolean projection preserves configured/disabled and missing/null unknown',()=>{assert.equal(authHookState(true),'configured');assert.equal(authHookState(false),'disabled');for(const value of [null,undefined,'false',0,{},[]])assert.equal(authHookState(value),'unknown');});
for(const mechanism of ['databaseTriggers','bootstrapFunctions','memberRoleDefaults','automaticEnrollment','customClaims']){
 test(mechanism+' missing denies',()=>rejected(d=>delete d.e.creationMechanisms[mechanism]));
 test(mechanism+' unknown denies',()=>rejected(d=>d.e.creationMechanisms[mechanism].state='unknown'));
 test(mechanism+' unapproved side effect denies',()=>rejected(d=>d.e.creationMechanisms[mechanism].effects='notify-or-grant-or-enroll'));
}
for(const [name,change]of Object.entries({production:d=>d.e.project='bsndfhbemstyrrglajat',sibling:d=>d.e.project='other',branch:d=>d.e.branch='main',branchId:d=>d.e.branchId='other',provider:d=>d.e.providerIdentity='caller-assertion',browserSource:d=>d.e.source='browser-owner',scope:d=>d.e.operatorScope='organization-admin',stale:d=>d.e.observedAt=NOW-300001,future:d=>d.e.observedAt=NOW+1,preapproval:d=>d.a.issuedAt=NOW+1,graph:d=>d.e.creationMechanisms.triggerGraphSha256=sha256('OTHER-GRAPH'),unreviewedVersion:d=>d.e.authBinaryEvidence='unknown',extraField:d=>d.e.password='SYNTHETIC-SENTINEL',extraHook:d=>d.e.unknownFutureHook='disabled',extraMechanism:d=>d.e.creationMechanisms.networkCallback={state:'disabled',effects:'none'},claims:d=>d.e.creationMechanisms.customClaims.state='configured',enrollment:d=>d.e.creationMechanisms.automaticEnrollment.state='configured'}))test('v2 rejects '+name,()=>rejected(change));
for(const [name,change]of Object.entries({collector:d=>d.s.collectorSourceSha='0'.repeat(40),evidenceDigest:d=>d.s.providerEvidenceSha256=sha256('OTHER'),tamper:d=>d.e.collectionReceiptSha256=sha256('TAMPER')}))test('independent seal rejects '+name,()=>rejected(change,false));
test('mechanism validator rejects untrusted getters without invocation',()=>{let calls=0;assert.throws(()=>validateCreationMechanisms({get triggerGraphSha256(){calls++;throw Error('SYNTHETIC-SECRET');}},H),e=>e.message==='DENIED');assert.equal(calls,0);});
test('receipt and nested unknown fields cannot echo sensitive diagnostics',()=>{const d=data();d.e.creationMechanisms.customClaims.extra='SYNTHETIC-SECRET';pin(d);try{verify(d);assert.fail('must deny');}catch(e){assert.equal(e.message,'DENIED');assert.equal(String(e).includes('SYNTHETIC-SECRET'),false);}});

for(const [name,change]of Object.entries({missing:d=>delete d.e.creationMechanisms.dependencyReview,unknown:d=>d.e.creationMechanisms.dependencyReview.status='unknown',unresolved:d=>d.e.creationMechanisms.dependencyReview.unresolvedDependencyCount=1,missingReceipt:d=>d.e.creationMechanisms.dependencyReview.reviewSha256=null}))test('transitive dependency review rejects '+name,()=>rejected(change));
