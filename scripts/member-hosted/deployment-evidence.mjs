// Local evidence composition only. The trusted operator constructs and retains its
// own registry. Injection is for offline fixtures, never independent provider proof.
import {performance} from 'node:perf_hooks';
import {types} from 'node:util';

const SOURCE='327ba098628f70aa65140862b8b14cd709bfd711';
const SITE='70b03a42-6329-476e-bf4b-2b1ce30e9567';
const PROJECT='qjksggxorghaxvpyslip';
const KINDS=Object.freeze(['provider','database','deployment','configuration','auth']);
const MAX_AGE=300000, MAX_DRIFT=1000;
const deny=()=>{throw Error('Deployment evidence denied.');};
const need=condition=>{if(!condition)deny();};
// Copy only bounded plain own data. Never invoke getters, toJSON, coercion or
// Proxy traps while moving an untrusted value into the private receipt store.
function clone(value){
  let count=0;const visited=new Set();
  function copy(item,depth){
    need(depth<=32&&++count<=10000);
    if(item===null||typeof item==='string'||typeof item==='boolean')return item;
    if(typeof item==='number'){need(Number.isFinite(item));return item;}
    need(item&&typeof item==='object'&&!types.isProxy(item)&&!visited.has(item));
    const array=Array.isArray(item),prototype=Object.getPrototypeOf(item);
    need(array?prototype===Array.prototype:prototype===Object.prototype||prototype===null);
    visited.add(item);const descriptors=Object.getOwnPropertyDescriptors(item),result=array?[]:{};
    for(const key of Reflect.ownKeys(descriptors)){
      need(typeof key==='string');const descriptor=descriptors[key];
      if(array&&key==='length')continue;
      need(descriptor.enumerable&&Object.hasOwn(descriptor,'value')&&key!=='__proto__');
      if(array)need(/^(0|[1-9][0-9]*)$/.test(key)&&Number(key)<item.length);
      result[key]=copy(descriptor.value,depth+1);
    }
    if(array)need(result.length===item.length&&Object.keys(result).length===item.length);
    visited.delete(item);return result;
  }
  return copy(value,0);
}
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const baseSame=(left,right)=>['source','site','project'].every(key=>left?.[key]===right?.[key]);
const same=(left,right)=>baseSame(left,right)&&['deploy','manifestSha256'].every(key=>left?.[key]===right?.[key]);
const identityKeys=['source','site','project','deploy','manifestSha256'];
function identity(value,{baseOnly=false}={}){
  value=clone(value);
  const keys=baseOnly?identityKeys.slice(0,3):identityKeys;
  need(value&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key)));
  need(keys.every(key=>typeof value[key]==='string')&&value.source===SOURCE&&value.site===SITE&&value.project===PROJECT);
  if(!baseOnly)need(/^[a-f0-9]{24}$/.test(value.deploy)&&/^[a-f0-9]{64}$/.test(value.manifestSha256));
  need(!['6ae8942b7f6512d039ce0da6','6ae8a1aa48521d4528081700'].includes(value.deploy));
  return freeze(clone(value));
}
/** Per-registry handles are capabilities within a trusted process, not signatures.
 * The live operator must never accept a caller-created registry, clock, callback,
 * timestamp, raw response or opaque handle as independent provider authority.
 * No observation timestamp is accepted from the evidence payload or re-dated.
 */
