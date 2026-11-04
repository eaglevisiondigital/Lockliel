import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createOfflineProviderReadinessAdapter,getOfflineReadinessEvidence,createHostedProviderReadinessAdapter} from '../../scripts/acceptance-281/provider-readiness-adapter.mjs';
const read = p => JSON.parse(readFileSync(new URL('../../lib/readiness-281/'+p,import.meta.url)));
const expected=read('local-expected.json');
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const binding={source:'a'.repeat(40),runId:'b'.repeat(32),operator:'Synthetic operator'};
const adapter=createOfflineProviderReadinessAdapter({...binding,receiptPublicKey:publicKey.export({type:'spki',format:'pem'})});
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
function fixture(){return {kind:'offline-provider-readiness-281-v1',synthetic:true,...binding,project:expected.project,branch:expected.branch,branchId:expected.branchId,provider:'MOCK_SUPABASE',operation:'MOCK_NATIVE_READ_ONLY_281',observedAt:1000,version:281,candidateSha256:expected.candidate.sha256,ledger:structuredClone(expected.ledger),catalog:read('fingerprint/default.json'),foreignKeys:read('fingerprint/expected-foreign-keys.json'),sqlResult:{scope:'LOCAL_FIXTURE_ONLY',localCandidateCompatible:true,hostedReady:false,executionAuthorized:false}};}
function envelope(p){const payload=stable(p);return {payload,signature:sign(null,Buffer.from(payload),privateKey).toString('base64')};}
const check=p=>adapter.verify({envelope:envelope(p),now:2000});
test('exact retained structural/catalog and281ledger compose into frozen offline receipt',()=>{const r=check(fixture());assert.equal(r.localChecksPass,true);assert.equal(r.hostedReady,false);assert.equal(r.executionAuthorized,false);assert(Object.isFrozen(r));assert.equal(getOfflineReadinessEvidence(r,{...binding,now:2001}),r);});
test('reviewed qualified FK representation accepted only with exact structure',()=>{const p=fixture();p.catalog=read('fingerprint/empty.json');assert(check(p).localChecksPass);});
for(const [name,mutate,code] of [
 ['wrong project',p=>p.project='production','PROJECT_MISMATCH'],['wrong branch',p=>p.branch='other','PROJECT_MISMATCH'],['wrong branchid',p=>p.branchId='other','PROJECT_MISMATCH'],['wrong version',p=>p.version=280,'LEDGER_MISMATCH'],['wrong migration',p=>p.candidateSha256='0'.repeat(64),'LEDGER_MISMATCH'],['missing ledgerentry',p=>p.ledger.pop(),'LEDGER_MISMATCH'],['reordered ledger',p=>p.ledger.reverse(),'LEDGER_MISMATCH'],['wrong source',p=>p.source='c'.repeat(40),'BINDING_MISMATCH'],['wrong run',p=>p.runId='c'.repeat(32),'BINDING_MISMATCH'],['wrong operator',p=>p.operator='Other','BINDING_MISMATCH'],['future receipt',p=>p.observedAt=2001,'STALE_EVIDENCE'],['missing operator',p=>delete p.operator,'INVALID_RECEIPT'],['extra authorityboolean',p=>p.trusted=true,'INVALID_RECEIPT'],['live receipt',p=>p.synthetic=false,'LIVE_AUTHORITY_UNAVAILABLE'],['provider claim',p=>p.provider='Supabase','LIVE_AUTHORITY_UNAVAILABLE'],['altered structure',p=>p.foreignKeys=[],'CATALOG_MISMATCH'],['altered constraint',p=>p.catalog.constraints[0].definition+=' changed','CATALOG_MISMATCH'],['hosted SQL claim',p=>p.sqlResult.hostedReady=true,'CATALOG_MISMATCH']
])test(name,()=>{const p=fixture();mutate(p);assert.throws(()=>check(p),new RegExp(code));});
test('exact five-minute boundary expires',()=>assert.throws(()=>adapter.verify({envelope:envelope(fixture()),now:301000}),/STALE_EVIDENCE/));
test('signature tampering denies',()=>{const e=envelope(fixture());e.payload+=' ';assert.throws(()=>adapter.verify({envelope:e,now:2000}),/INVALID_SIGNATURE/);});
test('canonical payload required even with valid signature',()=>{const payload=JSON.stringify(fixture());assert.throws(()=>adapter.verify({envelope:{payload,signature:sign(null,Buffer.from(payload),privateKey).toString('base64')},now:2000}),/NONCANONICAL_RECEIPT/);});
test('foreign issuer cannot authenticate receipt',()=>{const pair=generateKeyPairSync('ed25519');const e=envelope(fixture());e.signature=sign(null,Buffer.from(e.payload),pair.privateKey).toString('base64');assert.throws(()=>adapter.verify({envelope:e,now:2000}),/INVALID_SIGNATURE/);});
test('receipt copy, stale receipt andwrong binding denied at consumption',()=>{const r=check(fixture());assert.throws(()=>getOfflineReadinessEvidence({...r},{...binding,now:2000}),/UNTRUSTED/);assert.throws(()=>getOfflineReadinessEvidence(r,{...binding,now:301000}),/STALE/);assert.throws(()=>getOfflineReadinessEvidence(r,{...binding,operator:'Other',now:2000}),/UNTRUSTED/);});
test('hosted factory always refuses including supplied authority',()=>assert.throws(()=>createHostedProviderReadinessAdapter({trusted:true}),/INDEPENDENT_PROVIDER/));
test('missing diagnostics and malformed inputs reveal fixed errors only',()=>{for(const envelope of [null,{}, {payload:'secret',signature:'secret'}])assert.throws(()=>adapter.verify({envelope,now:2000}),/^Error: INVALID_RECEIPT$/);});
