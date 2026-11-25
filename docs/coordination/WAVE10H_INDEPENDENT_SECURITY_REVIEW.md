# Wave 10H independent protected deployment security review

November 2, 2026. Actual reviewer: `/root/wave10h_security`. This reviewer implemented neither operator source module, did not stage or commit files, and used no live provider, credential, Auth or database operation. Reviewer ownership is this report, the separate bounded parallel review, and `tests/member-hosted-deployment-security.test.mjs`.

**LOCAL SECURITY REVIEW PASSED after the findings below were corrected and independently rechecked.** No actionable local security defect remains in the frozen snapshot identified below. This is readiness for an exact isolated deployment authorization review, not permission to reserve, upload, provision a key, authenticate, retire infrastructure or change production. No live feature or hosted acceptance is established by local mocks.

## Exact reviewed source and separation

Application remains `327ba098628f70aa65140862b8b14cd709bfd711`, runtime parent `bcaa35680ffefc61775636d65f568827e42d7f06`. Operator tooling is a separate local addition on `codex/wave10-hosted-composition`; the coordinator will identify its commit. The application must still be built from a clean exact-source checkout after a separately authorized actual reservation. Deleted Wave 10E/G IDs and the synthetic fixture manifest are not deployment identities.

| Frozen file | SHA256 |
|---|---|
| scripts/member-hosted/uploader.mjs | 6f132ce8406a20c34eeff0c2e2eed63c913d5bd75647ac1fb9e6829ad7626d0c |
| scripts/member-hosted/provider-receipts.mjs | 8844ca07f62a6da2f3e1e0226991f0b55c94d6048b7e0d481f45978adb69ef80 |
| tests/member-hosted-uploader.test.mjs | 6f36daedd3ee2aa1086dff87bc56a90b68cd5661f99948520da429ec4a1f58eb |
| tests/member-hosted-provider-receipts.test.mjs | c132b0eb4898f79b01ad4eedc2836327a4936e91b76201c33b43f013b7a1fbf6 |
| tests/member-hosted-deployment-security.test.mjs | cc741ff713c0de3fcca4fb55f83a32883daadea1b1eeff35f8a49b2fe0312424 |

Read existing engineering, security, architecture and Wave 10B-G boundary/evidence documents, then inspected the entire new modules and actual composed `createDeploymentOperator` flow. Independent review included trust, byte, lifecycle, credential and failure boundaries, not only test names or implementing-agent claims.

## Findings corrected and independently rechecked

| Finding | Impact before correction | Verified correction |
|---|---|---|
| Reservation response conferred cleanup ownership before historical exclusion | A forged or malformed POST reply naming an existing historical deployment could fail reservation validation, then still reach DELETE in finally cleanup. Independently reproduced with the actual receipt reader. | Cleanup ownership is conferred only after independent complete before/after inventory and exact reservation checks prove a new ID. Historical/ambiguous replies never authorize DELETE and report unresolved reservation. No replacement reservation is attempted. |
| Retirement checked only GET on POST-only Auth surfaces | GET 404 could conceal a still-active login/logout POST endpoint. Independently reproduced. | Require GET checks plus four credential-free empty POST checks for custom/direct login/logout URLs, alongside scoped/global provider 404, complete list absence and historical/alias preservation. GET404/POST200 now fails containment. |
| Raw-byte credential-reflection scanner missed JSON Unicode escaping | A provider could reflect an encoded operator credential inside an allowlisted metadata field; parsing decoded it into returned metadata. Independently reproduced using a synthetic sentinel. | Both raw and decoded response keys/values are checked against current operator/private configuration values before metadata returns. Errors remain fixed and generic. The independent escaped-reflection test passes. No real credential was involved. |
| Rate observer allowed an ambiguous 29-to-31 threshold | A permissive 31-request rule counting an earlier GET could be accepted as the required 30-request rule. Independently reproduced. | Do not send Auth GET before threshold sampling. Require 30 consecutive invalid-body POST responses 400 and the 31st 429 inside 60 seconds, separately for both Auth routes. A 31-request rule now fails. Later Auth GET429 is denial evidence only, not proof of method enforcement. |

Other reviewed corrections include captured immutable upload pins and byte buffers, rejection after plan disposal, clearing invalid credential input buffers, the fixed-site branch-inventory read, conflicting provider commit_ref denial, independent cleanup capacity after normal-budget exhaustion, decoded secret metadata suppression, canonical artifact paths and matching configuration/artifact content maps. An aged preservation baseline no longer prevents fresh retirement proof; current publication captures still require fresh baseline/current receipts and stop rather than rebase silently.

## Credential and operator boundary

