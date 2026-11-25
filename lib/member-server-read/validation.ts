import {ISOLATED_PROJECT,ISOLATED_SITE,SERVER_READ_VERSION} from './contracts';
import type {IsolatedReadBinding,ServerMemberSnapshot} from './contracts';
/** Exact data descriptors only. Never execute untrusted getters or coercion. */
function record(value:unknown,keys:readonly string[]):value is Record<string,unknown>{
 if(value===null||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)return false;
 const desc=Object.getOwnPropertyDescriptors(value),actual=Reflect.ownKeys(desc);
 return actual.length===keys.length&&actual.every(key=>typeof key==='string'&&keys.includes(key)&&'value' in desc[key]&&desc[key].enumerable);
}
const text=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\x00-\x1f\x7f]/.test(v);
const hex=(v:unknown,n:number)=>typeof v==='string'&&new RegExp('^[a-f0-9]{'+n+'}$').test(v);
export function isolatedReadBinding(value:unknown):IsolatedReadBinding|null{
 try{if(!record(value,['project','site','deploy','source'])||value.project!==ISOLATED_PROJECT||value.site!==ISOLATED_SITE||!hex(value.deploy,24)||!hex(value.source,40))return null;
 return Object.freeze({project:ISOLATED_PROJECT,site:ISOLATED_SITE,deploy:value.deploy as string,source:value.source as string});}catch{return null;}
}
/** Only explicit nonsecret build expectations may select a target; no response/query overrides. */
export function expectedIsolatedReadBinding(input:Readonly<{deploy?:string;source?:string}>):IsolatedReadBinding|null{
 return isolatedReadBinding({project:ISOLATED_PROJECT,site:ISOLATED_SITE,deploy:input.deploy,source:input.source});
}
function section(value:unknown,valid:(v:unknown)=>boolean):boolean{
 if(record(value,['status']))return value.status==='missing'||value.status==='unavailable';
 return record(value,['status','value'])&&value.status==='ready'&&valid(value.value);
}
function profile(v:unknown):boolean{return record(v,['displayName','initials','onboardingStatus'])&&text(v.displayName,241)&&text(v.initials,8)&&text(v.onboardingStatus,80);}
function preferences(v:unknown):boolean{return record(v,['ministryEmail','faithBoostEmail','bookReleaseEmail','partnerEmail','smsUpdates','revision'])&&['ministryEmail','faithBoostEmail','bookReleaseEmail','partnerEmail','smsUpdates'].every(k=>typeof v[k]==='boolean')&&typeof v.revision==='string'&&v.revision.length<=64&&/^\d{4}-\d\d-\d\dT/.test(v.revision)&&Number.isFinite(Date.parse(v.revision));}
function freeze<T>(v:T):T{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
export function validateServerSnapshot(value:unknown,expected:IsolatedReadBinding,request:Readonly<{nonce:string;generation:number}>,now:number):ServerMemberSnapshot|null{
 try{
  if(!record(value,['version','nonce','generation','boundary','validUntil','binding','identity','profile','preferences','dashboard'])||value.version!==SERVER_READ_VERSION||value.nonce!==request.nonce||value.generation!==request.generation||!hex(value.boundary,64)||!Number.isSafeInteger(value.validUntil)||Number(value.validUntil)<=now||Number(value.validUntil)>now+60000)return null;
  const binding=isolatedReadBinding(value.binding);if(!binding||Object.keys(binding).some(k=>binding[k as keyof IsolatedReadBinding]!==expected[k as keyof IsolatedReadBinding]))return null;
  const identity=value.identity;
  if(!record(identity,['status','value'])||identity.status!=='ready'||!record(identity.value,['displayName','initials','assurance'])||!text(identity.value.displayName,241)||!text(identity.value.initials,8)||!['aal1','aal2'].includes(identity.value.assurance as string))return null;
  if(!section(value.profile,profile)||!section(value.preferences,preferences)||!record(value.dashboard,['status','value'])||value.dashboard.status!=='ready'||!record(value.dashboard.value,['courseAvailability'])||value.dashboard.value.courseAvailability!=='unavailable')return null;
  if(record(value.profile,['status','value'])&&value.profile.status==='ready'&&record(value.profile.value,['displayName','initials','onboardingStatus'])&&(value.profile.value.displayName!==identity.value.displayName||value.profile.value.initials!==identity.value.initials))return null;
  // Rebuild from validated data, never retain the caller's mutable object graph.
  return freeze(JSON.parse(JSON.stringify(value))) as ServerMemberSnapshot;
 }catch{return null;}
}
