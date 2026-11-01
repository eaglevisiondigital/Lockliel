# W4 Wave 2: synthetic Faith Journey UI result

November 1, 2026. Local implementation passed scoped coordinator browser review; it is not live
integration or release. Dave's Wave 2 authorization extends the earlier contract-only
scope to isolated memory-only React prototypes. Prior Wave 1 source/tests are retained.

## Source and owned changes

- Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane4-faith-contracts/Lockliel`.
- Branch: `codex/lane4-faith-contracts`.
- Exact base/current committed HEAD: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
- Wave 1 and Wave 2 files remain local and uncommitted. No commit/push/merge/deployment.

New Wave 2 files:

| File | Implemented behavior |
| --- | --- |
| `components/faith-journey-preview/faith-journey-preview.tsx` | Synthetic workspace, explicit preferred-edition controls, anchors, prayer add/archive/remove, growth areas, related practical plans and self-reported step completion; reset/unknown-context clearing |
| `components/faith-journey-preview/scripture-drawer.tsx` | Actual modal reference drawer consuming the existing guarded service, explicit unavailable states, synthetic A/B editions, private memory-only anchor creation and focus/keyboard handling |
| `components/faith-journey-preview/preview-model.ts` | Pure bounded preview state, private allowlist projection, unknown-context clearing, explicit editions and synthetic domain mutations |
| `components/faith-journey-preview/faith-journey-preview.module.css` | Scoped navy/blue/cream palette, responsive layout, visible focus and reduced-motion rules; no shared CSS/token imports or edits |
| `tests/faith-journey-preview.test.mjs` | Private defaults, unknown/invalid context, no fallback, domain state, removal/reset, bounded fixtures, source-boundary checks and actual rendered React select-label regression |
| `docs/lane4-faith-contracts/CRISIS_SUPPORT_INTERACTION_REQUIREMENTS.md` | Separate qualified-review requirements only; no crisis runtime or advice |
| `docs/lane4-faith-contracts/WAVE2_RESULT.md` | This implementation and verification handoff |

The earlier README and private-domain architecture receive a short Wave 2 status
notice. Existing `lib/faith-journey/contracts.ts`, `lib/faith-journey/index.ts`,
`tests/faith-journey-contracts.test.mjs` and provider-licensing analysis are unchanged
by Wave 2. No navigation, live route, Auth/session, course, schema, dependency,
package/lockfile, workflow, hosting manifest or other repository file was edited.

## Actual interactions

- No initial preferred translation. The member must explicitly choose synthetic A,
  synthetic B or an unavailable synthetic edition. These are not licensed translations
  or an approved real default. The unavailable edition/provider and unknown provider
  state show a clear unavailable message and never silently substitute another edition.
- The drawer displays invented placeholders from the existing pure guarded service.
  Synthetic B has a distinct label/text. No real Bible text or verse API is accessed.
- Anchors keep exact synthetic version/reference and an optional invented reflection,
  without retaining verse text. Adding an anchor states that it is memory-only.
- Prayer Board supports an invented example, add, archive/reopen and remove. No prayer
  event, count, response, answered-prayer claim or message is fabricated.
- Growth areas support member-authored synthetic title/reflection. Action plans can
  link to a growth area, contain one practical step and toggle self-reported practice.
  Removing a growth area detaches its plan link without exposing or inventing progress.
- All draft collections are bounded to 12. No sharing, audience selector, recipient,
  export, email, reminder, recommendation, crisis classifier or network service exists.
- Reset clears preferred edition, stored preview entries and unsubmitted form state.
  Refresh reconstructs empty state. Unknown identity context clears previous drafts,
  removes private forms/data and rejects mutations; returning to owner starts empty.
  This is a synthetic presentation boundary, not authentication or hosted RLS evidence.

## Local checks actually run

| Check | Result and practical limit |
| --- | --- |
| Node guarded tests | 80 passed: 67 retained Wave 1 contract tests + 13 new preview tests; 0 failed/skipped. Existing network guard plus OS network denial used. |
| Scoped strict TypeScript | Passed for owned TS/TSX and a temporary CSS-module declaration; no shared tsconfig change or full Next type-generation claim. |
| Targeted ESLint | Passed with `--max-warnings 0` for owned preview/contracts and two tests. |
| Actual React browser bundle | esbuild successfully bundled actual React/ReactDOM and owned components; approximately 652.8 KB JavaScript and 12.2 KB scoped CSS before compression. No dependency installed. |
| Actual React SSR markup | 11 assertions passed for required headings, explicit unselected synthetic edition, memory/reset notice, no real-text label, empty prayer state and no iframe/password field. This is initial markup, not browser interaction evidence. |
| Historical migrations | All 280 source migration files are preserved. Final byte/scope inspection is recorded in the coordinator handoff. No SQL/replay/hosted acceptance ran. |

Representative commands use the already installed Node 24, TypeScript, ESLint and
esbuild. Tests run with:

```sh
/usr/bin/sandbox-exec -f /private/tmp/lockliel-w4-preview-20261101/deny-network.sb /opt/homebrew/opt/node@24/bin/node --import ./tests/support/network-guard.mjs --test tests/faith-journey-contracts.test.mjs tests/faith-journey-preview.test.mjs
```

Scoped typecheck uses `--noEmit --strict --target ES2022 --module preserve
--moduleResolution bundler --skipLibCheck --jsx react-jsx --lib DOM,ESNext
--esModuleInterop`, the temporary CSS declaration and owned TS/TSX. Targeted lint
covers `components/faith-journey-preview`, `lib/faith-journey` and both owned test files.
No full Next production build, full SQL suite, live Bible API, real member data or
hosted Auth acceptance is claimed.

## Browser review harness and security

Coordinator review URL: `http://127.0.0.1:4319/faith-journey`.
Actual components are built into an outside-Git harness at
`/private/tmp/lockliel-w4-preview-20261101/`. Only four fixed local resources are served.
The server binds to 127.0.0.1; the OS policy denies non-local networking. CSP denies
connections, forms, frames, images, media, fonts, objects and external resources;
only local scripts/styles are allowed. Responses are no-store and no-referrer.
No credential, account, private prayer or member PII is present in the harness.

