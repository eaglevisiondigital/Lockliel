/** Owner-installed nonsecret execution seal. No creation/reset/installation API.
 * Source approval is deliberately absent today. Local fixtures are never authority. */
import {open,lstat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname} from 'node:path';
import {performance} from 'node:perf_hooks';
import {types} from 'node:util';
const PRIVATE='/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10im-operator/approved-operator.json';
const REVIEWED_INSTALLATION=null;
const handles=new WeakMap(),offline=new WeakMap();
const need=x=>{if(!x)throw Error('Reviewed isolated operator authority denied.');};
function safe(v,depth=0){need(depth<16);if(v===null||typeof v==='string'||typeof v==='boolean')return v;if(typeof v==='number'){need(Number.isFinite(v));return v;}need(v&&typeof v==='object'&&!types.isProxy(v));const array=Array.isArray(v);need(Object.getPrototypeOf(v)===(array?Array.prototype:Object.prototype));const out=array?[]:{},ds=Object.getOwnPropertyDescriptors(v);need(Reflect.ownKeys(ds).length<256);for(const key of Reflect.ownKeys(ds)){need(typeof key==='string');if(array&&key==='length')continue;const d=ds[key];need(d.enumerable&&Object.hasOwn(d,'value')&&key!=='__proto__');out[key]=safe(d.value,depth+1);}return out;}
const hash=b=>createHash('sha256').update(b).digest('hex');
const canonical=v=>v&&typeof v==='object'&&!Array.isArray(v)?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':Array.isArray(v)?'['+v.map(canonical).join(',')+']':JSON.stringify(v);
function validate(r,approval,now){
 need(r&&Object.getPrototypeOf(r)===Object.prototype&&Object.keys(r).sort().join()===['version','project','branch','site','account','applicationSource','toolingSource','scope','operatorId','nativeWorkerSha256','nativeManifestSha256','nativePermitSha256','issuedAt','expiresAt','ownerApprovalId','sourceHashes'].sort().join());
 need(r.version==='lockliel-reviewed-operator-v1'&&r.project==='qjksggxorghaxvpyslip'&&r.branch==='course-cutover-rehearsal-274'&&r.site==='70b03a42-6329-476e-bf4b-2b1ce30e9567'&&r.account==='6a674f7a0e2cdcc2b838db89'&&r.applicationSource==='327ba098628f70aa65140862b8b14cd709bfd711'&&r.toolingSource==='51857e44642ac79a4b1f458de786b97d98762082');
 need(['isolated-preflight-only','isolated-deployment-and-acceptance'].includes(r.scope)&&typeof r.operatorId==='string'&&/^[a-f0-9]{24}$/.test(r.operatorId));
 need(Number.isSafeInteger(now)&&Number.isSafeInteger(r.issuedAt)&&Number.isSafeInteger(r.expiresAt)&&r.issuedAt<=now&&now<r.expiresAt&&r.expiresAt-r.issuedAt>0&&r.expiresAt-r.issuedAt<=300000);
 need(typeof r.ownerApprovalId==='string'&&/^[A-Za-z0-9._:-]{1,96}$/.test(r.ownerApprovalId)&&r.ownerApprovalId===approval.ownerApprovalId);
 for(const field of ['nativeWorkerSha256','nativeManifestSha256','nativePermitSha256'])need(typeof r[field]==='string'&&/^[a-f0-9]{64}$/.test(r[field]));
 need(hash(canonical(r))===approval.canonicalSha256);
 need(r.sourceHashes&&Object.getPrototypeOf(r.sourceHashes)===Object.prototype&&Object.keys(r.sourceHashes).length>=8&&Object.keys(r.sourceHashes).length<=64);
 for(const [path,digest]of Object.entries(r.sourceHashes))need(/^(?:scripts\/member-hosted\/[A-Za-z0-9._-]+|netlify\/member-hosted\/[A-Za-z0-9._-]+|netlify\/lib\/member-read-binding\.mjs)$/.test(path)&&typeof digest==='string'&&/^[a-f0-9]{64}$/.test(digest));
 return Object.freeze({...r,sourceHashes:Object.freeze({...r.sourceHashes})});
}
export async function loadReviewedOperatorAuthority(...args){
 need(args.length===0&&REVIEWED_INSTALLATION!==null);let fd,raw;
 try{const dir=await lstat(dirname(PRIVATE));need(dir.isDirectory()&&!dir.isSymbolicLink()&&dir.uid===process.getuid()&&(dir.mode&0o777)===0o700);
  fd=await open(PRIVATE,constants.O_RDONLY|constants.O_NOFOLLOW);const before=await fd.stat();need(before.isFile()&&before.uid===process.getuid()&&(before.mode&0o777)===0o400&&before.nlink===1&&before.size>0&&before.size<=16384);
  raw=Buffer.alloc(16385);const {bytesRead}=await fd.read(raw,0,raw.length,0);need(bytesRead===before.size&&hash(raw.subarray(0,bytesRead))===REVIEWED_INSTALLATION.artifactSha256);
  const after=await fd.stat(),d=await lstat(dirname(PRIVATE));need(after.ino===before.ino&&after.size===before.size&&after.mtimeMs===before.mtimeMs&&d.ino===dir.ino&&d.dev===dir.dev&&!d.isSymbolicLink());
  const value=validate(JSON.parse(raw.subarray(0,bytesRead).toString('utf8')),REVIEWED_INSTALLATION,Date.now());const handle=Object.freeze({kind:'reviewed-operator-authority'});handles.set(handle,{value,loadedAt:Date.now(),lastWall:Date.now(),lastMono:performance.now(),invalid:false});return handle;
 }catch{throw Error('Reviewed isolated operator authority denied.');}finally{raw?.fill(0);await fd?.close();}
}
export function requireReviewedOperatorAuthority(handle){const r=handles.get(handle);need(r&&!r.invalid);const wall=Date.now(),mono=performance.now();try{need(Number.isSafeInteger(wall)&&wall>=r.lastWall&&mono>=r.lastMono&&Math.abs((wall-r.lastWall)-(mono-r.lastMono))<=1000&&wall-r.loadedAt<=300000&&wall>=r.value.issuedAt&&wall<r.value.expiresAt);r.lastWall=wall;r.lastMono=mono;return r.value;}catch{r.invalid=true;throw Error('Reviewed isolated operator authority denied.');}}
export function operatorInstallationReadiness(...args){need(args.length===0);return Object.freeze({installed:false,state:'UNVERIFIED',requiresSeparateOwnerInstallation:true});}
/** Strict fixture review has a different capability domain and cannot be executed. */
export function reviewSyntheticOperatorAuthority(record,approval,now){let value;try{value=validate(safe(record),safe(approval),now);}catch{throw Error('Reviewed isolated operator authority denied.');}const handle=Object.freeze({syntheticOnly:true,liveAuthority:false});offline.set(handle,value);return handle;}
