# Synthetic commerce API v1

Import pure named exports from lib/commerce-preview/index.ts. This module imports only the coordinator-owned lib/synthetic-contracts/context.ts. No sibling lane dependency. Source uses the existing application-compatible extensionless shared import; tests load an in-memory esbuild ESM bundle under the network guard without changing shared TypeScript settings.

| API | Synthetic responsibility |
| --- | --- |
| routeDestination(context, organizationId, registry) | Explicit one-route-per-organization registry with no shared merchant identifiers |
| createIntent(context, destination, request) | Donation/book-purchase fixture consent, amount and product snapshot validation |
| transitionIntent(context, intent, event) | Revision/event/idempotency checked state transition, authorization repeated on retries |
| isIntent(value) | Exact structural and historical state-machine consistency, not authenticity |
| ownerIntentView(context, intent) | Owner-only minimal intent status/amount/fulfillment projection |
| financeProjection(context, intent) | Same-org commerce:finance AAL2 settled/refund/net projection, no payer identity |
| productEntitlement(context, intent, product) | Owner and matching settled purchase fixture eligibility; no grant effect |
| reconcileIntent(context, intent, statement) | Same-org finance AAL2 revision-bound matched/mismatch result |
| textToGiveCapability() | Future unavailable capability with explicit unresolved independent ownership and consent requirements |

Every result is `{status:'synthetic',value,effects:NO_EFFECTS}` or generic `{status:'unavailable',effects:NO_EFFECTS}`. The static future capability has readiness unavailable. No result is a production-ready declaration.

## Fixture request

The following describes synthetic input structure, not an invocation of a payment:

```ts
{
 intentId: 'synthetic-intent-a',
 kind: 'donation',
 amountMinor: 100,
 product: null,
 quantity: 0,
 consent: {
  mode: 'synthetic',
  organizationId: 'synthetic-lockliel',
  actorId: 'synthetic-member-a',
  purpose: 'donation',
  decision: 'fixture-explicit'
 }
}
```

Destination schemaVersion is lockliel-commerce-preview-v1; mode synthetic; organizationId one explicitly supported fixture organization; destinationId/merchantId bounded synthetic IDs; provider synthetic-fixture; currency XTS; merchantDecision/legalDecision fixture-reviewed; revision nonnegative integer. A real/unknown currency or provider remains unavailable. A fixture-reviewed decision is not a real decision record.

Products additionally carry productId, revision, fixture-active publication, available availability, positive integer unitMinor, digital/shipping delivery, fixture-reviewed entitlementDecision, and not-applicable/fixture-reviewed shippingDecision respectively. Book-purchase amount must equal unitMinor times quantity, with quantity 1 through 10. No complimentary book or shipping price/promise is implied.

Each event has exactly eventId, idempotencyKey, expectedRevision, kind and amountMinor. authorize/settle amount must equal the entire original intent amount; refund is positive and cannot exceed remaining settlement; fail/cancel/fulfillment amounts are zero. Finance events require commerce:finance AAL2; fulfillment events require commerce:fulfillment AAL2. Owner cancel is limited to created own intent plus commerce:intent. Exact retry returns current independent snapshot; changed reuse of either event identity or key is unavailable.

All objects reject unrecognized fields. No URLs, provider credentials, contact data, private assessment, receipt text, bank/card details, shipping addresses, raw messages or signatures belong in this contract. In-memory synthetic snapshots contain opaque IDs and amounts only and are never persisted by this module.
