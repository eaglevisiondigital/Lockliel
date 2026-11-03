/** Offline execution of the exact bounded sequence. Offline receipts cannot be
 * admitted by any live operator, and no plain data can mint provider authority. */
import {createOfflineProvider,createOfflineMember,disposeOfflineProvider,plannedLoginDigests} from './transport.mjs';
import {consumeOfflineAttempt,claimOfflineStep,recordOfflineOutcome} from './durable-ledger.mjs';
import {IDENTITY,clone,need,freeze,sha256,canonical,validateNativeReceipt,verifyPost,safeFailure} from './contracts.mjs';
import {disposeOwnedInputs} from './protected-input.mjs';
const scenarios=new WeakMap(),drafts=new WeakMap();
export function createOfflineProvisioningScenario(input={}){
 const data=clone(input);need(Object.keys(data).every(k=>['before','after','provider','elapsed'].includes(k)));
 const handle=freeze({kind:'synthetic-fixture-provisioning',syntheticOnly:true});scenarios.set(handle,data);return handle;
}
function native(phase,now,subjects=[]){return {schema:'lockliel-fixture-native-v1',phase,...Object.fromEntries(['project','branch','branchId'].map(k=>[k,IDENTITY[k]])),startedAt:now,observedAt:now,safeguards:{directIPv6:true,tlsVerifyFull:true,hostnameVerified:true,transactionReadOnly:'on',lockTimeout:'5s',statementTimeout:'30s',sameConnectionAndTransaction:true,rolledBack:true,connectionClosed:true},ledger:280,paused:true,schemaReady:true,protocol:'278-v1',collisionCount:0,protectedStateSha256:sha256('offline-old-owned-records'),triggerGraphSha256:sha256('offline-reviewed-trigger-graph'),unexpectedWriteCount:0,subjects};}
function draftRecord(generation,created,before,after,now){
 const record={version:'lockliel-fixture-provenance-draft-v1',status:'UNVERIFIED_OFFLINE_ONLY',syntheticOnly:true,project:IDENTITY.project,branch:IDENTITY.branch,branchId:IDENTITY.branchId,generation,recordedAt:now,creationEvents:created.map((x,i)=>({label:['A','B'][i],projectionSha256:x.projectionSha256,createdAt:x.createdAt})),subjects:created.map(x=>x.tuple),beforeSha256:sha256(canonical(before)),afterSha256:sha256(canonical(after)),independentApproval:'MISSING',liveAuthority:false};
 const handle=freeze({kind:'offline-provenance-draft',syntheticOnly:true});drafts.set(handle,freeze(record));return handle;
}
export function inspectOfflineProvenanceDraft(handle){const data=drafts.get(handle);need(data);return data;}
export async function runOfflineProvisioning(handle,ledger,now=Date.now()){
 const config=scenarios.get(handle);need(config&&Number.isSafeInteger(now));scenarios.delete(handle);
 let provider,consumed=false,created=[],failure='DENIED',privateDraft;const buffers=[];let time=now;
 try{
  const grant=consumeOfflineAttempt(ledger,time);consumed=true;
  // All mock input is constructed only after irreversible attempt consumption.
  const planned=plannedLoginDigests(grant.generation);need(planned[0].loginSha256!==planned[1].loginSha256);
  claimOfflineStep(ledger,'PRECHECK',time);
  const pre=validateNativeReceipt({...native('before',time),...(config.before||{})},'before',sha256('offline-reviewed-trigger-graph'),time);
  provider=createOfflineProvider(config.provider||[{kind:'success'},{kind:'success'}]);
  for(const [i,label]of ['A','B'].entries()){
   time=now+i+1;claimOfflineStep(ledger,'CREATE_'+label,time);
   const password=Buffer.from('SYNTHETIC-FIXTURE-PASSWORD-'+label+'-ONLY');buffers.push(password);
   created.push(await createOfflineMember(provider,label,password,grant.generation,time));
  }
  time=now+(config.elapsed??3);claimOfflineStep(ledger,'POSTCHECK',time);
  const subjects=created.map(x=>({...x.tuple,profileCount:1,confirmed:true,staffRoleCount:0,factorCount:0,sessionCount:0,enrollmentCount:0,progressCount:0,noteCount:0,unexpectedClaimCount:0}));
  const post=validateNativeReceipt({...native('after',time,subjects),...(config.after||{})},'after',sha256('offline-reviewed-trigger-graph'),time);
  verifyPost(pre,post,created);claimOfflineStep(ledger,'FINAL',time);privateDraft=draftRecord(grant.generation,created,pre,post,time);recordOfflineOutcome(ledger,'PASS',time);
  return freeze({summary:{ok:true,syntheticOnly:true,hostedUsersCreated:0,simulatedCreates:2,liveAuthority:false,independentHostedVerification:false,attemptConsumed:true,operatorActivated:false},privateDraft});
 }catch(error){failure=safeFailure(error);if(consumed)try{recordOfflineOutcome(ledger,failure==='PROVIDER_TIMEOUT'||failure==='PROVIDER_AMBIGUOUS'?'AMBIGUOUS':created.length?'PARTIAL':'BLOCKED',Math.max(now,time));}catch{failure='ATTEMPT_UNAVAILABLE';}
  return freeze({summary:{ok:false,syntheticOnly:true,hostedUsersCreated:0,simulatedCreates:created.length,liveAuthority:false,attemptConsumed:consumed,error:failure,retryAllowed:false,reconciliationRequired:consumed}});
 }finally{disposeOwnedInputs(buffers);if(provider)disposeOfflineProvider(provider);}
}
export function provisioningReadiness(){return freeze({project:IDENTITY.project,branch:IDENTITY.branch,liveEnabled:false,protectedInputImplemented:true,fixedAdminRequestImplemented:true,offlineWorkflowImplemented:true,requires:['source-pinned private worker integration','reviewed native acquisition and trigger/hook seal','fresh child-only project/operator authority','separate owner creation approval','new dedicated durable execution grant','private custodian/retention approval'],existingDiagnostic:'CONSUMED',deploymentReservation:'UNUSED'});}