- Imports perform no I/O. There is no ambient fetch, process environment/argument/credential-file fallback, automatic execution, credential-bearing CLI command or site-wide configuration mutation.
- Hidden input requires explicitly supplied TTY streams, raw no-echo operation, fixed prompt/errors, control/timeout cancellation, terminal restoration and buffer clearing. The operator must retain exclusive ownership of those streams. No real protected input was requested or exercised.
- Protected handles retain private buffers in a WeakMap and redact inspection/JSON. Caller buffers clear immediately; owned buffers clear on disposal/use. JavaScript/TLS can create immutable garbage-collected strings, so physical zeroization is not promised. No credential file, evidence value, token output or logging is introduced.
- HTTPS composition requires an explicitly injected reviewed request implementation and exact-operation authorization closure. Fixed Netlify API origin, TLS verification, no redirects, bounded requests, bounded bodies, generic failures and allowlisted metadata are enforced. The trusted JavaScript operator itself is not sandboxed by a WeakMap. An attacker controlling injected code can manufacture a fake transport; that is not supported authority.
- Fresh operator permissions, billing/headroom, approved usage and external preflight are mandatory operator responsibilities. A callback returning true is not independent proof that those checks ran. Wave 10H does not read current owner permissions, account balance or provider settings. The future executable assignment must bind the reviewed preflight and exact operation authority, including `beginContainment`, before any remote request.

## Artifact, configuration and receipt composition

`prepareUpload` requires exact approved source/site/project and a separately approved manifest digest. Existing strict package verification is reused unchanged. Artifact bytes are reread, hash-checked and privately retained; later file or pin mutation cannot repoint or alter uploads. Extra provider-requested hashes, archives, servers or edge functions deny. No synthetic release fixture is authorized for upload.

The actual operator wraps finalization in `createConfigurationReceiptTransport` and each approved static/native byte PUT in `createArtifactReceiptTransport`. It then independently captures publication and requires an opaque route/rate handle before composing the pre-Auth receipt. A boolean or application-generated JSON does not enable acceptance.

Provider handles cannot be cloned, serialized, imported as browser JSON or transferred across reader baseline owners. Identity, source when returned, context, explicit publication pointers, complete history/pagination, fresh timestamps, aliases and raw draft presence remain distinct. Omitted raw draft is never relabeled as an actual raw true value: logical draft=true is derived from independent publication/history evidence.

Configuration observation permits exactly three functions and their approved routes/rules, draft=true, exact file/native maps and one deployment-only functions-scope secret field. Its receipt contains no value and accurately states `effectiveRuntimeVerified=false`. Provider ACK is contractual provisioning evidence, not independent secret readback, opaque-key project proof or proof of actual execution.

Native/static byte proof preserves SHA256 ZIP versus SHA1 static domains. Provider ACK must return the expected hash/name/path and exact endpoint; a compiled-module hash, title or browser echo cannot replace native archive proof. Configuration/artifact maps must agree before composition. The uploader currently takes the all-ACK path, including approved content-addressed bytes the provider did not request. Real acceptance of redundant PUTs is unverified and must stop/retire if unsupported. No automatic alternate upload route or replacement ID exists.

The independently reviewed optional `capture({configuration,publication})` dedup path is not used by that uploader: it requires opaque exact finalization maps/required-subset evidence and fresh ready same-ID publication, labels its proof as contractual content-addressed dedup, and does not claim a download/readback. No untrusted claim can mint this proof. Provider-specific receipt semantics must remain explicit during later execution.

`composeProviderReceipt` supplies pre-Auth provider evidence only. It leaves `authAcceptance=null` and requires fresh isolated database evidence, project-attested private key and separately authorized hosted acceptance. Existing `verifyProviderBinding` retains its independent final gates; source declarations and synthetic test success do not satisfy them.

## Routes, runtime and unchanged safeguards

Only these native hosted routes are authorized by the reviewed package/operator:

| Function | Route | Method |
|---|---|---|
| lockliel-member-read | /api/lockliel/member-read | GET |
| lockliel-login | /api/lockliel-auth/login | POST |
| lockliel-logout | /api/lockliel-auth/logout | POST |

The credential-free observer requires the correct read path to deny anonymous access, exact direct-function/other-route 404s, and the bounded independent rate observations. It sends only an invalid Auth body, no cookie, bearer, password, private data or key. A generic route probe is not full same-origin/CSRF/cookie/MFA acceptance. Those remain required in the separately authorized synthetic window.

Independently compared eleven protected shared source/configuration files to Git application327, including runtime/binding/transport/cookies, existing login/logout, builder/verifier, member read server/core and netlify.toml: **all unchanged**. Existing default-OFF gates, provider Context/source/deploy pin, same-host POST, no credentials in URLs, Secure/HttpOnly/host-only cookies, strict Origin/CSRF/redirect policy, local-scope logout, unknown/required MFA denial, active-session/owner-RLS checks, paused=true readiness and unavailable private domains remain intact. No alternate Auth system or new session behavior was added.

