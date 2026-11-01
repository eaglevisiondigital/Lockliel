# Wave 9 parallel readiness review

November 1, 2026. Actual reviewer: `/root/wave9_parallel_readiness`, one dispatched worker covering six bounded priorities. These are source/evidence reviews and prepared assignments, not six running agents or newly implemented features. No source, shared register, Git index, environment or production setting was changed by this worker.

## Exact reviewed baseline and evidence quality

Reviewed application `e83f0886ed7761d8a47738b9085ed8fab9610b8c` in retained `codex/wave8-server-read` worktree `/Users/davesmacbookpro/.codex/worktrees/lockliel-wave8-server-read/Lockliel`, documentation HEAD `a41f4e628e773dce56b040674676d570b9afc358`. All reviewed tracked source bytes independently match that application commit. Source provenance and inspected files are enumerated in `SOURCE_REVIEW.json`; this does not attest a deployed artifact.

Read the Wave 8 result, exact hosted gate, architecture/security/decisions, all twelve registers and the full 37-feature inventory. Earlier implementation and test reports were inspected, including the licensing/private-domain notes and Wave 5 finance/admin compatibility review. No current licensing terms, hosted acceptance, actual zoom, spoken reader, OS motion activation or fresh browser result is claimed from reading those files. The coordinator owns this wave's validation results.

Inventory remains 37 IDs: 2 Live and Verified, 22 Partially Implemented, 5 Implemented but Not Released, 5 Blocked, 2 Proposed / Decision Pending, 1 Approved but Not Started. None is promoted by this review.

## Findings that constrain cross-lane integration

1. **Real owner projections and synthetic authority are different contracts.** `lib/member-server-read/contracts.ts` exposes display identity/assurance, owner profile summary, five communication preferences and explicit unavailable course state. It contains no relationship IDs, original inviter/campaign/mentor/group links, recipient consent, content entitlement, organization grant or administrative scope. No adapter may manufacture a synthetic context or privileged grant from this DTO. Those services need independently reviewed server-authorized contracts before connected integration.
2. **Communication flags do not authorize sharing.** `lib/connections-preview/index.ts` checks current accepted, unexpired `resource-share` consent bound to owner/contact plus explicit revision-bound confirmation. Its follow-up permission is separate. `lib/share-review/adapter.ts` re-runs L6 and L5 at confirmation; its `preview-confirmed` result says `delivery=not-sent`. That existing synthetic composition must remain intact. A new member-read failure cannot silently restore fixture sharing.
3. **Clock and revision domains differ.** L6 entitlement/readiness uses canonical ISO timestamps; L5 consent/reminders and L8 scopes use epoch milliseconds. Wave 5 normalizes its own fixed fixture clock but supplies no production time authority. Live `updated_at` strings in the Wave 8 preferences projection are not L5 numeric revisions or L8 authorization revisions. Future adapters must validate units, clocks, provenance, owner/org and exact version rather than cast values.
4. **Content availability is not purchase or staff permission.** L6 metadata has no price, SKU, merchant or shipping authority. Founders application, orientation and human review remain separate; all returned role/staff/facilitator-grant flags are false. L7 requires an independent product/destination/explicit financial consent and preserves separate Lockliel, Champion Life and SowGo merchant routing. L8 requires its own AAL2 purpose and reviewed subject/revision/expiry scope. AAL2 in the member display is not that grant.
5. **Private domains cannot reuse convenient note fields.** Faith contracts keep owner-private prayer, growth, actions and Anchor references separate from course notes, contact notes and staff notes. No new backing schema exists. Wave 8 correctly leaves these unavailable. None should be inferred empty, exposed to leaders, joined into operations reports or sent to a Scripture provider.
6. **Release success is not execution authority.** L8 release checks return `executeProduction=false` even when synthetic gates pass. Existing course, account-origin, CAPTCHA, Data API/ACL, Storage-byte recovery, operator/PITR and trusted-duration gates remain independent. Lessons 11–13 must keep Media Coming Soon. This review performed no account-origin query or provider diagnostic.

