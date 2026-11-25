/** Display DTOs only. A fixture-authenticated state is never a real login. */
export const MEMBER_READ_VERSION = 'lockliel-member-read-v1' as const;
/** Reviewed public invitation destinations in this offline fixture, not protected routes. */
export const OFFLINE_PUBLIC_RESOURCE_PATHS:readonly string[]=Object.freeze(['/faith-boost','/getting-a-grip']);
export type FixtureActor = 'user-a'|'user-b'|'anonymous'|'expired'|'staff';
export type ReadScenario = 'ready'|'missing'|'network-error'|'stale'|'unauthorized'|'unknown-permissions';
export type UnavailableReason = 'backend-required'|'privacy-decision-pending'|'consent-unverified'|'upstream-unknown';
export type FeatureRead<T> = Readonly<{status:'ready';value:T;revision:string;source:'existing-api-fixture'}|{status:'unavailable';reason:UnavailableReason;message:string}>;
declare const sessionBrand:unique symbol;
/** Not serialized. Runtime provenance is checked by the issuing adapter's WeakMap. */
export type ValidatedSession = Readonly<{readonly [sessionBrand]:true}>;
export type MemberIdentity = Readonly<{displayName:string;initials:string;assurance:'aal1'|'aal2';mode:'offline-authenticated'}>;
export type SessionResult = Readonly<{status:'authenticated';session:ValidatedSession;identity:MemberIdentity;boundary:string;validUntilMs:number}|{status:'anonymous'|'expired'|'forbidden'|'error';message:string}>;
export type ProfileRead = Readonly<{displayName:string;initials:string;onboardingStatus:string}>;
export type CommunicationsRead = Readonly<{ministryEmail:boolean;faithBoostEmail:boolean;bookReleaseEmail:boolean;partnerEmail:boolean;smsUpdates:boolean}>;
export type CourseProgressRead = Readonly<{title:string;completed:number;total:number;maintenance:boolean}>;
export type RelationshipRead = Readonly<{id:string;label:string;revision:string;status:string;shareEligibility:'unavailable';consent:'unknown'}>;
export type ResourceRead = Readonly<{id:string;title:string;type:string;description:string;href:string;shareEligible:false}>;
export type MemberReadModel = Readonly<{
 version:typeof MEMBER_READ_VERSION;revision:string;identity:MemberIdentity;
 profile:FeatureRead<ProfileRead>;communications:FeatureRead<CommunicationsRead>;courseProgress:FeatureRead<CourseProgressRead>;
 myFive:FeatureRead<readonly RelationshipRead[]>;catalog:FeatureRead<readonly ResourceRead[]>;
 photo:FeatureRead<never>;faithBanner:FeatureRead<never>;scripturePreferences:FeatureRead<never>;anchors:FeatureRead<never>;prayers:FeatureRead<never>;growth:FeatureRead<never>;actionPlans:FeatureRead<never>;
 sharing:FeatureRead<never>;privacy:Readonly<{status:'unknown';message:string}>;
}>;
export type MemberReadResult = Readonly<{status:'ready';data:MemberReadModel}|{status:'missing'|'unavailable'|'error'|'forbidden'|'conflict'|'aborted';message:string}>;
export type ReadOptions = Readonly<{signal?:AbortSignal;expectedRevision?:string}>;
/** A connected implementation must call existing server requireSession and active-session validation.
 * It must never mint authority from this browser's fixture choice or a supplied owner ID.
 * No connected implementation or network transport is included in Wave 7. */
export interface MemberReadPort {
 validateSession(actor:FixtureActor,scenario?:ReadScenario):Promise<SessionResult>;
 readMember(session:ValidatedSession,options?:ReadOptions):Promise<MemberReadResult>;
 invalidate():void;
}
/** Future server-only seam, deliberately separate from the offline actor-selection interface. */
export interface ExistingBffSessionPort<RequestContext> {
 validateCurrentRequest(context:RequestContext):Promise<{status:'authenticated';session:ValidatedSession}|{status:'anonymous'|'expired'|'forbidden'|'error'}>;
 readOwner(session:ValidatedSession,options?:ReadOptions):Promise<MemberReadResult>;
}
export type MemberLoadState = Readonly<{status:'idle'|'loading';generation:number}|{status:'ready';generation:number;boundary:string;data:MemberReadModel}|{status:'anonymous'|'expired'|'forbidden'|'error'|'missing'|'unavailable'|'conflict'|'aborted';generation:number;message:string}>;

/** PROPOSED display contracts only. No authoritative endpoint/schema exists for these
 * domains in this candidate. They are not used as successful fixture responses. */
export type ProposedPrivateReference = Readonly<{providerId:string;editionId:string;referenceId:string}>;
export type ProposedPhotoMetadataRead = Readonly<{assetId:string;revision:string;state:'processing'|'ready'|'rejected';visibility:'private';alternativeText:string}>;
export type ProposedFaithBannerRead = Readonly<{bannerId:string;revision:string;visibility:'private'}>;
export type ProposedScripturePreferencesRead = Readonly<{providerId:string;editionId:string;revision:string}>;
/** Bodies go only to their owner-only module, never dashboard/share projections. */
export type ProposedScriptureAnchorRead = Readonly<{id:string;revision:string;reference:ProposedPrivateReference;privateReflection:string}>;
export type ProposedPrayerRead = Readonly<{id:string;revision:string;privateBody:string;state:'open'|'archived'}>;
export type ProposedGrowthAreaRead = Readonly<{id:string;revision:string;title:string;privateReflection:string;state:'active'|'archived'}>;
export type ProposedActionPlanRead = Readonly<{id:string;revision:string;title:string;growthAreaId:string|null;steps:readonly Readonly<{id:string;label:string;state:'planned'|'done'|'skipped'}>[]} >;
