# Wave 10A narrow Auth correction and isolated deployment proposal

**PROPOSAL ONLY. NO AUTH IMPLEMENTATION OR HOSTED EXECUTION AUTHORIZED.**

Reviewed application base `f5214b75b8dba3671b8eeda6c45574baa2539221`, documentation `e0f3e3928591a1996386debe89e2b92412263fdd`, branch codex/wave10-hosted-composition. Proposed Auth implementation source is **UNASSIGNED** until separately approved work is implemented, validated, independently reviewed and committed. A later documentation commit is not that application candidate. Current source has no exposed login/logout and must not be relabeled as an Auth candidate.

## Exact proposed isolated identity

| Item | Required identity |
| --- | --- |
| Netlify site | 70b03a42-6329-476e-bf4b-2b1ce30e9567, last observed name jade-unicorn-642f40 |
| Context | deploy-preview only; draft=true, published=false |
| Actual deploy ID | UNASSIGNED. Obtain by separately approved provider reservation and independently read back before compilation |
| Origin | HTTPS immutable DEPLOY--jade-unicorn-642f40.netlify.app matching actual24hex deploy ID |
| Supabase | qjksggxorghaxvpyslip only; course-cutover-rehearsal-274 |
| Backend precondition | exact280 versions/fingerprints, paused=true, schemaReady=true, protocol278-v1 |
| Identities | existing ordinary synthetic A/B only, separately approved protected input; manager/MFA/roles are excluded |
| Routes | GET /api/lockliel/member-read; POST /api/lockliel-auth/login; POST /api/lockliel-auth/logout only |

No production target, old acceptance site60579b8e, missing/inaccessible old jxt backend, replacement database or infrastructure purchase is part of this proposal. Neither existing course alias nor existing deploy is overwritten. Backend maintenance stays ON. Marginal usage/coexistence/private runtime environment costs remain unquoted, not assumed free.

## File-level correction proposed for explicit LOCAL approval

The independent detailed source review is [AUTH_REVIEW.md](../wave10a-auth-scope/AUTH_REVIEW.md). The following is an exact lease plan, not a patch or authorization:

| File | Proposed change and review boundary |
| --- | --- |
| netlify/functions/lockliel-login.mjs | Extract a dependency-injected factory for its existing validation/password-grant/AAL/cookie business logic. Preserve default guarded production export/config and existing behavior; new isolated-only policy denies MFA-required acceptance before success cookies. No new Auth provider/framework. |
| netlify/functions/lockliel-logout.mjs | Expose its existing cookie-clearing/logout behavior through a dependency-injected factory while retaining default production semantics. Isolated policy explicitly supplies local scope/result handling; never silently change production logout. |
| components/member-review/hosted-session-controls.tsx (new) | Minimal presentation adapter to existing same-origin login/logout contract. Password transient DOM/FormData only; POST/action and hydration-disabled fields/button; JSON POST, no-store, redirect:error, fixed review destination, generic errors, field cleared after every attempt. No signup/recovery/MFA/next URL links or browser token store. |
| components/member-review/server-member-read-shell.tsx | Optional gated session controls; clear previous member state before each Auth transition and on failure/logout/MFA denial. Use existing controller/invalidation contract, no new session store. Existing default read-only/local modes unchanged. |
| app/my-lockliel/review/page.tsx; lib/member-review/review-policy.ts | Require independent default-OFF Auth flag plus all existing source/site/deploy/context pins. Read enablement alone never exposes Auth. No global navigation or design token edit. |
| netlify/member-hosted/runtime.mjs | Compose actual approved factories after trusted runtime and request guards. Implement only proposed invalid-cookie local clear, local logout result separation and pre-cookie MFA denial. No fake provider Context or permissive replacement production guard. |
| netlify/member-hosted/transport.mjs | Keep standalone member GET path unchanged. Narrow dormant Auth transport to password grant and exact logout?scope=local. Invalid/expired/foreign tokens never leave process. Global/others/unspecified logout, refresh, signup/recovery/admin and redirects denied. |
| netlify/member-hosted/session-cookies.mjs (new, isolated only) | Adapter reuses current cookie serialization/encoding/names/expiry; validates host-only Path=/, HttpOnly, SameSite=Lax and explicitly appends/serializes Secure before emitting both successful and clearing cookies when the unchanged serializer omits it, then validates it under the already pinned HTTPS runtime. Existing core's isolated-member-read mode does not independently force Secure, so do not rely on absent build env or mutate process.env. Clear cookies use same attributes, Max-Age=0. No Domain widening or shared core policy edit. |
| scripts/member-hosted/package.mjs; scripts/member-hosted/verify.mjs | Preserve existing v1 one-read-function behavior. Introduce separately versioned strict Auth package with exactly3route/archive inventory only when explicitly requested; never weaken v1 to accept unexpected Auth handlers. Three official native archives, same bootstrap/source/compiled/ZIP bridges, minimal review assets. Same-origin form-action only for approved UI; server remains JSON-only. Preserve custom-path/direct-route denial, no-store and independent evidence gates. |
| tests/member-hosted-runtime.test.mjs; tests/member-hosted-package.test.mjs; tests/member-hosted-verifier.test.mjs; tests/wave10-member-ui.test.mjs | Add precise Auth-enabled/disabled, target, route, body, cookie, revocation, MFA and isolation cases while retaining current regressions. No hosted fixtures. |
| tests/auth-form-static-safety.test.mjs; tests/member-hosted-auth-composition.test.mjs (new) | Test actual existing-handler factory composition, default production equivalence, SSR/prehydration native-GET denial, JS-disabled/manual methods, private errors, local-only logout and cookie policy. Synthetic-only tests; no real password/token logging. |

