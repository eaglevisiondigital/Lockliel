import {LOCKLIEL_ORG,NO_EFFECTS,hasSyntheticGrant,isRecord,isSyntheticContext,isSyntheticId,isRevision,isPlainText,isSyntheticOwner} from '../synthetic-contracts/context';
import type {SyntheticContext} from '../synthetic-contracts/context';

/** Proposals over invented records only; no runtime grants, operational execution or durable audit writes. */
export const OPS_SCHEMA='lockliel-ops-preview-v1' as const;
export const PURPOSE_GRANTS={
 'member-support':'ops:member-review',
 'privacy-review':'ops:privacy-review',
 'content-review':'ops:content-review',
 'account-integrity':'ops:account-integrity',
 'operations-report':'ops:report-view',
 'release-review':'ops:release-review',
} as const;
export type OpsPurpose=keyof typeof PURPOSE_GRANTS;
export type ScopedReview=Readonly<{
 mode:'synthetic'; organizationId:typeof LOCKLIEL_ORG; actorId:string; subjectId:string;
 purpose:OpsPurpose; revision:number; expiresAt:number; revoked:boolean; humanReviewed:boolean;
}>;
type Denied=Readonly<{ok:false;reason:'unavailable';effects:typeof NO_EFFECTS}>;
const denied=():Denied=>({ok:false,reason:'unavailable',effects:NO_EFFECTS});
const validTime=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
const purpose=(value:unknown):value is OpsPurpose=>typeof value==='string'&&Object.hasOwn(PURPOSE_GRANTS,value);
const scoped=(ctx:unknown,scope:unknown,subjectId:unknown,revision:unknown,requested:unknown,now:unknown):ctx is SyntheticContext=>{
 if(!purpose(requested)||!isSyntheticId(subjectId)||!isRevision(revision)||!validTime(now)||!hasSyntheticGrant(ctx,PURPOSE_GRANTS[requested],LOCKLIEL_ORG,2)||!isRecord(scope))return false;
 return scope.mode==='synthetic'&&scope.organizationId===ctx.organizationId&&scope.actorId===ctx.actorId&&scope.subjectId===subjectId&&scope.purpose===requested&&scope.revision===revision&&validTime(scope.expiresAt)&&scope.expiresAt>now&&scope.revoked===false&&scope.humanReviewed===true;
};
export function reviewStaffAuthorization(ctx:unknown,scope:unknown,input:unknown,now:unknown){
 if(!isRecord(input)||!scoped(ctx,scope,input.subjectId,input.revision,input.purpose,now))return denied();
 return {ok:true,mode:'synthetic',purpose:input.purpose,subjectId:input.subjectId,privilegeGranted:false,effects:NO_EFFECTS} as const;
}
export function projectMemberForPurpose(ctx:unknown,scope:unknown,record:unknown,requested:unknown,now:unknown){
 if(!isRecord(record)||record.mode!=='synthetic'||record.organizationId!==LOCKLIEL_ORG||!scoped(ctx,scope,record.id,record.revision,requested,now)||!['member-support','account-integrity'].includes(requested as string)||!isPlainText(record.displayLabel,80)||!record.displayLabel.startsWith('Synthetic ')||!['onboarding','active','unknown'].includes(record.status as string))return denied();
 return {ok:true,mode:'synthetic',member:{id:record.id as string,revision:record.revision as number,displayLabel:record.displayLabel,status:record.status as 'onboarding'|'active'|'unknown'},effects:NO_EFFECTS} as const;
}
export type PrivacyRequest=Readonly<{
 schemaVersion:typeof OPS_SCHEMA;mode:'synthetic';organizationId:typeof LOCKLIEL_ORG;
 id:string;ownerId:string;kind:'data-export'|'account-deletion';state:'requested'|'reviewed';revision:number;
 review:null|Readonly<{actorId:string;decision:'synthetic-approved'|'declined'}>;
}>;
export function isPrivacyRequest(value:unknown):value is PrivacyRequest{
 if(!isRecord(value)||value.schemaVersion!==OPS_SCHEMA||value.mode!=='synthetic'||value.organizationId!==LOCKLIEL_ORG||!isSyntheticId(value.id)||!isSyntheticId(value.ownerId)||!['data-export','account-deletion'].includes(value.kind as string)||!isRevision(value.revision))return false;
 if(value.state==='requested')return value.review===null&&value.revision===0;
 return value.state==='reviewed'&&value.revision>0&&isRecord(value.review)&&isSyntheticId(value.review.actorId)&&value.review.actorId!==value.ownerId&&['synthetic-approved','declined'].includes(value.review.decision as string);
}
const projectRequest=(r:PrivacyRequest):PrivacyRequest=>({schemaVersion:OPS_SCHEMA,mode:'synthetic',organizationId:LOCKLIEL_ORG,id:r.id,ownerId:r.ownerId,kind:r.kind,state:r.state,revision:r.revision,review:r.review?{actorId:r.review.actorId,decision:r.review.decision}:null});
export function createPrivacyRequest(ctx:unknown,input:unknown){
 if(!isRecord(input)||input.organizationId!==LOCKLIEL_ORG||!isSyntheticOwner(ctx,input.ownerId)||!hasSyntheticGrant(ctx,'privacy:request')||!isSyntheticId(input.id)||!['data-export','account-deletion'].includes(input.kind as string))return denied();
 const request:PrivacyRequest={schemaVersion:OPS_SCHEMA,mode:'synthetic',organizationId:LOCKLIEL_ORG,id:input.id,ownerId:ctx.actorId,kind:input.kind as PrivacyRequest['kind'],state:'requested',revision:0,review:null};
 return {ok:true,request,effects:NO_EFFECTS} as const;
}
export function projectOwnPrivacyRequest(ctx:unknown,request:unknown){
 if(!isPrivacyRequest(request)||!isSyntheticOwner(ctx,request.ownerId))return denied();
 return {ok:true,request:projectRequest(request),effects:NO_EFFECTS} as const;
}
export function reviewPrivacyRequest(ctx:unknown,scope:unknown,request:unknown,decision:unknown,expectedRevision:unknown,now:unknown){
 if(!isPrivacyRequest(request)||request.state!=='requested'||request.revision!==expectedRevision||!scoped(ctx,scope,request.id,request.revision,'privacy-review',now)||ctx.actorId===request.ownerId||!['synthetic-approved','declined'].includes(decision as string))return denied();
 return {ok:true,request:{...projectRequest(request),state:'reviewed',revision:request.revision+1,review:{actorId:ctx.actorId,decision:decision as 'synthetic-approved'|'declined'}},effects:NO_EFFECTS} as const;
}
export const PRIVACY_EXECUTION_GATES=['policy','identity','coverage','retention','revocation','operator','authorization'] as const;
function gates(value:unknown,keys:readonly string[]){
 if(!isRecord(value)||Object.keys(value).length!==keys.length)return null;
 if(keys.some(k=>!Object.hasOwn(value,k)||!['pass','blocked','unknown'].includes(value[k] as string)))return null;
 return keys.filter(k=>value[k]!=='pass');
}
export function planPrivacyExecution(ctx:unknown,scope:unknown,request:unknown,evidence:unknown,now:unknown){
 if(!isPrivacyRequest(request)||request.state!=='reviewed'||request.review?.decision!=='synthetic-approved'||!scoped(ctx,scope,request.id,request.revision,'privacy-review',now)||ctx.actorId===request.ownerId||ctx.actorId===request.review.actorId)return denied();
 const missing=gates(evidence,PRIVACY_EXECUTION_GATES);if(!missing)return denied();
 return {ok:true,mode:'synthetic',state:missing.length?'blocked':'synthetic-plan-only',missing,operation:request.kind,executionImplemented:false,effects:NO_EFFECTS} as const;
}
export const AUDIT_EVENTS=['privacy-requested','privacy-reviewed','content-reviewed','integrity-reviewed','release-reviewed'] as const;
export function prepareAuditEvent(ctx:unknown,scope:unknown,input:unknown,now:unknown){
 if(!isRecord(input)||!scoped(ctx,scope,input.subjectId,input.revision,input.purpose,now)||!AUDIT_EVENTS.includes(input.event as typeof AUDIT_EVENTS[number])||!['allowed','denied','held'].includes(input.outcome as string))return denied();
 const expected:Record<OpsPurpose,readonly string[]>={'member-support':[],'privacy-review':['privacy-requested','privacy-reviewed'],'content-review':['content-reviewed'],'account-integrity':['integrity-reviewed'],'operations-report':[],'release-review':['release-reviewed']};
 if(!expected[input.purpose as OpsPurpose].includes(input.event as string))return denied();
 return {ok:true,event:{schemaVersion:OPS_SCHEMA,mode:'synthetic',organizationId:ctx.organizationId,actorId:ctx.actorId,subjectId:input.subjectId,subjectRevision:input.revision,event:input.event,outcome:input.outcome,at:now},persisted:false,effects:NO_EFFECTS} as const;
}
export function prepareOperationalReport(ctx:unknown,scope:unknown,input:unknown,now:unknown){
 if(!isRecord(input)||input.organizationId!==LOCKLIEL_ORG||!scoped(ctx,scope,input.id,input.revision,'operations-report',now)||!isRecord(input.counts)||!isRevision(input.sampleSize)||input.sampleSize<5)return denied();
 const fields=['members','enrollments','lessons','progress','notes'];
 if(fields.some(k=>!Object.hasOwn(input.counts as object,k)||!isRevision((input.counts as Record<string,unknown>)[k])))return denied();
 const counts=Object.fromEntries(fields.map(k=>{const count=(input.counts as Record<string,number>)[k];return[k,count<5?null:count];}));
 return {ok:true,mode:'synthetic',counts,smallCells:'suppressed',operationalClaim:false,effects:NO_EFFECTS} as const;
}
export function reviewContentApproval(ctx:unknown,scope:unknown,input:unknown,now:unknown){
 if(!isRecord(input)||input.organizationId!==LOCKLIEL_ORG||input.mode!=='synthetic'||!scoped(ctx,scope,input.id,input.revision,'content-review',now)||!isSyntheticId(input.authorId)||ctx.actorId===input.authorId||input.state!=='submitted'||input.expectedRevision!==input.revision||input.revision===Number.MAX_SAFE_INTEGER||!['approve','decline'].includes(input.decision as string))return denied();
 const missing=gates(input.evidence,['rights','editorial','privacy','ownerDecision']);if(!missing)return denied();
 return {ok:true,mode:'synthetic',id:input.id,revision:Number(input.revision)+1,state:input.decision==='decline'?'declined':missing.length?'held':'synthetic-approved',missing,publicationActivated:false,effects:NO_EFFECTS} as const;
}
export const RELEASE_GATES=['provider','source','backendBinding','authAcceptance','accountDisposition','storageRecovery','pitrWindow','operator','migrationPlan','durations','oldClients','executionAuthorization'] as const;
export function reviewReleaseGates(ctx:unknown,scope:unknown,input:unknown,now:unknown){
 if(!isRecord(input)||input.organizationId!==LOCKLIEL_ORG||!scoped(ctx,scope,input.id,input.revision,'release-review',now))return denied();
 const missing=gates(input.gates,RELEASE_GATES);if(!missing)return denied();
 return {ok:true,mode:'synthetic',readiness:missing.length?'blocked':'synthetic-review-ready',missing,executeProduction:false,effects:NO_EFFECTS} as const;
}
export function reviewAccountIntegrity(ctx:unknown,scope:unknown,record:unknown,disposition:unknown,now:unknown){
 const projected=projectMemberForPurpose(ctx,scope,record,'account-integrity',now);
 if(!projected.ok||!['needs-owner-disposition','synthetic-run-evidence'].includes(disposition as string))return denied();
 return {ok:true,mode:'synthetic',subjectId:projected.member.id,state:'review-proposal-only',disposition,accountChanged:false,identityAttribution:'not-established',effects:NO_EFFECTS} as const;
}
export const COVERAGE_DOMAINS=['profile','contacts','consent','course-progress','private-course-notes','prayers','growth','public-intake','financial-retention','storage-bytes'] as const;
export function privacyCoverageReview(ctx:unknown,scope:unknown,input:unknown,now:unknown){
 if(!isRecord(input)||input.organizationId!==LOCKLIEL_ORG||!scoped(ctx,scope,input.id,input.revision,'privacy-review',now))return denied();
 const missing=gates(input.coverage,COVERAGE_DOMAINS);if(!missing)return denied();
 return {ok:true,mode:'synthetic',coverage:missing.length?'incomplete':'synthetic-complete',missing,exportCreated:false,deletionPerformed:false,effects:NO_EFFECTS} as const;
}
// This package deliberately has no live principal decoder, database access, audit sink or operation executor.
export const acceptsOnlySyntheticContext=isSyntheticContext;
