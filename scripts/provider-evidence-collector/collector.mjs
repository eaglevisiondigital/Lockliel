/** Concrete orchestration is source reviewed, but live authority is unavailable.
 * No caller argument, switch, fixture callback or local flag can enable it.
 * VM tests replace module bindings privately, never the live public interface. */
import {loadInstalledAuthority,inspectVerifiedAuthority,verifyEnteredCredentialBinding,operatorReadiness} from './authority.mjs';
import {performance} from 'node:perf_hooks';
import {consumeInstalledAttempt} from './attempt.mjs';
import {readHiddenLocalInput} from '../fixture-provision/protected-input.mjs';
import {performFixedRead} from './transport.mjs';
const denied=category=>Object.freeze({schema:'lockliel-provider-collector-readiness-v1',ok:false,category,project:'qjksggxorghaxvpyslip',operation:'GET_AUTH_CONFIG',...operatorReadiness()});
function checkProof(proof,now) {
 if(!proof||proof.project!=='qjksggxorghaxvpyslip'||proof.origin!=='https://api.supabase.com'||proof.operation!=='GET_AUTH_CONFIG'||proof.permission!=='auth_config_read'||proof.scope!=='ISOLATED_ONLY'||proof.operatorVerified!==true||proof.credentialBindingVerified!==true||![proof.observedAt,proof.expiresAt,now].every(Number.isSafeInteger)||now<proof.observedAt||now>=proof.expiresAt||now-proof.observedAt>300000||proof.expiresAt-proof.observedAt>300000)throw 0;
 for(const key of ['operatorEvidenceDigest','approvalDigest','credentialBindingEvidenceDigest'])if(!/^[a-f0-9]{64}$/.test(proof[key]))throw 0;
}
export async function runCollector() {
 let credential,consumed=false,inputRequested=false,requestAttempted=false;
 try {
  const monoStart=performance.now(),now=Date.now(),authority=loadInstalledAuthority(now),proof=inspectVerifiedAuthority(authority,now);checkProof(proof,now);
  if(!consumeInstalledAttempt(authority,now).consumed)return {...denied('ATTEMPT_UNAVAILABLE'),inputRequested,requestAttempted,attemptConsumed:null,attemptState:'UNVERIFIED_OR_SPENT'};
  consumed=true;const beforeInput=Date.now(),inputProof=inspectVerifiedAuthority(authority,beforeInput);checkProof(inputProof,beforeInput);if(inputProof!==proof||beforeInput<now||Math.abs(beforeInput-now-(performance.now()-monoStart))>1000)throw 0;
  inputRequested=true;credential=await readHiddenLocalInput('operator');
  const current=Date.now(),elapsed=performance.now()-monoStart;
  if(elapsed<0||elapsed>=300000||current<now||Math.abs(current-now-elapsed)>1000)throw 0;
  const fresh=inspectVerifiedAuthority(authority,current);checkProof(fresh,current);if(fresh!==proof)throw 0;
  if(verifyEnteredCredentialBinding(authority,credential)!==true)throw 0;
  requestAttempted=true;const receipt=await performFixedRead(authority,credential);
  return Object.freeze({...receipt,operatorEvidenceDigest:proof.operatorEvidenceDigest,approvalDigest:proof.approvalDigest,credentialBindingEvidenceDigest:proof.credentialBindingEvidenceDigest,authorityObservedAt:proof.observedAt,authorityExpiresAt:proof.expiresAt,localIntegrityOnly:true,inputRequested,requestAttempted,attemptConsumed:consumed,processExitRequired:true});
 }catch{return Object.freeze({...denied(consumed?'PRIVATE_EXECUTION_BLOCKED':'AUTHORITY_UNAVAILABLE'),inputRequested,requestAttempted,attemptConsumed:consumed});}
 finally {if(Buffer.isBuffer(credential))credential.fill(0);}
}
