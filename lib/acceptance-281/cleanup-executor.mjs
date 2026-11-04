// Disabled for hosted use. This executor can mutate only its own synthetic in-memory store.
import {createHash} from 'node:crypto';
import {prepareSyntheticRecordContainment,verifySyntheticRecordContainment} from './record-containment.mjs';
const copy=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const fail=()=>{throw Error('SYNTHETIC_CLEANUP_STOPPED');};
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function createHostedRecordCleanupExecutor(){return Object.freeze({enabled:false,executionAuthorized:false,reason:'DATABASE_RPC_TRUSTED_RECEIPTS_AND_EXACT_AUTHORIZATION_REQUIRED'});}
export function createSyntheticRecordCleanupExecutor(input){
 const {run,owners,baseline,creation,before,now}=input??{};
 // Existing exact-scope reconciliation rejects malformed/foreign/history drift up front.
 const first=prepareSyntheticRecordContainment({run,owners,baseline,creation,before,now});
 const fixed=freeze(copy({run,owners,baseline,creation,before}));
 let records=copy(before.records),state='ready',lastAt=now;const plans=new WeakMap();let chain='0'.repeat(64);const events=[];
 const event=(kind,at)=>{if(!Number.isSafeInteger(at)||at<lastAt)fail();lastAt=at;const value={kind,at,previous:chain,recordsDigest:hash(records)};chain=hash(value);events.push(freeze({...value,hash:chain}));};
 event('synthetic-initialized',now);
 const observe=at=>{if(!Number.isSafeInteger(at)||at<lastAt)fail();lastAt=at;return freeze({...copy(fixed.before),observedAt:at,records:copy(records)});};
 function prepare(at){
  if(state!=='ready')fail();
  const observed=observe(at);
  const checked=prepareSyntheticRecordContainment({...fixed,before:observed,now:at});
  if(hash(checked.review.targets)!==hash(first.review.targets))fail();
  const handle=Object.freeze({});plans.set(handle,{targets:checked.review.targets,at,beforeDigest:hash(records),verification:checked.handle});state='prepared';
  event('synthetic-plan-prepared',at);return Object.freeze({handle,syntheticOnly:true,executionAuthorized:false,targetDigest:hash(checked.review.targets),beforeDigest:hash(records)});
 }
 function execute(handle,at,mode='normal'){
  const plan=plans.get(handle);if(state!=='prepared'||!plan)fail();plans.delete(handle);state='consumed';
  if(!Number.isSafeInteger(at)||at<lastAt||at<plan.at||at-plan.at>300000||!['normal','interrupt-before-commit','acknowledgment-lost'].includes(mode)||hash(records)!==plan.beforeDigest){event('synthetic-denied',lastAt);fail();}
  event('synthetic-attempt-consumed',at);
  if(mode==='interrupt-before-commit'){state='uncertain';event('synthetic-interrupted',at);return Object.freeze({syntheticOnly:true,status:'uncertain',retryAllowed:false});}
  const ids=new Set(plan.targets.map(r=>r.id));
  const next=records.filter(r=>!ids.has(r.id));
  if(records.length-next.length!==ids.size){state='uncertain';fail();}
  // Atomic replacement of this closure's store; never a caller path, URL, table or connection.
  records=next;event('synthetic-delete-committed',at);
  if(mode==='acknowledgment-lost'){state='uncertain';return Object.freeze({syntheticOnly:true,status:'uncertain',retryAllowed:false});}
  const result=verifySyntheticRecordContainment(plan.verification,observe(at),at);state='verified';event('synthetic-cleanup-verified',at);
  return Object.freeze({...result,deleted:ids.size,retryAllowed:false});
 }
 function reconcile(at){
  if(state!=='uncertain')fail();
  // Fresh observation, not a second deletion; original baseline is independently compared.
  const normalized=rows=>JSON.stringify([...rows].sort((a,b)=>a.id.localeCompare(b.id)));
  const complete=normalized(observe(at).records)===normalized(fixed.baseline.records);
  if(complete){state='verified';event('synthetic-cleanup-reconciled',at);}
  return Object.freeze({syntheticOnly:true,recordCleanupReconciled:complete,executionAuthorized:false,retryAllowed:false,deploymentRetirementVerified:false});
 }
 function evidence(){return freeze({syntheticOnly:true,hostedEnabled:false,state,events:copy(events),currentDigest:hash(records),durable:false});}
 return Object.freeze({prepare,execute,reconcile,observe,evidence});
}
