# WAVE 10B AUTH IMPLEMENTATION RESULT

**WAVE 10B READY FOR ISOLATED DEPLOYMENT REVIEW**

November 1, 2026. Local implementation and independent security review are complete. No deployment, real credential provisioning or hosted Auth operation is authorized or performed. This assessment requests a later narrowly scoped deployment review; it is not a production release decision.

## Authority, exact source and ownership

Dave's Wave 10B attachment 4d8f83d8-ea02-4a5a-a3eb-f72bf7f77096 explicitly supersedes the historical preparation-only Auth restriction for the exact LOCAL correction in [the Wave 10A proposal](WAVE10A_NARROW_AUTH_AND_DEPLOYMENT_PROPOSAL.md). The original automatic rejection remains in historical records; no rejected action was bypassed. No new rejection blocked this authorized local implementation. The proposal and summary were reconciled: production default rotation/expiry/active-session behavior stays unchanged; this approved isolated slice has no refresh or new manager/MFA endpoint.

Dedicated branch `codex/wave10-hosted-composition`, worktree `/Users/davesmacbookpro/.codex/worktrees/lockliel-wave10-hosted-composition/Lockliel`.

| Checkpoint | Exact commit |
| --- | --- |
| Existing application preserved | f5214b75b8dba3671b8eeda6c45574baa2539221 |
| Starting documentation | 9b798fc24497f1059a8b3bf5b18c03ad4df25fc9 |
| Reused Auth runtime/factories | bcaa35680ffefc61775636d65f568827e42d7f06 |
| Combined validated application/package source | 327ba098628f70aa65140862b8b14cd709bfd711 |

A later local documentation-only commit contains this report and does not replace the proposed application source.

Three native agents were actually dispatched. `/root/wave10b_auth_runtime` exclusively owned existing login/logout factory extraction, isolated runtime/transport/cookies and composition tests. `/root/wave10b_auth_ui` owned controls, shell/policy/route/UI tests, then the disjoint package builder/tests. `/root/wave10b_independent_security` implemented no source and independently reviewed all changed Auth/UI/package/verifier code and actual native artifacts; it also continued finite cross-lane preparation. Coordinator owned independent verifier/tests, full validation, browser operation, local commits, preservation and registers. No competing shared schema/navigation/design-token edits or other-project work.

## Exact source/test files changed

- `app/my-lockliel/review/page.tsx`
- `components/member-review/hosted-session-controls.tsx`
- `components/member-review/server-member-read-shell.tsx`
- `lib/member-review/review-policy.ts`
- `netlify/functions/lockliel-login.mjs`
- `netlify/functions/lockliel-logout.mjs`
- `netlify/member-hosted/runtime.mjs`
- `netlify/member-hosted/session-cookies.mjs`
- `netlify/member-hosted/transport.mjs`
- `scripts/member-hosted/package.mjs`
- `scripts/member-hosted/verify.mjs`
- `tests/member-hosted-auth-composition.test.mjs`
- `tests/member-hosted-package.test.mjs`
- `tests/member-hosted-verifier.test.mjs`
- `tests/wave10-member-ui.test.mjs`
- `tests/wave10b-auth-ui.test.mjs`

Lane notes are in `docs/wave10b-runtime`, `docs/wave10b-ui` and `docs/wave10b-security`; all twelve registers, the37-feature inventory and five continuity documents are updated separately.

## Existing infrastructure reused

`createLoginHandler` and `createLogoutHandler` expose dependency seams around existing Lockliel business logic. Existing default production/course exports, guard/config, validation, password grant/AAL and cookie serialization remain unchanged in behavior; factory/default-equivalence tests pass. Pure annotations permit genuinely unused default factory construction to be removed from the strict GET-only bundle without changing runtime defaults. No competing Auth system, provider SDK, broad session endpoint or new session store.

Unchanged: `lockliel-core.mjs`, production/backend configuration and safety guard, public AuthForm/sign-in/signup/recovery source, original edge guard/hosting manifests/workflows/dependencies, design tokens/styles/navigation, member projections/controller/RLS interfaces and every migration. The review route imports the existing approved member stylesheet without editing it or the public site.

## Login, session and logout behavior