The initial temporary SSR harness needed its module format corrected to resolve
React; the local server policy initially rejected the literal IP syntax. Both stopped
before a server was available. The corrected CJS SSR bundle passed, and the macOS
policy uses localhost with an explicit 127.0.0.1 listener. No security rule was weakened
and no external connection occurred. Only the final corrected bundle is for QA.

The subagent did not operate a browser. The coordinator completed the scoped browser
review recorded below. After that review, only exec session 30298 was stopped and the
owned temporary harness directory and dependency symlink were removed. The listener
is retired; this URL is a historical review address. Intended source and Wave 1 work
remain intact. No harness was deployed.

## Accessibility implementation and remaining limits

Native `dialog.showModal()` establishes modal behavior. The heading receives initial
focus; labelled/described semantics, Tab/Shift-Tab containment, Escape/cancel close,
visible close buttons and connected-trigger focus return are implemented. The page
has a skip link, semantic labelled sections, native forms, status announcements,
44-pixel-or-larger main controls and responsive single-column layouts. All user text
is interpolated as React plain text; no HTML injection or external links are used.

Source and SSR checks do not prove live focus behavior, responsive rendering, actual
200% zoom, screen-reader output, measured contrast or reduced-motion runtime behavior.
These remain browser/assistive-technology acceptance items until independently observed.

## Coordinator observations and label correction