**Reuse unchanged:** netlify/lib/lockliel-core.mjs, deployment-safety.mjs, root backend configuration, public Auth UI/source defaults, original edge guard/root hosting manifests/workflows/dependencies, member-read server/projections/client/controller/RLS interfaces, design system and all280 migrations. No broad session handler is included; it refreshes and returns contact/role/group data beyond the approved DTO. No course/private Faith/MyFive/catalog persistence or upload/sharing.

## Exact proposed Auth/session policy

This is new behavior requiring approval; it is not implemented here.

- Only ordinary synthetic password sign-in against pinned qjks. Browser URL/query never carries email/password/token. No ambient production key/bearer, no service key. Existing host-only HttpOnly cookies are reused, never returned as token JSON. Passwords, keys and session secrets are omitted from evidence/logs and browser storage. Cookie-based session storage is the existing explicit Auth contract, not a promise that tokens exist only in process memory.
- Reject missing/wrong Origin, cross-site/same-site cross-host, wrong method/path, query, browser Authorization, malformed/oversized JSON and unapproved runtime before credential/key use. Keep existing IP limits in new entry metadata; no rate-limit or CAPTCHA setting change. If isolated provider requires proof or other configuration, STOP instead of bypassing it.
- Access expiry ends this package's session. No refresh flow. Refresh cookies follow existing serialization/expiry contract but are not consumed by this slice; their presence is not a promise of30day acceptance access. Both cookies clear together. No existing Auth lifetime policy is changed.
- Valid isolated logout explicitly POSTs `/auth/v1/logout?scope=local`. Missing/expired/malformed/foreign cookies clear only this host's cookies and member view, without forwarding a rejected token. With a valid token and provider failure, clear locally but state revocation is unverified; do not report successful provider revocation. No global/others sign-out or assumption of instant JWT invalidation.
- MFA-required login is denied for this ordinary-member acceptance surface before success cookies commit. An isolated policy callback may locally revoke only the newly granted synthetic session using server-memory tokens, clear current browser state and deny the review. If revocation is unverified, stop acceptance. No challenge/factor reset/AAL2/manager or privileged path is included. This exact new policy needs explicit approval.
- Existing controller clears on same-window/cross-tab Auth signals, account switch, load/error/expiry and visibility loss. Signals carry no tokens or PII. A/B require independent cookie jars, not two tabs on the same host. Browser selection never establishes server permission.

## Allowed network destinations

Browser: same immutable origin only, fixed three API paths and local static assets. No external redirects, forms, frames, CDN scripts or provider SDK in the browser.