No new actionable source defect was established in this bounded review. The findings above are integration requirements and missing capabilities, not assertions that the existing synthetic models are live vulnerabilities.

## Six prepared follow-on assignments

All branch/worktree names below are proposals, not created resources. Each implementation assignment needs a new, exact local scope before execution. Preserve existing lane heads and use a fresh branch from the reviewed application, recording its full SHA and ownership. Do not edit shared Auth, routing/navigation, tokens, dependencies, manifests, old contracts or migrations without coordinator review. Each UI task stays local-only/default OFF and uses invented data. None includes hosted Auth, persistence, payment, messaging, staff grants or content activation.

### P1: Member accessibility and visual acceptance

Features F15–F17. Suggested branch `codex/wave9-member-accessibility`, proposed worktree `lockliel-wave9-member-accessibility/Lockliel`. L3 owns a new `docs/member-accessibility-wave9/**` evidence packet and, only if separately approved and findings require it, scoped member-review/member-preview CSS and components. Root coordinates the shell/route; no public page or global token rewrite.

Fresh source review confirms the existing scoped navy/blue/cream system, 44px controls, visible focus rule, responsive wrapping, semantic status/live regions, keyboard skip/clear behavior and a reduced-motion CSS branch. The Scripture drawer uses native dialog, named title/description, Tab containment, Escape and focus return. Static source is not actual assistive-technology acceptance.

Smallest next task: a local browser acceptance matrix over default OFF, honest missing-binding, approved offline fixtures and local error/expiry states, at 320/390/768/1365 widths. Exercise actual 200% zoom/reflow, keyboard-only navigation and, where available, a spoken screen reader. Record actual OS reduced-motion activation and restoration separately from source rules. Do not claim positive authenticated browser evidence using an offline fixture. Capture approved baseline/recoverable assets before visible corrections. Deliver exact source/build/mode, screenshots, focus/announcement results, measured contrast for each rendered state and precise unverified cases. Any source correction requires focused regressions, type/lint/build and independent review.

Dependencies: no hosted binding is needed for offline/unavailable review; positive real owner state waits for the separately approved hosted acceptance. O04 intended visual reference governs broader design changes.

### P2: Bible rights and private lifecycle contract reconciliation

Features F18–F22. Suggested branch `codex/wave9-faith-contract-review`, worktree `lockliel-wave9-faith-contract-review/Lockliel`. L4 owns `docs/faith-contract-review-wave9/**` and proposed new isolated contract tests; L8 reviews lifecycle, L1 identity, L3 drawer integration. No provider network adapter, licensed text ingestion, persistence or crisis automation.

`lib/faith-journey/contracts.ts` already separates provider/version/edition, versification, display/cache/export/share rights, territories, review expiry, attribution and telemetry. `readPassage` fails closed without silently switching edition. Anchors retain references without licensed verse bytes. Current rights models are not complete provider-specific quota/cache/export enforcement. Retained licensing analysis names API.Bible, ESV, Bible Brain and WEB as candidates only; its dated official-source analysis is not a license or an automatically selected default. Do not treat public-domain text as approval for a particular API transport or edition.

Smallest next task: prepare a rights decision matrix with exact edition/version/territory, default/fallback, canon/locale, cache/offline/export/share/telemetry and contract-review references, plus a private-domain lifecycle matrix for retention, owner export/deletion, revocation, backup limits and minors. Extend only synthetic policy tests after authorization. Acceptance must reject expired rights, identity/versification mismatch, privacy-field disclosure, silent fallback and cross-owner draft access. All new sources remain invented or clearly permitted public-domain fixtures. Do not provide crisis runtime or hotline copy; prepare review requirements for a qualified safety reviewer.

Dependencies/owner decisions: O06 rights/provider/default, O07 lifecycle/minors, O08 qualified crisis scope. These do not block the matrix or synthetic tests, but do block real content and durable sensitive data.

