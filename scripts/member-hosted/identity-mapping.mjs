/** Exact synthetic identities, never credentials. This module performs no network
 * operation. A JSON claim or synthetic fixture cannot issue a live capability. */
import {createHash} from 'node:crypto';
import {open,lstat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname} from 'node:path';
import {types} from 'node:util';
import {performance} from 'node:perf_hooks';

const PROJECT='qjksggxorghaxvpyslip',BRANCH='course-cutover-rehearsal-274';
const BRANCH_ID='7091bfd6-83ce-4c11-ac30-8ce85e09be2d';
const VERSION='lockliel-synthetic-identity-mapping-v1';
const PRIVATE_PATH='/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10im-qjks-identities/approved-mapping.json';
// Installation requires separate review of exact independently approved evidence
// and its artifact digest. No live identity approval is installed in Wave10I-M.
const REVIEWED_APPROVAL=null;
const MAX_MAPPING_AGE=86400000,MAX_OBSERVATION_AGE=300000,MAX_BYTES=8192;
const liveMappings=new WeakMap(),syntheticMappings=new WeakMap();
const denied=()=>{throw Error('Protected synthetic identity mapping denied.');};
const need=value=>{if(!value)denied();};
const hash=value=>createHash('sha256').update(value).digest('hex');
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
function safe(value,depth=0){
 need(depth<12);
 if(value===null||typeof value==='boolean')return value;
 if(typeof value==='string'){need(value.length<=4096);return value;}
 if(typeof value==='number'){need(Number.isSafeInteger(value));return value;}
 need(value&&typeof value==='object'&&!types.isProxy(value));
 const array=Array.isArray(value);need(Object.getPrototypeOf(value)===(array?Array.prototype:Object.prototype));
 const descriptors=Object.getOwnPropertyDescriptors(value),out=array?[]:{};
 need(Reflect.ownKeys(descriptors).length<=64);
 for(const key of Reflect.ownKeys(descriptors)){
  need(typeof key==='string');if(array&&key==='length')continue;
  const d=descriptors[key];need(d.enumerable&&Object.hasOwn(d,'value')&&key!=='__proto__');
  if(array)need(/^(0|[1-9][0-9]*)$/.test(key)&&Number(key)<value.length);
  out[key]=safe(d.value,depth+1);
 }
 if(array)need(out.length===value.length&&Object.keys(out).length===value.length);
 return out;
}
const exact=(value,keys)=>{need(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key)));};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
function canonical(value){
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
 return JSON.stringify(value);
}
function validateArtifact(input,approval,now){
 const value=safe(input),seal=safe(approval);
 exact(value,['version','project','branch','branchId','issuedAt','expiresAt','evidence','subjects']);
 exact(seal,['artifactSha256','mappingSha256','recordSha256','approvalId','issuedAt','expiresAt']);
 need(digest(seal.artifactSha256)&&digest(seal.mappingSha256)&&digest(seal.recordSha256));
 need(value.version===VERSION&&value.project===PROJECT&&value.branch===BRANCH&&value.branchId===BRANCH_ID);
 need(Number.isSafeInteger(now)&&Number.isSafeInteger(value.issuedAt)&&Number.isSafeInteger(value.expiresAt));
 need(value.issuedAt<=now&&value.expiresAt>now&&value.expiresAt-value.issuedAt>0&&value.expiresAt-value.issuedAt<=MAX_MAPPING_AGE);
 need(seal.issuedAt===value.issuedAt&&seal.expiresAt===value.expiresAt);
 exact(value.evidence,['source','approvalId','recordSha256','verifiedAt']);
 const e=value.evidence;need(e.source==='independent-approved-synthetic-fixture-record');
 need(typeof e.approvalId==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/.test(e.approvalId));
 need(digest(e.recordSha256)&&e.recordSha256===seal.recordSha256&&e.approvalId===seal.approvalId);
 need(Number.isSafeInteger(e.verifiedAt)&&e.verifiedAt<=value.issuedAt&&value.issuedAt-e.verifiedAt<=MAX_MAPPING_AGE);
 need(Array.isArray(value.subjects)&&value.subjects.length===2);
 for(const [index,row] of value.subjects.entries()){
  exact(row,['label','subjectSha256','profileSha256','createdAtSha256','loginSha256']);
  need(row.label===['A','B'][index]);
  for(const key of ['subjectSha256','profileSha256','createdAtSha256','loginSha256'])need(digest(row[key]));
 }
 for(const key of ['subjectSha256','profileSha256','createdAtSha256','loginSha256'])need(value.subjects[0][key]!==value.subjects[1][key]);
 need(hash(canonical(value))===seal.mappingSha256);
 return freeze({artifact:value,seal});
}
function observe(record,input,now){
 const value=safe(input);exact(value,['project','branch','mappingSha256','provenanceEvidenceSha256','observedStartedAt','observedAt','subjects']);
 need(value.project===PROJECT&&value.branch===BRANCH&&value.mappingSha256===record.seal.mappingSha256&&value.provenanceEvidenceSha256===record.seal.recordSha256);
 need(Number.isSafeInteger(now)&&Number.isSafeInteger(value.observedStartedAt)&&Number.isSafeInteger(value.observedAt)&&value.observedStartedAt>=record.loadedAt&&value.observedStartedAt<=value.observedAt&&value.observedAt<=now);
 need(now-value.observedStartedAt<=MAX_OBSERVATION_AGE&&now<record.artifact.expiresAt&&now-record.loadedAt<=MAX_OBSERVATION_AGE);
 need(Array.isArray(value.subjects)&&value.subjects.length===2);
 for(const [index,row]of value.subjects.entries()){
  exact(row,['label','subjectSha256','profileSha256','createdAtSha256','loginSha256','profileCount','confirmed','staffRoleCount']);
  const expected=record.artifact.subjects[index];
  need(row.label===expected.label&&row.profileCount===1&&row.confirmed===true&&row.staffRoleCount===0);
  for(const key of ['subjectSha256','profileSha256','createdAtSha256','loginSha256'])need(row[key]===expected[key]);
 }
 return freeze({project:PROJECT,branch:BRANCH,labels:['A','B'],mappingSha256:record.seal.mappingSha256,
  provenanceEvidenceSha256:record.seal.recordSha256,subjectsMatched:true,profileBindingVerified:true,
  ordinaryMembersOnly:true,providerAuthority:false,requiresTrustedNativeChannel:true});
}
function recordFor(handle){const record=liveMappings.get(handle);need(record);return record;}
function clockFor(record){
 need(!record.invalid);const wall=Date.now(),mono=performance.now();
 if(wall<record.lastWall||mono<record.lastMono||Math.abs((wall-record.lastWall)-(mono-record.lastMono))>1000){record.invalid=true;denied();}
 record.lastWall=wall;record.lastMono=mono;return wall;
}
/** No options/path/approval injection. The fixed source-reviewed approval must be
 * installed by a later reviewed change. Missing approval stops before file access. */
