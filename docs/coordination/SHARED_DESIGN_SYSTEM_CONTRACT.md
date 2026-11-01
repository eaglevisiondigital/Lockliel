# Shared design system contract, initial proposal

## Wave 3 current result, November 1

Integrated synthetic review retains navy/blue/cream and Arial-compatible existing identity in scoped CSS; public website/assets/global tokens unchanged. One coordinator-owned shell/main/nav surrounds reusable W3/W4 regions, stable scoped IDs and host reset keys.320/390/768/1365 both sections reflow; labels, skip focus, drawer focus/Tab/Escape and private statuses pass. Actual200%zoom/OSreducedmotion/fullscreenreader/exhaustive rendered contrast remain open. Visual owner approval and recoverable Site25 reference remain live-redesign gates; local integration is not a public redesign approval.

## Historical snapshots below


## Wave 2 current result, November 1

W3 retains the existing palette and mark, using only scoped module CSS. Reusable labelled controls/help, status/busy/image semantics, private-reset photo controls and320px reflow were refined.13selected declared-color contrast calculations pass (lowest selected text7.2069:1, control4.2762:1); this is not full rendered contrast certification. W4 uses a separate scoped module and the same recorded palette; no competing global tokens or navigation edits. Its drawer supports modal keyboard/focus behavior and four-width review. Neither prototype changes a published design. Full screen-reader, actual200% zoom and runtime reduced-motion acceptance remain open.

## Earlier wave record retained

## November 1 next-phase result

W3 implemented only components/member-experience-preview/** in its dedicated worktree. Local CSS and reusable dashboard/card/Banner/placeholder components reconcile existing navy/blue/cream and the existing local mark. No global tokens, common primitive, navigation or live member route changed. This remains a review proposal for integration, not a new approved website design.

Privacy defaults are private, field sharing is explicit, public visitors receive no card, and hidden versus absent Banner copy does not disclose private presence. Confirmation copy requires sign-in and confers no staff role. Browser widths 1365/768/390 and scoped keyboard/privacy/state checks passed. Full screen-reader, measured contrast, actual 200% zoom and runtime reduced-motion checks remain open. Production and Sites v25 remain preserved; Dave's intended recoverable visual reference is still required before integration.

## Initialization snapshot retained for history

Approved preservation requirements are binding. The extraction/component organization
below is a proposed engineering contract for review, not an implemented design change.
Lane 3 is the sole design-token/common-UI/navigation owner; coordinator integrates.

## Baselines and source of truth

Preserve Netlify production source `1599ab2` / deploy `6abbb27a` and ChatGPT Site active version 25 separately.
Neither is overwritten, unpublished or silently declared the other's source. Before a
visible change obtain Dave's intended reference, retain recoverable source/assets and
review snapshots. The current Git tree preserves the Netlify source/assets; Site version 25's
current complete archive/source binding has not been retrieved. No Site export or
visual redesign occurred in initialization.

Existing public tokens: app/globals.css includes blue `#0b84e3`, bright blue `#36a9ff`,
navy `#031428`, cream/ink and Arial/Helvetica. Existing member CSS is
app/my-lockliel/my-lockliel.css. Common primitives already exist in components/ui/.
Map these to a single reviewed token contract; do not create another competing theme.
No token replacement or CSS extraction is authorized by this document.

## Cross-platform reusable experience

Use the approved Champion Life course interaction standard documented in DECISIONS.md
and course-engine-standard-result/course-engine-reconciliation: desktop sticky media and
worksheet, responsive media minimization, honest cloud/local save status, owner-private
notes, real trusted progression, keyboard and mobile usability. Current Lockliel lesson
workspace is its existing application of the standard. No other repository or current
Champion Life final mockup was inspected here. A wider shared package is proposed only.

Share patterns and typed contracts while retaining branding, organization/tenant,
permission, payment destination, private data and release boundary separation. An
import from shared UI never authorizes an organization or data access. Do not duplicate
Auth/session/schema infrastructure or migrate to another platform as a design task.

## Component/UX rules

- Lane 3 owns public/member typography, spacing, color, focus, status and responsive tokens;
  consumers use approved styles and avoid whole-file global CSS edits.
- New isolated mocks use module CSS and synthetic view models, no live API dependency.
- Member cards show only authorized display data. Private prayer, assessments, notes,
  financial data and unrestricted contact details never appear through visual convenience.
- Profile visibility is explicit per field/audience; private remains the default. Photo
  upload/storage/retention/moderation requires a reviewed policy/interface first.
- Signup success preserves truthful confirmation/session states. A “success” banner must
  not imply a confirmed account, staff access or email delivery without evidence.
- Navigation changes are singularly owned, reviewed for route/security semantics and
  merged only after independent components are accepted. No parallel layout rewrites.
- Scripture drawer must support keyboard/focus return/Escape/labels/reflow and rights
  attribution; never manufacture unavailable verse text or silently switch versions.
- Show loading, unavailable, denied, empty, validation, conflict, retry and saved states
  truthfully. A local draft must not be called cloud-saved; prepared links are not sent.
- Copy is Scripture-first, respectful/non-coercive; retain approved convictions. No
  invented spiritual achievement scoring. No em dashes in product-facing new copy.
- The five-part mission is approved direction. Resolve existing four-part visual text
  through owner copy/design review rather than blanket production replacements.

## Acceptance contract

Owner reviews the scoped mock before shared components are wired. Verify representative
390/768/1365 widths, keyboard/focus, screen-reader labels, contrast, reduced motion,
200% zoom/reflow and honest degraded states. Compare approved baselines and keep an
asset/source recovery reference. No new branded images, redesigned public sections or
cross-repository package publication without a separate assignment.
