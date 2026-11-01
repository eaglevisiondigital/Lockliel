# W4 Wave 3: reusable Faith workspace candidate

November 1, 2026. Local reusable source is ready for coordinator QA. This is an
actual React module for the separately gated synthetic integrated candidate, not a
live Bible/provider/Auth implementation or a production release.

## Verified starting point

- Existing branch: `codex/lane4-faith-contracts`.
- Existing worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane4-faith-contracts/Lockliel`.
- Clean Wave 1/2 checkpoint before work: `dd743799f5e5063732fccc4e3f961ddae9da5e7a`.
- Wave 1 rights/private-domain contracts and historical Wave 2 report/evidence are retained.
- Only the owned components, focused preview test and this report changed in Wave 3.

## Stable host API

Named component import:

```tsx
import {FaithJourneyWorkspace} from './components/faith-journey-preview/faith-journey-workspace';
import type {
  FaithWorkspaceProps, FaithWorkspaceIdentity, FaithEditionPreference,
  FaithWorkspaceIntent, FaithProviderPreviewMode,
} from './components/faith-journey-preview/workspace-contract';
```

`FaithWorkspaceProps`:

| Prop | Contract |
| --- | --- |
| `identity` | Required `{status: 'synthetic-owner', boundaryKey: string}` or `{status: 'unknown'}`. Missing, unknown or malformed values deny the workspace. This is a synthetic view contract, not authentication or authorization. |
| `editionPreference` | Required `{status: 'unselected'}`, `{status: 'selected', editionId: string}`, or `{status: 'unknown'}`. Only fixture-only, fixture-alternative and unavailable-edition are accepted. Invalid/unknown choices remain unavailable, without a fallback. |
| `onIntent` | Required metadata-only callback. Receives `preferred-edition-change-requested` with an allowlisted synthetic edition ID or null, or `reset-requested`. Never receives prayer/reflection/growth/plan text, account IDs, permission grants or save/delivery claims. |
| `idPrefix` | Required safe unique DOM prefix. Coordinator integration uses exactly `integrated-faith`. Invalid prefixes deny rendering of private controls. |
| `providerMode` | Optional ready/unavailable/unknown synthetic state. Default is unknown, not ready. No external provider is invoked. |
| `resetKey` | Optional nonnegative integer or bounded safe opaque string. Changing it remounts and clears module memory. |

The module renders a labelled section with h2 and subordinate feature headings.
It introduces no header, main, nav, footer or h1. The coordinator owns the single
host shell, navigation and gated `/my-lockliel/review` route. This lane did not edit
that route, gate, shared tokens or any host file.

The host owns preferred edition, identity/boundary/reset lifecycle and provider review
state. The module owns private in-memory drafts only. A callback requests a change;
the host must update the controlled prop. No persistence follows from an intent.
The host must increment/reset its boundary/reset values and clear preferences when
switching review identities or resetting. The module independently remounts private
state when boundaryKey, resetKey or prefix changes; unknown identity unmounts all
private controls. Returning to known context begins empty. Never map a real Auth
session or member data into this synthetic view without separate reviewed authority.

## Actual source changes

| File | Wave 3 behavior |
| --- | --- |
| `components/faith-journey-preview/faith-journey-workspace.tsx` | Exported reusable private-memory workspace; prior six feature interactions preserved; host-controlled edition/identity/reset; prefixed DOM IDs; no nested app landmarks |
| `components/faith-journey-preview/workspace-contract.ts` | Typed host props/intents and fail-closed guards; callback allowlist excludes private bodies |
| `components/faith-journey-preview/scripture-encouragement.tsx` | Scripture-based encouragement layout from an explicit versioned synthetic reference/placeholder, with attribution and deliberate unavailable states |
| `components/faith-journey-preview/synthetic-scripture.ts` | Reuses existing guarded service for the same synthetic A/B fixture in drawer and encouragement; no real provider/default, private-data analysis or network |
| `components/faith-journey-preview/faith-journey-preview.tsx` | Existing standalone preview now wraps the reusable module and owns its synthetic host controls |
| `components/faith-journey-preview/scripture-drawer.tsx` | Uses shared synthetic fixture reader and prefixed label/reflection IDs; retains native modal focus/close/return behavior |
| `components/faith-journey-preview/faith-journey-preview.module.css` | Scoped module boundary and encouragement styles only; no shared token or app stylesheet edits |
| `tests/faith-journey-preview.test.mjs` | Existing regression coverage adapted to prefixed IDs; added host guards, controlled preference/intent and actual reusable-module SSR tests |
| `docs/lane4-faith-contracts/WAVE3_RESULT.md` | This Wave 3 handoff; prior evidence is not overwritten |

Encouragement is a fixed synthetic presentation shared by every viewer. It does not
consume prayer, health, family, growth or assessment text to infer a recommendation.
Displayed text explicitly says it is invented and not Scripture/advice/personalized
recommendation. Versioned citation/edition attribution travels with available fixture
content. Unavailable/unknown edition or provider shows no substitute message or verse.
The Explore button opens the existing reference drawer. Real Scripture text, licensed
provider calls, editorial approval and a real default translation remain absent.

## Local verification actually run

- 86 focused tests passed: 67 retained rights/domain tests and 19 preview/integration
  tests, including actual rendered React label/landmark/unknown-view assertions.
- Tests used both the repository's network guard and an OS deny-network policy.
- Strict scoped TypeScript passed for owned TS/TSX and a temporary CSS declaration;
  no package/tsconfig/shared-file change.
- Targeted ESLint passed with zero warnings for owned source and both focused tests.
- Actual browser React bundle built: approximately 662.1 KB JavaScript / 13.1 KB CSS.
- No full Next build, SQL replay, root integration-route acceptance or hosted Auth
  test is represented by these checks.

## Bounded local QA harness

The temporary outside-Git harness serves actual components at
`http://127.0.0.1:4319/workspace` and the preserved standalone wrapper at
`http://127.0.0.1:4319/faith-journey`. The workspace route supplies a minimal synthetic
host, not the coordinator's integrated application route. It allows review of explicit
host identity/provider, boundary changes and resets without real account access.

The server binds only to 127.0.0.1 under OS non-local-network denial. CSP denies API
connections/forms/frames/images/fonts/media/objects and external resources; only fixed
local scripts/styles are allowed. Responses are no-store/no-referrer. No credential,
real member data, Bible provider or sensitive persisted data is present.

No browser was operated by this lane. The coordinator directed a local preservation
checkpoint based on the guarded 86 tests, scoped types/lint, actual React bundle and
SSR contract checks, so the exact source can be imported into the actual Next candidate.
New workspace browser acceptance is PENDING that integrated route review; no isolated
Wave 3 browser pass or combined application acceptance is claimed. Historical Wave 2
browser evidence remains scoped to its earlier source. This local checkpoint is not
release authority. The coordinator will report actual combined QA independently.

## Held portions and next action

No live Auth, provider/text ingestion, cloud persistence, sharing delivery, private-data
recommendations, spiritual scores or crisis automation. Existing crisis interaction
requirements remain for qualified review only. Real-provider licensing/default/canon/
locale, sensitive-data retention/export/deletion, RLS/ACLs and privacy/minors decisions
remain gates before any live feature. Types/props/UI guards are not Auth or RLS.

The next action is coordinator synthetic integration QA using the local owned-file
checkpoint. Import only the exact reviewed source snapshot into the default-off local
candidate; do not infer merge, production deployment, settings or migration authority.
