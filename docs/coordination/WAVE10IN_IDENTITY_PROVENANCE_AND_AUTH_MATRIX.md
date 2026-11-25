# Wave 10I-N identity provenance and Auth evidence reconciliation

November 3, 2026, America/Chicago. Local read-only source/evidence review by agent `wave10in_identity_auth`. Application `327ba098628f70aa65140862b8b14cd709bfd711`, operator source `d51b90db66d5fc650e7b5139a8a5787ba6a994ac`, documentation `acd29c4f4b127e3a9fa66a1527a1364b6fb0c3b2` remain the inspected baseline. No real identity artifact, credential store, provider, database or Auth session was accessed. No implementation was changed by this review.

## Decision and exact provenance gap

Actual A/B authority remains **UNVERIFIED**. `scripts/member-hosted/identity-mapping.mjs` has `REVIEWED_APPROVAL=null`; its live loader denies before reading its private path. `operator-binding.mjs` requires that approved mapping before provider input and before the native inspection. The worker can compare independently approved identities to current isolated rows; it cannot create its own independent fixture provenance. Fresh database existence, account counts, a matching email domain, successful login, browser claims, metadata or an owner-assigned label are not substitutes.

The reviewed repository contains useful historical corroboration:

- `docs/coordination/WAVE9_TRUSTED_BINDING_REVIEW.md`, section “Fresh isolated database and synthetic fixture findings”, and `docs/wave9-lanes/SUPABASE_EVIDENCE.json` record November 1 isolated A/B existence, matching retained fixture identities, one profile each, zero staff roles and zero sessions. They also distinguish the manager with two roles. Their sanitized projection omits exact subject/profile/creation/login digests and a sealed independent creation record. It therefore cannot satisfy the new exact mapping contract by itself or establish current state.
- `docs/coordination/WAVE10ID_ISOLATED_CREDENTIAL_RECOVERY_REVIEW.md` and its retained metadata identify `qjksggxorghaxvpyslip`, `course-cutover-rehearsal-274`, as the intended child. That is historical branch linkage, not a fresh health, identity-roster or Auth receipt.
- `docs/course-engine-isolated-acceptance-2026-09-30.md` records an older synthetic A/B/manager acceptance. Wave 9 distinguishes the older `jxtgtfffdiwzxocxoqxk` environment from current qjks. Do not import an old fixture, account, MFA or acceptance claim across those environments without exact independent linkage.
- `docs/coordination/WAVE10IJ_FINAL_RECONCILIATION.md` establishes the consumed historical direct diagnostic and ledger 280. It does not supply the new exact A/B mapping or a fresh native receipt.

This bounded review did not locate a complete independently approved creation-record-to-exact-digest artifact in the inspected sanitized records. It did not search private owner identity stores. Absence of that complete artifact here is not proof that the owner lacks the original record.

## Exact private noncredential evidence required

An approved operator must privately locate the independently retained original fixture record and verify its originating authorized isolated run, exact qjks project, A/B labels, exact Auth subjects and profiles, creation timestamps and login identifiers. The retained record must be independently reviewable with a stable record hash and named approval ID. Its origin cannot be the browser, caller JSON, the new database observation itself or a fabricated synthetic test fixture.

Only the reviewed digest artifact belongs in the owner-private installation; no password, token, session or raw identity belongs there. Its exact contract is:

| Layer | Required evidence and constraint |
| --- | --- |
| Mapping identity | Version `lockliel-synthetic-identity-mapping-v1`; exact qjks project, course-cutover-rehearsal-274 branch and reviewed branch ID; exactly ordered A and B |
| Provenance | `source=independent-approved-synthetic-fixture-record`, approved record SHA256, approval ID and actual verification time |
| Each subject | `subjectSha256`, `profileSha256`, `createdAtSha256`, `loginSha256`; A and B distinct in every field |
| Source approval | Exact artifact-byte SHA256, canonical mapping SHA256, record SHA256, approval ID, issued/expires times pinned independently in reviewed source |
| Freshness | Mapping lifetime at most 24 hours; provenance review within 24 hours of issuance; native observation after loading, at most five minutes old; never re-date old evidence |
| Private artifact | Fixed approved path, owner-only 0700 parent and 0600 single-link nonsymlink file; bounded content; no credentials or session material |
| Fresh native comparison | Exact digest matches, confirmed account, exactly one matching profile and zero staff roles for each A/B; actual source-pinned worker/nonce/connection/transaction receipt |
| Later login binding | Hidden normalized login digest matches approved A/B before a password prompt or Auth request; post-login subject and distinct session boundaries also verified |

