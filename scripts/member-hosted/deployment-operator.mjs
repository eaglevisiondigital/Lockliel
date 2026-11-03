/** Preparation-only trusted composition. No import connects, prompts, installs,
 * consumes a grant or creates a remote resource. Offline fixture capabilities
 * cannot cross into the private live authority domain. Live activation is held.
 */
import {request as officialHttpsRequest} from 'node:https';
import {createHash,randomBytes} from 'node:crypto';
import {readFile,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {types} from 'node:util';
import {createProtectedApiTransport,createDeploymentOperator,readHiddenCredential,disposeCredential,
  APPROVED_SOURCE,APPROVED_SITE,APPROVED_PROJECT} from './uploader.mjs';
import {createProviderReceiptReader,createRouteReceiptObserver} from './provider-receipts.mjs';
import {verifyProviderBinding} from './verify.mjs';
import {createDeploymentEvidenceRegistry,assessAalEvidence,AAL_EVIDENCE_MATRIX} from './deployment-evidence.mjs';

export const OPERATOR_IDENTITY=Object.freeze({source:APPROVED_SOURCE,site:APPROVED_SITE,project:APPROVED_PROJECT});
const BRANCH='course-cutover-rehearsal-274';
const BRANCH_ID='7091bfd6-83ce-4c11-ac30-8ce85e09be2d';
const DENIED='Trusted isolated deployment operator denied.';
const need=x=>{if(!x)throw Error(DENIED);};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const SECURITY_SHA='0e4fa8073cabb5985bc963fe2fd17a9d428417b50bd6e9451622f2d882e44c31';
const seals=Object.freeze({
 'verify.mjs':'e5255bb5e9e291bf8c3dab3b373356394b454305b1df331eaf4419a6c94f7cc6',
 'package.mjs':'dd7722c7492378862dd64fad2033e79975e0d9c1d08f0020bdec34270d39fafa',
 'uploader.mjs':'6f132ce8406a20c34eeff0c2e2eed63c913d5bd75647ac1fb9e6829ad7626d0c',
 'provider-receipts.mjs':'8844ca07f62a6da2f3e1e0226991f0b55c94d6048b7e0d481f45978adb69ef80',
 'database_preflight.py':'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba',
 'deployment_database_preflight.py':'c367e660e07d42286ec1be321fd65593a82aa2ad85bd883383b677cd139e75db',
 'deployment-preflight-baseline.json':'1b17b93a1c4d21d19cda04cd62c57785f276797c929fd5906c90b75ecf39e8ae',
 'deployment-evidence.mjs':'feca6917bab530e38d0ec64b35e35b4226009e68f3443b964ccc1572fde335f1',
});
const holds=Object.freeze(['EXECUTION_AUTHORITY_NOT_INSTALLED','SYNTHETIC_IDENTITY_BASELINE_MISSING',
 'FRESH_PROVIDER_OPERATOR_BINDING_REQUIRED','PROTECTED_NATIVE_WORKER_BINDING_REQUIRED',
 'CALLER_REST_ACCEPTANCE_NOT_YET_OBSERVED','FRESH_NEGATIVE_AAL_EVIDENCE_REQUIRED']);
// Functions are captured internally, never replaced by an exported options bag.
// Deliberately no live executor yet: source/authority/native/fixture gaps must be
// closed before these adapters may be instantiated with actual protected input.
const trustedBindings=Object.freeze({officialHttpsRequest,createProtectedApiTransport,
 readHiddenCredential,createDeploymentOperator,createProviderReceiptReader,
 createRouteReceiptObserver,verifyProviderBinding,
 async approvedBuilder(){const {buildMemberHostedPackage}=await import('./package.mjs');return buildMemberHostedPackage;}});
const liveAuthorities=new WeakSet(); // No issuer exists in this preparation package.
function plainData(value,depth=0){
 need(depth<24);
 if(value===null||typeof value==='string'||typeof value==='boolean')return value;
 if(typeof value==='number'){need(Number.isFinite(value));return value;}
 need(value&&typeof value==='object'&&!types.isProxy(value));
 const array=Array.isArray(value);need(Object.getPrototypeOf(value)===(array?Array.prototype:Object.prototype));
 const descriptors=Object.getOwnPropertyDescriptors(value),result=array?[]:{};
 need(Reflect.ownKeys(descriptors).length<=4096);
 for(const key of Reflect.ownKeys(descriptors)){
  need(typeof key==='string');if(array&&key==='length')continue;
  const d=descriptors[key];need(d.enumerable&&Object.hasOwn(d,'value')&&key!=='__proto__');
  result[key]=plainData(d.value,depth+1);
 }
 return result;
}
function checkNative(value,{nonce,startedAt,finishedAt,baseline}){
 const result=plainData(value);need(result.ok===true);const r=result.receipt;
 need(r&&r.version==='lockliel-deployment-native-preflight-v1'&&r.source==='direct-native-deployment-preflight');
 need(typeof nonce==='string'&&/^[a-f0-9]{32}$/.test(nonce)&&r.runNonce===nonce);
 need(Number.isSafeInteger(startedAt)&&Number.isSafeInteger(finishedAt)&&finishedAt>=startedAt&&finishedAt-startedAt<=300000);
 need(Number.isSafeInteger(r.observedStartedAt)&&Number.isSafeInteger(r.observedAt)&&r.observedStartedAt>=startedAt&&r.observedAt>=r.observedStartedAt&&r.observedAt<=finishedAt);
 need(r.project===APPROVED_PROJECT&&r.host===`db.${APPROVED_PROJECT}.supabase.co`&&r.database==='postgres');
 for(const field of ['startupOptionsVerified','tlsVerifyFull','hostnameVerified','directIPv6','samePhysicalConnection','sameTransaction','noReconnect','noDataWrites','rolledBack','connectionClosed','nativeInventoryVerified','syntheticProvenanceVerified','deploymentReady','currentSessionCatalogVerified','requiredColumnGrantsVerified'])need(r[field]===true);
 need(['TLSv1.2','TLSv1.3'].includes(r.tlsVersion)&&typeof r.cipher==='string'&&r.cipher.length>0&&r.cipher.length<=128);
 need(Number.isSafeInteger(r.backendPid)&&r.backendPid>0&&typeof r.transactionStartedAt==='string'&&r.transactionStartedAt.length>0);
 need(r.transactionReadOnly==='on'&&r.lockTimeout==='5s'&&r.statementTimeout==='30s');
 need(r.inspectionQueries===7&&r.witnessQueries===15&&r.totalStatements===24);
 need(r.ledger===280&&r.paused===true&&r.schemaReady===true&&r.protocol==='278-v1'&&r.rlsAll===true&&r.notesServiceTablePrivileges===0&&r.notesServiceColumnPrivileges===0);
 for(const key of ['versionsSha256','migration280StatementsArrayTextMd5','migration280SourceSha256'])need(r.baseline?.[key]===baseline[key]);
 need(r.catalogSha256===baseline.catalogSha256&&r.securitySha256===SECURITY_SHA);
 need(r.branchIdentity?.branch===BRANCH&&r.branchIdentity.branchId===BRANCH_ID);
 // Historical branch metadata is not made fresh here. Provider identity remains
 // a separate proof. Caller REST is observed only after hosted A/B acceptance.
 need(r.branchIdentity.fresh===false&&r.callerRestVerified===false);
 return Object.freeze({project:r.project,observedAt:r.observedAt,observedStartedAt:r.observedStartedAt,ledger:280,paused:true,schemaReady:true,protocol:'278-v1',callerRestVerified:false,branchFresh:false});
}
/** Data-only offline validator. It cannot mint a live/native capability. */
export function reviewNativeReceiptOffline(value,options){
 try{return Object.freeze({syntheticOnly:true,providerAuthority:false,review:checkNative(value,plainData(options))});}
 catch{throw Error(DENIED);}
}
export function createTrustedDeploymentOperator(...args){
 need(args.length===0);
 return Object.freeze({
  async prepare(...options){
   need(options.length===0);const verified=[];
   try{for(const [name,hash]of Object.entries(seals)){
    const path=fileURLToPath(new URL(name,import.meta.url));need((await lstat(path)).isFile()&&!(await lstat(path)).isSymbolicLink());
    need(sha(await readFile(path))===hash);verified.push(name);
   }}catch{throw Error(DENIED);}
   need(Object.values(trustedBindings).every(value=>typeof value==='function'));
   return Object.freeze({identity:OPERATOR_IDENTITY,mode:'preparation-only',liveEnabled:false,
    sourceSealsVerified:Object.freeze(verified),holds,AAL:AAL_EVIDENCE_MATRIX,
    consumedJAllowance:'must-remain-consumed',applicationReservationsUsed:0});
  },
  async run(authority){
   // No caller JSON, fixture registry, receipt, credential or callback can pass.
   need(authority&&typeof authority==='object'&&liveAuthorities.has(authority));
   throw Error(DENIED);
  }
 });
}
/** Explicitly synthetic sequencing harness, not a live operator or grant issuer.
 * Reuses the reviewed lifecycle with offline mocks. Its result never asserts
 * provider authority, even when fixtures report a successful lifecycle.
 */
export function createOfflineDeploymentComposition(fixture){
 need(fixture&&fixture.syntheticOnly===true&&typeof fixture.clock==='function');
 const clock=fixture.clock,registry=createDeploymentEvidenceRegistry({identity:OPERATOR_IDENTITY,clock});
 let used=false,normalClosed=false,ownedId=null;
 const now=()=>clock().wall;
 const ensure=()=>{need(!normalClosed);const h=registry.begin('provider');return h;};
 return Object.freeze({async run(input){
  need(!used);used=true;const startedAt=now();let operator;
  try{
   const nativeObservation=registry.begin('database');
   const nonce=randomBytes(16).toString('hex');
   const native=await fixture.native({nonce});
   checkNative(native,{nonce,startedAt,finishedAt:now(),baseline:fixture.baseline});
   registry.finish(nativeObservation,{identity:OPERATOR_IDENTITY,value:{nativeInventoryVerified:true}});
   const observation=ensure();await fixture.providerPreflight();
   registry.finish(observation,{identity:OPERATOR_IDENTITY,value:{operatorVerified:true}});
   // Missing exact negative AAL evidence is a pre-reservation gate. No key, build, Auth or
   // reservation should be attempted while current scope cannot meet verifier.
   need(assessAalEvidence(fixture.aal,{nonEscalationEvidence:fixture.nonEscalationEvidence}).releaseVerifierCompatible===true);
   operator=createDeploymentOperator({
    request:fixture.request,reader:fixture.reader,
    authorize:async operation=>{
     if(operation.phase==='cleanup'||operation.phase==='begin-containment')return fixture.authorize(operation);
     need(!normalClosed&&now()-startedAt<=300000);return fixture.authorize(operation);
    },
    preparePackage:async pin=>{ownedId=pin.binding.deploy;need(now()-startedAt<=300000);return fixture.preparePackage(pin);},
    beforeAcceptance:async receipt=>{
     need(now()-startedAt<=300000);registry.bindDeployment({deploy:receipt.pin.binding.deploy,manifestSha256:receipt.manifestSha256});
     return fixture.beforeAcceptance(receipt);
    },
    acceptance:async receipt=>{need(now()-startedAt<=300000);return fixture.acceptance(receipt);},
    beginContainment:async()=>{normalClosed=true;return fixture.beginContainment();},
    wait:fixture.wait,now,
   });
   const result=await operator.run(input);
   return Object.freeze({syntheticOnly:true,providerAuthority:false,...result});
  }catch{
   // If an actual fixture lifecycle owns an ID its original operator performs
   // exact-ID cleanup in finally. Never guess ownership from partial responses.
   return Object.freeze({syntheticOnly:true,providerAuthority:false,ok:false,
    reservationAttempted:false,ownedId,category:'PREFLIGHT_OR_SCOPE_DENIED'});
  }finally{disposeCredential(input?.key);}
 }});
}
