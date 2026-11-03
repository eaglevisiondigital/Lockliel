/** Local preparation only. Does not import the operator, load private approvals,
 * create a usable grant, prompt, execute a worker or contact any provider. */
import {readFile,lstat,writeFile,mkdir,mkdtemp,chmod,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify,types} from 'node:util';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';
const run=promisify(execFile);
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const SOURCE='d51b90db66d5fc650e7b5139a8a5787ba6a994ac';
const APPLICATION='327ba098628f70aa65140862b8b14cd709bfd711';
const SEAL='scripts/member-hosted/operator-source-seal.mjs';
const EXTRAS=[SEAL,'scripts/member-hosted/operator-binding-launch.command','scripts/member-hosted/deployment_native_launch.command','scripts/member-hosted/recovery-runtime-SHA256SUMS'];
const SEALED_HASH='b58bb57de86b9c221ac4edb8225e1e1e4d320041b786468eab2e3d589982fd7f';
const need=x=>{if(!x)throw Error('Offline operator installation preparation denied.');};
const sha=x=>createHash('sha256').update(x).digest('hex');
const safeName=x=>typeof x==='string'&&/^(?:scripts\/member-hosted\/[A-Za-z0-9._-]+|netlify\/member-hosted\/[A-Za-z0-9._-]+|netlify\/lib\/member-read-binding\.mjs)$/.test(x);
async function blob(name){need(safeName(name));const {stdout}=await run('/usr/bin/git',['--no-replace-objects','-c','core.hooksPath=/dev/null','-C',ROOT,'cat-file','blob',`${SOURCE}:${name}`],{env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'},encoding:'buffer',maxBuffer:2000000});return stdout;}
async function ownedSource(name){need(safeName(name));const path=join(ROOT,name),s=await lstat(path);need(s.isFile()&&!s.isSymbolicLink()&&s.uid===process.getuid()&&s.nlink===1&&!(s.mode&0o022)&&s.size>0&&s.size<=2000000);const bytes=await readFile(path),after=await lstat(path);need(s.dev===after.dev&&s.ino===after.ino&&s.size===after.size&&s.mtimeMs===after.mtimeMs&&bytes.length===s.size);return bytes;}
function ownData(value,depth=0){need(depth<8);if(value===null||typeof value==='string'||typeof value==='boolean')return value;if(typeof value==='number'){need(Number.isSafeInteger(value));return value;}need(value&&typeof value==='object'&&!types.isProxy(value));const array=Array.isArray(value);need(Object.getPrototypeOf(value)===(array?Array.prototype:Object.prototype));const out=array?[]:{},ds=Object.getOwnPropertyDescriptors(value);need(Reflect.ownKeys(ds).length<=64);for(const key of Reflect.ownKeys(ds)){need(typeof key==='string');if(array&&key==='length')continue;const d=ds[key];need(d.enumerable&&Object.hasOwn(d,'value')&&key!=='__proto__');out[key]=ownData(d.value,depth+1);}return out;}
function manifest(files){return {version:'lockliel-offline-installation-preparation-v1',source:SOURCE,application:APPLICATION,site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',state:'PREPARATION_ONLY',executionAuthorized:false,operatorApproval:null,identityApproval:null,usableGrantCreated:false,jAllowance:'CONSUMED',applicationReservation:'UNUSED',files};}
export function reviewPreparationManifest(value){
 const r=ownData(value),expected=manifest({});need(Object.keys(r).sort().join()===Object.keys(expected).sort().join());for(const key of Object.keys(expected))if(key!=='files')need(r[key]===expected[key]);
 need(r.files&&Object.getPrototypeOf(r.files)===Object.prototype&&Object.keys(r.files).length===40);for(const [name,digest]of Object.entries(r.files))need(safeName(name)&&typeof digest==='string'&&/^[a-f0-9]{64}$/.test(digest));need(EXTRAS.every(name=>Object.hasOwn(r.files,name))&&r.files[SEAL]===SEALED_HASH);
 return Object.freeze({preparationOnly:true,liveAuthority:false,files:40});
}
async function inventory(){
 const seal=await ownedSource(SEAL);need(sha(seal)===SEALED_HASH&&seal.equals(await blob(SEAL)));
 // Parse the reviewed data-only literal without evaluating source or importing it.
 const names=[...seal.toString('utf8').matchAll(/^ '([^']+)':'([a-f0-9]{64})',$/gm)];need(names.length===36&&new Set(names.map(x=>x[1])).size===36);const pins=Object.fromEntries(names.map(x=>[x[1],x[2]]));const files={},buffers=new Map();
 for(const name of [...new Set([...Object.keys(pins),...EXTRAS])].sort()){const bytes=await ownedSource(name),original=await blob(name);need(bytes.equals(original)&&(!pins[name]||sha(bytes)===pins[name]));files[name]=sha(bytes);buffers.set(name,bytes);}
 need(buffers.size===40);const result=manifest(files);reviewPreparationManifest(result);
 // The package stays disabled; no new approval is inferred from exact bytes.
 need(buffers.get('scripts/member-hosted/operator-authority.mjs').includes(Buffer.from('const REVIEWED_INSTALLATION=null;'))&&buffers.get('scripts/member-hosted/identity-mapping.mjs').includes(Buffer.from('const REVIEWED_APPROVAL=null;')));
 const native=JSON.parse(buffers.get('scripts/member-hosted/deployment-native-worker-manifest.json').toString('utf8'));need(native.executionAuthorized===false&&native.operatorSeal===null&&native.identityApproval===null&&native.project===result.project);
 return {result,buffers};
}
export async function auditReviewedInstallationSource(...args){need(args.length===0);try{const {result}=await inventory();return Object.freeze({...result,sourceVerified:true,dependencies:'Runtime/dependency bytes require the retained offline bootstrap verification',privateArtifactsAccessed:false,credentialsRequested:false,connectionsOpened:0});}catch{throw Error('Offline operator installation preparation denied.');}}
export async function stageReviewedInstallationPreparation(...args){need(args.length===0);let target;
 try{const {result,buffers}=await inventory();const tmp=await lstat('/private/tmp');need(tmp.isDirectory()&&!tmp.isSymbolicLink());target=await mkdtemp('/private/tmp/lockliel-wave10in-preparation-');await chmod(target,0o700);
  for(const [name,bytes]of buffers){const path=join(target,name);await mkdir(dirname(path),{recursive:true,mode:0o700});await writeFile(path,bytes,{flag:'wx',mode:0o400});need(sha(await readFile(path))===result.files[name]);}
  await writeFile(join(target,'PREPARATION_ONLY.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o400});reviewPreparationManifest(JSON.parse(await readFile(join(target,'PREPARATION_ONLY.json'),'utf8')));
  return Object.freeze({ok:true,preparationOnly:true,liveExecutionAuthorized:false,path:target,files:40,source:SOURCE,credentialsRequested:false,privateArtifactsAccessed:false,connectionsOpened:0,grantCreated:false});
 }catch{if(target)await rm(target,{recursive:true,force:true});throw Error('Offline operator installation preparation denied.');}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{need(process.argv.length===3);const mode=process.argv[2];need(mode==='--audit'||mode==='--stage');const result=mode==='--audit'?await auditReviewedInstallationSource():await stageReviewedInstallationPreparation();console.log(JSON.stringify(result));}
 catch{console.log(JSON.stringify({ok:false,errorCode:'OFFLINE_INSTALLATION_PREPARATION_DENIED'}));process.exitCode=1;}
}
