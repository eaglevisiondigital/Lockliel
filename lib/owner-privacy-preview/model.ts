/** Owner-only synthetic presentation, never a live settings or authorization adapter. */
import { PRIVATE_VISIBILITY } from '../../components/member-experience-preview/preview-model';
import { LOCKLIEL_ORG, NO_EFFECTS, hasSyntheticGrant, isRecord, isRevision, isSyntheticContext, isSyntheticOwner } from '../synthetic-contracts/context';
import type { SyntheticContext } from '../synthetic-contracts/context';

export const OWNER_PRIVACY_SCHEMA='lockliel-owner-privacy-preview-v1' as const;
export const PRIVACY_SCENARIOS=['ready','loading','empty','error'] as const;
export type PrivacyScenario=typeof PRIVACY_SCENARIOS[number];
export type VisibilityIdea='private'|'approved-connections';
export type PrivacyIdeas=Readonly<{
 photo:VisibilityIdea;faithBanner:VisibilityIdea;sharing:'not-given'|'review-idea';communications:'not-connected'|'review-idea';
}>;
export type PrivacyDraft=Readonly<{
 schemaVersion:typeof OWNER_PRIVACY_SCHEMA;mode:'synthetic';organizationId:typeof LOCKLIEL_ORG;ownerId:string;revision:number;ideas:PrivacyIdeas;
}>;
export const PRIVATE_IDEAS:PrivacyIdeas=Object.freeze({photo:PRIVATE_VISIBILITY.photo,faithBanner:PRIVATE_VISIBILITY.faithBanner,sharing:'not-given',communications:'not-connected'});
const OWNER_IDS:readonly string[]=['synthetic-a','synthetic-b'];
const oneOf=(value:unknown,allowed:readonly string[]):value is string=>typeof value==='string'&&allowed.includes(value);
const exact=(value:unknown,keys:readonly string[]):value is Record<string,unknown>=>isRecord(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key))&&Object.values(Object.getOwnPropertyDescriptors(value)).every(descriptor=>Object.hasOwn(descriptor,'value'));
export function isPrivacyOwner(context:unknown):context is SyntheticContext {
 return exact(context,['schemaVersion','mode','organizationId','actorId','aal','sessionActive','grants'])&&Array.isArray(context.grants)&&Object.values(Object.getOwnPropertyDescriptors(context.grants)).every(descriptor=>Object.hasOwn(descriptor,'value'))&&isSyntheticContext(context)&&OWNER_IDS.includes(context.actorId)&&hasSyntheticGrant(context,'member:read');
}
export function privacyBoundary(context:unknown,boundaryKey:unknown):string|null {
 if(!isPrivacyOwner(context)||typeof boundaryKey!=='string'||!boundaryKey.length||boundaryKey.length>160||/[\u0000-\u001f]/.test(boundaryKey))return null;
 return JSON.stringify([boundaryKey,context.organizationId,context.actorId,context.aal,context.sessionActive,[...context.grants].sort()]);
}
export function createPrivacyDraft(context:unknown):PrivacyDraft|null {
 return isPrivacyOwner(context)?{schemaVersion:OWNER_PRIVACY_SCHEMA,mode:'synthetic',organizationId:LOCKLIEL_ORG,ownerId:context.actorId,revision:0,ideas:{...PRIVATE_IDEAS}}:null;
}
function ideas(value:unknown):value is PrivacyIdeas {
 return exact(value,['photo','faithBanner','sharing','communications'])&&oneOf(value.photo,['private','approved-connections'])&&
  oneOf(value.faithBanner,['private','approved-connections'])&&oneOf(value.sharing,['not-given','review-idea'])&&oneOf(value.communications,['not-connected','review-idea']);
}
function ownDraft(context:unknown,value:unknown):value is PrivacyDraft {
 return isPrivacyOwner(context)&&exact(value,['schemaVersion','mode','organizationId','ownerId','revision','ideas'])&&value.schemaVersion===OWNER_PRIVACY_SCHEMA&&
  value.mode==='synthetic'&&value.organizationId===LOCKLIEL_ORG&&isSyntheticOwner(context,value.ownerId)&&isRevision(value.revision)&&ideas(value.ideas);
}
const unavailable=()=>({status:'unavailable' as const,liveStatus:'unknown' as const,effects:NO_EFFECTS});
/** This changes only an in-memory what-if DTO. It cannot create permission, consent or delivery. */
export function changePrivacyIdea(context:unknown,current:unknown,change:unknown,expectedRevision:unknown) {
 if(!ownDraft(context,current)||current.revision!==expectedRevision||current.revision===Number.MAX_SAFE_INTEGER||!exact(change,['field','value'])||
  !oneOf(change.field,['photo','faithBanner','sharing','communications']))return unavailable();
 const field=change.field as keyof PrivacyIdeas;
 const next={photo:current.ideas.photo,faithBanner:current.ideas.faithBanner,sharing:current.ideas.sharing,communications:current.ideas.communications,[field]:change.value};
 if(!ideas(next))return unavailable();
 return {status:'local-idea' as const,draft:{schemaVersion:OWNER_PRIVACY_SCHEMA,mode:'synthetic' as const,organizationId:LOCKLIEL_ORG,ownerId:current.ownerId,revision:current.revision+1,
  ideas:{photo:next.photo,faithBanner:next.faithBanner,sharing:next.sharing,communications:next.communications}},liveStatus:'unknown' as const,effects:NO_EFFECTS};
}
export type PrivacyArea=Readonly<{
 id:'photo'|'faithBanner'|'prayers'|'growth'|'anchors'|'myFive'|'sharing'|'communications';title:string;description:string;localStatus:string;rule:string;liveStatus:'unknown';
}>;
/** Field allowlist: no raw profile, prayers, notes, contacts, addresses or operational request record escapes. */
export function projectOwnerPrivacy(context:unknown,current:unknown,scenario:unknown='ready') {
 if(!ownDraft(context,current)||!oneOf(scenario,PRIVACY_SCENARIOS))return unavailable();
 if(scenario!=='ready')return {status:scenario as Exclude<PrivacyScenario,'ready'>,liveStatus:'unknown' as const,effects:NO_EFFECTS};
 const values=current.ideas;
 const visibility=(value:VisibilityIdea)=>value==='private'?'Private in this sample':'Audience idea only';
 const area=(id:PrivacyArea['id'],title:string,description:string,localStatus:string,rule:string):PrivacyArea=>({id,title,description,localStatus,rule,liveStatus:'unknown'});
 const areas:readonly PrivacyArea[]=[
  area('photo','Profile photo','Choose whether an optional photo belongs in a future member card.',visibility(values.photo),'An audience selection is not a permission grant. Uploads and real audience access are not connected.'),
  area('faithBanner','Faith Banner','A short encouragement can be personal, and it can stay private.',visibility(values.faithBanner),'Only an explicitly approved audience could receive it in a future verified flow. A banner is not a spiritual assessment or role.'),
  area('prayers','Prayer Board','Personal prayers are private reflections, not a group feed.','Private in this sample','This panel cannot share prayer content or notify an inviter, mentor, leader or group. No prayer content is read here.'),
  area('growth','Personal growth','Growth areas and action plans are for your own reflection.','Private in this sample','No score, assessment, progress detail or personal action plan is exposed to another person here.'),
  area('anchors','Scripture Anchors','Your saved-reference idea and personal reflection are separate from public Scripture.','Private in this sample','A reference does not make your reflection public. No anchor or private reflection is loaded into this panel.'),
  area('myFive','My Five relationships','A personal follow-up list is not a public member directory.','Private in this sample','Original inviter, latest campaign, assigned mentor or group and actual access permissions remain separate.'),
  area('sharing','Sharing consent','Choosing a recipient or reviewing a resource cannot create their consent.',values.sharing==='not-given'?'No consent created':'Review idea only','Any future share must recheck the relevant current consent, access and resource. No consent is accepted or changed here.'),
  area('communications','Communication preferences','Email, text and in-app choices need their own clear purpose and permission.',values.communications==='not-connected'?'No channel connected':'Preference idea only','A preview format is not delivery permission. No address is loaded, no preference is saved and no message is sent.'),
 ];
 const localIdeas=Number(values.photo!==PRIVATE_IDEAS.photo)+Number(values.faithBanner!==PRIVATE_IDEAS.faithBanner)+Number(values.sharing!==PRIVATE_IDEAS.sharing)+Number(values.communications!==PRIVATE_IDEAS.communications);
 return {status:'ready' as const,liveStatus:'unknown' as const,areas,localIdeas,ideas:{photo:values.photo,faithBanner:values.faithBanner,sharing:values.sharing,communications:values.communications},
  audiencePermissionGranted:false,consentCreated:false,deliveryConnected:false,rolesGranted:false,effects:NO_EFFECTS};
}
