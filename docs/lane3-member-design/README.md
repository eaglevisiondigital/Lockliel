# Member experience design prototype

Prepared November 1, 2026 under Dave's explicit W3 implementation authorization.

This is a reviewable synthetic React prototype. It is not a production dashboard,
profile editor, Auth change, new permission model or replacement website. Nothing
is connected to a member account. No data is uploaded, saved, shared or sent.

## Source and preservation

- Branch: `codex/lane3-member-design`.
- Base and current committed HEAD: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
- Dedicated worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane3-member-design/Lockliel`.
- Approved edit scope: `components/member-experience-preview/**`,
  `docs/lane3-member-design/**` and `tests/member-experience-preview.test.mjs`.
- No local commit, push, merge, production deployment or environment mutation.

The existing member palette, Arial/Helvetica typography, panel treatment and local
`public/lockliel-mark.png` are reused. The source asset is retained in Git. This
prototype defines no global tokens and changes no global/member CSS, shared
primitive, layout, navigation, package, migration or hosting manifest. Both the
Netlify production website and ChatGPT Site version 25 remain preserved. Neither
has been selected as the authoritative reference for a future redesign. The
five-part mission is shown only in this isolated review surface.

## What is implemented

The preview includes a dashboard, one clear next-step card, a richer member card,
three growth paths, an optional Faith Banner, explicit per-field visibility
choices and a side-by-side audience projection. Profile photo treatment is an
initials placeholder. No file input or upload implementation exists.

An always-visible notice labels the design as synthetic. Interactive controls
only update React state. Action buttons announce that no course, contact, message,
request, role or progress changed. Refreshing resets all choices. There is no
cloud-save or email-delivery claim.

The review controls exercise:

- Ready, loading, no recommendation, access denied and unavailable next-step states.
- A local retry from unavailable to ready, without a network request.
- Optional Faith Banner presets and a no-banner state, without Scripture text,
  private prayer content, assessment inference or spiritual scores.
- Independent photo-placeholder, location and banner visibility, initially Only me.
- Owner, approved-connection and public-visitor visual comparisons. Public visitors
  receive no profile projection. These choices do not establish authorization.
- Request received, confirmation needed, email confirmed and signed-in signup
  presentations. A received request is not a confirmed account or session; an
  email instruction is not delivery evidence; confirmation is not sign-in or a role.

## Component map

| File | Responsibility |
| --- | --- |
| `components/member-experience-preview/member-experience-preview.tsx` | Composes the synthetic dashboard, profile/audience controls, signup states and page-only notices. |
| `components/member-experience-preview/member-components.tsx` | Reusable presentation components: panel, member card, Faith Banner, next-step card and signup status. |
| `components/member-experience-preview/preview-model.ts` | Typed presentation states, private initial visibility and an explicit allowlist projection. No authorization or transport. |
| `components/member-experience-preview/synthetic-fixtures.ts` | One invented display fixture with no email, phone, account ID or real member values. |
| `components/member-experience-preview/member-experience-preview.module.css` | Scoped styling, mobile reflow, focus states, skip link and reduced-motion behavior. |
| `tests/member-experience-preview.test.mjs` | Privacy projection, invalid audience/banner, state truthfulness and transport/persistence exclusion checks. |
| `docs/lane3-member-design/PRIVACY_AND_INTEGRATION.md` | Review boundary and future integration requirements. |

## Local review harness

The coordinator performs browser QA. The temporary harness uses esbuild to bundle
these actual React components, not a static imitation. It imports React/ReactDOM
and the owned component graph, then serves the bundle and existing brand mark on
`http://127.0.0.1:4318/member-experience`. No live application route is imported.
Runtime scripts and bundle files live outside Git under
`/private/tmp/lockliel-w3-preview-20261101/` and are not product infrastructure.

Historical launch command used for this review:

```sh
/usr/bin/sandbox-exec -f /private/tmp/lockliel-w3-preview-20261101/network.sb /opt/homebrew/opt/node@24/bin/node /private/tmp/lockliel-w3-preview-20261101/harness.mjs
```

The server binds only to `127.0.0.1`. An OS policy denies non-localhost networking.
The harness CSP denies API connections, forms, frames and external resources.
Only local scripts, styles and the existing local image are allowed. A temporary
`node_modules` symlink supported local validation and was removed after browser QA.
The exact server, temporary harness artifacts and dependency symlink were retired after coordinator review. This command is an execution record, not a currently available service. No harness was deployed.

## Validation scope

The 12 focused tests pass with the existing Node network guard and OS IP denial.
Strict TypeScript checking of the owned contract/components passes. The actual
React browser bundle builds. Targeted ESLint passes with zero warnings and covers only owned source/tests.
A documented inline exception permits the existing local `<img>` in this
standalone harness, avoiding an unrelated Next image route or loader.

No full Next production build, full course/SQL suite, authenticated hosted test,
production query or live email/session test is represented by these checks. There
is no route integration in this package. Coordinator browser results and their remaining accessibility limits are recorded
in `docs/lane3-member-design/ACCEPTANCE.md`.

## Next review step

Review the synthetic desktop/mobile states and privacy comparison. Choose the
recoverable visual reference, approve any scoped presentation changes, settle
photo/audience policy and agree on privacy-safe DTOs before a separate integration
assignment. The prototype is not permission to connect to real accounts or replace
any published experience.
