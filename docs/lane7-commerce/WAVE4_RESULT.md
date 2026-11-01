# Wave 4 Lane 7 result

November 1, 2026. Actual agent: commerce_wave4. Branch: codex/lane7-commerce-contracts. Base: fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098. Worktree: /Users/davesmacbookpro/.codex/worktrees/lockliel-lane7-commerce-contracts/Lockliel.

## Implemented synthetic contracts

The directly typed Wave 4 authorization supersedes the earlier preparation-only hold for these contracts and tests. The earlier automatic approval rejection remains historical, recorded in the Wave 3 coordination packet. No new rejection or bypass occurred in this lane.

- Explicit independent organization/destination/merchant registry for synthetic Lockliel, Champion Life and SowGo. Duplicate destination or merchant allocation is unavailable; no implied shared merchant accounts.
- Donation and book-purchase intent creation requires active explicit fixture identity/grant, purpose-bound same-owner and same-organization consent, positive bounded integer minor units, an explicit reviewed fixture route and exact product quote where applicable.
- Versioned created, authorized, settled, failed, cancelled, partially-refunded and refunded states. Settlement requires full matching prior authorization. Optimistic revisions and exact event/idempotency-key retry matching reject stale/conflicting transitions. Current session/grants are checked before accepting retries.
- Separate AAL2 finance and fulfillment fixture grants. Owner-only views omit merchant/event/identity fields; finance projection omits payer identity and contact information. Neither posts a ledger entry or issues a receipt.
- Product entitlement is a derived fixture eligibility result only after a matching settled purchase and current product revision, amount and delivery. Donations, mere authorization and any refund cannot confer entitlement.
- Book ordering carries a product snapshot, bounded quantity and exact amount, with explicit fixture publication/availability/entitlement/shipping decisions. Physical fulfillment follows processing, packed, shipped, delivered, fulfilled in order; digital fulfillment follows processing, fulfilled. It cannot advance without settlement or after a refund. Recorded fulfillment history remains after refunds.
- Bounded cumulative refunds and revision-bound synthetic reconciliation distinguish matched from mismatch without hiding financial differences.
- Future Global Propel Text-to-Give capability vocabulary remains unavailable. Independent ownership/merchant routing, sender consent, verified payment events, idempotency and receipt policy are explicit dependencies. No Global Propel provider or merchant is invented.

All accepted results are labeled synthetic and include the shared frozen NO_EFFECTS object: save/send/schedule/grant/publish/pay/execute are false. Generic unavailable results return no sensitive payload. Unknown or actual provider/currency/legal/merchant decisions cannot satisfy fixture readiness. Only synthetic-fixture and the XTS fixture token are accepted; this is no real currency/provider approval.

## Validation

- 41 focused JavaScript tests passed with tests/support/network-guard.mjs preloaded. No unexpected network attempt.
- Strict scoped TypeScript passed for this lane and the unmodified shared context using ordinary bundler resolution, without allowImportingTsExtensions or a shared configuration change.
- Scoped ESLint passed with zero warnings.
- Neutral platform ESM bundle passed; 14,801 output bytes, in-memory output only.
- git diff --check passed. Source/shared module hashes and all 280 migration byte comparisons are in validation.json.
- Initial native Node TypeScript loading failed extensionless module resolution. An explicit .ts source import then passed focused checks, but review identified incompatibility with the existing ordinary application TypeScript configuration. The separate follow-up preserves checkpoint 9cc72c4 and restores the extensionless source import. Tests now load an in-memory neutral ESM bundle under the existing network guard. Final 41 tests, ordinary strict scoped TypeScript, zero-warning lint and the 14,801-byte bundle all pass; no shared compiler option changed.
- Review found and corrected nested input alias retention and incomplete entitlement product-snapshot checking before this checkpoint.

No UI exists in this package; browser, responsive and accessibility acceptance is not claimed. No full application build or database replay was needed for the pure module; coordinator integration/build validation remains separate. No live service, payment or staff permission was tested.

## Existing architecture preserved

Reviewed existing partner, finance and order handlers and their regression expectations before coding. Existing live concepts remain authoritative: gifts versus commitments, order/payment state versus fulfillment events, product entitlement versus donation/benefit rules, and finance versus fulfillment permission. This module is an isolated test/review contract, not a second database, checkout, gateway or ledger. No existing live handler, resource flow, order, gift, benefit rule, schema, RLS, migration, navigation, shared Auth or design token was changed.

## Limits and integration readiness

Ready for coordinator-owned synthetic compatibility tests and a disabled review adapter only. Fixture contexts, grants, event histories, product decisions and consent markers are caller-supplied synthetic data. They are never trusted server authorization, verified provider events, payment evidence or legal decisions. Replay validation checks model consistency, not authenticity. A caller can construct a complete fictional history; no signature or backend trust is implied.

No live collection of card/bank/payer/contact/address data; gateway, webhook signature, storage, messaging, account grants, shipping execution or financial ledger mutation exists. A future real adapter must enforce authoritative organization/merchant ownership, current authorization and consent, authenticated provider events, durable per-merchant idempotency, concurrency, audit, privacy and all release decisions. It must separately handle post-authorization consent withdrawal/cancellation and refund entitlement policy. Current fixture creation consent and session/grant revocation checks do not implement live provider cancellation.

Open decisions: gateway(s), independent account ownership/destination mapping, legal classification, currency/minor-unit rules, tax/receipts, recurring payment and refund policy, book price/benefit/availability/shipping/returns, fulfillment and private shipping data, actual product/entitlement adapter, Global Propel ownership/provider and Text-to-Give consent. None is approved by passing these tests.

Shared dependencies: coordinator context v1 must stay byte-identical; L6 catalog discovery projection is not a purchasable SKU or price/rights approval; L8 finance-purpose reporting must use sanitized AAL2 finance projections, never broad member cards or private assessments. No L5 follow-up/referral/leader marker conveys finance privilege or entitlement. The smallest next step is a coordinator-owned synthetic adapter contract between L6 product discovery, L7 unavailable commerce readiness and L8 scoped reporting, with all operational effects false.

Production preservation: no production access, data/settings/Auth/CAPTCHA/SMTP/PITR/compute/maintenance change, migration, financial action, staff grant, content activation, email/SMS, push, merge, deployment, purchase or other repository modification. Main, course PR #4 and Wave 3 integration remain untouched by this lane.
