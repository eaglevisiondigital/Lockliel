# Prepared Wave 3 assignment: L7 Giving, Payments and Commerce

Current Wave3 override: preparation-only. See README.md and ELIGIBILITY_AND_DEPENDENCIES.md for actual agents/worktrees/commits and automatic scope-review hold. No source implementation was authorized by this prepared document.


November 1, 2026. Agent: UNASSIGNED. Proposed branch: codex/lane7-commerce-contracts. Proposed managed worktree suffix: lane7-commerce-contracts.

## Exclusive proposed files

lib/commerce-preview/**; components/commerce-readiness-preview/**; tests/commerce-preview.test.mjs; docs/lane7-commerce/**

## Bounded implementation and dependencies

Build provider-neutral readiness/contracts and synthetic intent/status review only. Separate gift, membership, book purchase, fulfillment and receipt destinations. No gateway is approved by preference, URL or old discussion. Do not create a live payment form or collect card/bank/payer data, call a gateway, calculate tax-deductibility, issue a receipt, invent approved fees/currency or mark a transaction paid. A synthetic state must be labeled synthetic and cannot activate a financial action.

Dependencies: Dave/finance/legal decisions on gateway, account ownership, destinations, legal classification, tax/receipts/currencies/webhooks and book-benefit/shipping policies; L6 owns catalog/assets and benefit promise; L8 owns finance purpose projections; L1 owns authorization. A decision matrix, state machine and unavailable readiness mock can proceed without those unresolved choices.

Acceptance: fail-closed unknown provider/currency/decision/authorization, no confusion between intended/authorized/settled/failed/refunded states, replay/idempotency contract simulation without a real gateway, sanitized DTOs omit bank/card/secret data. Hold all account setup, fees, contracts/terms, credentials, live checkout, payments, receipts and fulfillment actions. No financial activation or purchase.
## Dispatch gate and preservation

PREPARED ONLY, NOT DISPATCHED. Wave2 authorizes preparation, not execution of this package. Before a future dispatch, coordinator verifies the exact base, allocates a dedicated managed worktree/branch, records the agent and exclusive file lease, and reconciles any approved integration delta. Proposed branches/paths below do not yet exist. Base proposal: fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098; never copy unrelated dirty work. Uncommitted W3/W4 components are not available dependencies until separately reviewed/integrated.

No production query/change, accounts/Auth/session/email/SMS, migration, push, merge, deployment, maintenance, live content/payment/Share Library activation, purchase or new dependency. Do not edit shared Auth, navigation, tokens, package/lockfile, workflows, hosting or admin-person handler. Coordinator owns shared contracts/schema/release boundaries. Use synthetic fixtures and memory-only state; no real member data, resource bytes or provider credentials. A type/intent/preview never authorizes a real action.

Return exact base/HEAD, actual owner/worktree, allowed files/diff, meaningful focused tests, scoped type/lint and actual browser/accessibility/security findings if UI exists. Keep production egress blocked. Mark unavailable/conflict/denied/empty states honestly. Do not broaden to cleanup. Keep history/migration bytes unchanged and submit contract requests before any shared edit.
