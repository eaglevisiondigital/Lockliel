import {MEMBER_READ_VERSION,OFFLINE_PUBLIC_RESOURCE_PATHS} from './contracts';
import type {MemberReadModel} from './contracts';
function safe(value:unknown,seen=new Set<object>(),depth=0):boolean{
 if(value===null||typeof value==='boolean')return true;
 if(typeof value==='string')return value.length<=2000&&!/[\u0000-\u001f<>]/u.test(value);
 if(typeof value==='number')return Number.isSafeInteger(value)&&value>=0;
 if(typeof value!=='object'||depth>8||seen.has(value))return false;
 if(![Object.prototype,Array.prototype,null].includes(Object.getPrototypeOf(value)))return false;
 seen.add(value);const descriptors=Object.getOwnPropertyDescriptors(value),keys=Reflect.ownKeys(descriptors);if(keys.length>101)return false;
 for(const key of keys){if(typeof key!=='string'||!('value'in descriptors[key])||!safe(descriptors[key].value,seen,depth+1))return false;}
 seen.delete(value);return true;
}
const rec=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const exact=(v:unknown,keys:readonly string[]):v is Record<string,unknown>=>rec(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const str=(v:unknown):v is string=>typeof v==='string'&&v.length>0;
function unavailable(v:unknown):boolean{return exact(v,['status','reason','message'])&&v.status==='unavailable'&&['backend-required','privacy-decision-pending','consent-unverified','upstream-unknown'].includes(v.reason as string)&&str(v.message);}
function feature(v:unknown,valid:(value:unknown)=>boolean):boolean{return unavailable(v)||(exact(v,['status','value','revision','source'])&&v.status==='ready'&&v.source==='existing-api-fixture'&&str(v.revision)&&valid(v.value));}
/** Presentation guard only, NOT session authorization. It never evaluates data getters. */
function validateModel(value:unknown):value is MemberReadModel{
 if(!safe(value)||!exact(value,['version','revision','identity','profile','communications','courseProgress','myFive','catalog','photo','faithBanner','scripturePreferences','anchors','prayers','growth','actionPlans','sharing','privacy']))return false;
 const v=value;if(v.version!==MEMBER_READ_VERSION||!str(v.revision)||!exact(v.identity,['displayName','initials','assurance','mode'])||!str(v.identity.displayName)||!str(v.identity.initials)||!['aal1','aal2'].includes(v.identity.assurance as string)||v.identity.mode!=='offline-authenticated')return false;
 if(!feature(v.profile,p=>exact(p,['displayName','initials','onboardingStatus'])&&str(p.displayName)&&str(p.initials)&&str(p.onboardingStatus)))return false;
 if(!feature(v.communications,p=>exact(p,['ministryEmail','faithBoostEmail','bookReleaseEmail','partnerEmail','smsUpdates'])&&Object.values(p).every(item=>typeof item==='boolean')))return false;
 if(!feature(v.courseProgress,p=>exact(p,['title','completed','total','maintenance'])&&str(p.title)&&typeof p.completed==='number'&&typeof p.total==='number'&&p.completed<=p.total&&typeof p.maintenance==='boolean'))return false;
 if(!feature(v.myFive,p=>Array.isArray(p)&&p.length<=5&&p.every(item=>exact(item,['id','label','revision','status','shareEligibility','consent'])&&str(item.id)&&str(item.label)&&str(item.revision)&&str(item.status)&&item.shareEligibility==='unavailable'&&item.consent==='unknown')))return false;
 if(!feature(v.catalog,p=>Array.isArray(p)&&p.length<=50&&p.every(item=>exact(item,['id','title','type','description','href','shareEligible'])&&str(item.id)&&str(item.title)&&str(item.type)&&str(item.description)&&typeof item.href==='string'&&OFFLINE_PUBLIC_RESOURCE_PATHS.includes(item.href)&&item.shareEligible===false)))return false;
 if(!['photo','faithBanner','scripturePreferences','anchors','prayers','growth','actionPlans','sharing'].every(key=>unavailable(v[key])))return false;
 return exact(v.privacy,['status','message'])&&v.privacy.status==='unknown'&&str(v.privacy.message);
}

export function isMemberReadModel(value:unknown):value is MemberReadModel{try{return validateModel(value);}catch{return false;}}
