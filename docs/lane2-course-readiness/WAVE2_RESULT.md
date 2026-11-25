# Wave 2: isolated course identity and readiness reconciliation

November 1, 2026. **Read-only readiness checks passed; complete deployed backend binding remains uncertified. No production release readiness is claimed.**

## Exact scope and unchanged source

Existing branch `codex/lane2-course-readiness`, base/head
`fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`, existing worktree
`/Users/davesmacbookpro/.codex/worktrees/lockliel-lane2-course-readiness/Lockliel`.
Dave authorized Wave 2 through the coordinator. Exclusive writes remain
`docs/lane2-course-readiness/**`. Root registers, application code, schema, release
tooling, navigation, design and hosting configuration were not edited.

Target: isolated Supabase `qjksggxorghaxvpyslip` / `course-cutover-rehearsal-274`
and Netlify site `70b03a42-6329-476e-bf4b-2b1ce30e9567` only. No production database,
Auth, users, settings or sites were inspected or changed by this lane in Wave 2.
Wave 1 records and their checksum manifest are unchanged; this report appends evidence.

## Fresh findings

| Boundary | Actual check/result | Limit |
|---|---|---|
| Local Git/migrations | Same base/head; no tracked diff; all 280 files still match sealed SHA256 manifests | No new CLI preparation, build, full suite or migration replay. Wave 1 pinned-Git-source and nine verifier-test passes remain prior evidence. |
| Netlify deployment metadata | Existing `6abfd81ccee16b59b75711a0` is ready, branch-deploy/rehearsal, site 70b03a42; commit_ref=null | Historical deploy metadata is not a current alias-to-deploy attestation; comparable function digests unavailable in exposed connected readers. |
| Frontend | Four fresh 200 HTML responses exactly match Wave 1/historical fa294f7 hashes | Static bytes do not prove backend function bytes or identity of every asset. No browser/JavaScript/authenticated test. |
| Static security headers | Four pages have CSP permitting expected qjks Supabase origin, excluding production Supabase origin, form-action self | Browser connection policy does not certify server-side destination/transport enforcement. |
| Harmless session GET | No-cookie /api/lockliel-auth/session returns 401 and exact authenticated:false JSON | Source returns before provider requests without cookies. Two cookie headers were counted, consistent with source clearing cookies; no values saved or client session established. |
| Harmless journey GET | No-cookie /api/lockliel/journey returns 401 and exact Unauthorized JSON | Source returns before course RPC/readiness/data calls without a session. This is an authorization denial, not positive database connectivity or an observed maintenance 503. |
| Isolated SQL identity | postgres; ledger 280; actual read_only=on, lock_timeout 5s, statement_timeout 30s | Connector session only, not a new direct IPv6/TLS/password preflight. |
| Isolated readiness | paused=true, schemaReady=true, protocol278-v1 | Maintenance stayed ON; no course writes attempted. |
| Migration 280 | Stored-statements fingerprint a55aead9115d12881650fee9f1bede27 matches prior accepted evidence | Stored-statement MD5 and source-file SHA256 are distinct. This is not a new complete 280-ledger/catalog parity audit. |
| Private security | Notes RLS ON, notes owner postgres, grading-key RLS ON, service_role note table/column privileges zero | Seven standard table privileges plus separately checked MAINTAIN cover all eight reviewed privileges. No note/answer content read. |
| Exposure metadata | Authenticated public-schema USAGE and notes SELECT true; direct notes INSERT/UPDATE/DELETE false | Effective grants are separate from RLS, API configuration and an actual authenticated REST response. No API key or session used. |
| Current isolated defaults | postgres/public tables: postgres=arwdDxtm, service_role=Dxtm | Different-project historical production defaults are not a same-project before/after comparison. No change or provider-rollout attribution inferred. |

## Binding assessment

Current frontend and unauthenticated route behavior are consistent with the retained
fa294f7 acceptance package. They narrow uncertainty but cannot independently prove
that every deployed function still has its historical digest or that its actual runtime
destination is qjks. Exposed Netlify readers supplied no usable function digests or
current immutable alias mapping. No environment values, keys, function bundles or
secret-bearing deployed source were fetched to fill the gap. No redeploy occurred.

The tracked `scripts/acceptance/prepare-runtime.mjs` targets a different historical
acceptance site/project. It was inspected, not executed, and cannot certify or rebuild
this qjks rehearsal. The historical qjks packager identity remains attributed evidence.
Do not substitute the other environment or infer permission to recreate either one.

**Current backend artifact/binding gate remains OPEN.** A ready historical deploy,
matching static files, CSP and 401 denials are not a complete runtime attestation.

## Provider exposure change and release implications

The official [April 28 Data API notice](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically),
reviewed November 1, says new public tables require explicit grants after the October 30
rollout; existing grants persist and RLS remains a separate layer. Actual isolated
notes SELECT exists and effective table/column INSERT/UPDATE plus table DELETE remain denied. Rollout status/API exposure was
not independently certified. Future release review must refresh actual creator defaults,
table/column grants, required RPC permissions and authenticated REST behavior. Do not
change grants/settings, widen private access, edit sealed migrations or normalize away
unexpected catalog differences to accommodate an assumed provider change.

## Passed evidence retained and remaining acceptance

October 3 exact-fa294f7 A/B sign-in, manager AAL1 denial/normal MFA/AAL2 projection and
positive course 280 acceptance remain passed within their recorded limits. Nothing was
reset or repeated. Later d71d079 real Turnstile 300030 failure is a separate Auth 274
candidate and does not erase those passes or prove real-proof compatibility.

No fresh signup, password, MFA, email, authenticated session, autosave, media,
progression or completion was tested. Browser lost-ack/interruption remains optional/unverified. The appended
[acceptance delta](WAVE2_ACCEPTANCE_DELTA.md) identifies exactly which gates narrowed
and what remains held. Wave 1 duration, recovery, storage and ordering packets remain
unchanged: 13 authoritative durations need separate population authority; Lessons 11–13
stay Media Coming Soon; independent PDF bytes/custodian, Dave's availability, final-write
PITR coverage, member disposition, notice/drain/old-tab closure and execution authority
remain release gates. Dave's new owner context is “none known” for acquisition/testing;
that answers context, not cohort legitimacy or account disposition.

## Integration readiness and smallest next task

The documentation-only packet is ready for coordinator review, not an integration
merge or production release. The source candidate remains unchanged; a new full suite
would repeat accepted work without resolving the artifact gate. No commit/push is made.

Smallest next task: a separately scoped read-only provider attestation of current
alias→immutable deploy→function digests and the reviewed qjks binding/outbound-guard
artifact, with only IDs/hashes/booleans returned. Obtain this through an authorized
metadata/file-manifest surface without credential/env output. If unavailable, record
that exact access limit and decide the next verification method before credentials,
new hosted positives or any separately authorized deployment. Keep maintenance ON.

## Preservation and evidence

No new credentials/input, keys/env inventory, Auth operation, synthetic session, valid
form, backend write, maintenance toggle, migration, deployment, commit, push, merge,
production action, Storage access, content/duration activation or browser operation.
The reviewed no-cookie handlers are designed to return before backend work; observed
401 responses matched that path. No arbitrary database function or mutation was probed.
No repeat of Wave 1's public-key source echo occurred; no key values appear here.

Sanitized observations: [verification.json](evidence/wave2-2026-11-01/verification.json).
New file checksums are separate from Wave 1 in
[evidence/wave2-2026-11-01/SHA256SUMS](evidence/wave2-2026-11-01/SHA256SUMS).