- Both read and independent Auth opt-ins default OFF. Auth UI requires `LOCKLIEL_MEMBER_HOSTED_AUTH_REVIEW=isolated-login` plus every existing pinned read-build gate; runtime requires both strict boolean flags and provider Context. Read-only enablement cannot expose login/logout.
- Fixed same-origin JSON POST only; exact Origin/Fetch Metadata/path/method/query/header checks before private-key or provider use. No next/return URL, open redirect, credential URL/referrer, native credential GET, browser bearer or raw provider error. Both native forms/inputs/buttons are disabled until hydration. Password/FormData/payload clear before await and in cleanup; no credential state/store/logging.
- Explicit Secure, HttpOnly, host-only, Path=/, SameSite=Lax successful and clearing cookies reuse existing names/encoding/expiry. No Domain widening or environment mutation. Existing refresh-cookie serialization is preserved, but this slice never consumes it. Access expiry ends acceptance; no refresh. Read requires authoritative provider user, active session and caller owner-RLS before and after projection, not JWT/browser role claims alone.
- Valid isolated logout calls only `/auth/v1/logout?scope=local`. Missing/expired/foreign/malformed cookies clear locally without forwarding them. Missing key/provider failure still clears local cookies/view but reports revocation unverified; acceptance must stop. JWTs are not claimed instantly revoked. Production default logout semantics are preserved.
- Known MFA-required AAL1 accounts deny before success cookies; phone/WebAuthn factors are not erased into ordinary success. Missing/unknown factor knowledge fails closed. Only the newly granted isolated session is eligible for local cleanup; uncertainty explicitly stops acceptance. No challenge/reset/AAL2/manager endpoint or role grant. An ordinary provider-confirmed AAL2 member response is not administrative authorization.
- Disposable SQL/RLS verifies actual AAL1 denial, active AAL2 with DB staff role allowance, wrong identity/revoked-session denial and private-note protection. No staff grant, session/factor or user change occurs on any managed database. This does not replace real manager hosted acceptance.
- Every Auth transition invalidates old private data before transport and on completion/failure. Same-window/cross-tab notifications contain only event/timestamp. Unsupported private Faith/course/MyFive/content/photo/banner/financial/admin domains stay unavailable or Unknown. Saved preferences do not confer consent, entitlement or leadership.

## Trusted binding and artifacts

Exact proposed site 70b03a42-6329-476e-bf4b-2b1ce30e9567 and Supabase qjksggxorghaxvpyslip only, deploy-preview/published=false, schema 280/paused=true/protocol278-v1. Source/site/deploy/context/immutable HTTPS origin are checked against compiled pin and provider Context, never inferred from browser headers. No production/old-site fallback, service key, refresh, signup/recovery/admin, messages/payments or broad REST. Publishable syntax alone is not project provenance.

Original `lockliel-member-package-v1` remains strict one-GET-function/no-form/no-Auth artifact. Separate `lockliel-member-auth-package-v1` requires exactly3 native archives and custom routes: GET member-read, POST login, POST logout. Each archive has exactly4 official native entries with pinned bootstrap2.24.0/ZISI16.3.0 and source/compiled/ZIP byte bridges. Static asset allowlist, no-store/noindex, self-only CSP and exact disabled form whitelist remain enforced. No uploader, new dependency or provider operation was introduced.

Clean-source demonstration manifest SHA256 `f9eb5c350815bd69930c8c90f78c8d5abb87e50a426d83cad4bc175c514647f5`, at `/private/tmp/lockliel-wave10b-exact-A6LulG/package`. It reports source 327, sourceClean=true, **localFixture=true/releaseEligible=false/hostedAcceptance=NOT EXECUTED**. Its all-a deploy ID is synthetic, not a reserved/provider deploy. It must never be uploaded as an actual target. Report-only files were temporarily held outside the worktree and restored unchanged so clean-source identity was measured without ignoring dirty source.

| Native ZIP | SHA256 |
| --- | --- |
| lockliel-member-read | `c770f73f14723e0a269027bb72fff971c9fb55dd48260167f87906a3c071f394` |
| lockliel-login | `c2630e93b003f13cb2fe395e5c6d7260f46e0f384651ee9b79380f422c697b8c` |
| lockliel-logout | `573a3da6feb0e97c2fb208ceee0bbf29d51149636baa45c5ed3408f6b773db60` |

[Manifest](evidence/2026-11-01-wave10b/package-manifest.json) and [independent signoff](../wave10b-security/INDEPENDENT_REVIEW.md) preserve the exact byte domains. A future actual deploy ID requires rebuilding this exact source and separate independent manifest review. Provider metadata/ZIP/static/hash domains, custom routing and platform30 requests/60 seconds/IP rate enforcement remain unverified hosted gates. Local source metadata is not platform proof.

## Validation and independent findings

- **1,689 JavaScript tests passed,0 failed,0 skipped**, deny-network preload and actual native ZIP tests enabled using existing reviewed toolchain.
- TypeScript, configured/scoped lint and Netlify validation PASS:83 modules/63 handlers.
- Six supported build modes PASS: default OFF, legacy synthetic, offline read, local-server read, pinned hosted read, pinned hosted Auth. Exact committed-source Auth rebuild and final default OFF restoration also PASS.
- Disposable PostgreSQL 17 socket-only cluster:280 authoritative migrations replayed, all17 SQL/RLS files PASS, operational readiness/paused-read/ACL fixtures PASS; own cluster removed. No managed database was contacted.
- Independent reviewer reran336 focused tests and361 parallel contract subset tests, all pass. These are subsets of1,689, not additional unique totals.
- Six review findings were corrected/rechecked: verified non-TOTP MFA loss, missing-key cookie cleanup, unknown-MFA cleanup uncertainty, permissive UI DTOs, malformed CSP interpolation and cross-candidate acceptance receipt mixing. No actionable local security finding remains. Hosted acceptance receipts now carry exact source/site/deploy/project/manifest identity plus freshness/security checks; a pure checker cannot authenticate arbitrary JSON.
- All 280 migration hashes unchanged against9b798fc and source 327. 1241other protected non-Markdown baseline hashes unchanged; only the16 explicit source/test paths changed. No dependency, hosting manifest, workflow, public asset or migration bytes changed.

