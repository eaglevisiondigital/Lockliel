# W3 Wave 3 reusable member workspace result

November 1, 2026. Completed under Dave's bounded Wave 3 authority. This is a local
component checkpoint for coordinator integration, not a release or live integration.

## Source and scope

- Existing branch/worktree: `codex/lane3-member-design` at
  `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane3-member-design/Lockliel`.
- Wave 3 parent: `365b30769c534cc8a75818ea50d3cb85a5ade30c`, which preserved Wave 1/2.
- Earlier application baseline: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
- Only the owned component prefix, one owned test and owned lane documents changed.
- The exact new local commit SHA is returned by Git in the coordinator handoff;
  this file is included in that commit and does not invent a self-referential SHA.

Updated:

- `components/member-experience-preview/member-components.tsx`
- `components/member-experience-preview/member-experience-preview.tsx`
- `components/member-experience-preview/member-experience-preview.module.css`
- `tests/member-experience-preview.test.mjs`

Added:

- `components/member-experience-preview/index.ts`
- `components/member-experience-preview/member-display-contract.ts`
- `components/member-experience-preview/member-experience-workspace.tsx`
- `docs/lane3-member-design/MEMBER_WORKSPACE_API.md`
- `docs/lane3-member-design/WAVE3_A11Y_HARNESS.md`
- `docs/lane3-member-design/WAVE3_RESULT.md`

All Wave 2 evidence and result documents remain unchanged. No root/shared
coordination, Auth, application route, global/member CSS, common primitive,
package/dependency, workflow, hosting, migration or other repository edit.

## Reusable component contract

`MemberExperienceWorkspace` is a named headless export from
`components/member-experience-preview/index.ts`. It creates no application header,
main, navigation or footer. The coordinator supplies its local review route/shell
and explicit default-OFF review flag in a separate integration tree.

Required props: `identity`, `displayModel`, `resetKey`. Optional: `idPrefix`,
`onIntent`. Identity accepts a valid synthetic-owner boundary or unknown. Unknown
identity does not inspect the model and renders no member fields or interactive
descendants. Malformed/incomplete model or reset key also fails closed.

The external model contains only a member display projection and next-step state.
The normalizer reconstructs bounded allowlisted plain-text fields, drops unknown
keys and photo/destination URL fields, preserves distinct availability states and
uses React text rendering. It is not a semantic classifier: callers must provide
privacy-safe display prose, not raw private records. No private note, assessment,
prayer, finance, role, contact or token field belongs in this DTO.

The workspace owns only local review choices. Optional field/photo visibility
starts private. Owner-boundary or resetKey changes remount and discard state;
unknown identity unmounts the known view. The host must change resetKey for a new
record/model revision and must not reuse a boundary for different owners. No
actual record, session or permission is created by those marker strings.

Callback intents contain only `{kind, boundaryKey}` with three allowlisted kinds:
`member:continue`, `member:review-profile`, `member:retry`. Missing/non-function
callbacks disable host action buttons. No intent occurs during render. Runtime
checks reject invented kinds and object-to-string coercion that could otherwise
carry an arbitrary object inside the metadata envelope. Callback failure yields
an unavailable message, never a saved or sent claim. The host owns any separately
reviewed effect; these components have no transport, persistence or navigation.

The original synthetic entry now hosts the same workspace and retains its outer
shell, fixture controls and truthful signup examples. Scoped workspace styling
reuses the existing palette/control rules without inheriting a full page shell.
The existing local mark and navy/blue treatment remain preserved.

Exact types, example props, callback payloads and integration obligations are in
`MEMBER_WORKSPACE_API.md`.

## Local checks actually run

| Check | Result / scope |
| --- | --- |
| Focused guarded tests | 35 passed, 0 failed, 0 skipped. Existing behavior plus external model allowlists, unknown identity without model inspection, malformed model, escaped plain text, no shell markup, callback absence/failure/metadata/coercion, multiple instances and distinct availability states. |
| Strict TypeScript | Passed for every owned TS/TSX module and the temporary CSS module declaration. |
| Targeted ESLint | Passed with 0 errors and 0 warnings, requiring --max-warnings 0. |
| Actual React build | Final workspace and standalone entry bundled with existing esbuild/React/ReactDOM. No new dependency or live application route. |
| Network containment | Tests/type/lint/final bundle ran under OS network denial; tests also used the existing Node network guard. The temporary local server used a localhost-only OS policy and restrictive connection/form/frame/external-resource CSP. |

The meaningful tests operate on both pure contracts and actual SSR output. SSR
uses a synthetic CSS-module stub to inspect semantics, not painted pixels. No
member data or untrusted code is compiled. The source capability scan covers all
owned TS/TSX/CSS files for transport, upload and browser persistence calls.

No full Next application build, course/SQL replay, production test, remote CI or
integrated browser acceptance is claimed by this lane. The coordinator will run
full Next build, integration tests and browser QA on the exact imported commit.
The previous Wave 2 browser/contrast observations are retained as historical scope,
not represented as fresh Wave 3 runtime checks.

## Accessibility tools and open evidence

A temporary non-product harness was prepared on 127.0.0.1:4318 with actual React,
synthetic identity/model/callback/reset controls and optional local CSS helpers
for font scaling, text spacing and reduced motion. These helpers were outside
product paths and made no OS/browser setting change. Their exact behavior and
limits are documented in `WAVE3_A11Y_HARNESS.md`.

The coordinator chose the actual local Next integration route for the next browser
review. No agent-operated browser test or repeated old prototype QA was performed.
CSS font scaling is not actual 200% browser zoom. CSS motion overrides are not an
OS preference or media-query runtime check. Full screen-reader acceptance remains
unverified. These are open integration acceptance tasks, not claimed passes.

## Preservation, cleanup and next step

No live uploads, images, public sharing, persistence, API, database/schema, accounts,
credentials, Auth/settings/maintenance changes, migration, push, merge or deployment.
No production access. No shared route/global-token/Auth copying.

Only the exact owned Wave 3 localhost server, temporary harness directory and
borrowed dependency symlink were retired after local validation. Product files,
Wave 1/2 evidence and the managed worktree are retained. A local-only commit of
this owned delta is authorized; no remote action follows.

Next: coordinator imports the exact local commit snapshot into its separate local
integration tree, verifies review flag OFF/unknown identity/private reset/callback
boundaries, runs full Next checks and tests real browser accessibility where
supported. Any detected defect returns as a narrow owner fix. Live data, uploads,
sharing, Auth, sensitive persistence and production release remain separate gates.
