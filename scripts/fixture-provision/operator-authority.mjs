/** Source-pinned nonsecret operator installation. No installer, approval minting,
 * token retrieval, provider calls or test-to-live capability conversion. */
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {IDENTITY,need,clone,exact,digest,sha256,canonical,freeze,freshness} from './contracts.mjs';
import {AUTH_HOOK_FIELDS,validateCreationMechanisms} from './provider-evidence.mjs';
const ROOT='/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10ir-fixture-operator';
const SOURCE=dirname(fileURLToPath(import.meta.url));
const handles=new WeakMap();let rootStamp=null;
function stableRoot(){const d=fs.lstatSync(ROOT);need(rootStamp&&d.ino===rootStamp.ino&&d.dev===rootStamp.dev&&d.isDirectory()&&!d.isSymbolicLink()&&d.uid===process.getuid()&&(d.mode&0o777)===0o700&&fs.realpathSync(ROOT)===ROOT,'ATTEMPT_UNAVAILABLE');}
export const operatorRoot=ROOT;
function bytes(path,maximum=131072,mode=null){const s=fs.lstatSync(path);need(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1&&s.uid===process.getuid()&&(mode===null?!(s.mode&0o022):(s.mode&0o777)===mode)&&s.size>0&&s.size<=maximum,'SOURCE_MISMATCH');const fd=fs.openSync(path,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{const a=fs.fstatSync(fd);need(a.ino===s.ino&&a.dev===s.dev,'SOURCE_MISMATCH');const b=fs.readFileSync(fd);const z=fs.fstatSync(fd);need(b.length===s.size&&z.size===s.size&&z.mtimeMs===s.mtimeMs&&z.ctimeMs===s.ctimeMs,'SOURCE_MISMATCH');return b;}finally{fs.closeSync(fd);}}
export function validateFixtureApproval(raw,seal,now){seal=clone(seal);const r=clone(raw);exact(r,['schema','project','branch','branchId','scope','generation','sourceSha','ownerApprovalId','issuedAt','expiresAt','maximumCreates','maximumDatabaseConnections','triggerGraphSha256','providerEvidenceSha256','nativeWorkerSha256','nativeInventorySha256','caPath','caSha256','grantSha256','registryRoot','anchorRoot']);
 need(r.schema==='lockliel-fixture-operator-approval-v1'&&r.scope==='two-new-isolated-fixtures');for(const k of ['project','branch','branchId'])need(r[k]===IDENTITY[k]);
 need(/^[a-f0-9]{32}$/.test(r.generation)&&/^[a-f0-9]{40}$/.test(r.sourceSha)&&/^[A-Za-z0-9._:-]{1,96}$/.test(r.ownerApprovalId));
 freshness(r.issuedAt,r.issuedAt,now);need(r.expiresAt>now&&r.expiresAt-r.issuedAt<=300000&&r.maximumCreates===2&&r.maximumDatabaseConnections===2);
 for(const k of ['triggerGraphSha256','providerEvidenceSha256','nativeWorkerSha256','nativeInventorySha256','caSha256','grantSha256'])need(digest(r[k]));
 need(r.caPath===ROOT+'/supabase-ca.crt'&&r.registryRoot===ROOT+'/provenance'&&r.anchorRoot===ROOT+'/independent-head');
 need(seal.ownerApprovalId===r.ownerApprovalId&&seal.approvalSha256===sha256(canonical(r)));return freeze(r);
}
/** Evidence is an independently collected and reviewed provider projection, not
 * a browser assertion. Installation pins its exact bytes and collector identity.
 * This function validates data only; it never grants a capability. */
export function validateFixtureProviderEvidence(raw,approval,seal,now){approval=clone(approval);seal=clone(seal);const r=clone(raw);exact(r,['schema','project','branch','branchId','observedAt','collectorSourceSha','collectionReceiptSha256','operatorScope',...AUTH_HOOK_FIELDS,'authBinaryEvidence','providerIdentity','creationMechanisms','source']);
 need(r.schema==='lockliel-fixture-provider-evidence-v2'&&r.source==='independent-provider-observation'&&r.providerIdentity==='supabase-management-api');for(const k of ['project','branch','branchId'])need(r[k]===IDENTITY[k]);
 freshness(r.observedAt,r.observedAt,now);need(r.observedAt>=approval.issuedAt&&/^[a-f0-9]{40}$/.test(r.collectorSourceSha)&&digest(r.collectionReceiptSha256));
 need(r.operatorScope==='isolated-auth-admin-create-only-in-worker');for(const k of AUTH_HOOK_FIELDS)need(r[k]==='disabled');
 validateCreationMechanisms(r.creationMechanisms,approval.triggerGraphSha256);
 need(r.authBinaryEvidence==='provider-version-reviewed'&&seal.providerEvidenceSha256===approval.providerEvidenceSha256&&sha256(canonical(r))===approval.providerEvidenceSha256&&seal.collectorSourceSha===r.collectorSourceSha);return freeze(r);
}
export function loadFixtureOperatorAuthority(...args){need(args.length===0);const seal=JSON.parse(bytes(join(SOURCE,'operator-installation-seal.json')).toString());exact(seal,['schema','installed','ownerApprovalId','approvalSha256','providerEvidenceSha256','collectorSourceSha']);need(seal.schema==='lockliel-fixture-installation-v1'&&seal.installed===true,'AUTHORITY_MISSING');
 const d=fs.lstatSync(ROOT);need(d.isDirectory()&&!d.isSymbolicLink()&&d.uid===process.getuid()&&(d.mode&0o777)===0o700&&fs.realpathSync(ROOT)===ROOT,'AUTHORITY_MISSING');
 rootStamp={ino:d.ino,dev:d.dev};const now=Date.now(),approval=validateFixtureApproval(JSON.parse(bytes(ROOT+'/approval.json',16384,0o400).toString()),seal,now),evidence=validateFixtureProviderEvidence(JSON.parse(bytes(ROOT+'/provider-evidence.json',16384,0o400).toString()),approval,seal,now);
 need(sha256(bytes(ROOT+'/grant.json',16384,0o400))===approval.grantSha256,'AUTHORITY_MISSING');const h=freeze({kind:'reviewed-fixture-operator'});handles.set(h,{approval,evidence,lastWall:now,lastMono:performance.now(),consumed:false,next:0,closed:false});return h;
}
export function requireFixtureAuthority(h){const r=handles.get(h);need(r&&!r.closed,'AUTHORITY_MISSING');const wall=Date.now(),mono=performance.now();try{stableRoot();need(wall>=r.lastWall&&mono>=r.lastMono&&Math.abs(wall-r.lastWall-(mono-r.lastMono))<=1000&&wall<r.approval.expiresAt&&wall-r.evidence.observedAt<=300000,'AUTHORITY_MISSING');r.lastWall=wall;r.lastMono=mono;return r.approval;}catch{r.closed=true;throw new Error('AUTHORITY_MISSING');}}
function sync(){stableRoot();const fd=fs.openSync(ROOT,fs.constants.O_RDONLY|fs.constants.O_DIRECTORY|fs.constants.O_NOFOLLOW);try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
function exclusive(name,value){stableRoot();const fd=fs.openSync(ROOT+'/'+name,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW,0o400);try{fs.writeFileSync(fd,canonical(value));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}sync();}
export function consumeFixtureAttempt(h){const a=requireFixtureAuthority(h),r=handles.get(h);need(!r.consumed,'ATTEMPT_UNAVAILABLE');try{need(sha256(bytes(ROOT+'/grant.json',16384,0o400))===a.grantSha256);const grant=JSON.parse(bytes(ROOT+'/grant.json',16384,0o400).toString());exact(grant,['schema','project','generation','ownerApprovalId','maximumCreates']);need(grant.schema==='fixture-two-account-grant-v1'&&grant.project===IDENTITY.project&&grant.generation===a.generation&&grant.ownerApprovalId===a.ownerApprovalId&&grant.maximumCreates===2);fs.mkdirSync(ROOT+'/CONSUMED',{mode:0o700});sync();r.consumed=true;exclusive('consumption.json',{generation:a.generation,consumedAt:Date.now(),maximumCreates:2});return a;}catch{r.closed=true;throw new Error('ATTEMPT_UNAVAILABLE');}}
export function claimFixtureStep(h,step){const a=requireFixtureAuthority(h),r=handles.get(h);need(r.consumed&&step===['PRECHECK','CREATE_A','CREATE_B','POSTCHECK','FINAL'][r.next],'ATTEMPT_UNAVAILABLE');try{exclusive('step-'+r.next+'.json',{generation:a.generation,step,at:Date.now()});r.next++;}catch{r.closed=true;throw new Error('ATTEMPT_UNAVAILABLE');}}
export function finishFixtureAttempt(h,status){const r=handles.get(h);need(r?.consumed&&['PASS','BLOCKED','PARTIAL','AMBIGUOUS'].includes(status)&&(status!=='PASS'||r.next===5),'ATTEMPT_UNAVAILABLE');try{exclusive('outcome.json',{generation:r.approval.generation,status,at:Date.now()});}finally{r.closed=true;}}
export function fixtureOperatorReadiness(){return freeze({installed:false,liveExecutionEnabled:false,sourcePinnedInstallationImplemented:true,durableConsumptionImplemented:true,providerEvidenceAcquisition:'SEPARATELY_REVIEWED_INDEPENDENT_COLLECTOR_REQUIRED',diagnosticAllowance:'CONSUMED',deploymentReservation:'UNUSED'});}
/** Append-only coordinator copy of every private registry head before another
 * action. It contains digests and lifecycle sequencing, never credentials. */
export function recordFixtureCheckpoint(h,checkpoint){const r=handles.get(h);need(r?.consumed,'ATTEMPT_UNAVAILABLE');const c=clone(checkpoint);exact(c,['schema','generation','sequence','headSha256','anchorSha256']);need(c.schema==='lockliel-fixture-provenance-checkpoint-v1'&&c.generation===r.approval.generation&&Number.isSafeInteger(c.sequence)&&c.sequence>=0&&digest(c.headSha256)&&digest(c.anchorSha256));exclusive('provenance-head-'+c.sequence+'.json',c);}
export function requireFixtureOperation(h,operation){const a=requireFixtureAuthority(h),r=handles.get(h);const expected={INPUT:1,BEFORE:1,CREATE_A:2,CREATE_B:3,AFTER:4};need(r.consumed&&Object.hasOwn(expected,operation)&&r.next===expected[operation],'ATTEMPT_UNAVAILABLE');return a;}