## Actual browser and accessibility acceptance

Actual exported UI and compiled functions ran on loopback with a synthetic in-process provider and explicitly synthetic Context/Origin mapping only in an unshipped harness. Enter login A, explicit-load persistence after reload, B switching/no A data, local logout/anonymous denial, provider failure uncertainty, known/unknown MFA denial and revoked-session denial pass. The broader lifecycle run preceded commit on the same reviewed code; final-source 327 smoke independently confirms normal login/read/logout and blocked-JS behavior with its new source pin.

With JavaScript blocked by a test-only CSP, actual browser controls remain disabled and Enter causes **zero API/grant/logout requests**; both forms still POST fixed paths. Direct local GET login/logout return405; unintended direct-function/signup routes404. These are local dispatcher tests, not hosted Netlify route acceptance. Secure cookie headers are passed unchanged and accepted by localhost's browser behavior, not proof of real HTTPS deployment.

Four widths320/390/768/1365 show no horizontal document overflow; fields clear, no private sentinels render, query remains empty. Keyboard Clear focuses H1. Existing palette/styles reused. Actual 200% zoom, spoken screen reader, exhaustive rendered contrast and current-source OS reduced motion remain unverified; historical motion evidence is not relabeled current. Browser storage contents were not inspected through restricted DOM APIs; no-token-storage assertions rely on source/headers/tests. A/B browser run was sequential account switching on one jar; independent jars are offline contract coverage, not two hosted browser sessions.

[Browser evidence](evidence/2026-11-01-wave10b/browser-qa.json), [desktop](evidence/2026-11-01-wave10b/auth-desktop.png), [mobile](evidence/2026-11-01-wave10b/auth-mobile.png). Final synthetic sessions0; tab closed, viewport restored and only task-owned listener stopped. No real credentials requested/provisioned/used or recorded. Existing HttpOnly session cookies intentionally hold synthetic tokens during this test; no promise of physical string zeroization.

## Parallel lanes, inventory and remaining approvals

Independent source-bound contracts/review advanced accessibility, Bible/private Faith rights, MyFive/groups, Founders/content, commerce, administration/privacy, account-origin/CAPTCHA and course-release preparation. [Parallel packet](../wave10b-security/PARALLEL_COMPATIBILITY_REVIEW.md) defines reusable boundaries and finite next assignments. This is one reviewer plus the two actual implementation agents, not eight newly running agents or new live features. All 37 IDs/status classes remain; none newlyLive. Successful sign-in grants no sharing consent, organization/leadership, protected-content, finance or staff authority.

Next smallest action: review [the exact isolated deployment proposal](WAVE10B_ISOLATED_DEPLOYMENT_REVIEW.md) and separately authorize an operator/usage/coexistence/failed-new-draft-disposition window. Actual deploy reservation/context retention, deployment-private runtime key/project attestation, fresh exact 280/RLS/notes/session/catalog/caller REST, provider route/rate/byte readback and protected existing synthetic A/B Auth acceptance remain gates. Do not substitute old source f5214b7, a synthetic ID, an old course alias or real members. Manager/MFA hosted operations, signup/email/recovery/CAPTCHA and maintenance changes remain excluded unless separately authorized.

Historical provider-output fingerprint classification remains as recorded in Wave 10A; no new provider response/value retrieval or use/rotation occurred. Account origin/real CAPTCHA, current course binding, Storage recovery, operator/PITR/duration/legal/provider/content/privacy/accessibility decisions and production release gates remain separate and open.

## Production and history preservation

No push, merge, deployment, managed migration/SQL/Auth, production or isolated settings/maintenance change, credential provisioning, user/factor/role mutation, content/duration/ShareLibrary activation, Storage, SMTP/PITR/compute, payment/message/purchase or other-repository operation. Main 1599ab271e0120a5cdc4e38e225ba749dd214721 and development/course PR #4fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098 remain at retained refs; no fresh GitHub status read claimed. All 22 other prior branch/tracking refs remain exact; no new branches/tags/rewrite/prune/worktree deletion. Root's six original tracked dirty hashes and HEAD are unchanged.

Both existing public sites, course rehearsal/maintenance and production are untouched by this work. Production 274/Small/PITR 7/leaked-password protection ON and isolated 280/paused ON/schemaReady/278-v1 are retained prior observations, not fresh provider audits. Local-only scope cannot certify their current remote counts or hidden settings. Full preservation evidence is [here](evidence/2026-11-01-wave10b/preservation.json). Production release is not authorized.
