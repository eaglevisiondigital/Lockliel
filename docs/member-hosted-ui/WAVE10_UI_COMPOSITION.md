# Wave 10 isolated member-read UI composition

November 1, 2026. Local implementation only. No hosted sign-in, deployment or Auth setting change.

## Implemented

The existing `/my-lockliel/review` static route can expose the existing Wave 8 `ServerMemberReadShell` through a new independent default-OFF build gate. It does not select a synthetic fixture, change the public website, activate private domain adapters, or introduce an authentication framework.

All of these trusted build values must match:

| Input | Exact required value |
| --- | --- |
| LOCKLIEL_MEMBER_HOSTED_REVIEW | isolated-read |
| NETLIFY | true |
| CONTEXT | deploy-preview |
| SITE_ID | 70b03a42-6329-476e-bf4b-2b1ce30e9567 |
| DEPLOY_ID | 24 lowercase hexadecimal characters |
| COMMIT_REF | 40 lowercase hexadecimal characters |
| LOCKLIEL_ISOLATED_READ_DEPLOY | exact DEPLOY_ID |
| LOCKLIEL_ISOLATED_READ_SOURCE | exact COMMIT_REF |

The route compiles its nonsecret expected deploy/source into the existing strict Wave 8 client binding. Supabase project `qjksggxorghaxvpyslip` and Netlify site identity are fixed by the existing client contract. It never derives expected binding from a response, request header, browser query, cookie or arbitrary public URL.

This build exposure is only one layer. It is not an authenticated session, provider attestation, artifact verification or runtime authorization. The separate package/runtime must independently enforce exact site/deploy/source/origin/context, maintain no-store responses, preserve the schema280/protocol278-v1/maintenanceON prerequisites and forbid all production fallback. The coordinator owns that work.

A missing or mismatched hosted gate remains not-found. Existing local synthetic, offline and local server-review modes retain their separate gates. Hosted selection returns only the real server-read shell even if local mock flags are present. No read failure falls back to a mock or another member.

## Existing UI reused unchanged

`ServerMemberReadShell`, `ServerMemberPanels`, the server adapter/controller/strict DTO parser, existing member review CSS/design and real Auth-change invalidation remain unchanged. The connected slice can display only the owner's minimal identity/profile and read-only communication preferences. Course progress, private Faith content, profile uploads, My Five/contact notes, resource entitlements, sharing and writes remain unavailable or Unknown. Sign-in is not performed by this review. It requires a separately authorized existing isolated session on the same actual host.

## Approval-review boundary retained

An attempted local edit adding a narrow credential-entry adapter for existing login/logout handlers was rejected by automatic approval review. The command did not run and none of its files were created. The exact reason was:

> The Wave 10 authorization covers local composition but explicitly defers hosted sign-in/session lifecycle to a separate approval; this edit adds credential-bearing login/logout behavior and therefore exceeds the authorized scope.

No alternate command or indirect workaround was attempted. The safe read-only gate, tests and this report continued. There is no new login form, credential input, session-control component, password store, token store, login redirect or Auth lifecycle implementation in this lane. Separate owner approval is needed for that held portion if it remains necessary. Existing sign-in pages cannot be assumed compatible with the reduced package because they link to excluded signup/recovery/MFA paths.

## Focused validation

Twenty-one new Wave 10 tests and the five existing Wave 8 UI tests passed, 26 total. These are local tests under the outbound deny-all preload. They exercise:

- Every required gate field absent, invalid contexts/site/deploy/source and pin mismatch.
- Actual review-route not-found on OFF, production, wrong site and missing/mismatched pins.
- Exact hosted build renders the existing server shell, status region and private-unavailable view.
- Hosted build cannot select offline/local mock data even with their flags set.
- No password inputs, signup links or invented member values in the hosted SSR view.
- Legacy local synthetic and missing-binding server mode preserved.
- No browser-derived configuration or Auth lifecycle added to the route.

Scoped ESLint passed with zero warnings. Ordinary TypeScript `tsc --noEmit` passed. Coordinator full suite/build/browser validation is reported separately; do not add overlapping focused totals to that suite. No actual hosted Auth, current-source spoken screen reader, real 200% zoom or hosted positive browser acceptance is certified by these SSR tests.

## Files and ownership

Exclusive source changes: `lib/member-review/review-policy.ts`, `app/my-lockliel/review/page.tsx`, `tests/wave10-member-ui.test.mjs`. This document is under `docs/member-hosted-ui`. No shared Auth source, navigation, existing styling/tokens, migrations, dependencies, hosting files or other projects were edited by this lane. Coordinator creates logical local commits after integration review; no lane staging, commit, push, merge or deployment.