### P3: My Five and Groups integration preparation

Features F23–F25. Suggested branch `codex/wave9-connections-review`, worktree `lockliel-wave9-connections-review/Lockliel`. L5 owns new `lib/connections-review/**`, `components/connections-review/**` and focused tests/docs only if separately approved. Existing `lib/connections-preview`, `lib/share-review` and shared host remain immutable dependencies unless a reviewed defect requires a coordinated patch.

The current relationship model deliberately separates original inviter, latest campaign, assigned mentor/group and authorization. Capacity review is a pure five-active calculation and explicitly cannot enforce concurrent writes. Group joins/host requests and invitation responses are proposals, not membership or leadership. Only self-membership is projected, never a roster. Private notes remain owner-only even if follow-up consent is revoked, matching the existing modeled behavior rather than inventing a deletion policy.

Smallest next task: a synthetic self-membership and group-request review card using the existing projections, explicit no-save/no-send labels, empty/loading/denied/expired states and account-bound clearing. Design the future owner-safe read DTO with existing relationship and consent services, not a parallel contact system. Require A/B/org isolation, contact-note/prayer/finance exclusion, stale/revoked consent, separate inviter/campaign/mentor/group fields, group-role noninference and unlinked-contact unknown-consent denial. No delivery or new share events. Coordinator alone adds any host slot after component acceptance.

Dependencies: an actual connected sharing slice needs authenticated relationship plus recipient/resource/channel-specific consent and authoritative revision/revocation reads. Wave 8 display preferences are insufficient. No schema or role grant follows from this preparation.

### P4: Founders and content workflow review surface

Features F26–F30. Suggested branch `codex/wave9-content-review`, worktree `lockliel-wave9-content-review/Lockliel`. L6 owns proposed `components/content-readiness-review/**`, isolated fixtures and tests/docs; L8 owns any later admin integration. Reuse current L6 catalog/publication/intake/Founders contracts, not public forms, Blobs, the released reader or production Share Library.

`foundersReadiness` rejects orientation/review on unsubmitted applications and approval before orientation completion. A ready fixture grants no staff role, leadership or facilitator entitlement. Book/training reader readiness needs a separate current entitlement even if metadata is public. Intake consent establishes neither mailbox verification nor a member identity. Getting a Grip's production row remains inactive independently of an active synthetic catalog item.

Smallest next task: a local application/orientation/human-review timeline and editorial content checklist from existing exact DTOs, emphasizing held publication and separate entitlement. Test revision conflicts, owner/org mismatch, consent withdrawal, future inactive items, unknown rights, denied reader access and no role inference. No actual intake, approval, email, protected bytes or publication. Owner decisions on final assets, complimentary offer, thresholds, currency, shipping and returns stay unknown; avoid promises in preview copy.

Dependencies: L5 consumes only eligible metadata; L7 product/merchant/shipping approval remains separate. L8 review authority is distinct from member interest.

### P5: Giving and commerce compatibility preparation

Features F30–F32. Suggested branch `codex/wave9-commerce-review`, worktree `lockliel-wave9-commerce-review/Lockliel`. L7 owns new docs plus, after approval, isolated scenario tests around existing `lib/commerce-preview`. No provider SDK, webhook, credentials, real payment, receipt, merchant connection or financial setting.

Existing contracts use `synthetic-fixture` and XTS only. Routing rejects duplicated merchants/destinations and requires one explicit route for the organization. Intent replay validates history; idempotency retries recheck authority and reject changed payloads. Entitlement requires exact settled book purchase, same owner/org/product revision/delivery/amount. Donations and refunds cannot silently become product rights. This model is not a posted financial ledger or an auditable provider reconciliation service.

