/** Fixed isolated fixture contracts. Neither a JSON document nor a digest grants authority. */
import {createHash} from 'node:crypto';
import {types} from 'node:util';
export const IDENTITY=Object.freeze({project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',branchId:'7091bfd6-83ce-4c11-ac30-8ce85e09be2d',applicationSource:'327ba098628f70aa65140862b8b14cd709bfd711'});
export const CATEGORIES=Object.freeze(['DENIED','SOURCE_MISMATCH','AUTHORITY_MISSING','ATTEMPT_UNAVAILABLE','PREFLIGHT_FAILED','PROVIDER_REJECTED','PROVIDER_AMBIGUOUS','PROVIDER_TIMEOUT','POSTCHECK_FAILED','INTERRUPTED','INCOMPLETE']);
export function deny(category='DENIED'){throw new Error(CATEGORIES.includes(category)?category:'DENIED');}
export function need(value,category='DENIED'){if(!value)deny(category);}
export const sha256=value=>createHash('sha256').update(value).digest('hex');
export const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export function clone(value,depth=0){
 need(depth<12);if(value===null||typeof value==='boolean')return value;
 if(typeof value==='string'){need(value.length<=8192);return value;}
 if(typeof value==='number'){need(Number.isSafeInteger(value));return value;}
 need(value&&typeof value==='object'&&!types.isProxy(value));const array=Array.isArray(value);
 need(Object.getPrototypeOf(value)===(array?Array.prototype:Object.prototype));const ds=Object.getOwnPropertyDescriptors(value),out=array?[]:{};
 need(Reflect.ownKeys(ds).length<=80);
 for(const key of Reflect.ownKeys(ds)){need(typeof key==='string');if(array&&key==='length')continue;const d=ds[key];need(d.enumerable&&Object.hasOwn(d,'value')&&key!=='__proto__');if(array)need(/^(0|[1-9][0-9]*)$/.test(key)&&Number(key)<value.length);out[key]=clone(d.value,depth+1);}
 if(array)need(out.length===value.length&&Object.keys(out).length===value.length);return out;
}
export function exact(o,keys){need(o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k)));}
export function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
export function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export function freshness(start,end,now){need([start,end,now].every(Number.isSafeInteger)&&start<=end&&end<=now&&now-start<=300000);}
export const tupleKeys=Object.freeze(['subjectSha256','profileSha256','createdAtSha256','loginSha256']);
export function validateTuple(raw,label){const row=clone(raw);exact(row,['label',...tupleKeys]);need(row.label===label&&tupleKeys.every(k=>digest(row[k])));return freeze(row);}
export function distinct(rows){need(rows.length===2);for(const key of tupleKeys)need(rows[0][key]!==rows[1][key]);}
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x);
export function loginDigest(email){need(typeof email==='string'&&/^[a-z0-9.-]{1,100}@fixture[.]invalid$/.test(email));return sha256('lockliel:qjks:login:'+email);}
/** Raw provider user is private and discarded by transport, never returned. Only
 * allowlisted noncredential fields contribute to the evidence digest. */
