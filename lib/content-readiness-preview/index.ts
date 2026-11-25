/** Pure synthetic readiness models. No live trust, content delivery or authorization adapter. */
import {
  LOCKLIEL_ORG, NO_EFFECTS, hasSyntheticGrant, isPlainText, isRecord,
  isRevision, isSyntheticContext, isSyntheticId, isSyntheticOwner,
} from '../synthetic-contracts/context';
import type { SyntheticCatalogItemV1 } from '../synthetic-contracts/context';
export type { SyntheticCatalogItemV1 } from '../synthetic-contracts/context';

export const CATALOG_SCHEMA = 'lockliel-catalog-preview-v1' as const;
export const REQUEST_SCHEMA = 'lockliel-content-request-v1' as const;
export const ENTITLEMENT_SCHEMA = 'lockliel-content-entitlement-v1' as const;
export const PUBLICATION_SCHEMA = 'lockliel-content-publication-v1' as const;
export const INTAKE_SCHEMA = 'lockliel-content-intake-v1' as const;
export const FOUNDERS_SCHEMA = 'lockliel-founders-preview-v1' as const;
export const CONSENT_VERSION = 'content-consent-v1' as const;
export type PreviewResult<T> = Readonly<
  { ok: false; state: 'blocked'; effects: typeof NO_EFFECTS } |
  { ok: true; state: 'synthetic-ready'; effects: typeof NO_EFFECTS; value: T }
