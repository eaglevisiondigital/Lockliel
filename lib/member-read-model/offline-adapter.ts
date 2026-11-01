import { MEMBER_READ_VERSION, OFFLINE_PUBLIC_RESOURCE_PATHS } from './contracts';
import type {FixtureActor,ReadScenario,ValidatedSession,MemberIdentity,MemberReadModel,MemberReadPort,MemberReadResult,FeatureRead} from './contracts';
/** Existing response ENVELOPES are retained inside this private fixture seam, not forwarded to UI. */
export type ApiFixture = Readonly<{session:unknown;preferences:unknown;journey:unknown;myFive:unknown;catalog:unknown}>;
type Authority={owner:string;scenario:ReadScenario;identity:MemberIdentity;epoch:number;expiresAt:number};
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002';
const REV='2026-11-01T12:00:00.000Z';
const unavailable=(reason:'backend-required'|'privacy-decision-pending'|'consent-unverified'|'upstream-unknown',message:string)=>({status:'unavailable' as const,reason,message});
const ready=<T>(value:T,revision=REV):FeatureRead<T>=>({status:'ready',value,revision,source:'existing-api-fixture'});
const failure=(status:'error'|'forbidden'|'unavailable'|'conflict'|'missing'|'aborted',message:string):MemberReadResult=>({status,message});
/** Reject accessors, class instances, cycles and oversized trees before inspecting input fields. */
function plain(value:unknown,seen=new Set<object>(),depth=0):boolean {
 if(value===null||typeof value==='string'||typeof value==='boolean')return typeof value!=='string'||value.length<=16000;
 if(typeof value==='number')return Number.isFinite(value);
 if(typeof value!=='object'||depth>10||seen.has(value))return false;
 const proto=Object.getPrototypeOf(value);if(proto!==Object.prototype&&proto!==Array.prototype&&proto!==null)return false;
 seen.add(value);const descriptors=Object.getOwnPropertyDescriptors(value),keys=Reflect.ownKeys(descriptors);
 if(keys.length>201)return false;
 for(const key of keys){if(typeof key!=='string')return false;const d=descriptors[key];if(!('value'in d)||!plain(d.value,seen,depth+1))return false;}
 seen.delete(value);return true;
}
const record=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const text=(value:unknown,max=140):value is string=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\u0000-\u001f<>]/u.test(value);
const uuid=(value:unknown):value is string=>typeof value==='string'&&/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu.test(value);
function localPath(value:unknown):value is string {
 if(typeof value!=='string'||value.length>240||!/^\/[a-z0-9/-]*$/u.test(value)||value.includes('//'))return false;
 return OFFLINE_PUBLIC_RESOURCE_PATHS.includes(value);
}
function freeze<T>(value:T):T {if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
/** Test injection is an offline response supplier, never fetch, a URL, credentials or a request context. */
export type OfflineAdapterOptions=Readonly<{clock?:()=>number;fixtureFor?:(owner:string)=>ApiFixture;wait?:()=>Promise<void>}>;
export function createOfflineFixture(owner:string):ApiFixture {
 const isB=owner===B,name=isB?'Jordan':'Alex',contact=isB?'Morgan Example':'Taylor Example';
 return {
  session:{authenticated:true,user:{id:owner,email:'not-forwarded@example.invalid'},profile:{id:owner,first_name:name,last_name:'Sample',onboarding_status:'new',phone:'NOT_FORWARDED',original_inviter_id:B,current_leader_id:B},journey:null,roles:['admin'],founderStatus:null,groupMemberships:[],leaderProfile:null,peopleAssignedCount:0,mfa:{aal:'aal1',hasVerifiedTotp:false,requiresChallenge:false}},
  preferences:{preferences:{ministry_email:false,faith_boost_email:true,book_release_email:false,partner_email:false,sms_updates:false,email_consent_at:null,sms_consent_at:null,updated_at:REV}},
  journey:{course:{id:'10000000-0000-4000-8000-000000000001',title:'Getting a Grip'},enrollment:{course_id:'10000000-0000-4000-8000-000000000001',status:'active',enrolled_at:REV,completed_at:null},lessons:[{id:'20000000-0000-4000-8000-000000000001'}],progress:[],mediaProgress:[],gates:[],notes:[{body:'PRIVATE_COURSE_NOTE'}],assets:[],preferredLocale:'en-US',contentLanguage:'en',maintenance:{paused:true,schemaReady:true,protocol:'278-v1'},learnerId:owner},
  myFive:{person:{id:isB?'30000000-0000-4000-8000-000000000002':'30000000-0000-4000-8000-000000000001',name:contact,status:'invited',stage:'invited',note:'PRIVATE_CONTACT_NOTE',version:REV,nextAction:'Review',followupAllowed:true,nextFollowUp:null,latestPreparedResource:null,historyLimited:false,engagement:null,timeline:[{detail:'PRIVATE_TIMELINE'}]}},
  catalog:{preferredLanguage:'en',lanes:[{id:'hope',label:'Hope'}],assets:[{id:'40000000-0000-4000-8000-000000000001',slug:'encouragement',title:'Everyday Encouragement',asset_type:'faith_boost',description:'Take a small step of hope.',share_text:'NOT_FORWARDED',category:'hope',preview_image_path:null,destination_path:'/faith-boost',featured:true,sort_order:1,language_code:'en',translation_key:'encouragement',lanes:['hope']}]}
 };
}
function project(raw:ApiFixture,authority:Authority):MemberReadResult {
 if(!plain(raw))return failure('unavailable','Member data could not be verified.');
 const {session,preferences,journey,myFive,catalog}=raw;
 if(!record(session)||session.authenticated!==true||!record(session.user)||session.user.id!==authority.owner)return failure('forbidden','This session cannot read these member details.');
 if(session.profile===null)return failure('unavailable','The member profile could not be verified.');
 if(!record(session.profile)||session.profile.id!==authority.owner||!text(session.profile.first_name,80)||!text(session.profile.last_name,80)||!text(session.profile.onboarding_status,40))return failure('unavailable','The member profile is unavailable.');
 const displayName=session.profile.first_name+' '+session.profile.last_name;
 const identity={...authority.identity,displayName,initials:session.profile.first_name.charAt(0)+session.profile.last_name.charAt(0)};
 let comm:MemberReadModel['communications']=unavailable('upstream-unknown','Communication choices are unknown.');
 if(record(preferences)&&record(preferences.preferences)){
  const p=preferences.preferences,fields=['ministry_email','faith_boost_email','book_release_email','partner_email','sms_updates'];
  if(fields.every(key=>typeof p[key]==='boolean')&&text(p.updated_at,60))comm=ready({ministryEmail:p.ministry_email as boolean,faithBoostEmail:p.faith_boost_email as boolean,bookReleaseEmail:p.book_release_email as boolean,partnerEmail:p.partner_email as boolean,smsUpdates:p.sms_updates as boolean},p.updated_at);
 }
 let course:MemberReadModel['courseProgress']=unavailable('upstream-unknown','Course progress is unavailable.');
 if(record(journey)&&journey.learnerId!==authority.owner)return failure('forbidden','Course ownership could not be verified.');
 if(record(journey)&&record(journey.course)&&text(journey.course.title)&&Array.isArray(journey.lessons)&&Array.isArray(journey.progress)&&record(journey.maintenance)&&typeof journey.maintenance.paused==='boolean'){
  const ids=journey.lessons.flatMap(lesson=>record(lesson)&&uuid(lesson.id)?[lesson.id]:[]);
  const progressValid=journey.progress.every(p=>record(p)&&typeof p.lesson_id==='string'&&ids.includes(p.lesson_id)&&['not_started','in_progress','completed'].includes(p.status as string)&&Number.isSafeInteger(p.revision)&&Number(p.revision)>=0);
  const progressIds=journey.progress.flatMap(p=>record(p)?[p.lesson_id]:[]);
  if(ids.length===journey.lessons.length&&new Set(ids).size===ids.length&&progressValid&&new Set(progressIds).size===progressIds.length){const completed=journey.progress.filter(p=>record(p)&&p.status==='completed').length;course=ready({title:journey.course.title,completed,total:ids.length,maintenance:journey.maintenance.paused});}
 }
 let contacts:MemberReadModel['myFive']=unavailable('upstream-unknown','My Five is unavailable.');
 if(record(myFive)&&record(myFive.person)){const p=myFive.person;if(uuid(p.id)&&text(p.name)&&text(p.version,60)&&text(p.status,40))contacts=ready([{id:p.id,label:p.name,revision:p.version,status:p.status,shareEligibility:'unavailable',consent:'unknown'}],p.version);}
 let resources:MemberReadModel['catalog']=unavailable('upstream-unknown','The resource catalog is unavailable.');
 if(record(catalog)&&Array.isArray(catalog.assets)&&catalog.assets.length<=50){
  const items=catalog.assets.flatMap(a=>record(a)&&uuid(a.id)&&text(a.title)&&text(a.asset_type,40)&&text(a.description,1000)&&localPath(a.destination_path)?[{id:a.id,title:a.title,type:a.asset_type,description:a.description,href:a.destination_path,shareEligible:false as const}]:[]);
  if(items.length===catalog.assets.length&&new Set(items.map(item=>item.id)).size===items.length)resources=ready(items);
 }
 const data:MemberReadModel={version:MEMBER_READ_VERSION,revision:REV,identity,profile:ready({displayName,initials:identity.initials,onboardingStatus:session.profile.onboarding_status}),communications:comm,courseProgress:course,myFive:contacts,catalog:resources,
  photo:unavailable('backend-required','Photo metadata and private Storage are not connected.'),faithBanner:unavailable('backend-required','Saved Faith Banner preferences are not available.'),scripturePreferences:unavailable('backend-required','Saved Bible preferences are not available.'),anchors:unavailable('backend-required','Scripture Anchors have no approved persistence adapter.'),prayers:unavailable('backend-required','Private Prayer Board persistence is not connected.'),growth:unavailable('backend-required','Private growth entries are not connected.'),actionPlans:unavailable('backend-required','Personal action plans are not connected.'),sharing:unavailable('consent-unverified','Resource sharing requires independently verified current consent. Nothing was sent.'),privacy:{status:'unknown',message:'Live privacy status is unknown. Local ideas do not change account settings.'}};
 return {status:'ready',data:freeze(data)};
}
export function createOfflineMemberAdapter(options:OfflineAdapterOptions={}):MemberReadPort {
 const issued=new WeakMap<object,Authority>();const clock=options.clock??Date.now;let epoch=0,sequence=0;
 return {
  async validateSession(actor:FixtureActor,scenario:ReadScenario='ready'){
   if(actor==='anonymous')return {status:'anonymous',message:'Choose a synthetic member to review private data.'};
   if(actor==='expired')return {status:'expired',message:'The sample session expired. Private content is cleared.'};
   if(actor==='staff'||!['user-a','user-b'].includes(actor)||!['ready','missing','network-error','stale','unauthorized','unknown-permissions'].includes(scenario)||scenario==='unauthorized'||scenario==='unknown-permissions')return {status:'forbidden',message:'A role or unknown permission does not grant private member access.'};
   const identity:MemberIdentity=freeze({displayName:actor==='user-a'?'Alex Sample':'Jordan Sample',initials:actor==='user-a'?'AS':'JS',assurance:'aal1',mode:'offline-authenticated'});
   const session=Object.freeze(Object.create(null)) as ValidatedSession;
   const validUntilMs=clock()+300000;
   issued.set(session,{owner:actor==='user-a'?A:B,scenario,identity,epoch,expiresAt:validUntilMs});
   return {status:'authenticated',session,identity,boundary:'offline-member-'+epoch+'-'+(++sequence),validUntilMs};
  },
  async readMember(session:ValidatedSession,{signal,expectedRevision}={}){
   if(signal?.aborted)return failure('aborted','The member request was cancelled.');
   const authority=session&&typeof session==='object'?issued.get(session):undefined;
   if(!authority||authority.epoch!==epoch||authority.expiresAt<=clock())return failure('forbidden','The session is no longer authorized.');
   try{
    if(options.wait)await options.wait();
    if(signal?.aborted)return failure('aborted','The member request was cancelled.');
    if(authority.epoch!==epoch||authority.expiresAt<=clock())return failure('forbidden','The session is no longer authorized.');
    if(authority.scenario==='network-error')return failure('error','The offline service could not be reached. Try again.');
    if(authority.scenario==='stale'||(expectedRevision!==undefined&&expectedRevision!==REV))return failure('conflict','The member snapshot changed. Reload before continuing.');
    const raw=options.fixtureFor?options.fixtureFor(authority.owner):createOfflineFixture(authority.owner);
    if(authority.scenario==='missing')return failure('missing','No member profile was returned.');
    return project(raw,authority);
   }catch{return failure('error','The member service is unavailable. Private data was not returned.');}
  },
  invalidate(){epoch++;}
 };
}