Smallest next task: prepare table-driven multi-organization scenarios for duplicate/missing destinations, changed idempotency payload, revoked grants on retry, partial/full refunds, mismatched settlement/statement, malformed histories and donation-versus-book rights. Review a future cross-lane product-to-entitlement contract with L6 without casting catalog metadata into a price/product. Return only synthetic results with all effects false. Keep Global Propel Text-to-Give unavailable until independent ownership/provider/consent authority exists.

Dependencies/owner decisions: O13 book/gift/shipping, O14 independent account/legal/tax/provider/destinations/currencies/receipts/refund/webhook decisions. Historical gateway preference is not approval. No infrastructure purchase is implicit.

### P6: Administration, reporting and privacy operations preparation

Features F33–F36. Suggested branch `codex/wave9-ops-review`, worktree `lockliel-wave9-ops-review/Lockliel`. L8 owns proposed local docs/scenario tests and a synthetic operational-report panel; no existing admin handler, staff roles, real reports, account changes, export/deletion executor or audit sink.

`projectMemberForPurpose` permits only explicit display/status metadata after independent AAL2 purpose/subject/revision/expiry review. Finance authority does not grant member support. Privacy requester, reviewer and execution planner are separate identities; even all-pass planning remains nonexecuting. Operational report counts below five are suppressed and sample size must be at least five. That fixture threshold is not an approved anonymity or statistical disclosure policy. Live reporting would need approved dimensions, date ranges, repeat/differencing protections and audience controls; avoid labeling this synthetic output anonymous or privacy compliant.

Smallest next task: a synthetic report/approval preview with allowlisted aggregates, denied/held/stale scopes and metadata-only audit proposal. Require tests for scope purpose/expiry/org/revision, extra-sensitive-field stripping, small cells and cross-filter re-identification requirements. Test that an approved Founder, leader tag, AAL2 member or finance grant never becomes staff authorization. No real account investigation or execution. Review eventual private Faith/photo/financial-retention/Storage-byte lifecycle coverage with L4/L7; never include bodies in generic reporting.

Dependencies: O02 account disposition, O07 privacy lifecycle, O09 Storage custodian, O10 operator/PITR window and separately approved source/runtime release. An all-pass synthetic release checklist still does not permit migration, deployment or maintenance changes.

## Ownership, sequencing and independence

P1 local accessibility, P2 rights/lifecycle decisions, P3 group fixture design, P4 content timeline design, P5 commerce scenarios and P6 operations scenarios can proceed independently once their local execution scope is approved. The environment-binding investigation is not a prerequisite for source/design analysis. Do not dispatch six new implementations against shared host files. Native capacity is coordinator plus at most three workers; stage assignments and keep explicit file leases.

One coordinator owns `components/member-review/**`, `app/my-lockliel/review/**`, shared wire contracts, feature gates, navigation, tokens, dependencies, hosting files and migrations. P1 requests the narrow component lease it needs before edits. P3/P4/P6 produce isolated reusable components and interface requests; root alone assembles accepted snapshots. L1 remains sole Auth/session security owner, L2 course owner; P2 must request any drawer or course reference integration. Preserve old branch heads, worktrees and historical approval/rejection records; create no worktree merely to claim a lane is active.

Future connected work must first reconcile server-safe identity/organization/grants with existing APIs. Never convert the Wave 8 owner display into L5–L8 fixture authority. Independent preparation can finish while account-origin, real CAPTCHA and course binding gates remain blocked. Full 37-feature inventory and all twelve registers remain coordinator-owned and unchanged by this worker.

## Preservation and validation statement

This worker ran read-only file/Git inspections and a deterministic source/inventory review. It executed no JavaScript/build/browser/SQL tests, no hosted request, no credential input and no production query. Coordinator-run Wave 9 checks must be reported separately; prior Wave 8 1,438 tests and 280/17 SQL result are historical within this review. All inspected source file hashes match exact application commit, with details in `SOURCE_REVIEW.json`. No migration byte, source, package, lockfile, asset, settings, Auth, session, maintenance, account, role, message, payment, content or infrastructure change; no staging, commit, push, merge or deploy by this worker.
