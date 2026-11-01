/** Pure synthetic review contracts. Caller fixtures are never server authorization or RLS. */
import { LOCKLIEL_ORG, NO_EFFECTS, hasSyntheticGrant, isPlainText, isRecord, isRevision,
  isSyntheticId, isSyntheticOwner } from '../synthetic-contracts/context';
import type { SyntheticCatalogItemV1 } from '../synthetic-contracts/context';

export const ACTIVE_STAGES = ['praying', 'invited', 'connected', 'growing'] as const;
export const FIVE_ACTIVE_LIMIT = 5;
export type Stage = typeof ACTIVE_STAGES[number] | 'paused' | 'completed';
export type Relationship = Readonly<{
  mode:'synthetic'; organizationId:typeof LOCKLIEL_ORG; id:string; ownerId:string; revision:number;
  stage:Stage; originalInviterId:string|null; latestCampaignId:string|null;
  assignedMentorId:string|null; assignedGroupId:string|null;
}>;
export type Consent = Readonly<{
  mode:'synthetic'; organizationId:typeof LOCKLIEL_ORG; ownerId:string; contactId:string;
  state:'invited'|'accepted'|'declined'|'revoked'; scope:'resource-share'|'follow-up'; revision:number; expiresAt:number;
}>;
export type Denial = Readonly<{status:'denied';effects:typeof NO_EFFECTS}>;
const DENIED:Denial = Object.freeze({status:'denied',effects:NO_EFFECTS});
const stages:readonly string[]=[...ACTIVE_STAGES,'paused','completed'];
const active=(stage:Stage)=> (ACTIVE_STAGES as readonly string[]).includes(stage);
const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const enumValue=(value:unknown,choices:readonly string[]):value is string=>typeof value==='string'&&choices.includes(value);
function fixture(value:unknown):value is Record<string,unknown> {
  return isRecord(value)&&value.mode==='synthetic'&&value.organizationId===LOCKLIEL_ORG;
}
function relationship(value:unknown):value is Relationship {
  return fixture(value)&&isSyntheticId(value.id)&&isSyntheticId(value.ownerId)&&isRevision(value.revision)&&
    enumValue(value.stage,stages)&&
    ['originalInviterId','latestCampaignId','assignedMentorId','assignedGroupId'].every(key=>value[key]===null||isSyntheticId(value[key]));
}
function owned(context:unknown,value:unknown,grant='connections:read'):value is Relationship {
  return relationship(value)&&isSyntheticOwner(context,value.ownerId)&&hasSyntheticGrant(context,grant);
}
function project(value:Relationship):Relationship {
  return {mode:'synthetic',organizationId:LOCKLIEL_ORG,id:value.id,ownerId:value.ownerId,revision:value.revision,
    stage:value.stage,originalInviterId:value.originalInviterId,latestCampaignId:value.latestCampaignId,
    assignedMentorId:value.assignedMentorId,assignedGroupId:value.assignedGroupId};
}
/** Only owner-visible relationship metadata. No arbitrary fields or inferred access permission. */
export function projectRelationship(context:unknown,value:unknown) {
  return owned(context,value)?{status:'visible' as const,relationship:project(value),effects:NO_EFFECTS}:DENIED;
}
/** Models capacity only; cannot enforce concurrent writes or replace the existing database constraint. */
export function reviewCapacity(context:unknown,existing:unknown,candidate:unknown) {
  if(!owned(context,candidate,'connections:edit')||!Array.isArray(existing)||existing.length>1000||existing.some(row=>!owned(context,row)))return DENIED;
  const rows=existing as Relationship[];
  if(new Set(rows.map(row=>row.id)).size!==rows.length)return DENIED;
  const current=rows.find(row=>row.id===candidate.id);
  if(current&&current.revision!==candidate.revision)return DENIED;
  const count=rows.filter(row=>row.id!==candidate.id&&active(row.stage)).length+Number(active(candidate.stage));
  return count<=FIVE_ACTIVE_LIMIT?{status:'capacity-reviewed' as const,activeCountAfter:count,effects:NO_EFFECTS}:DENIED;
}
/** Notes stay owner-private even after contact consent is revoked, mirroring existing live behavior. */
export function reviewPrivateNote(context:unknown,contact:unknown,note:unknown,expectedRevision:unknown) {
  if(!owned(context,contact,'connections:edit')||contact.revision!==expectedRevision||typeof note!=='string'||note.length>3000||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(note))return DENIED;
  return {status:'private-note-draft' as const,contactId:contact.id,ownerId:contact.ownerId,note:note.trim(),visibility:'owner-only' as const,effects:NO_EFFECTS};
}
function validConsent(value:unknown,contact:Relationship,now:number,scope:Consent['scope']):value is Consent {
  return fixture(value)&&value.ownerId===contact.ownerId&&value.contactId===contact.id&&value.state==='accepted'&&
    value.scope===scope&&isRevision(value.revision)&&finite(value.expiresAt)&&value.expiresAt>now;
}
/** This stricter linked-member preview never invents permission for an unlinked real contact. */
export function reviewReminder(context:unknown,contact:unknown,consent:unknown,expectedRevision:unknown,at:unknown,now:unknown) {
  if(!owned(context,contact,'connections:edit')||contact.revision!==expectedRevision||!active(contact.stage)||!finite(now)||!validConsent(consent,contact,now,'follow-up'))return DENIED;
  if(at!==null&&(!finite(at)||at<=now||at>now+366*86400000))return DENIED;
  return {status:'reminder-draft' as const,contactId:contact.id,at,effects:NO_EFFECTS};
}
const catalogKeys=['schemaVersion','mode','organizationId','resourceId','revision','label','language','kind','publication','availability','visibility','shareable'];
/** Structural L6 contract validation, deliberately no sibling imports or URL/content fields. */
export function isShareableCatalogItem(value:unknown):value is SyntheticCatalogItemV1 {
  return fixture(value)&&Object.keys(value).length===catalogKeys.length&&catalogKeys.every(key=>Object.hasOwn(value,key))&&
    value.schemaVersion==='lockliel-catalog-preview-v1'&&isSyntheticId(value.resourceId)&&isRevision(value.revision)&&
    isPlainText(value.label,160)&&typeof value.language==='string'&&/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,2}$/.test(value.language)&&
    enumValue(value.kind,['course-invitation','resource-invitation','training','book'])&&value.publication==='active'&&
    value.availability==='available'&&enumValue(value.visibility,['public','member'])&&value.shareable===true;
}
/** An entitled item is held until a future authoritative rights/access service exists. */
export function prepareShare(input:{context:unknown;contact:unknown;consent:unknown;resource:unknown;confirmation:unknown;now:unknown}) {
  const {context,contact,consent,resource,confirmation,now}=input;
  if(!owned(context,contact,'connections:share')||!active(contact.stage)||!finite(now)||!validConsent(consent,contact,now,'resource-share')||!isShareableCatalogItem(resource))return DENIED;
  if(resource.visibility==='member'&&!hasSyntheticGrant(context,'member:read'))return DENIED;
  if(!fixture(confirmation)||confirmation.confirmed!==true||confirmation.ownerId!==contact.ownerId||confirmation.contactId!==contact.id||
    confirmation.contactRevision!==contact.revision||confirmation.resourceId!==resource.resourceId||confirmation.resourceRevision!==resource.revision||
    confirmation.consentRevision!==consent.revision)return DENIED;
  return {status:'share-preview' as const,contactId:contact.id,resourceId:resource.resourceId,effects:NO_EFFECTS};
}
/** A member can preview only their own synthetic membership, never a roster or other member's role. */
export function projectMembership(context:unknown,value:unknown) {
  if(!fixture(value)||!isSyntheticId(value.memberId)||!isSyntheticId(value.groupId)||!isRevision(value.revision)||
    !isSyntheticOwner(context,value.memberId)||!hasSyntheticGrant(context,'groups:read-self')||
    !enumValue(value.state,['invited','active','left','revoked']))return DENIED;
  return {status:'membership-preview' as const,membership:{groupId:value.groupId,memberId:value.memberId,
    revision:value.revision,state:value.state},effects:NO_EFFECTS};
}
export type GroupAction='join-request'|'host-request'|'invitation-response'|'review-host'|'review-leader'|'growth-plan';
/** Requests and invitation responses are human-review proposals, never group membership or leadership. */
export function reviewGroupAction(context:unknown,request:unknown,now:unknown) {
  if(!fixture(request)||!finite(now)||!isSyntheticId(request.requesterId)||!isRevision(request.revision)||!isSyntheticOwner(context,request.requesterId)||
    !hasSyntheticGrant(context,'groups:request')||request.confirmed!==true)return DENIED;
  const base={groupId:request.groupId,requesterId:request.requesterId,effects:NO_EFFECTS};
  if(request.action==='join-request'||request.action==='host-request') {
    if(!isSyntheticId(request.groupId))return DENIED;
    return {status:'human-review-required' as const,action:request.action,...base};
  }
  if(request.action==='invitation-response') {
    if(!isSyntheticId(request.groupId)||!isSyntheticId(request.invitationId)||request.invitationState!=='invited'||request.invitationRecipientId!==request.requesterId||
      !finite(request.expiresAt)||request.expiresAt<=now||!enumValue(request.response,['accept','decline']))return DENIED;
    return {status:'invitation-response-draft' as const,response:request.response,...base};
  }
  if(request.action==='review-host'||request.action==='review-leader') {
    if(!isSyntheticId(request.groupId)||!isSyntheticId(request.subjectId)||request.subjectId===request.requesterId||
      !hasSyntheticGrant(context,'groups:review',LOCKLIEL_ORG,2)||request.humanReviewed!==true||
      !enumValue(request.decision,['recommend','decline']))return DENIED;
    return {status:'approval-proposal-only' as const,subjectId:request.subjectId,decision:request.decision,...base};
  }
  if(request.action==='growth-plan') {
    if(!isSyntheticId(request.groupId)||!isSyntheticId(request.proposedGroupId)||request.proposedGroupId===request.groupId||
      !isPlainText(request.nextStep,240))return DENIED;
    return {status:'multiplication-review-required' as const,proposedGroupId:request.proposedGroupId,...base};
  }
  return DENIED;
}