export function canonicalProviderTimestamp(value){
 need(typeof value==='string');const m=/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?Z$/.exec(value);need(m);
 // Go time.Time marshals RFC3339Nano. PostgreSQL stores microseconds; reject
 // nonzero sub-microsecond precision rather than invent an equality.
 need(!m[2]||m[2].slice(6).replace(/0/g,'')==='');const normalized=m[1]+'.'+(m[2]||'').padEnd(6,'0').slice(0,6)+'Z';
 const milliseconds=Date.parse(normalized);need(Number.isFinite(milliseconds)&&new Date(milliseconds).toISOString().slice(0,19)===m[1]);return normalized;
}
export function projectCreatedUser(raw,label,expectedLogin,now){
 const u=clone(raw);need(['A','B'].includes(label));need(uuid(u.id)&&u.email===expectedLogin&&loginDigest(u.email));
 const createdAt=canonicalProviderTimestamp(u.created_at);
 const created=Date.parse(u.created_at);need(Number.isFinite(created)&&created<=now&&now-created<=300000);
 need(typeof u.email_confirmed_at==='string'&&Number.isFinite(Date.parse(u.email_confirmed_at))&&Date.parse(u.email_confirmed_at)<=now);
 need(u.role==='authenticated'&&u.is_anonymous===false&&(u.phone===''||u.phone===null)&&(!Object.hasOwn(u,'factors')||(Array.isArray(u.factors)&&u.factors.length===0)));
 const app=u.app_metadata;need(app&&typeof app==='object');need(Object.keys(app).every(k=>['provider','providers'].includes(k))&&app.provider==='email'&&Array.isArray(app.providers)&&app.providers.length===1&&app.providers[0]==='email');
 // Never hash arbitrary provider metadata, raw error text or credential fields.
 const tuple={label,subjectSha256:sha256('lockliel:qjks:auth:'+u.id),profileSha256:sha256('lockliel:qjks:profile:'+u.id),createdAtSha256:sha256('lockliel:qjks:created:'+createdAt),loginSha256:loginDigest(u.email)};
 return freeze({tuple,projectionSha256:sha256(canonical({project:IDENTITY.project,...tuple,createdAt,confirmed:true,ordinaryRole:true})),createdAt});
}
const safeguards={directIPv6:true,tlsVerifyFull:true,hostnameVerified:true,transactionReadOnly:'on',lockTimeout:'5s',statementTimeout:'30s',sameConnectionAndTransaction:true,rolledBack:true,connectionClosed:true};
export function validateNativeReceipt(input,phase,seal,now){
 need(['before','after'].includes(phase));const r=clone(input);exact(r,['schema','phase','project','branch','branchId','startedAt','observedAt','safeguards','ledger','paused','schemaReady','protocol','collisionCount','protectedStateSha256','triggerGraphSha256','unexpectedWriteCount','subjects']);
 need(r.schema==='lockliel-fixture-native-v1'&&r.phase===phase);for(const k of ['project','branch','branchId'])need(r[k]===IDENTITY[k]);freshness(r.startedAt,r.observedAt,now);
 need(canonical(r.safeguards)===canonical(safeguards)&&r.ledger===280&&r.paused===true&&r.schemaReady===true&&r.protocol==='278-v1');
 need(r.collisionCount===0&&r.unexpectedWriteCount===0&&digest(r.protectedStateSha256)&&digest(r.triggerGraphSha256)&&r.triggerGraphSha256===seal);
 need(Array.isArray(r.subjects)&&r.subjects.length===(phase==='before'?0:2));
 if(phase==='after')for(const [i,s]of r.subjects.entries()){
  exact(s,['label',...tupleKeys,'profileCount','confirmed','staffRoleCount','factorCount','sessionCount','enrollmentCount','progressCount','noteCount','unexpectedClaimCount']);
  validateTuple(Object.fromEntries(['label',...tupleKeys].map(k=>[k,s[k]])),['A','B'][i]);
  need(s.profileCount===1&&s.confirmed===true&&['staffRoleCount','factorCount','sessionCount','enrollmentCount','progressCount','noteCount','unexpectedClaimCount'].every(k=>s[k]===0));
 }
 if(phase==='after')distinct(r.subjects);return freeze(r);
}
export function verifyPost(before,after,created){
 need(before.protectedStateSha256===after.protectedStateSha256&&before.triggerGraphSha256===after.triggerGraphSha256&&after.startedAt>=before.observedAt);
 distinct(created.map(x=>x.tuple));for(let i=0;i<2;i++)for(const k of ['label',...tupleKeys])need(after.subjects[i][k]===created[i].tuple[k]);return true;
}
export function safeFailure(error){if(!error||typeof error!=='object'||types.isProxy(error))return 'DENIED';const d=Object.getOwnPropertyDescriptor(error,'message');return d&&Object.hasOwn(d,'value')&&CATEGORIES.includes(d.value)?d.value:'DENIED';}