Maintenance ON is an explicit preserved backend expectation, not a setting this tooling changes. Existing RLS/notes/grading-key protections are source/test evidence here, not a fresh managed database audit. The future isolated preflight must independently verify actual schema280/RLS/ACL/readiness/caller state under read-only/5s/30s safeguards before Auth acceptance.

## Failure and containment

The operator consumes one reservation attempt and never retries or substitutes a site/context/deployment. Only a new independently proved ID can authorize its cancel/delete. Wrong identity, publication or ambiguous ownership denies destructive cleanup and reports unresolved containment for operator review. It must never guess an ID or delete history to obtain success.

After ownership is established, failure attempts exact-ID containment with separate cleanup quota. Publication/identity is reread before deletion. Provider scoped/global404, complete history/list restoration and twelve immutable GET/empty-POST checks are independent requirements. Cleanup failure is not successful retirement; acceptance history may be true while overall ok remains false. The proposed human window is not automatic endpoint expiry, and an unpublished URL is not access-private.

## Independently executed checks

All JavaScript runs used Node24 with the deny-network preload. No real sockets, provider credentials, hosted Auth or SQL were used.

- **147 tests passed, zero failures/skips** across new uploader, receipt and independent security tests, using the already installed reviewed ZISI16.3.0/serverless-functions-api2.24.0 toolchain. The independent attacker file contributes27 cases, including the four reproductions above and wrong project/context/site/publication, missing authority, stale/forged/modified receipts, altered byte domains, alias drift and credential suppression.
- **202 existing runtime/Auth-composition/verifier tests passed**, zero failures/skips, preserving existing Auth/session/CSRF/MFA/default-OFF/owner-read safeguards.
- **369 existing parallel contract/integration tests passed**, zero failures/skips; see [parallel lane review](WAVE10H_PARALLEL_LANE_REVIEW.md).
- Scoped ESLint passed for both new modules and all three new test files.
- Independently compared all **280 migration SQL bytes** to Git327: all unchanged. No migration or SQL executed by this reviewer.

These are focused subsets of the coordinator's authoritative full validation, not additional unique full-suite totals. Full JavaScript/TypeScript/build/lint/Netlify/disposable replay/SQL evidence is coordinator-owned and must be recorded separately. No real browser accessibility or live provider acceptance is claimed.

## Remaining execution gates and preservation

A later exact owner authorization must cover one new application reservation/build/upload, true deployment-private isolated key provisioning, fresh isolated database/provider/operator/billing evidence, harmless route/rate probes, existing ordinary synthetic A/B Auth/session lifecycle and mandatory exact-new-ID retirement. Do not retrieve keys or passwords during review. If protected provenance, provider hash/configuration semantics, rate behavior, route composition or cleanup cannot be proved, stop that stage and contain only the new ID. No degraded trust/context/key or additional deployment is allowed.

The provider private-key readback and effective native routing/rate semantics remain real execution limitations, not locally established hosted facts. Existing account-origin, real-CAPTCHA, course release, licensing/legal, Storage recovery, accessibility and production release gates remain open and independent.

No production or isolated provider call/write, Auth session, credential retrieval/provisioning, SQL, migration/replay, maintenance/settings change, account/MFA/role action, message, payment, content activation, reservation/upload/deployment/retirement, Git push/merge or purchase was performed by this reviewer. Existing public websites, course PR #4 and rehearsal, main and root dirty work were untouched. Prior production274 and isolated280-pausedON observations were not freshly audited. No new feature is Live.

## Final coordinator proposal review

Reviewed `WAVE10H_EXACT_ISOLATED_DEPLOYMENT_ASSIGNMENT.md` and `WAVE10H_PROTECTED_DEPLOYMENT_READINESS_RESULT.md` after tooling commit `51857e44642ac79a4b1f458de786b97d98762082`. **PASS WITH EXECUTION LIMITS.** The documents accurately distinguish unchanged application327, committed reviewed tooling, unassigned future provider ID, site70/qjks-only authority, true deployment-private provisioning, external operator/billing preflight, callback trust, conditional actual provider evidence and mandatory exact-ID retirement. They do not claim hosted acceptance or production readiness.

The prepared ordinary A/B scope does not authorize manager/MFA/role actions. Existing final verifier AAL/privileged fields must not be fabricated from ordinary sign-in. If exact separately authorized evidence for a required field is unavailable, full verification remains NOT VERIFIED and the new draft must still be retired. This is an explicit future gate, not authority to broaden the window.

Rate sampling exhausts the Auth budget; actual login/method acceptance must wait for a clean rate window while keeping independently required receipts fresh. The assignment states that distinction. Request/compute/egress figures are planning ceilings and cost uncertainty, not a provider spending guarantee or enforced endpoint expiry. Current role/billing/backend/key provenance and real native receipt semantics remain actual preflight/execution requirements. No further source change or test rerun was needed for this prose-only review. No remote action was performed.