The coordinator reported that modal keyboard behavior passed: heading initial focus,
Shift-Tab to the last close control, Tab to the first close control, Escape close and
focus return to the reference trigger. With no selected edition, the drawer showed
unavailable without substitution. These are scoped observations, not full assistive-
technology acceptance. Initial tool-driven pointer activation timed out while keyboard
activation worked; that alone does not establish an application pointer defect.

The coordinator found an exact-label locator mismatch for nested select labels. The
preview now uses separate visible `label` elements with explicit `htmlFor`/`id` pairs
for all four selects. A new test bundles the actual React component graph in memory,
renders it to static markup and checks exact label text, separate select associations
and the expected select count. The label issue is not being classified as a screen-
reader defect from locator evidence alone. The corrected bundle passed the coordinator recheck below. No application source
changed after that recheck.

## Final coordinator browser acceptance

The coordinator reported these results on the corrected actual React bundle. This
subagent did not repeat or independently operate those browser checks.

| Interaction | Observed result |
| --- | --- |
| Explicit select labels | Exact label queries succeeded after reload for the corrected separate label/select markup. |
| Preferred edition | Initially unselected. No-edition drawer unavailable; synthetic A/B had distinct Not Scripture placeholders; unavailable edition and unknown provider did not fall back. |
| Anchor identity | Empty-reflection anchor was retained with synthetic A even after the preferred edition changed to B. No verse-text storage or real default was implied. |
| Modal keyboard | Initial heading focus, Shift-Tab to last close, Tab to first close, Escape close and return to trigger passed. This occurred before the label-only correction; drawer bytes were unchanged by it. |
| Prayer Board | HTML-looking synthetic input rendered as plain text with zero injected `b` elements. Add, archive and remove passed. |
| Growth and plans | Growth addition, Plan one small step focus to title with selected related area, plan creation and self-reported step check passed. |
| Unknown context | Private controls hidden; anchors, growth areas, plans and unsubmitted prayer input cleared. Returning to owner started blank. |
| Reset and refresh | Reset cleared unsubmitted input and edition. Refresh restored initial defaults. |
| Responsive layout | No horizontal overflow at 320, 390, 768 and 1365 CSS pixel widths. |
| Browser resource/console scope | Observed resource URLs used only 127.0.0.1:4319; no console warnings/errors returned. This is scoped observation, not an exhaustive network capture. |

Coordinator-owned screenshots remain in the root checkout, not this lane's worktree:

- `/Users/davesmacbookpro/Documents/ChatGPT/Lockliel/docs/coordination/evidence/2026-11-01-wave2/faith-drawer-desktop.jpg`
- `/Users/davesmacbookpro/Documents/ChatGPT/Lockliel/docs/coordination/evidence/2026-11-01-wave2/faith-drawer-mobile.jpg`
- `/Users/davesmacbookpro/Documents/ChatGPT/Lockliel/docs/coordination/evidence/2026-11-01-wave2/faith-overview.jpg`

Those evidence files were not modified by this lane. Full screen-reader acceptance,
actual 200% zoom/reflow, runtime reduced-motion behavior and a full rendered contrast
audit remain unverified. Do not call those checks passed.

## Remaining gates and smallest next action

- Owner visual review and recoverable production/Sites design baseline before integration.
- Complete the remaining assistive-technology/zoom/contrast/motion acceptance.
- Provider/version/licensing/default/canon/locale decisions; no licensed-text ingestion.
- Reviewed server DTOs, identity/RLS, retention/export/deletion/share revocation and
  minors/jurisdiction policy before durable sensitive data or live account integration.
- Separate qualified crisis review using the requirements document; no runtime implied.
- Separate integration/release assignment. No production, remote CI, migration,
  maintenance, Auth/SMTP, settings, content, payment/staff, Storage/PITR action occurred.

Smallest next action: owner reviews the synthetic UI and contract decisions, followed
by narrowly scoped accessibility and integration planning. Do not connect these
prototypes to production or activate live Bible/sharing features. No commit, push,
merge, production deployment, new account/session or live data test occurred.
