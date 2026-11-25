import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadReviewedIdentityMapping,identityMappingReadiness,identityMappingSummary,
 privateIdentityMappingPayload,reviewNativeIdentityObservation,createSyntheticIdentityMappingFixture,
 reviewSyntheticIdentityObservation} from '../scripts/member-hosted/identity-mapping.mjs';
const now=1793635200000,sha=x=>createHash('sha256').update(x).digest('hex');
const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(){
 const subjects=['A','B'].map(label=>({label,subjectSha256:sha('synthetic-auth-'+label),profileSha256:sha('synthetic-profile-'+label),createdAtSha256:sha('synthetic-created-'+label),loginSha256:sha('lockliel:qjks:login:synthetic-'+label.toLowerCase()+'@example.invalid')}));
 const artifact={version:'lockliel-synthetic-identity-mapping-v1',project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',branchId:'7091bfd6-83ce-4c11-ac30-8ce85e09be2d',issuedAt:now-1000,expiresAt:now+3600000,
  evidence:{source:'independent-approved-synthetic-fixture-record',approvalId:'OFFLINE-SYNTHETIC-ONLY',recordSha256:sha('offline synthetic independent evidence'),verifiedAt:now-2000},subjects};
 const approval={artifactSha256:sha(JSON.stringify(artifact)),mappingSha256:sha(canonical(artifact)),recordSha256:artifact.evidence.recordSha256,approvalId:artifact.evidence.approvalId,issuedAt:artifact.issuedAt,expiresAt:artifact.expiresAt};
 const observation={project:artifact.project,branch:artifact.branch,mappingSha256:approval.mappingSha256,provenanceEvidenceSha256:approval.recordSha256,observedStartedAt:now,observedAt:now+20,
  subjects:subjects.map(s=>({...s,profileCount:1,confirmed:true,staffRoleCount:0}))};
 return{artifact,approval,now,observation};
}
function resign(f){f.approval.artifactSha256=sha(JSON.stringify(f.artifact));f.approval.mappingSha256=sha(canonical(f.artifact));}
function handle(f){return createSyntheticIdentityMappingFixture({artifact:f.artifact,approval:f.approval,now:f.now});}
const denied=fn=>assert.throws(fn,/Protected synthetic identity mapping denied\./);
test('production mapping remains unverified and fails before artifact access',async()=>{
 assert.deepEqual(identityMappingReadiness(),{project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',state:'UNVERIFIED',liveApprovalInstalled:false,requiresSeparateHostedVerification:true});
 await assert.rejects(loadReviewedIdentityMapping(),/mapping denied/);
 await assert.rejects(loadReviewedIdentityMapping({artifact:{}}),/mapping denied/);
});
test('synthetic mapping exact separate A/B comparison has no provider authority',()=>{
 const f=fixture(),h=handle(f),r=reviewSyntheticIdentityObservation(h,f.observation,now+30);
 assert.equal(r.subjectsMatched,true);assert.equal(r.syntheticOnly,true);assert.equal(r.liveAuthority,false);assert.equal(r.providerAuthority,false);assert.equal(r.requiresTrustedNativeChannel,true);
 assert.deepEqual(r.labels,['A','B']);assert(!JSON.stringify(r).includes(f.artifact.subjects[0].subjectSha256));assert(!JSON.stringify(r).includes(f.artifact.subjects[0].loginSha256));
});
for(const [name,mutate]of [
 ['production project',f=>{f.artifact.project='bsndfhbemstyrrglajat';}],
 ['sibling project',f=>{f.artifact.project='aaaaaaaaaaaaaaaaaaaa';}],
 ['wrong branch',f=>{f.artifact.branch='production';}],
 ['wrong branch ID',f=>{f.artifact.branchId='00000000-0000-0000-0000-000000000000';}],
 ['unknown version',f=>{f.artifact.version='other';}],
 ['expired mapping',f=>{f.artifact.expiresAt=now;}],
 ['future mapping',f=>{f.artifact.issuedAt=now+1;}],
 ['overlong approval lifetime',f=>{f.artifact.expiresAt=now+86400001;}],
 ['unapproved provenance',f=>{f.artifact.evidence.source='user_metadata';}],
 ['missing evidence',f=>{delete f.artifact.evidence;}],
 ['unknown private field',f=>{f.artifact.password='synthetic-value-never-print';}],
 ['email field',f=>{f.artifact.subjects[0].email='synthetic@example.invalid';}],
 ['third subject',f=>{f.artifact.subjects.push(clone(f.artifact.subjects[1]));}],
 ['reversed subjects',f=>{f.artifact.subjects.reverse();}],
 ['duplicate A and B subject',f=>{f.artifact.subjects[1].subjectSha256=f.artifact.subjects[0].subjectSha256;}],
 ['duplicate A and B profile',f=>{f.artifact.subjects[1].profileSha256=f.artifact.subjects[0].profileSha256;}],
 ['duplicate A and B creation proof',f=>{f.artifact.subjects[1].createdAtSha256=f.artifact.subjects[0].createdAtSha256;}],
 ['duplicate A and B login binding',f=>{f.artifact.subjects[1].loginSha256=f.artifact.subjects[0].loginSha256;}],
 ['missing protected login binding',f=>{delete f.artifact.subjects[0].loginSha256;}],
 ['uppercase login digest',f=>{f.artifact.subjects[0].loginSha256='A'.repeat(64);}],
 ['uppercase digest',f=>{f.artifact.subjects[0].subjectSha256='A'.repeat(64);}],
 ['stale independently verified evidence',f=>{f.artifact.evidence.verifiedAt=now-86402000;}],
 ['future independently verified evidence',f=>{f.artifact.evidence.verifiedAt=now;}],
])test('mapping rejects '+name,()=>{const f=fixture();mutate(f);resign(f);denied(()=>handle(f));});
for(const [name,mutate]of [
 ['wrong approval digest',f=>{f.approval.mappingSha256='a'.repeat(64);}],
 ['wrong raw artifact digest',f=>{f.approval.artifactSha256='b'.repeat(64);}],
 ['wrong provenance digest',f=>{f.approval.recordSha256='c'.repeat(64);}],
 ['wrong approval ID',f=>{f.approval.approvalId='other';}],
 ['approval time substitution',f=>{f.approval.issuedAt=now;}],
])test('approval rejects '+name,()=>{const f=fixture();mutate(f);denied(()=>handle(f));});
for(const [name,mutate]of [
 ['wrong project',f=>{f.observation.project='bsndfhbemstyrrglajat';}],
 ['wrong user',f=>{f.observation.subjects[0].subjectSha256=sha('unknown');}],
 ['swapped user',f=>{f.observation.subjects.reverse();}],
 ['wrong profile',f=>{f.observation.subjects[0].profileSha256=sha('unknown-profile');}],
 ['wrong creation binding',f=>{f.observation.subjects[0].createdAtSha256=sha('unknown-created');}],
 ['wrong login identity',f=>{f.observation.subjects[0].loginSha256=sha('wrong-login');}],
 ['missing profile',f=>{f.observation.subjects[0].profileCount=0;}],
 ['ambiguous profile',f=>{f.observation.subjects[0].profileCount=2;}],
 ['unconfirmed user',f=>{f.observation.subjects[0].confirmed=false;}],
 ['staff role',f=>{f.observation.subjects[0].staffRoleCount=1;}],
 ['third account',f=>{f.observation.subjects.push(clone(f.observation.subjects[0]));}],
 ['unknown field',f=>{f.observation.session='SYNTHETIC-SESSION-MUST-NOT-RETURN';}],
 ['retimed before load',f=>{f.observation.observedStartedAt=now-1;}],
 ['future observation',f=>{f.observation.observedAt=now+31;}],
 ['ambiguous timestamp',f=>{f.observation.observedAt=true;}],
 ['forged mapping digest',f=>{f.observation.mappingSha256='0'.repeat(64);}],
 ['forged provenance digest',f=>{f.observation.provenanceEvidenceSha256='1'.repeat(64);}],
])test('observation rejects '+name,()=>{const f=fixture(),h=handle(f);mutate(f);denied(()=>reviewSyntheticIdentityObservation(h,f.observation,now+30));});
test('observations expire at five-minute boundary and denial cannot recover',()=>{
 const f=fixture(),h=handle(f);denied(()=>reviewSyntheticIdentityObservation(h,f.observation,now+300001));denied(()=>reviewSyntheticIdentityObservation(h,f.observation,now+30));
});
test('one observation cannot replay',()=>{const f=fixture(),h=handle(f);reviewSyntheticIdentityObservation(h,f.observation,now+30);denied(()=>reviewSyntheticIdentityObservation(h,f.observation,now+31));});
test('fixture and caller JSON cannot cross into live capability APIs',()=>{
 const f=fixture(),h=handle(f);for(const candidate of [h,{},clone(h)]){
  denied(()=>identityMappingSummary(candidate));denied(()=>privateIdentityMappingPayload(candidate));denied(()=>reviewNativeIdentityObservation(candidate,f.observation));
 }
});
test('accessors and Proxy traps never run',()=>{
 let touched=false;const accessor={get artifact(){touched=true;return{};}};
 denied(()=>createSyntheticIdentityMappingFixture(accessor));assert.equal(touched,false);
 const proxy=new Proxy({},{getPrototypeOf(){touched=true;return Object.prototype;}});
 denied(()=>createSyntheticIdentityMappingFixture(proxy));assert.equal(touched,false);
});
test('cycles, sparse arrays and prototype-bearing values fail closed',()=>{
 const f=fixture();f.artifact.evidence.cycle=f.artifact;denied(()=>handle(f));
 const s=fixture();delete s.artifact.subjects[0];denied(()=>handle(s));
 denied(()=>createSyntheticIdentityMappingFixture(Object.create(null)));
});
test('fixed error never includes rejected sensitive-shaped fixture data',()=>{
 const f=fixture(),h=handle(f);f.observation.token='SYNTHETIC-TOKEN-CANARY';
 try{reviewSyntheticIdentityObservation(h,f.observation,now+30);assert.fail('must deny');}catch(error){assert.equal(error.message,'Protected synthetic identity mapping denied.');assert(!error.stack.includes('SYNTHETIC-TOKEN-CANARY'));}
});

// Exercise the real private-file reader with a separate, explicitly synthetic
// source copy. The reviewed original and its null approval are never modified.
import {mkdtemp,writeFile,readFile,chmod,rm,symlink,link,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
async function privateLoaderFixture(mutate=async()=>{}){
 const f=fixture(),at=Date.now();f.now=at;f.artifact.issuedAt=at-1000;f.artifact.expiresAt=at+3600000;f.artifact.evidence.verifiedAt=at-2000;
 f.approval.issuedAt=f.artifact.issuedAt;f.approval.expiresAt=f.artifact.expiresAt;resign(f);
 const root=await mkdtemp(join(tmpdir(),'lockliel-im-mapping-synthetic-'));
 await chmod(root,0o700);const directory=join(root,'mapping');await mkdir(directory,{mode:0o700});
 const path=join(directory,'approved-mapping.json');await writeFile(path,JSON.stringify(f.artifact),{mode:0o600});
 await mutate({root,directory,path,f});
 const source=await readFile(new URL('../scripts/member-hosted/identity-mapping.mjs',import.meta.url),'utf8');
 const synthetic=source.replace("const REVIEWED_APPROVAL=null;",'const REVIEWED_APPROVAL='+JSON.stringify(f.approval)+';')
  .replace("'/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10im-qjks-identities/approved-mapping.json'",JSON.stringify(path));
 const runtimeModule=await import('data:text/javascript;base64,'+Buffer.from(synthetic+'\n// synthetic-only '+root).toString('base64'));
 return{f,module:runtimeModule,cleanup:()=>rm(root,{recursive:true,force:true})};
}
test('synthetic source-copy exercises protected file loader without granting original authority',async()=>{
 const f=await privateLoaderFixture();try{
  const h=await f.module.loadReviewedIdentityMapping(),summary=f.module.identityMappingSummary(h);
  assert.equal(summary.sourcePinned,true);assert.deepEqual(summary.labels,['A','B']);
  assert.equal(f.module.privateIdentityMappingPayload(h).project,'qjksggxorghaxvpyslip');
  denied(()=>identityMappingSummary(h));
  const at=Date.now(),observation={...f.f.observation,mappingSha256:f.f.approval.mappingSha256,observedStartedAt:at,observedAt:at};
  const verified=f.module.reviewNativeIdentityObservation(h,observation);assert.equal(verified.providerAuthority,false);
  denied(()=>f.module.reviewNativeIdentityObservation(h,observation));
 }finally{await f.cleanup();}
});
for(const [name,mutate]of [
 ['file permission broadening',async({path})=>chmod(path,0o644)],
 ['parent permission broadening',async({directory})=>chmod(directory,0o755)],
 ['file symlink',async({path,root})=>{const target=join(root,'target.json');await writeFile(target,await readFile(path),{mode:0o600});await rm(path);await symlink(target,path);}],
 ['parent symlink',async({directory,root,path})=>{const bytes=await readFile(path);await rm(directory,{recursive:true});const target=join(root,'target');await mkdir(target,{mode:0o700});await writeFile(join(target,'approved-mapping.json'),bytes,{mode:0o600});await symlink(target,directory);}],
 ['hardlink',async({path,root})=>link(path,join(root,'second.json'))],
 ['artifact byte change',async({path})=>writeFile(path,'{}',{mode:0o600})],
 ['wrong source approval digest',async({f})=>{f.approval.artifactSha256='f'.repeat(64);}],
 ['stale file approval',async({f,path})=>{f.artifact.expiresAt=Date.now()-1;f.approval.expiresAt=f.artifact.expiresAt;resign(f);await writeFile(path,JSON.stringify(f.artifact),{mode:0o600});}],
 ['oversized private artifact',async({path})=>writeFile(path,'x'.repeat(8193),{mode:0o600})],
])test('synthetic private loader rejects '+name,async()=>{
 const f=await privateLoaderFixture(mutate);try{await assert.rejects(f.module.loadReviewedIdentityMapping(),/Protected synthetic identity mapping denied\./);}finally{await f.cleanup();}
});