export function createDeploymentEvidenceRegistry({identity:binding,clock}={}){
  const initial=clone(binding);
  let bound=identity(initial,{baseOnly:Object.keys(initial).length===3});
  const time=clock??(()=>({wall:Date.now(),monotonic:performance.now()}));
  need(typeof time==='function');
  const observations=new WeakMap(), receipts=new WeakMap(), phases=new Set();
  let invalid=false,last=null;
  function sample(){
    need(!invalid);
    try{
      const point=clone(time());
      need(point&&Object.keys(point).length===2&&Number.isSafeInteger(point.wall)&&Number.isFinite(point.monotonic)&&point.monotonic>=0);
      const result={wall:point.wall,monotonic:point.monotonic};
      need(!last||(result.wall>=last.wall&&result.monotonic>=last.monotonic&&Math.abs((result.wall-last.wall)-(result.monotonic-last.monotonic))<=MAX_DRIFT));
      last=result;return result;
    }catch{invalid=true;deny();}
  }
  const origin=sample();
  function validWindow(start,end,now){
    need(!invalid);
    for(const point of [start,end])need(point.wall<=now.wall&&point.monotonic<=now.monotonic&&point.wall>=origin.wall&&point.monotonic>=origin.monotonic);
    need(end.wall>=start.wall&&end.monotonic>=start.monotonic);
    need(Math.abs((end.wall-start.wall)-(end.monotonic-start.monotonic))<=MAX_DRIFT);
    need(Math.abs((now.wall-start.wall)-(now.monotonic-start.monotonic))<=MAX_DRIFT);
    need(now.wall-start.wall<=MAX_AGE&&now.monotonic-start.monotonic<=MAX_AGE);
    need(now.wall-origin.wall<=MAX_AGE&&now.monotonic-origin.monotonic<=MAX_AGE);
  }
  function record(handle,kind,now){
    const receipt=receipts.get(handle);need(receipt&&!receipt.consumed&&receipt.kind===kind&&baseSame(receipt.identity,bound));
    need(!receipt.identity.deploy?['provider','database'].includes(kind):same(receipt.identity,bound));
    validWindow(receipt.start,receipt.end,now);return receipt;
  }
  return Object.freeze({
    bindDeployment(value){
      need(!invalid);value=clone(value);
      need(!bound.deploy&&value&&Object.keys(value).length===2);
      const next=identity({...bound,...clone(value)});const now=sample();validWindow(origin,now,now);bound=next;return bound;
    },
    begin(kind){
      need(!invalid&&KINDS.includes(kind)&&!phases.has(kind));
      const at=sample();validWindow(at,at,at);phases.add(kind);
      const handle=Object.freeze({kind:'observation'});observations.set(handle,{kind,start:at,ended:false});return handle;
    },
    finish(handle,options){
      need(!invalid);let safe;try{safe=clone(options);}catch{invalid=true;deny();}
      const {identity:claimed,value}=safe;const observation=observations.get(handle);need(observation&&!observation.ended&&same(claimed,bound));
      need(bound.deploy||['provider','database'].includes(observation.kind));
      observation.ended=true;const end=sample();validWindow(observation.start,end,end);
      // Store payload privately; timestamps/binding below always come from this
      // registry. Transport validation belongs to the sealed trusted operator.
      let payload;try{payload=freeze(clone(value));}catch{invalid=true;deny();}
      const receipt=Object.freeze({kind:'evidence'});receipts.set(receipt,{kind:observation.kind,identity:bound,start:observation.start,end,value:payload,consumed:false});return receipt;
    },
    interrupt(handle){const observation=observations.get(handle);need(observation&&!observation.ended);observation.ended=true;invalid=true;},
    consume(handle,kind){
      const receipt=record(handle,kind,sample());receipt.consumed=true;
      return freeze({kind,identity:receipt.identity,runIdentity:bound,startedAt:receipt.start.wall,observedAt:receipt.end.wall,elapsedMs:receipt.end.monotonic-receipt.start.monotonic,value:receipt.value});
    },
    assertFresh(handles,{requiredKinds=KINDS}={}){
      need(Array.isArray(requiredKinds)&&requiredKinds.length===KINDS.length&&new Set(requiredKinds).size===KINDS.length&&KINDS.every(kind=>requiredKinds.includes(kind)));
      need(bound.deploy&&handles&&Object.keys(handles).length===KINDS.length);const now=sample();
      const records=KINDS.map(kind=>record(handles[kind],kind,now));
      records.forEach(receipt=>{receipt.consumed=true;});
      return freeze(Object.fromEntries(records.map(receipt=>[receipt.kind,{identity:receipt.identity,runIdentity:bound,startedAt:receipt.start.wall,observedAt:receipt.end.wall,value:receipt.value}])));
    },
    // Expired or interrupted acceptance must never disable exact-ID containment.
    cleanupIdentity(){return bound;},
  });
}