Digest encodings and canonicalization are exactly those in `tests/fixtures/member-hosted-identity/README.md`; no new encoding or artifact format is proposed. Identity/login digests are private pseudonymous data, not public authorization tokens and not suitable for public reports. Sharing a digest does not confer authority. The native query's ordinary-member check does not establish password availability, absence of an MFA factor, successful login or manager authorization.

## Smallest separately authorized provenance procedure

1. An owner/operator reviews the retained original isolated fixture record privately, with no credential retrieval or sign-in. Confirm exact project and A/B provenance; record only approval metadata and safe digest/status output. Use historical qjks evidence for corroboration, not as fresh hosted proof. Stop if the original mapping is missing or ambiguous.
2. If that record contains the exact required values, prepare the existing private digest artifact and have its origin, byte hash, canonical hash, approval ID and validity independently reviewed before installing a source seal. Local preparation must preserve all existing source/dependency checks and must not create a usable attempt grant yet.
3. If required identity values or provenance cannot be established offline, hold the current preflight. Obtain separate exact authorization and review for a protected, child-only, read-only identity-evidence procedure. Its purpose is to compare the retained original fixture record with current existing accounts, not to create accounts or infer provenance from current existence. No production-parent query, Management API secret endpoint, password reset, member Auth or role change is necessary or authorized by this proposal. No such acquisition helper is claimed to be installed by this document.
4. Only after the independent mapping approval is available, authorize the fresh native preflight separately. It must use a distinct new one-connection grant, direct qjks IPv6/TLS verify-full, on/5s/30s safeguards in the same transaction, exact 280 ledger/readiness/catalog and eight fixed inspections. Let that existing worker verify the approved digests; do not alter it to accept its own newly observed data as prior approval.
5. Return only statuses/hashes through the protected channel. Stop after read-only preflight. J remains CONSUMED and the application reservation remains UNUSED. A pass does not authorize deployment or any ordinary/privileged Auth session.

## Required Auth scope matrix

All rows below are plans and source interpretation, not fresh hosted acceptance. Current Wave 10I-N authorizes none of these hosted probes. Ordinary rows describe what a separately authorized A/B deployment window could cover with a reviewed observer. Existing code does not implement every proposed observation.

| Required category | Existing exact route or boundary | Ordinary A/B scope versus separate authority | Current gap |
| --- | --- | --- | --- |
| Anonymous access | GET `/api/lockliel/member-read`; caller verification and empty-cookie rejection | Harmless anonymous read denial in later ordinary window | Offline runtime tests exist; no fresh hosted observation |
| Expired session | Same read route and `isolatedTokenClaims`/existing read handler | Later private synthetic expired-cookie negative is ordinary scope, but cannot be mislabeled as a genuine provider-expired session | Observer has no expiry probe; forged/malformed-token rejection is not complete genuine expiry evidence; do not wait beyond the freshness/acceptance budget or change server time |
| Revoked/inactive session | Existing `lockliel_current_session_active` RPC and same read route | Later replay of only the just-created A/B session after authorized local logout may be a bounded ordinary denial test, provided a reviewed private observer retains/disposes material safely | Current observer clears jars and does not perform that replay; catalog/RPC definition inspection is not runtime revocation proof; no global logout or session mutation is proposed |
| Cross-user access | Read transport allows only authenticated subject filters and strict DTO; no owner selector | Separate A/B own reads plus explicit wrong-owner/query denial can fit later ordinary window | Observer compares separate owner-bound response boundaries; different boundaries alone do not execute an explicit cross-user attack |
| Forged owner/role | Read query rejected; login body accepts only email/password; unknown/direct/privileged API routes blocked | Harmless synthetic claim/query negatives may fit later ordinary window | Offline fixtures exist; no fresh trusted hosted observation. Never use user metadata or caller headers as real authority |
| AAL1 privileged denial | Exactly three member/read/login/logout routes, no privileged handler in this deployment | Later ordinary AAL1 request to an unlisted privileged route may show surface denial | A 404 or route rejection proves only this deployment exposes no privileged handler; it does not prove a separate course/admin application's permission checks |
| MFA-required/unavailable denial | `createHostedLogin` revokes a newly issued local grant and denies when verified factor exists or factor knowledge is unavailable | An MFA-enabled identity or provider-failure observation requires an explicit reviewed plan; ordinary no-factor A/B success cannot establish it | No current ordinary observer trigger. Do not add a factor, alter provider responses in a real deployment, log in the manager or claim MFA evidence from mocks |
| Manager AAL2 acceptance | No MFA challenge/verify or privileged route in this exact three-route package | Separate exact manager/MFA/site/role authority and acceptance procedure required | NOT TESTED; no manager reset, factor enrollment or role grant proposed |
| Actual staff authorization | Separate role and policy checks; AAL is not staff membership | Separate authorized staff-role acceptance required | NOT TESTED; zero-role A/B cannot establish positive staff acceptance |

