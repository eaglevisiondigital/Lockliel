# Wave 5 local Share Review workspace

Owner: `/root/connections_wave3`. Branch: `codex/wave5-share-integration`.
Base: `46d003673bf6ef4d877c0731ac47cf678dbed494`.
Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-wave5-share-integration/Lockliel`.

## Implemented scope

`ShareReviewWorkspace({context, boundaryKey, idPrefix?})` is a named, headless client component at `components/share-review/share-review-workspace.tsx`. `context` is the coordinator's `SyntheticContext | null`; `boundaryKey` is a bounded host visit/reset marker. It provides a labelled section with h2, resource cards, recipient and preview-format choice, optional synthetic note, complete review, explicit final checkbox, Back/Cancel and a local-only result: **Nothing was sent.** It adds no header, main, navigation, h1, API route, host feature gate or live adapter. The coordinator owns all host and route integration.

The scoped CSS follows the preserved navy, blue and cream visual system. Resource artwork is CSS-only. No external image, protected file, raw content body, address, contact coordinate, delivery link or clipboard operation is included. Private notes/prayers/growth/assessments/finance and role data are not imported. Existing public-site source and shared design tokens are unchanged.

All people/resources are invented fixtures. The optional note warns against real private information; the adapter bounds it and rejects links, email-like strings, phone-like strings, control characters and markup. This is not an exhaustive PII detector or permission to enter real data. Do not connect real identities or private information to this prototype.

## Actual contract composition

`lib/share-review/adapter.ts` imports the unchanged L6 `projectCatalogItem` and `catalogReadiness`, the unchanged L5 `projectRelationship`, `ACTIVE_STAGES` and `prepareShare`, plus the coordinator's shared context helpers. The final browser-platform adapter graph contains exactly those four modules and no external imports.

- The explicit fixture clock is numeric epoch `1793534400000`, converted to `2026-11-01T12:00:00.000Z` for L6 while L5 receives the same numeric epoch. It is not a claim about actual server time.
- Projection uses actual L6 discovery decisions and L5 owner filtering. Missing grants, unknown or other-organization context and malformed input reveal no recipient choices. Member-visible metadata requires independent `member:read`.
- Before a complete draft preview, the adapter verifies current owner/org/active relationship, resource share readiness, explicit sharing grant and narrow accepted resource-sharing consent with matching subject/revision/expiry. Selecting a name cannot create consent. Draft preview is not accepted final confirmation.
- Explicit confirmation re-resolves the current local snapshot, rechecks L6 share readiness and L5 preparation, and binds owner, resource/contact/consent revisions and reviewed display fields. Revocation, expired consent, changed versions/grants, A/B context swaps and stale resource data deny. Nothing can be restored by checking the confirmation box.
- Email/text are preview formats only. Resource-share consent does not confer future channel-specific email/SMS permission. No recipient address exists and no channel is connected.
- Final output is freshly projected from safe primitive fields, not a raw input-object spread. It contains `delivery='not-sent'` and all false `NO_EFFECTS`. No event, sent time, link, saved record, scheduling, notification, account, entitlement, leadership or group mutation is created.

## State and accessibility boundaries

Private component state is keyed by the full validated actor/org/AAL/session/grant boundary plus the host's `boundaryKey`. Actor, grants or boundary change unmounts and clears recipient, note, prepared preview and checkbox state. Refresh/reset clears all visit memory. There is no browser storage, cookie, persistence, event collector or transport. Native forms are absent, preventing pre-hydration form submission of drafts.

Editing resource/recipient/format/note, using Back or changing sample state clears explicit confirmation. Cancel clears the local draft. Native named radio controls support keyboard grouping. Labels and descriptions are explicit; focus moves after step commits, errors focus only after their message is rendered, and clearing while already on resource selection restores heading focus. Controls are at least 44 CSS pixels, layouts reflow below 700/380 pixels and the scoped reduced-motion branch disables motion. Full spoken screen-reader, actual browser zoom and OS reduced-motion acceptance require coordinator/operator verification and are not established by these source checks.

Sample controls expose ready/loading/empty/unavailable/revoked/stale states without changing any live setting. A previously prepared preview can be tested against revoked/stale state; final confirmation must reject it. Empty and unavailable states are described separately. Fixture retry only restores local sample data.

## Review findings corrected before checkpoint

1. Initial draft preparation checked resource/owner projection but not every consent/current share condition. Independent reviewers requested and verified fail-closed narrow consent, explicit sharing grant and actual active-stage checks before a complete preview. Final L5 validation remains in place.
2. Native radio grouping and post-render error/clear focus were refined during coordinator review.
3. The coordinator's actual browser found an existing global public-site blockquote rule positioning the optional note outside the viewport. The scoped `.preview blockquote` now resets position/inset/transform/font/text-shadow without modifying global CSS. A source regression guards this collision. After rebuild the coordinator reported computed `position: static` and visible placement passing in the actual browser; that observation is attributed to the coordinator, not agent SSR tests. A final decorative cover-label fit rule prevents an invented artwork word from breaking midword.

## Agent validation

- **78 focused tests passed:** 67 pure adapter tests using the actual unchanged L5/L6 code and 11 actual component SSR/source-boundary tests. The repository network guard was preloaded; no real network requests occurred.
- Strict scoped TypeScript passed, including existing Next CSS declarations. Initial direct attempts omitted those declarations or used an unavailable type-library path; both failed configuration resolution only and were corrected without any source/configuration change.
- Targeted ESLint passed with zero warnings across source and both test files.
- Pure browser-platform adapter bundle passed: 21,257 bytes, four expected source modules, zero external imports, no file output.
- Browser-platform UI/CSS bundle passed: 42,638-byte JS and 11,975-byte CSS, six expected local inputs, existing React external dependency only, no file output.
- Source review confirms no transport, storage, clipboard, dangerous markup, native form or external URL/image adapter. Full application build, combined suite, browser inspection and production-preservation manifests belong to the coordinator's separate report.

The dependency symlink is coordinator-owned for combined validation and is intentionally left intact until the coordinator removes it. No dependency installation or package/lockfile change occurred. Tests use already-installed esbuild to compile only the actual owned components/contracts in memory.

## Files and integration limit

Owned source: `components/share-review/**`, `lib/share-review/**`.
Owned tests: `tests/share-review-adapter.test.mjs`, `tests/share-review-workspace.test.mjs`.
Owned evidence/docs: `docs/share-review/**`.

No production access, SQL, account/Auth/CAPTCHA/settings change, migration, push, merge, deployment, real member testing, delivery, financial activation, infrastructure purchase or other-repository action occurred. Shared contracts remain byte-identical to the base. This is a local synthetic candidate, not live sharing or a release decision.

Next smallest step: coordinator assembles the existing host, reruns actual responsive/keyboard/reset/error/final-confirmation browser checks including visible note placement, and records exact-source combined tests and feature-gate behavior. Live delivery, real consent/session/entitlement adapters, durable private storage and protected content remain outside this assignment.
