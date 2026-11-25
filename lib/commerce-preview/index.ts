import { NO_EFFECTS, hasSyntheticGrant, isRecord, isRevision, isSyntheticContext, isSyntheticId, type SyntheticOrganization } from '../synthetic-contracts/context';

/** Fixture-only intent simulation, never a payment adapter or server authorization. */
export const COMMERCE_SCHEMA = 'lockliel-commerce-preview-v1' as const;
type Denied = Readonly<{ status: 'unavailable'; effects: typeof NO_EFFECTS }>;
type Result<T> = Readonly<{ status: 'synthetic'; value: T; effects: typeof NO_EFFECTS }> | Denied;
const denied = (): Denied => ({ status: 'unavailable', effects: NO_EFFECTS });
const accepted = <T>(value: T): Result<T> => ({ status: 'synthetic', value, effects: NO_EFFECTS });
const exact = (v: unknown, keys: readonly string[]): v is Record<string, unknown> => isRecord(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const organizations: readonly string[] = ['synthetic-lockliel', 'synthetic-champion-life', 'synthetic-sowgo'];
const organization = (v: unknown): v is SyntheticOrganization => typeof v === 'string' && organizations.includes(v);
const minorUnits = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) <= 1_000_000_000;

export type Destination = Readonly<{
  schemaVersion: typeof COMMERCE_SCHEMA; mode: 'synthetic'; organizationId: SyntheticOrganization;
  destinationId: string; merchantId: string; provider: 'synthetic-fixture'; currency: 'XTS';
  merchantDecision: 'fixture-reviewed'; legalDecision: 'fixture-reviewed'; revision: number;
}>;
const destinationKeys = ['schemaVersion', 'mode', 'organizationId', 'destinationId', 'merchantId', 'provider', 'currency', 'merchantDecision', 'legalDecision', 'revision'];
export function isDestination(v: unknown): v is Destination {
  return exact(v, destinationKeys) && v.schemaVersion === COMMERCE_SCHEMA && v.mode === 'synthetic' && organization(v.organizationId) && isSyntheticId(v.destinationId) && isSyntheticId(v.merchantId) && v.provider === 'synthetic-fixture' && v.currency === 'XTS' && v.merchantDecision === 'fixture-reviewed' && v.legalDecision === 'fixture-reviewed' && isRevision(v.revision);
}
/** Registry ownership must be explicit. No shared-merchant assumption or provider fallback. */
export function routeDestination(context: unknown, organizationId: unknown, registry: unknown): Result<Destination> {
  if (!organization(organizationId) || !hasSyntheticGrant(context, 'commerce:intent', organizationId) || !Array.isArray(registry) || registry.length > 12 || !registry.every(isDestination)) return denied();
  const merchants = new Set<string>();
  const destinations = new Set<string>();
  for (const route of registry) {
    if (merchants.has(route.merchantId) || destinations.has(route.destinationId)) return denied();
    merchants.add(route.merchantId); destinations.add(route.destinationId);
  }
  const matches = registry.filter(r => r.organizationId === organizationId);
  return matches.length === 1 ? accepted({ ...matches[0] }) : denied();
}
export type Product = Readonly<{
  schemaVersion: typeof COMMERCE_SCHEMA; mode: 'synthetic'; organizationId: SyntheticOrganization;
  productId: string; revision: number; publication: 'fixture-active'; availability: 'available';
  unitMinor: number; currency: 'XTS'; delivery: 'digital' | 'shipping';
  entitlementDecision: 'fixture-reviewed'; shippingDecision: 'not-applicable' | 'fixture-reviewed';
}>;
const productKeys = ['schemaVersion', 'mode', 'organizationId', 'productId', 'revision', 'publication', 'availability', 'unitMinor', 'currency', 'delivery', 'entitlementDecision', 'shippingDecision'];
function isProduct(v: unknown): v is Product {
  return exact(v, productKeys) && v.schemaVersion === COMMERCE_SCHEMA && v.mode === 'synthetic' && organization(v.organizationId) && isSyntheticId(v.productId) && isRevision(v.revision) && v.publication === 'fixture-active' && v.availability === 'available' && minorUnits(v.unitMinor) && v.unitMinor > 0 && v.currency === 'XTS' && (v.delivery === 'digital' || v.delivery === 'shipping') && v.entitlementDecision === 'fixture-reviewed' && v.shippingDecision === (v.delivery === 'shipping' ? 'fixture-reviewed' : 'not-applicable');
}
export type PaymentStatus = 'created' | 'authorized' | 'settled' | 'failed' | 'cancelled' | 'partially-refunded' | 'refunded';
export type FulfillmentStatus = 'not-started' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'fulfilled';
export type EventKind = 'authorize' | 'settle' | 'fail' | 'cancel' | 'refund' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'fulfilled';
export type CommerceEvent = Readonly<{ eventId: string; idempotencyKey: string; expectedRevision: number; kind: EventKind; amountMinor: number }>;
export type Intent = Readonly<{
  schemaVersion: typeof COMMERCE_SCHEMA; mode: 'synthetic'; organizationId: SyntheticOrganization;
  intentId: string; ownerId: string; kind: 'donation' | 'book-purchase'; revision: number;
  destination: Destination; amountMinor: number; currency: 'XTS';
  productId: string | null; productRevision: number | null; quantity: number; delivery: 'none' | 'digital' | 'shipping';
  status: PaymentStatus; fulfillment: FulfillmentStatus; refundedMinor: number;
  events: readonly CommerceEvent[];
}>;
const intentKeys = ['schemaVersion', 'mode', 'organizationId', 'intentId', 'ownerId', 'kind', 'revision', 'destination', 'amountMinor', 'currency', 'productId', 'productRevision', 'quantity', 'delivery', 'status', 'fulfillment', 'refundedMinor', 'events'];
const eventKeys = ['eventId', 'idempotencyKey', 'expectedRevision', 'kind', 'amountMinor'];
const eventKinds: readonly string[] = ['authorize', 'settle', 'fail', 'cancel', 'refund', 'processing', 'packed', 'shipped', 'delivered', 'fulfilled'];
function isEvent(v: unknown): v is CommerceEvent {
  return exact(v, eventKeys) && isSyntheticId(v.eventId) && isSyntheticId(v.idempotencyKey) && isRevision(v.expectedRevision) && typeof v.kind === 'string' && eventKinds.includes(v.kind) && minorUnits(v.amountMinor);
}
function initialIntent(v: unknown): v is Intent {
  if (!exact(v, intentKeys) || v.schemaVersion !== COMMERCE_SCHEMA || v.mode !== 'synthetic' || !organization(v.organizationId) || !isSyntheticId(v.intentId) || !isSyntheticId(v.ownerId) || !isDestination(v.destination) || v.destination.organizationId !== v.organizationId || !minorUnits(v.amountMinor) || v.amountMinor === 0 || v.currency !== 'XTS' || !isRevision(v.revision) || !minorUnits(v.refundedMinor) || v.refundedMinor > v.amountMinor || !Array.isArray(v.events) || v.events.length > 128 || !v.events.every(isEvent)) return false;
  if (v.kind === 'donation') return v.productId === null && v.productRevision === null && v.quantity === 0 && v.delivery === 'none';
  return v.kind === 'book-purchase' && isSyntheticId(v.productId) && isRevision(v.productRevision) && Number.isSafeInteger(v.quantity) && Number(v.quantity) >= 1 && Number(v.quantity) <= 10 && (v.delivery === 'digital' || v.delivery === 'shipping');
}
function nextState(state: Intent, event: CommerceEvent): Intent | null {
  if (event.expectedRevision !== state.revision) return null;
  let status = state.status, fulfillment = state.fulfillment, refundedMinor = state.refundedMinor;
  switch (event.kind) {
    case 'authorize': if (status !== 'created' || event.amountMinor !== state.amountMinor) return null; status = 'authorized'; break;
    case 'settle': if (status !== 'authorized' || event.amountMinor !== state.amountMinor) return null; status = 'settled'; break;
    case 'fail': if (!['created', 'authorized'].includes(status) || event.amountMinor !== 0) return null; status = 'failed'; break;
    case 'cancel': if (status !== 'created' || event.amountMinor !== 0) return null; status = 'cancelled'; break;
    case 'refund':
      if (!['settled', 'partially-refunded'].includes(status) || event.amountMinor === 0 || refundedMinor + event.amountMinor > state.amountMinor) return null;
      refundedMinor += event.amountMinor; status = refundedMinor === state.amountMinor ? 'refunded' : 'partially-refunded'; break;
    default: {
      if (state.kind !== 'book-purchase' || status !== 'settled' || event.amountMinor !== 0) return null;
      const stages: readonly string[] = state.delivery === 'shipping' ? ['not-started', 'processing', 'packed', 'shipped', 'delivered', 'fulfilled'] : ['not-started', 'processing', 'fulfilled'];
      if (stages[stages.indexOf(fulfillment) + 1] !== event.kind) return null;
      fulfillment = event.kind as FulfillmentStatus;
    }
  }
  return { ...state, status, fulfillment, refundedMinor, revision: state.revision + 1, events: [...state.events, { ...event }] };
}
/** Validate history as well as the current snapshot. Callers cannot forge a settled fixture by changing a field. */
export function isIntent(value: unknown): value is Intent {
  if (!initialIntent(value)) return false;
  let replay: Intent = { ...value, revision: 0, status: 'created', fulfillment: 'not-started', refundedMinor: 0, events: [] };
  const ids = new Set<string>(), keys = new Set<string>();
  for (const event of value.events) {
    if (ids.has(event.eventId) || keys.has(event.idempotencyKey)) return false;
    ids.add(event.eventId); keys.add(event.idempotencyKey);
    const next = nextState(replay, event); if (!next) return false; replay = next;
  }
  return value.revision === replay.revision && value.status === replay.status && value.fulfillment === replay.fulfillment && value.refundedMinor === replay.refundedMinor;
}
const intentRequestKeys = ['intentId', 'kind', 'amountMinor', 'product', 'quantity', 'consent'];
const consentKeys = ['mode', 'organizationId', 'actorId', 'purpose', 'decision'];
export function createIntent(context: unknown, destination: unknown, request: unknown): Result<Intent> {
  if (!isDestination(destination) || !hasSyntheticGrant(context, 'commerce:intent', destination.organizationId) || !exact(request, intentRequestKeys) || !isSyntheticId(request.intentId) || !minorUnits(request.amountMinor) || request.amountMinor === 0) return denied();
  if (!exact(request.consent, consentKeys) || request.consent.mode !== 'synthetic' || request.consent.organizationId !== destination.organizationId || request.consent.actorId !== context.actorId || request.consent.purpose !== request.kind || request.consent.decision !== 'fixture-explicit') return denied();
  let productId = null, productRevision = null, quantity = 0, delivery: Intent['delivery'] = 'none';
  if (request.kind === 'book-purchase') {
    if (!isProduct(request.product) || request.product.organizationId !== destination.organizationId || !Number.isSafeInteger(request.quantity) || Number(request.quantity) < 1 || Number(request.quantity) > 10 || request.amountMinor !== request.product.unitMinor * Number(request.quantity)) return denied();
    productId = request.product.productId; productRevision = request.product.revision; quantity = Number(request.quantity); delivery = request.product.delivery;
  } else if (request.kind !== 'donation' || request.product !== null || request.quantity !== 0) return denied();
  return accepted({ schemaVersion: COMMERCE_SCHEMA, mode: 'synthetic', organizationId: destination.organizationId, intentId: request.intentId, ownerId: context.actorId, kind: request.kind, revision: 0, destination: { ...destination }, amountMinor: request.amountMinor, currency: 'XTS', productId, productRevision, quantity, delivery, status: 'created', fulfillment: 'not-started', refundedMinor: 0, events: [] });
}
export function transitionIntent(context: unknown, state: unknown, event: unknown): Result<Intent> {
  if (!isIntent(state) || !isEvent(event) || !isSyntheticContext(context, state.organizationId)) return denied();
  const fulfillment = ['processing', 'packed', 'shipped', 'delivered', 'fulfilled'].includes(event.kind);
  const permitted = event.kind === 'cancel'
    ? context.actorId === state.ownerId && hasSyntheticGrant(context, 'commerce:intent', state.organizationId)
    : hasSyntheticGrant(context, fulfillment ? 'commerce:fulfillment' : 'commerce:finance', state.organizationId, 2);
  if (!permitted) return denied();
  const replay = state.events.find(e => e.idempotencyKey === event.idempotencyKey || e.eventId === event.eventId);
  if (replay) return eventKeys.every(key => replay[key as keyof CommerceEvent] === event[key as keyof CommerceEvent]) ? accepted(structuredClone(state)) : denied();
  if (state.events.length >= 128) return denied();
  const next = nextState(state, event); return next ? accepted(structuredClone(next)) : denied();
}
export function ownerIntentView(context: unknown, state: unknown) {
  if (!isIntent(state) || !isSyntheticContext(context, state.organizationId) || context.actorId !== state.ownerId) return denied();
  return accepted({ schemaVersion: COMMERCE_SCHEMA, mode: 'synthetic' as const, intentId: state.intentId, kind: state.kind, status: state.status, amountMinor: state.amountMinor, refundedMinor: state.refundedMinor, currency: state.currency, fulfillment: state.fulfillment });
}
/** No ledger posting, receipt, tax classification, beneficiary PII or payer details. */
export function financeProjection(context: unknown, state: unknown) {
  if (!isIntent(state) || !hasSyntheticGrant(context, 'commerce:finance', state.organizationId, 2)) return denied();
  const settled = ['settled', 'partially-refunded', 'refunded'].includes(state.status) ? state.amountMinor : 0;
  return accepted({ schemaVersion: COMMERCE_SCHEMA, mode: 'synthetic' as const, organizationId: state.organizationId, intentId: state.intentId, destinationId: state.destination.destinationId, kind: state.kind, currency: state.currency, settledMinor: settled, refundedMinor: state.refundedMinor, netMinor: settled - state.refundedMinor, revision: state.revision });
}
/** Donation, authorization and refund states never create a product right. */
export function productEntitlement(context: unknown, state: unknown, product: unknown) {
  if (!isIntent(state) || !isSyntheticContext(context, state.organizationId) || context.actorId !== state.ownerId || !isProduct(product) || product.organizationId !== state.organizationId || product.productId !== state.productId || product.revision !== state.productRevision || product.delivery !== state.delivery || product.unitMinor * state.quantity !== state.amountMinor || state.kind !== 'book-purchase' || state.status !== 'settled') return denied();
  return accepted({ organizationId: state.organizationId, productId: product.productId, ownerId: state.ownerId, entitlement: 'fixture-eligible' as const });
}
const reconciliationKeys = ['schemaVersion', 'mode', 'organizationId', 'intentId', 'destinationId', 'currency', 'settledMinor', 'refundedMinor', 'expectedRevision'];
export function reconcileIntent(context: unknown, state: unknown, statement: unknown) {
  if (!isIntent(state) || !hasSyntheticGrant(context, 'commerce:finance', state.organizationId, 2) || !exact(statement, reconciliationKeys) || statement.schemaVersion !== COMMERCE_SCHEMA || statement.mode !== 'synthetic' || statement.organizationId !== state.organizationId || statement.intentId !== state.intentId || statement.destinationId !== state.destination.destinationId || statement.currency !== 'XTS' || !minorUnits(statement.settledMinor) || !minorUnits(statement.refundedMinor) || statement.expectedRevision !== state.revision) return denied();
  const settled = ['settled', 'partially-refunded', 'refunded'].includes(state.status) ? state.amountMinor : 0;
  return accepted({ intentId: state.intentId, revision: state.revision, reconciliation: statement.settledMinor === settled && statement.refundedMinor === state.refundedMinor ? 'matched' as const : 'mismatch' as const });
}
/** Forward-compatible vocabulary only. Global Propel ownership/provider are not configured. */
export function textToGiveCapability() {
  return { schemaVersion: COMMERCE_SCHEMA, mode: 'synthetic' as const, channel: 'future-global-propel-text-to-give' as const, readiness: 'unavailable' as const, requirements: ['organization-ownership', 'independent-merchant-routing', 'provider-authorization', 'sender-consent', 'verified-payment-event', 'idempotency', 'receipt-policy'] as const, effects: NO_EFFECTS };
}
