# W3 Wave 2 member experience result

November 1, 2026. Dave explicitly authorized this bounded continuation of the
existing W3 synthetic prototype. No production integration or release is implied.

## Source and edit boundary

- Branch: `codex/lane3-member-design`.
- Base/current committed HEAD: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
- Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane3-member-design/Lockliel`.
- Changes remain local and uncommitted. No push, merge or deployment.
- Wave 1 source/evidence fingerprints are preserved in `WAVE1_FINGERPRINTS.json`.
  Wave 1 `ACCEPTANCE.md`, `README.md` and `PRIVACY_AND_INTEGRATION.md` remain intact
  as historical evidence. This file records the newer checks and changed behavior.

Updated owned files:

- `components/member-experience-preview/member-components.tsx`
- `components/member-experience-preview/member-experience-preview.tsx`
- `components/member-experience-preview/member-experience-preview.module.css`
- `components/member-experience-preview/preview-model.ts`
- `tests/member-experience-preview.test.mjs`

New owned evidence:

- `docs/lane3-member-design/WAVE1_FINGERPRINTS.json`
- `docs/lane3-member-design/WAVE2_CONTRAST_REVIEW.json`
- `docs/lane3-member-design/WAVE2_RESULT.md`

`synthetic-fixtures.ts` remains unchanged. No common primitive, global/member CSS,
shared design token, live navigation/layout, Auth, API, migration, dependency,
package/lockfile, Netlify or hosting manifest was edited.

## Evidence-backed refinements

The Wave 1 avatar was a generic span with an accessible label, and explanatory
text beside native controls was not consistently connected programmatically.
The refined components use explicit image roles/labels for synthetic avatars and
one reusable `PreviewSelect` that connects each visible label and help text to its
native select. Description references and IDs are checked in actual React output.

`PreviewPanel` now accepts standard section attributes. The next-step section is
named by its heading and reports busy only while the selected example is loading.
Page-only changes announce their state in the existing polite atomic status
region without moving focus. Presentation buttons explicitly use `type="button"`
to avoid accidentally submitting a surrounding form during future reuse.

Photo controls remain entirely synthetic. The owner can choose initials, no
placeholder or unavailable, or remove the sample placeholder. Every photo-state
change resets that field's visibility to Only me, so restoring a sample cannot
silently reuse an earlier sharing choice. No file input, photo, blob, storage path,
upload, image processing or persistence exists.

Non-owner photo states remain deliberately indistinguishable: private, removed
and unavailable show the same “No photo shared in this preview” label. Explicitly
shared initials can appear only as the synthetic placeholder. Public visitors
still receive no member card. The existing generic unshared Banner copy remains;
it does not reveal whether a private Banner exists. Optional field audiences are
independent and do not establish authorization, consent or a relationship.

The existing navy/blue palette and local brand mark are unchanged. Scoped styles
improve narrow layouts, native control/help sizing, focused main content and
mobile navigation target height. No new global theme or approved website redesign
was introduced.

## Local checks actually run

| Check | Result and scope |
| --- | --- |
| Focused tests | 23 passed, 0 failed, 0 skipped. Includes the 12 original tests plus photo lifecycle/privacy, actual React SSR semantics and selected contrast calculations. |
| Strict TypeScript | Passed for the owned components/contracts and temporary CSS declaration. No full Next type-generation claim. |
| Targeted ESLint | Passed with 0 errors and 0 warnings, using --max-warnings 0 on owned source/tests only. |
| Actual React browser build | Final source bundled successfully with existing esbuild, React and ReactDOM. No new dependency or live application route was imported. |
| Network controls | Tests/type/lint ran under OS network denial; Node tests also used the repository network guard. The temporary static server binds only 127.0.0.1 and permits localhost networking only. Its CSP denies API connections, forms, frames, external fonts/scripts/images and other external resources. |
| Edit scope | Worktree retains the original uncommitted prototype; only allowed W3 paths were changed, plus the explicitly temporary dependency symlink for validation. |

An initial contrast source assertion looked only for hex literals, while the
existing panel uses rgba. That test lookup was corrected to recognize the actual
rgba declaration. No palette change was made to force a test result.

The new SSR checks compile the actual owned React graph in memory with a synthetic
CSS-module stub. They verify semantic markup and references, not visual paint,
browser behavior or assistive-technology announcements. No untrusted or member
input is compiled or executed by those checks.

## Bounded contrast review

`WAVE2_CONTRAST_REVIEW.json` records the stylesheet hash, all 13 selected numeric
pairs/bounds and unrounded ratios. Every selected text calculation clears 4.5:1;
the lowest is 7.206904631551355:1. Selected control/focus calculations clear 3:1;
the lowest is 4.27615525919549:1 for the native select boundary. Banner text is
checked against a conservative brighter bound for its existing blue gradient.

These are declared-color calculations, not a complete rendered-pixel, gradient,
image, every-state or operating-system audit. The translucent panel calculation
uses its declared RGB endpoint. Do not infer full WCAG conformance from these
numbers or from lint/SSR tests.

The review follows the numeric thresholds in
[W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
[W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
separately describes a 320-CSS-pixel width; testing that width is not a claim that
actual browser zoom was exercised.
[W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
supports programmatic announcements without moving focus. Actual screen-reader
output remains an acceptance task.

## Coordinator browser evidence

The coordinator, not this subagent, operated the browser against the real local
React bundle. Reported November 1 observations:

| Case | Observation |
| --- | --- |
| Narrow/responsive layout | scrollWidth equaled clientWidth at 320, 390, 768 and 1365 CSS pixels. |
| Programmatic help | All aria-describedby tokens resolved to existing elements. |
| Photo removal | Removing the placeholder reset photo visibility to private; approved-connection view used the generic unshared label. |
| Unavailable and public | Unavailable photo and public-denied card behavior passed the scoped checks. |
| Refresh | All private initial choices were restored after refresh. |
| File input | None present. |
| Resource origins | Observed resources were loopback only; not an exhaustive packet capture. |
| Skip link | Enter focused MAIN. |
| Loading/status | Next-step section reported aria-busy=true, and the polite status region was present. |

The coordinator reloaded and reviewed the final tested bundle, completed browser
QA and reported no console warnings or errors. The retained synthetic desktop
screenshot is a JPEG in the root checkout at
`docs/coordination/evidence/2026-11-01-wave2/member-desktop.jpg`.
An attempted mobile screenshot captured another active tab at desktop dimensions;
the coordinator removed that mislabelled duplicate. No new Wave 2 member mobile
screenshot is claimed. The responsive DOM checks at 320, 390, 768 and 1365 CSS
pixels remain valid observations made while the W3 preview was active.
The coordinator-owned screenshot was not copied or modified by this lane.
The subagent performed no browser actions.

## Accessibility limits and integration blockers

Actual 200% browser zoom, runtime reduced-motion acceptance and full screen-reader
output remain unverified. The existing reduced-motion rule and scoped source/SSR
checks are not substitutes for those observations. Narrow CSS-width review and
selected contrast math are useful bounded evidence, not comprehensive conformance.

Live photo storage/moderation/retention, member audience/consent policy, server-side
privacy-safe DTOs and Dave's intended recoverable visual reference remain open.
The presentation projection is not a security boundary; real authorization must
be established server-side. No new data audience or upload policy is approved by
this mock. No role, access, enrollment or progress is inferred from a card, tag,
application, request or successful-looking signup state.

The smallest next action is to review the completed isolated refinements and
finish the remaining accessibility acceptance before any separately authorized
integration package. Do not connect real accounts or ship the prototype
automatically.

## Preservation and cleanup

No production query, data/settings/Auth/SMTP/PITR/compute/Storage/maintenance change,
credential input, account/session/email test, protected-resource access, migration,
push, merge, commit or deployment. No other repository or root coordination file
was modified by this lane.

Temporary Wave 2 harness: `/private/tmp/lockliel-w3-wave2-20261101/`.
Review URL: `http://127.0.0.1:4318/member-experience`.
After the coordinator confirmed browser QA was complete, only the exact Wave 2
static server, its owned temporary harness directory and the temporary dependency
symlink were retired. No listener remains on 4318 and both temporary paths are
absent. Product files, the dedicated worktree and Wave 1 evidence remain intact.

## Final file delta

Compared with the preserved Wave 1 fingerprints, four owned source files and the
owned test file changed. The synthetic fixture and all three Wave 1 Markdown
records remain byte-identical. Three new evidence/result files were added. There
are twelve intended owned files in total, no tracked baseline edit, and no commit.
Focused checks remain 23 passed / 0 failed / 0 skipped; TypeScript, zero-warning
lint and actual React bundle build passed. The browser findings above are the
coordinator's scoped observations, with the accessibility limits preserved.