export async function loadReviewedIdentityMapping(...args){
 need(args.length===0&&REVIEWED_APPROVAL!==null);let file,bytes,buffer;
 try{
  const parent=await lstat(dirname(PRIVATE_PATH));need(parent.isDirectory()&&!parent.isSymbolicLink()&&parent.uid===process.getuid()&&(parent.mode&0o777)===0o700);
  const status=await lstat(PRIVATE_PATH);need(status.isFile()&&!status.isSymbolicLink()&&status.uid===process.getuid()&&(status.mode&0o777)===0o600&&status.nlink===1&&status.size>0&&status.size<=MAX_BYTES);
  file=await open(PRIVATE_PATH,constants.O_RDONLY|constants.O_NOFOLLOW);
  const before=await file.stat();need(before.ino===status.ino&&before.dev===status.dev&&before.size===status.size&&before.mtimeMs===status.mtimeMs);
  buffer=Buffer.alloc(MAX_BYTES+1);const read=await file.read(buffer,0,buffer.length,0);bytes=buffer.subarray(0,read.bytesRead);need(bytes.length===before.size&&bytes.length<=MAX_BYTES&&hash(bytes)===REVIEWED_APPROVAL.artifactSha256);
  const afterParent=await lstat(dirname(PRIVATE_PATH));need(afterParent.ino===parent.ino&&afterParent.dev===parent.dev&&!afterParent.isSymbolicLink()&&(afterParent.mode&0o777)===0o700);
  const after=await file.stat();need(after.ino===before.ino&&after.size===before.size&&after.mtimeMs===before.mtimeMs&&after.ctimeMs===before.ctimeMs);
  const now=Date.now(),record=validateArtifact(JSON.parse(bytes.toString('utf8')),REVIEWED_APPROVAL,now);
  const handle=Object.freeze({kind:'protected-identity-mapping'});
  liveMappings.set(handle,{...record,loadedAt:now,lastWall:now,lastMono:performance.now(),invalid:false});return handle;
 }catch{denied();}finally{buffer?.fill(0);bytes?.fill(0);try{await file?.close();}catch{denied();}}
}
export function identityMappingReadiness(...args){need(args.length===0);return freeze({project:PROJECT,branch:BRANCH,state:'UNVERIFIED',liveApprovalInstalled:false,requiresSeparateHostedVerification:true});}
export function identityMappingSummary(handle){const r=recordFor(handle),now=clockFor(r);need(now<r.artifact.expiresAt&&now-r.loadedAt<=MAX_OBSERVATION_AGE);return freeze({project:PROJECT,branch:BRANCH,labels:['A','B'],mappingSha256:r.seal.mappingSha256,sourcePinned:true,providerAuthority:false});}
/** Digest-only private process transfer. No raw identity, email or session value. */
export function privateIdentityMappingPayload(handle){const r=recordFor(handle);identityMappingSummary(handle);return r.artifact;}
export function reviewNativeIdentityObservation(handle,value){const r=recordFor(handle);need(!r.observationUsed);r.observationUsed=true;try{return observe(r,value,clockFor(r));}catch{r.invalid=true;denied();}}
/** Explicit offline fixture capability. It cannot be used by any live API. */
export function createSyntheticIdentityMappingFixture(options){
 const o=safe(options);exact(o,['artifact','approval','now']);
 const record=validateArtifact(o.artifact,o.approval,o.now);
 need(hash(Buffer.from(JSON.stringify(o.artifact)))===o.approval.artifactSha256);
 const handle=Object.freeze({kind:'synthetic-identity-mapping',syntheticOnly:true});
 syntheticMappings.set(handle,{...record,loadedAt:o.now,lastNow:o.now,invalid:false});return handle;
}
export function reviewSyntheticIdentityObservation(handle,value,now){
 const r=syntheticMappings.get(handle);need(r&&!r.invalid&&!r.observationUsed);r.observationUsed=true;
 if(!Number.isSafeInteger(now)||now<r.lastNow){r.invalid=true;denied();}r.lastNow=now;
 try{return freeze({...observe(r,value,now),syntheticOnly:true,liveAuthority:false});}catch{r.invalid=true;denied();}
}