export const AAL_EVIDENCE_MATRIX=freeze([
  {category:'ordinaryAB',preSql:'cannot-establish-member-session',postHosted:'separate synthetic A/B password login, scoped reads and local logout',privileged:false},
  {category:'anonymousExpiredDenied',preSql:'catalog checks are not caller denial',postHosted:'anonymous and expired caller REST denial',privileged:false},
  {category:'aal1PrivilegedDenied',preSql:'function/ACL policy inspection only',postHosted:'AAL1 caller privileged-route denial',privileged:false},
  {category:'mfaRequiredDenied',preSql:'function/ACL policy inspection only',postHosted:'MFA-required caller denial',privileged:false},
  {category:'verifiedAal2PrivilegedAccepted',preSql:'cannot-establish-verified-AAL2-session',postHosted:'separately authorized verified AAL2 privileged acceptance',privileged:true},
  {category:'staffRoleAuthorized',preSql:'role/ACL inspection is not caller authorization',postHosted:'separately authorized scoped staff-role acceptance',privileged:true},
]);
export const AAL_NON_ESCALATION_MATRIX=freeze([
  {field:'exactSourceVerified',observation:'reviewed exact application source and artifact byte identity'},
  {field:'exactThreeRouteInventoryVerified',observation:'provider verified exact member-read/login/logout route inventory'},
  {field:'privilegedRoutesAbsent',observation:'reviewed source and provider route inventory expose no privileged handler'},
  {field:'directFunctionRoutesBlocked',observation:'authorized harmless direct-function route denial'},
  {field:'otherApiRoutesBlocked',observation:'authorized harmless unlisted API/privileged route denial'},
  {field:'forgedRoleAuthorityDenied',observation:'authorized negative role-claim input does not obtain privileged authority'},
  {field:'aal1PrivilegedDenied',observation:'authorized AAL1 caller denial at privileged route boundary'},
  {field:'sourceNoAalToStaffGrant',observation:'reviewed source/function role boundaries do not convert member AAL to staff authority'},
]);
/** Wave10B explicitly defines aal2AuthorizedOnly as non-escalation and absence of
 * a privileged surface, not successful manager/AAL2 acceptance. The live trusted
 * operator must obtain every source/provider/negative observation independently.
 * These data-only assessments never create authority from caller booleans. Positive
 * manager/staff acceptance remains NOT TESTED under the ordinary A/B-only scope. */
export function assessAalEvidence(value,options={}){
  value=clone(value);
  const categories=AAL_EVIDENCE_MATRIX.map(row=>row.category);
  need(value&&Object.keys(value).every(key=>categories.includes(key))&&Object.values(value).every(item=>typeof item==='boolean'));
  need(value.verifiedAal2PrivilegedAccepted!==true&&value.staffRoleAuthorized!==true);
  const observed=Object.fromEntries(categories.map(key=>[key,value[key]===true]));
  const safeOptions=clone(options);need(safeOptions&&Object.keys(safeOptions).every(key=>key==='nonEscalationEvidence'));
  const required=AAL_NON_ESCALATION_MATRIX.map(row=>row.field), supplied=safeOptions.nonEscalationEvidence??{};
  need(supplied&&Object.keys(supplied).every(key=>required.includes(key))&&Object.values(supplied).every(item=>typeof item==='boolean'));
  const nonEscalation=Object.fromEntries(required.map(key=>[key,supplied[key]===true]));
  const unresolved=categories.filter(key=>!observed[key]);
  const ordinaryAcceptanceComplete=categories.slice(0,4).every(key=>observed[key]);
  const missingRequiredNonEscalation=required.filter(key=>!nonEscalation[key]);
  const aal2AuthorizedOnly=ordinaryAcceptanceComplete&&missingRequiredNonEscalation.length===0;
  return freeze({scope:'ordinary-ab-only',observed,unresolved,nonEscalation,missingRequiredNonEscalation,ordinaryAcceptanceComplete,privilegedAcceptanceComplete:false,positiveManagerAcceptance:'NOT_TESTED',staffRoleAcceptance:'NOT_TESTED',aal2AuthorizedOnly,releaseVerifierCompatible:aal2AuthorizedOnly});
}