>;
const denied = (): PreviewResult<never> => Object.freeze({ ok: false, state: 'blocked', effects: NO_EFFECTS });
const ready = <T>(value: T): PreviewResult<T> => Object.freeze({ ok: true, state: 'synthetic-ready', effects: NO_EFFECTS, value });
const exact = (value: unknown, keys: readonly string[]): value is Record<string, unknown> =>
  isRecord(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const oneOf = (value: unknown, choices: readonly string[]): value is string => typeof value === 'string' && choices.includes(value);
const timestamp = (value: unknown): value is string => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const catalogKeys = ['schemaVersion','mode','organizationId','resourceId','revision','label','language','kind','publication','availability','visibility','shareable'];

/** Strict projection rejects extra data instead of silently passing through private fields. */
export function projectCatalogItem(input: unknown): SyntheticCatalogItemV1 | null {
  if (!exact(input, catalogKeys) || input.schemaVersion !== CATALOG_SCHEMA || input.mode !== 'synthetic' ||
    input.organizationId !== LOCKLIEL_ORG || !isSyntheticId(input.resourceId) || !isRevision(input.revision) ||
    !isPlainText(input.label, 120) || !/^Synthetic [A-Za-z0-9][A-Za-z0-9 '(),!?-]{0,109}$/.test(input.label) ||
    typeof input.language !== 'string' || !/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(input.language) ||
    !oneOf(input.kind, ['course-invitation','resource-invitation','training','book']) ||
    !oneOf(input.publication, ['inactive','active']) || !oneOf(input.availability, ['available','unavailable']) ||
    !oneOf(input.visibility, ['public','member','entitled']) || typeof input.shareable !== 'boolean') return null;
  // New object with exactly the shared consumer contract. No input object or nested references escape.
  return Object.freeze({
    schemaVersion: CATALOG_SCHEMA, mode: 'synthetic', organizationId: LOCKLIEL_ORG,
    resourceId: input.resourceId, revision: input.revision, label: input.label, language: input.language,
    kind: input.kind as SyntheticCatalogItemV1['kind'], publication: input.publication as SyntheticCatalogItemV1['publication'],
    availability: input.availability as SyntheticCatalogItemV1['availability'], visibility: input.visibility as SyntheticCatalogItemV1['visibility'],
    shareable: input.shareable,
  });
}
export function buildCatalogItem(input: unknown): PreviewResult<SyntheticCatalogItemV1> {
  const item = projectCatalogItem(input);
  return item ? ready(item) : denied();
}

const requestKeys = ['schemaVersion','resourceId','revision','action','now'];
const entitlementKeys = ['schemaVersion','organizationId','ownerId','resourceId','revision','expiresAt','revoked'];
function matchingEntitlement(context: unknown, item: SyntheticCatalogItemV1, entitlement: unknown, now: string): boolean {
  return hasSyntheticGrant(context, 'content:read') && exact(entitlement, entitlementKeys) &&
    entitlement.schemaVersion === ENTITLEMENT_SCHEMA && entitlement.organizationId === LOCKLIEL_ORG &&
    isSyntheticOwner(context, entitlement.ownerId) && entitlement.resourceId === item.resourceId &&
    entitlement.revision === item.revision && timestamp(entitlement.expiresAt) &&
    Date.parse(entitlement.expiresAt) > Date.parse(now) && entitlement.revoked === false;
}
export type CatalogDecision = Readonly<{
  resourceId: string; revision: number; action: 'discover'|'share'|'read';
  metadataOnly: true; contentDelivered: false; productionActivation: false;
}>;
/** All supplied contexts/entitlements are test fixtures, never production authorization. */
export function catalogReadiness(context: unknown, input: unknown, request: unknown, entitlement: unknown = null): PreviewResult<CatalogDecision> {
  const item = projectCatalogItem(input);
  if (!isSyntheticContext(context) || !item || !exact(request, requestKeys) || request.schemaVersion !== REQUEST_SCHEMA ||
    request.resourceId !== item.resourceId || request.revision !== item.revision || !timestamp(request.now) ||
    !oneOf(request.action, ['discover','share','read']) || item.publication !== 'active' || item.availability !== 'available') return denied();
  if (item.visibility === 'member' && !hasSyntheticGrant(context, 'member:read')) return denied();
  const entitled = matchingEntitlement(context, item, entitlement, request.now);
  if (item.visibility === 'entitled' && !entitled) return denied();
  if (request.action === 'share' && !item.shareable) return denied();
  // Reader readiness for books/facilitator training always needs an independent, current entitlement fixture.
  if (request.action === 'read' && (!['book','training'].includes(item.kind) || !entitled)) return denied();
  return ready(Object.freeze({ resourceId: item.resourceId, revision: item.revision,
    action: request.action as CatalogDecision['action'], metadataOnly: true, contentDelivered: false, productionActivation: false }));
}

export function publicationReadiness(context: unknown, input: unknown, evidence: unknown): PreviewResult<Readonly<{ reviewOnly: true; publish: false }>> {
  const item = projectCatalogItem(input);
  const keys = ['schemaVersion','organizationId','resourceId','revision','reviewedRevision','rights','decision'];
  if (!hasSyntheticGrant(context, 'content:review', LOCKLIEL_ORG, 2) || !item || !exact(evidence, keys) ||
    evidence.schemaVersion !== PUBLICATION_SCHEMA || evidence.organizationId !== LOCKLIEL_ORG ||
    evidence.resourceId !== item.resourceId || evidence.revision !== item.revision || evidence.reviewedRevision !== item.revision ||
    evidence.rights !== 'invented-placeholder-only' || evidence.decision !== 'approved-fixture' ||
    item.publication !== 'active' || item.availability !== 'available') return denied();
  return ready(Object.freeze({ reviewOnly: true, publish: false }));
}

export type IntakeDecision = Readonly<{
  purpose: 'resource-updates'|'founders-followup'; preparedOnly: true; persistence: 'none';
  mailboxVerification: 'not-verified-by-contract'; memberIdentity: 'not-created'; delivery: 'not-sent';
  resourceCookieProvesIdentity: false;
}>;
export function intakeReadiness(context: unknown, input: unknown, expectedRevision: unknown): PreviewResult<IntakeDecision> {
  const keys = ['schemaVersion','organizationId','ownerId','revision','purpose','channel','consent','consentVersion','leadAccess'];
  if (!exact(input, keys) || input.schemaVersion !== INTAKE_SCHEMA || input.organizationId !== LOCKLIEL_ORG ||
    !isSyntheticOwner(context, input.ownerId) || !isRevision(expectedRevision) || input.revision !== expectedRevision ||
    !oneOf(input.purpose, ['resource-updates','founders-followup']) || input.channel !== 'email' || input.consent !== 'given' ||
    input.consentVersion !== CONSENT_VERSION || !oneOf(input.leadAccess, ['absent','present'])) return denied();
  return ready(Object.freeze({ purpose: input.purpose as IntakeDecision['purpose'], preparedOnly: true, persistence: 'none',
    mailboxVerification: 'not-verified-by-contract', memberIdentity: 'not-created', delivery: 'not-sent', resourceCookieProvesIdentity: false }));
}

export type FoundersDecision = Readonly<{
  application: 'not-started'|'draft'|'submitted'|'withdrawn'; orientation: 'not-started'|'in-progress'|'completed';
  humanReview: 'not-reviewed'|'pending'|'approved-fixture'|'declined-fixture';
  nextStep: 'prepare-application'|'submit-application'|'complete-orientation'|'await-human-review'|'review-fixture-complete'|'withdrawn'|'decision-held';
  rolesGranted: false; staffAccessGranted: false; facilitatorEntitlementGranted: false;
}>;
export function foundersReadiness(context: unknown, input: unknown, expectedRevision: unknown): PreviewResult<FoundersDecision> {
  const keys = ['schemaVersion','organizationId','ownerId','revision','application','orientation','humanReview','recruiting','descriptiveTags'];
  if (!exact(input, keys) || input.schemaVersion !== FOUNDERS_SCHEMA || input.organizationId !== LOCKLIEL_ORG ||
    !isSyntheticOwner(context, input.ownerId) || !isRevision(expectedRevision) || input.revision !== expectedRevision ||
    !oneOf(input.application, ['not-started','draft','submitted','withdrawn']) ||
    !oneOf(input.orientation, ['not-started','in-progress','completed']) ||
    !oneOf(input.humanReview, ['not-reviewed','pending','approved-fixture','declined-fixture']) ||
    input.recruiting !== 'open' || !Array.isArray(input.descriptiveTags) || input.descriptiveTags.length > 1 ||
    !input.descriptiveTags.every(tag => tag === 'founders-interest')) return denied();
  if (input.application !== 'submitted' && (input.orientation !== 'not-started' || input.humanReview !== 'not-reviewed')) return denied();
  if (input.humanReview === 'approved-fixture' && input.orientation !== 'completed') return denied();
  let nextStep: FoundersDecision['nextStep'];
  if (input.application === 'withdrawn') nextStep = 'withdrawn';
  else if (input.application === 'not-started') nextStep = 'prepare-application';
  else if (input.application === 'draft') nextStep = 'submit-application';
  else if (input.humanReview === 'declined-fixture') nextStep = 'decision-held';
  else if (input.orientation !== 'completed') nextStep = 'complete-orientation';
  else if (input.humanReview !== 'approved-fixture') nextStep = 'await-human-review';
  else nextStep = 'review-fixture-complete';
  return ready(Object.freeze({ application: input.application as FoundersDecision['application'],
    orientation: input.orientation as FoundersDecision['orientation'], humanReview: input.humanReview as FoundersDecision['humanReview'],
    nextStep, rolesGranted: false, staffAccessGranted: false, facilitatorEntitlementGranted: false }));
}
