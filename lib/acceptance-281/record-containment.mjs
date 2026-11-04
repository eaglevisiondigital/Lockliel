// Offline, synthetic evidence reconciliation. No SQL, network, authority grants or deletion executor.
const PROJECT='qjksggxorghaxvpyslip';
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const sha=/^[a-f0-9]{64}$/;
const handles=new WeakMap();
const need=(value)=>{if(!value)throw Error('RECORD_CONTAINMENT_UNVERIFIED');};
const isId=v=>typeof v==='string'&&uuid.test(v);
const exact=(v,keys)=>v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const copy=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
function snapshot(value,run,now,fresh=true){
 need(exact(value,['kind','project','run','observedAt','complete','records']));
 need(value.kind==='synthetic-independent-record-snapshot'&&value.project===PROJECT&&value.run===run&&value.complete===true);
 need(Number.isSafeInteger(now)&&now>=0&&Number.isSafeInteger(value.observedAt)&&value.observedAt>=0&&value.observedAt<=now&&(!fresh||now-value.observedAt<=300000));
 need(Array.isArray(value.records)&&value.records.length<=10000);
 const ids=new Set();const rows=value.records.map(r=>{
  need(exact(r,['id','owner','run','digest'])&&isId(r.id)&&isId(r.owner)&&(r.run===null||isId(r.run))&&typeof r.digest==='string'&&sha.test(r.digest)&&!ids.has(r.id));ids.add(r.id);return copy(r);
 });
 return rows.sort((a,b)=>a.id.localeCompare(b.id));
}
export function prepareSyntheticRecordContainment({run,owners,baseline,creation,before,now}={}){
 need(isId(run)&&Array.isArray(owners)&&owners.length===2&&owners.every(isId)&&owners[0]!==owners[1]);
 const old=snapshot(baseline,run,now,false),current=snapshot(before,run,now);
 need(before.observedAt>=baseline.observedAt);
 need(exact(creation,['kind','project','run','observedAt','settled','ids']));
 need(creation.kind==='synthetic-independent-creation-ledger'&&creation.project===PROJECT&&creation.run===run&&creation.settled===true&&Number.isSafeInteger(creation.observedAt)&&creation.observedAt>=baseline.observedAt&&creation.observedAt<=before.observedAt);
 need(Array.isArray(creation.ids)&&creation.ids.length<=70&&creation.ids.every(isId)&&new Set(creation.ids).size===creation.ids.length);
 const original=new Map(old.map(r=>[r.id,r])),added=new Set(creation.ids);
 need([...added].every(id=>!original.has(id))&&current.length===old.length+added.size);
 const targets=[];
 for(const row of current){
  if(original.has(row.id)){need(same(row,original.get(row.id)));continue;}
  need(added.has(row.id)&&row.run===run&&owners.includes(row.owner));targets.push({id:row.id,owner:row.owner,run,digest:row.digest});
 }
 need(targets.length===added.size);
 // Handle is in-memory, scoped to this module. Serialized claims do not restore it.
 const handle=Object.freeze({});handles.set(handle,{run,old,targets,beforeAt:before.observedAt});
 return Object.freeze({handle,review:freeze({syntheticOnly:true,executionAuthorized:false,project:PROJECT,run,targets:copy(targets),deleteAccounts:false,deleteDeployment:false})});
}
export function verifySyntheticRecordContainment(handle,after,now){
 const record=handles.get(handle);need(record);handles.delete(handle); // one verification attempt, failure consumes handle
 const rows=snapshot(after,record.run,now);need(after.observedAt>=record.beforeAt&&same(rows,record.old));
 return Object.freeze({syntheticOnly:true,recordCleanupReconciled:true,executionAuthorized:false,deploymentRetirementVerified:false});
}
export function hostedRecordCleanup(){return Object.freeze({enabled:false,executionAuthorized:false,reason:'TRUSTED_COLLECTOR_DATABASE_GUARD_AND_SEPARATE_AUTHORIZATION_REQUIRED'});}
