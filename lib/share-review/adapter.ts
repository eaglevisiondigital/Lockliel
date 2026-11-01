/** Local review adapter only. No transport, persistence, events or real identity. */
import { catalogReadiness, projectCatalogItem, REQUEST_SCHEMA } from '../content-readiness-preview';
import { ACTIVE_STAGES, prepareShare, projectRelationship } from '../connections-preview';
import { LOCKLIEL_ORG, NO_EFFECTS, hasSyntheticGrant, isPlainText, isRecord, isRevision, isSyntheticContext, isSyntheticId } from '../synthetic-contracts/context';
import type { SyntheticContext, SyntheticCatalogItemV1 } from '../synthetic-contracts/context';

export const SHARE_FIXTURE_EPOCH = 1793534400000;
export const SHARE_SCENARIOS = ['ready','loading','empty','error','revoked','stale'] as const;
export type ShareScenario = typeof SHARE_SCENARIOS[number];
export type ShareChannel = 'in-app'|'email'|'sms';
export type ShareDraft = Readonly<{resourceId:string;contactId:string;channel:ShareChannel;message:string}>;
export type ShareSnapshot = Readonly<{
  schemaVersion:'lockliel-share-review-snapshot-v1';organizationId:typeof LOCKLIEL_ORG;
  scenario:ShareScenario;now:number;resources:readonly unknown[];contacts:readonly unknown[];
}>;
export type SharePreview = Readonly<{
  ownerId:string;resourceId:string;contactId:string;resourceRevision:number;contactRevision:number;consentRevision:number;
  resourceLabel:string;resourceType:string;recipientLabel:string;channel:ShareChannel;channelLabel:string;message:string;reviewedAt:string;
}>;
const blocked=()=>({status:'blocked' as const,message:'This preview is unavailable or has changed. Nothing was sent.',effects:NO_EFFECTS});
const exact=(input:unknown,keys:readonly string[]):input is Record<string,unknown>=>isRecord(input)&&Object.keys(input).length===keys.length&&keys.every(key=>Object.hasOwn(input,key));
const oneOf=(input:unknown,values:readonly string[]):input is string=>typeof input==='string'&&values.includes(input);
export function epochToCatalogTime(now:unknown):string|null {
  return typeof now==='number'&&Number.isSafeInteger(now)&&now>=0&&now<=8640000000000000?new Date(now).toISOString():null;
}
function snapshot(input:unknown):input is ShareSnapshot {
  return exact(input,['schemaVersion','organizationId','scenario','now','resources','contacts'])&&input.schemaVersion==='lockliel-share-review-snapshot-v1'&&
    input.organizationId===LOCKLIEL_ORG&&oneOf(input.scenario,SHARE_SCENARIOS)&&epochToCatalogTime(input.now)!==null&&
    Array.isArray(input.resources)&&input.resources.length<=6&&Array.isArray(input.contacts)&&input.contacts.length<=5;
}
const recipientNames:Readonly<Record<string,string>>=Object.freeze({'synthetic-share-person-one':'Alex Sample','synthetic-share-person-two':'Morgan Sample'});
const descriptions:Readonly<Record<string,string>>=Object.freeze({
  'synthetic-share-encouragement':'A small reminder to make room for hope in an ordinary day.',
  'synthetic-share-together':'An invitation to take a thoughtful next step, at your own pace.',
});
const KIND_LABELS:Readonly<Record<SyntheticCatalogItemV1['kind'],string>>=Object.freeze({'course-invitation':'Course invitation','resource-invitation':'Resource invitation',training:'Training preview',book:'Book preview'});
export const CHANNEL_LABELS:Readonly<Record<ShareChannel,string>>=Object.freeze({'in-app':'In-app preview',email:'Email preview',sms:'Text message preview'});
export function shareBoundary(context:unknown,boundaryKey:unknown):string|null {
  if(!isSyntheticContext(context)||typeof boundaryKey!=='string'||!boundaryKey.length||boundaryKey.length>160||/[\u0000-\u001f]/.test(boundaryKey))return null;
  return JSON.stringify([boundaryKey,context.organizationId,context.actorId,context.aal,context.sessionActive,[...context.grants].sort()]);
}
export function createShareSnapshot(context:SyntheticContext,scenario:ShareScenario='ready'):ShareSnapshot {
  const valid=isSyntheticContext(context)&&oneOf(scenario,SHARE_SCENARIOS);
  const item=(resourceId:string,label:string,visibility:'public'|'member'):SyntheticCatalogItemV1=>({schemaVersion:'lockliel-catalog-preview-v1',mode:'synthetic',organizationId:LOCKLIEL_ORG,
    resourceId,revision:scenario==='stale'?2:1,label,language:'en',kind:'resource-invitation',publication:'active',availability:'available',visibility,shareable:true});
  return {schemaVersion:'lockliel-share-review-snapshot-v1',organizationId:LOCKLIEL_ORG,scenario:valid?scenario:'error',now:SHARE_FIXTURE_EPOCH,
    resources:valid?[item('synthetic-share-encouragement','Synthetic Everyday Encouragement','public'),item('synthetic-share-together','Synthetic Learning Together','member')]:[],
    contacts:valid?Object.keys(recipientNames).map(id=>({relationship:{mode:'synthetic',organizationId:LOCKLIEL_ORG,id,ownerId:context.actorId,revision:1,stage:'invited',
      originalInviterId:null,latestCampaignId:null,assignedMentorId:null,assignedGroupId:null},
      consent:{mode:'synthetic',organizationId:LOCKLIEL_ORG,ownerId:context.actorId,contactId:id,state:scenario==='revoked'?'revoked':'accepted',scope:'resource-share',revision:1,expiresAt:SHARE_FIXTURE_EPOCH+3600000}})):[]};
}
function resolve(context:unknown,input:unknown,resourceId:unknown,contactId:unknown) {
  if(!isSyntheticContext(context)||!hasSyntheticGrant(context,'connections:share')||!snapshot(input)||!isSyntheticId(resourceId)||!isSyntheticId(contactId)||!['ready','revoked','stale'].includes(input.scenario))return null;
  const now=epochToCatalogTime(input.now)!;
  const resources=input.resources.map(projectCatalogItem).filter(item=>item?.resourceId===resourceId);
  if(resources.length!==1||!resources[0])return null;
  const resource=resources[0];
  const catalog=catalogReadiness(context,resource,{schemaVersion:REQUEST_SCHEMA,resourceId,revision:resource.revision,action:'share',now});
  const contacts=input.contacts.filter(row=>exact(row,['relationship','consent'])&&isRecord(row.relationship)&&row.relationship.id===contactId);
  if(!catalog.ok||contacts.length!==1||!exact(contacts[0],['relationship','consent']))return null;
  const row=contacts[0],owner=projectRelationship(context,row.relationship);
  if(owner.status!=='visible'||!(ACTIVE_STAGES as readonly string[]).includes(owner.relationship.stage)||!Object.hasOwn(recipientNames,contactId)||!isRecord(row.consent)||!isRevision(row.consent.revision)||
    row.consent.mode!=='synthetic'||row.consent.organizationId!==LOCKLIEL_ORG||row.consent.ownerId!==owner.relationship.ownerId||row.consent.contactId!==contactId||
    row.consent.state!=='accepted'||row.consent.scope!=='resource-share'||typeof row.consent.expiresAt!=='number'||!Number.isFinite(row.consent.expiresAt)||row.consent.expiresAt<=input.now)return null;
  return {context,input,resource,contact:owner.relationship,consent:row.consent,recipientLabel:recipientNames[contactId],now};
}
export function projectShareWorkspace(context:unknown,input:unknown) {
  if(!isSyntheticContext(context)||!hasSyntheticGrant(context,'connections:read')||!hasSyntheticGrant(context,'connections:share')||!snapshot(input))return {status:'blocked' as const,resources:[],recipients:[],effects:NO_EFFECTS};
  if(input.scenario!=='ready')return {status:input.scenario,resources:[],recipients:[],effects:NO_EFFECTS};
  const now=epochToCatalogTime(input.now)!;
  const resources=input.resources.flatMap(raw=>{
    const item=projectCatalogItem(raw);
    if(!item||!Object.hasOwn(descriptions,item.resourceId)||!catalogReadiness(context,item,{schemaVersion:REQUEST_SCHEMA,resourceId:item.resourceId,revision:item.revision,action:'discover',now}).ok)return [];
    return [{id:item.resourceId,label:item.label,description:descriptions[item.resourceId],kindLabel:KIND_LABELS[item.kind],audience:item.visibility==='member'?'Member resource':'Public resource'}];
  });
  const recipients=input.contacts.flatMap(raw=>{
    if(!exact(raw,['relationship','consent']))return [];
    const result=projectRelationship(context,raw.relationship);
    return result.status==='visible'&&Object.hasOwn(recipientNames,result.relationship.id)?[{id:result.relationship.id,label:recipientNames[result.relationship.id]}]:[];
  });
  if(new Set(resources.map(item=>item.id)).size!==resources.length||new Set(recipients.map(item=>item.id)).size!==recipients.length)return {status:'blocked' as const,resources:[],recipients:[],effects:NO_EFFECTS};
  return {status:resources.length&&recipients.length?'ready' as const:'empty' as const,resources,recipients,effects:NO_EFFECTS};
}
function readDraft(input:unknown):ShareDraft|null {
  if(!exact(input,['resourceId','contactId','channel','message'])||!isSyntheticId(input.resourceId)||!isSyntheticId(input.contactId)||!oneOf(input.channel,['in-app','email','sms'])||
    typeof input.message!=='string'||input.message.length>240||(input.message!==''&&!isPlainText(input.message,240))||/(?:https?:\/\/|www\.|@|\b\d[\d\s().+-]{6,}\d\b)/i.test(input.message))return null;
  return {resourceId:input.resourceId,contactId:input.contactId,channel:input.channel as ShareChannel,message:input.message.trim()};
}
/** Selection is only a review draft. It is not consent or an accepted L5 confirmation. */
export function buildSharePreview(context:unknown,input:unknown,selection:unknown) {
  const draft=readDraft(selection);
  if(!draft||!snapshot(input)||input.scenario!=='ready')return blocked();
  const data=resolve(context,input,draft.resourceId,draft.contactId);
  if(!data)return blocked();
  const preview:SharePreview={ownerId:data.contact.ownerId,resourceId:data.resource.resourceId,contactId:data.contact.id,
    resourceRevision:data.resource.revision,contactRevision:data.contact.revision,consentRevision:data.consent.revision as number,
    resourceLabel:data.resource.label,resourceType:KIND_LABELS[data.resource.kind],recipientLabel:data.recipientLabel,channel:draft.channel,channelLabel:CHANNEL_LABELS[draft.channel],message:draft.message,reviewedAt:data.now};
  return {status:'draft-preview' as const,preview,effects:NO_EFFECTS};
}
const previewKeys=['ownerId','resourceId','contactId','resourceRevision','contactRevision','consentRevision','resourceLabel','resourceType','recipientLabel','channel','channelLabel','message','reviewedAt'];
/** Always fetch the current local snapshot and invoke BOTH contracts again on explicit confirmation. */
export function confirmSharePreview(context:unknown,input:unknown,prepared:unknown,explicitConfirmation:unknown) {
  if(explicitConfirmation!==true||!exact(prepared,previewKeys)||!isSyntheticId(prepared.ownerId)||!isRevision(prepared.resourceRevision)||!isRevision(prepared.contactRevision)||!isRevision(prepared.consentRevision))return blocked();
  const draft=readDraft({resourceId:prepared.resourceId,contactId:prepared.contactId,channel:prepared.channel,message:prepared.message});
  if(!draft)return blocked();
  const data=resolve(context,input,draft.resourceId,draft.contactId);
  if(!data||data.contact.ownerId!==prepared.ownerId||data.resource.revision!==prepared.resourceRevision||data.contact.revision!==prepared.contactRevision||data.consent.revision!==prepared.consentRevision)return blocked();
  if(prepared.resourceLabel!==data.resource.label||prepared.resourceType!==KIND_LABELS[data.resource.kind]||prepared.recipientLabel!==data.recipientLabel||prepared.channelLabel!==CHANNEL_LABELS[draft.channel]||prepared.reviewedAt!==data.now)return blocked();
  const decision=prepareShare({context:data.context,contact:data.contact,consent:data.consent,resource:data.resource,now:data.input.now,
    confirmation:{mode:'synthetic',organizationId:LOCKLIEL_ORG,ownerId:data.contact.ownerId,contactId:data.contact.id,contactRevision:prepared.contactRevision,
      resourceId:data.resource.resourceId,resourceRevision:prepared.resourceRevision,consentRevision:prepared.consentRevision,confirmed:true}});
  if(decision.status!=='share-preview')return blocked();
  const preview:SharePreview={ownerId:data.contact.ownerId,resourceId:data.resource.resourceId,contactId:data.contact.id,resourceRevision:data.resource.revision,
    contactRevision:data.contact.revision,consentRevision:data.consent.revision as number,resourceLabel:data.resource.label,resourceType:KIND_LABELS[data.resource.kind],recipientLabel:data.recipientLabel,
    channel:draft.channel,channelLabel:CHANNEL_LABELS[draft.channel],message:draft.message,reviewedAt:data.now};
  return {status:'preview-confirmed' as const,delivery:'not-sent' as const,message:'Nothing was sent.' as const,preview,effects:NO_EFFECTS};
}