The legacy `aal2AuthorizedOnly` field keeps its reviewed non-escalation meaning. `deployment-evidence.mjs` requires all four ordinary/negative categories and all eight independent source/runtime observations: exact source, exact three routes, absent privileged routes, direct-function blocks, other API blocks, forged-role denial, AAL1 privileged denial and no AAL-to-staff grant. It explicitly refuses positive manager or staff assertions. Positive manager/staff testing is outside this member-only gate, not a reason to silently broaden permissions. The final verifier is unchanged.

## Field-level final-verifier reconciliation

`verify.mjs::verifyProviderBinding` requires all sixteen Auth flags true, exact source/site/deploy/project/manifest and fresh trusted receipts. `operator-acceptance.mjs` currently starts all false and can set only the four marked “observer path” below. Nothing here sets a flag true. The six `requiresSeparateObservation` categories are a highlighted subset, not the whole missing matrix.

| Flag | Current implemented observation or missing evidence |
| --- | --- |
| `sameOriginPostOnly` | False in current member observer; actual accepted POST plus rejected method/origin/query-credential observations required |
| `secureHttpOnlyHostOnlyCookies` | Observer path: strict actual successful-login cookie attributes; no live result now |
| `csrfDenied` | False; actual malformed/origin/fetch-metadata denial needed |
| `redirectDenied` | False; actual absence/rejection of unsafe redirect and token-bearing URL behavior needed |
| `expiryDenied` | False; explicit private expiry observation plan needed |
| `activeSessionDenied` | False; actual inactive/revoked caller observation needed |
| `localLogoutVerified` | Observer path: bounded cleanup of newly created A/B sessions; unresolved Auth outcomes fail cleanup |
| `crossAccountIsolation` | Observer path: distinct A/B subject-bound projections and session jars; explicit cross-user denial remains a distinct acceptance observation |
| `mfaUnavailableDenied` | False; separately reviewed actual negative observation needed |
| `aal1PrivilegedDenied` | False; actual surface-denial evidence and limited interpretation above |
| `aal2AuthorizedOnly` | False; all required source/provider/negative non-escalation observations; no manager-success inference |
| `defaultOffDenied` | False; source tests are historical offline evidence, not observation of an enabled hosted candidate with flags OFF |
| `foreignProjectDenied` | False; synthetic wrong-project rejection must not contact production/siblings; no source/config mutation authorized |
| `missingKeyDenied` | False; no key-removal/configuration change is authorized to force a hosted test |
| `noBrowserTokens` | Observer path: strictly projected DTO/cookie handling; broader actual static/browser artifact scrutiny remains separate |
| `maintenancePreserved` | False in observer; native paused/readiness receipt is necessary, but does not automatically fill a hosted Auth flag |

`operator-binding.mjs::runDeployment` correctly stops before credentials, native acquisition or reservation because `acceptanceEvidenceRequirements().complete` is false. `runHostedPreflight` is a separate read-only scope; completion of identity/operator installation and fresh native/provider evidence can be reviewed independently without falsely resolving these deployment gates.

## Verification and preservation

Review traced the matrix to `identity-mapping.mjs`, `deployment_native_worker.py`, `operator-acceptance.mjs`, `operator-binding.mjs`, `deployment-evidence.mjs`, `verify.mjs`, `netlify/member-hosted/runtime.mjs` and `transport.mjs`, plus the retained IL/IM security and matrix documents. Relevant offline fixture definitions are in `member-hosted-identity-mapping.test.mjs`, `member-hosted-runtime.test.mjs`, `member-hosted-auth-composition.test.mjs`, `member-hosted-deployment-evidence.test.mjs`, `member-hosted-deployment-operator-security.test.mjs` and `member-hosted-verifier.test.mjs`. This documentation-only agent did not rerun tests or claim new test passes; coordinator validation is reported separately.

Only this new document was written by this agent. No source, migration, dependency, private artifact, attempt ledger, live provider, database, Auth, maintenance, role, production, Git branch/ref, push, merge or deployment action occurred. No password, token, raw member identifier or email was retrieved or placed in this document. J CONSUMED and reservation UNUSED are preserved by no action.