Server: HTTPS qjksggxorghaxvpyslip.supabase.co only. POST `/auth/v1/token?grant_type=password`; POST `/auth/v1/logout?scope=local`; GET `/auth/v1/user`, current-session/readiness RPCs and exact owner/minimal profile/preference queries. No SMTP/email, SMS, payment, Blobs, signup/recovery/refresh/admin, external Bible, other site/project, production or broad REST query. Private project-key provenance remains separately attested; publishable syntax is not proof of project identity.

## Proposed flags and negative acceptance

Current read gates remain unchanged/defaultOFF. Propose additional `LOCKLIEL_MEMBER_HOSTED_AUTH_REVIEW=isolated-login`, plus explicit server/package `authEnabled=true` under a new strict manifest version. Both must defaultOFF independently; unknown values deny. Current NETLIFY/CONTEXT/SITE_ID/DEPLOY_ID/COMMIT_REF/expected-source/expected-deploy pins remain mandatory, and provider Context is independently checked at invocation. Flag names/options are proposed, not present or activated now.

Future tests must cover production/unknown/wrongproject/site/source/deploy/context/published/origin; forged request metadata; JSON/method/query/body/redirect/CSRF failures; cookie security with absent build env; native GET/prehydration; provider raw-error suppression; local-only scope and revocation uncertainty; no refresh/global sign-out; MFA before cookie commit; wrong/expired tokens zero egress; A/B separate jars/account switches/stale replies/back/reload/TTL/logout failure; v1 read-only preservation and exact v2 three archives/custom routes; no outbound production or private DTO leakage. Require relevant full local regression/types/build/configured lint/Netlify/security review, then exact candidate/manifest review before any hosted authorization.

## Separate hosting/operator approvals and stop gates

1. Owner explicitly authorizes only the above LOCAL Auth source work, including the two default-preserving shared factory extractions, isolated cookie/local-logout/MFA-denial policy and synthetic tests. That approval is still missing. Wave10A is review only and the earlier rejection stands until a new explicit scope is reviewed normally.
2. Review and independently validate the NEW actual Auth source SHA/artifact manifest. Existing f5214b7 and its synthetic-ID ZIP are not that source/artifact.
3. Separately authorize exact unpublished draft reservation/finalization/upload on site70 only, protected runtime key provisioning/project provenance, existing synthetic A/B session creation/local revocation and bounded browser acceptance. No real members, signup/email/recovery/SMTP/CAPTCHA or maintenance change. Approve usage window/budget/coexistence and named operator before any charge or setting action.
4. Provider reservation must return actual site/deploy/context=draft deploy-preview/published=false, then compile exact source+ID and match official static SHA1/native ZIP SHA256/functions_config routes by independent authenticated metadata. Empty reservation/context/ID retention and deployment-private environment semantics remain untested provider gates. STOP if wrong/unsupported; do not alter course aliases/site-wide settings or create a substitute target.
5. Fresh read-only backend identity/exact280 fingerprints/RLS/notes0-0/session catalog/column grants/readiness and actual caller REST acceptance remain required; preserve paused=true/protocol278-v1. Hosting activation does not grant a course-release decision.

## Rollback and failure handling, no operation authorized

Before any upload or Auth use, failure means STOP: keep flags OFF, retain exact artifacts/diagnostics without secrets, do not upload/publish or substitute a candidate. Existing course aliases/deploys/site settings and maintenance are unchanged, so they need no rollback.

During a separately approved test window, stop tests and clear local member state; use only the explicitly approved local synthetic-session revocation/host cookie clearing. Do not call global logout, reset accounts or change Auth settings. A provider failure is recorded honestly.

A new draft at an immutable URL may remain reachable after the operator stops testing. Abandoning a URL or creating a different OFF build does NOT disable that old artifact. If containment of a failed new draft is required, the operator must already hold or obtain separate exact permission to cancel/retire ONLY that new member draft and verify inaccessibility. No deletion of existing acceptance infrastructure, site-wide protection change, production restore, lock/publish/rollback endpoint or course alias repoint is implicit. If this disposition cannot be authorized and verified, do not begin the hosted window.

This proposal never authorizes production migration, deployment or merge. The existing course release and security gates remain intact.
