/** One source-pinned child channel, no ambient/native input or I/O on import. */
import {spawn} from 'node:child_process';
import {types} from 'node:util';
import {performance} from 'node:perf_hooks';
import {createHash,randomBytes} from 'node:crypto';
import {readFile,lstat,realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {privateIdentityMappingPayload,identityMappingSummary} from './identity-mapping.mjs';
import {requireReviewedOperatorAuthority} from './operator-authority.mjs';
const PYTHON='/Library/Developer/CommandLineTools/usr/bin/python3';
const PROJECT='qjksggxorghaxvpyslip';
const proofs=new WeakMap();
const need=x=>{if(!x)throw Error('Protected native preflight channel denied.');};
const hash=b=>createHash('sha256').update(b).digest('hex');
async function pinned(path,digest){const target=path===PYTHON?await realpath(path):path;if(path===PYTHON)need(target==='/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3.9');const s=await lstat(target);need(s.isFile()&&!s.isSymbolicLink()&&[0,process.getuid()].includes(s.uid)&&!(s.mode&0o022)&&s.size<=(path===PYTHON?20000000:2000000));const bytes=await readFile(target);need(hash(bytes)===digest);return bytes;}
function validate(value,{nonce,mapping,startedAt,finishedAt,baseline}){
 need(value?.ok===true&&value.attemptConsumed===true);const r=value.receipt;
 need(r?.version==='lockliel-deployment-native-preflight-v2'&&r.source==='direct-native-deployment-preflight'&&r.runNonce===nonce);
 need(Number.isSafeInteger(r.observedStartedAt)&&Number.isSafeInteger(r.observedAt)&&r.observedStartedAt>=startedAt&&r.observedAt>=r.observedStartedAt&&r.observedAt<=finishedAt&&finishedAt-startedAt<=300000);
 need(r.project===PROJECT&&r.host===`db.${PROJECT}.supabase.co`&&r.database==='postgres');
 for(const field of ['startupOptionsVerified','tlsVerifyFull','hostnameVerified','directIPv6','samePhysicalConnection','sameTransaction','noReconnect','noDataWrites','rolledBack','connectionClosed','nativeInventoryVerified','syntheticProvenanceVerified','currentSessionCatalogVerified','requiredColumnGrantsVerified'])need(r[field]===true);
 need(['TLSv1.2','TLSv1.3'].includes(r.tlsVersion)&&typeof r.cipher==='string'&&r.cipher.length>0&&r.cipher.length<129&&Number.isSafeInteger(r.backendPid)&&r.backendPid>0&&typeof r.transactionStartedAt==='string');
 need(r.transactionReadOnly==='on'&&r.lockTimeout==='5s'&&r.statementTimeout==='30s'&&r.inspectionQueries===8&&r.witnessQueries===17&&r.totalStatements===27);
 need(r.ledger===280&&r.paused===true&&r.schemaReady===true&&r.protocol==='278-v1'&&r.rlsAll===true&&r.notesServiceTablePrivileges===0&&r.notesServiceColumnPrivileges===0);
 need(r.deploymentReady===false&&r.callerRestVerified===false&&r.branchIdentity?.fresh===false&&r.branchIdentity.branch==='course-cutover-rehearsal-274'&&r.branchIdentity.branchId==='7091bfd6-83ce-4c11-ac30-8ce85e09be2d');
 for(const key of ['versionsSha256','migration280StatementsArrayTextMd5','migration280SourceSha256'])need(r.baseline?.[key]===baseline[key]);
 need(r.catalogSha256===baseline.catalogSha256&&r.securitySha256==='0e4fa8073cabb5985bc963fe2fd17a9d428417b50bd6e9451622f2d882e44c31');
 const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
 need(r.mappingSha256===hash(canonical(mapping))&&r.provenanceRecordSha256===mapping.evidence.recordSha256&&JSON.stringify(r.subjectsVerified)==='["A","B"]');
 return Object.freeze({source:'authenticated-read-only-provider-inspection',project:PROJECT,observedAt:r.observedAt,observedStartedAt:r.observedStartedAt,ledger:280,paused:true,schemaReady:true,protocol:'278-v1',baseline:Object.freeze({...r.baseline}),currentSessionCatalogVerified:true,requiredColumnGrantsVerified:true,callerRestVerified:false,rlsAll:true,notesServiceTablePrivileges:0,notesServiceColumnPrivileges:0,mappingSha256:r.mappingSha256,nativeVersion:r.version});
}
/** Only a live mapping capability and source-verified operator seal are accepted.
 * The seal is loaded by the zero-option trusted root, never browser/caller JSON.
 * This function is not itself an authority issuer or a deployment launcher. */
export async function collectPinnedNativePreflight(mappingHandle,authorityHandle){
 const authority=requireReviewedOperatorAuthority(authorityHandle);const seal={nativeWorkerSha256:authority.nativeWorkerSha256,nativeManifestSha256:authority.nativeManifestSha256};
 const mapping=privateIdentityMappingPayload(mappingHandle);identityMappingSummary(mappingHandle);
 need(['isolated-preflight-only','isolated-deployment-and-acceptance'].includes(authority.scope));
 await pinned('/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10im-deployment-preflight-authorization.json',authority.nativePermitSha256);
 const path=fileURLToPath(new URL('./deployment_native_worker.py',import.meta.url));
 await pinned(PYTHON,'bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e');
 await pinned(path,seal.nativeWorkerSha256);await pinned(fileURLToPath(new URL('./deployment-native-worker-manifest.json',import.meta.url)),seal.nativeManifestSha256);
 const baseline=JSON.parse(await readFile(new URL('./deployment-preflight-baseline.json',import.meta.url),'utf8'));
 need(hash(await readFile(new URL('./deployment-preflight-baseline.json',import.meta.url)))==='1b17b93a1c4d21d19cda04cd62c57785f276797c929fd5906c90b75ecf39e8ae');
 const nonce=randomBytes(16).toString('hex'),startedAt=Date.now(),startedMono=performance.now();const payload=Buffer.from(JSON.stringify({runNonce:nonce,identityMapping:mapping}));need(payload.length<=16384);
 let bytes;
 try{
  bytes=await new Promise((resolve,reject)=>{
   let settled=false,size=0;const chunks=[];const child=spawn(PYTHON,['-I','-B','-S',path,'--private-operator-channel'],{env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},stdio:['pipe','pipe','ignore']});
   const timer=setTimeout(()=>{child.kill('SIGTERM');finish(false);},180000);
   function finish(ok){if(settled)return;settled=true;clearTimeout(timer);if(ok)resolve(Buffer.concat(chunks));else reject(Error('Protected native preflight channel denied.'));for(const part of chunks)part.fill(0);}
   child.stdout.on('data',part=>{if(!Buffer.isBuffer(part)||(size+=part.length)>32768){child.kill('SIGTERM');finish(false);return;}chunks.push(Buffer.from(part));part.fill(0);});
   child.stdout.on('error',()=>{child.kill('SIGTERM');finish(false);});child.stdin.on('error',()=>{child.kill('SIGTERM');finish(false);});child.on('error',()=>finish(false));child.on('close',(code,signal)=>finish(code===0&&signal===null));child.stdin.end(payload);
  });
  requireReviewedOperatorAuthority(authorityHandle);const safe=validate(JSON.parse(bytes.toString('utf8')),{nonce,mapping,startedAt,finishedAt:Date.now(),baseline});const handle=Object.freeze({kind:'native-preflight-proof'});proofs.set(handle,{value:safe,used:false,startedAt,startedMono,lastWall:Date.now(),lastMono:performance.now(),invalid:false});return handle;
 }catch{throw Error('Protected native preflight channel denied.');}finally{payload.fill(0);bytes?.fill(0);}
}
export function consumePinnedNativePreflight(handle){const p=proofs.get(handle);need(p&&!p.used&&!p.invalid);const wall=Date.now(),mono=performance.now();try{need(wall>=p.lastWall&&mono>=p.lastMono&&wall>=p.startedAt&&wall-p.startedAt<=300000&&mono-p.startedMono<=300000&&Math.abs((wall-p.startedAt)-(mono-p.startedMono))<=1000);p.used=true;return p.value;}catch{p.invalid=true;throw Error('Protected native preflight channel denied.');}}
function safe(v,depth=0){need(depth<24);if(v===null||typeof v==='string'||typeof v==='boolean')return v;if(typeof v==='number'){need(Number.isFinite(v));return v;}need(v&&typeof v==='object'&&!types.isProxy(v));const array=Array.isArray(v);need(Object.getPrototypeOf(v)===(array?Array.prototype:Object.prototype));const out=array?[]:{},ds=Object.getOwnPropertyDescriptors(v);for(const key of Reflect.ownKeys(ds)){need(typeof key==='string');if(array&&key==='length')continue;const d=ds[key];need(d.enumerable&&Object.hasOwn(d,'value')&&key!=='__proto__');out[key]=safe(d.value,depth+1);}return out;}
/** Strict data-only offline review, never a live capability. */
export function reviewSyntheticNativeChannel(value,options){try{return Object.freeze({syntheticOnly:true,liveAuthority:false,value:validate(safe(value),safe(options))});}catch{throw Error('Protected native preflight channel denied.');}}
