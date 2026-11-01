# Wave 3: exact isolated backend-binding access review

November 1, 2026. **BLOCKED: current isolated backend binding is not fully verified.**
The exact missing provider attestation is identified below. This is an access/evidence
limit, not a newly observed course or database defect. Keep maintenance ON.

## Source and preserved work

Existing branch: `codex/lane2-course-readiness`.
Starting HEAD: `6e19e240e6d7fa00514399636f879de4992a290a`, the local-only preservation
commit of validated Wave 1/2 documents. Application source remains
`fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane2-course-readiness/Lockliel`.
Only new Wave 3 files under `docs/lane2-course-readiness/**` were written.

Current root instructions, coordinator packet and the Wave 2 result were read before
this bounded review. The historical application source and prior accepted checks were
not rebuilt or replayed. Wave 1/2 reports and evidence remain unchanged.

## Supported surfaces checked

The current connected Netlify readers expose get-project, get-projects,
get-forms-for-project, get-deploy and get-deploy-for-site. Their declared parameters
provide no branch-deploy listing, function-search or file-manifest operation. No
arbitrary operation was injected into those readers and no local credential was
retrieved to bypass that limitation.

The [official OpenAPI reference](https://open-api.netlify.com/) documents these GET
operations: `listSiteDeploys` with a branch filter, `searchSiteFunctions`, and
`listSiteFiles`. None is callable through the available readers. The public function
search response does not guarantee digest fields; a function-name list alone would
not prove byte identity. A site's current file list is not automatically a manifest
for its rehearsal branch. These documented surfaces were reviewed, not invoked through
an unprovided endpoint or invented connector parameter.

Two fresh allowlisted metadata reads confirm:

- Site `70b03a42-6329-476e-bf4b-2b1ce30e9567` is named `jade-unicorn-642f40`.
- Historical deploy `6abfd81ccee16b59b75711a0` still exists and is ready, context
  `branch-deploy`, branch `rehearsal`, `commit_ref=null`, `published_at=null`.
- No comparable deployed function digests or current rehearsal-alias mapping were
  exposed by these reads. Ready historical metadata is not current-alias proof.

The supported provider Functions page was also attempted at
`https://app.netlify.com/projects/jade-unicorn-642f40/functions`. The in-app browser
surface was unavailable. A new Chrome diagnostic tab rendered a blank page after
accessibility and screenshot inspection; two error messages were counted without
recording their contents. The cause and login state were not established. No sign-in,
configuration/source view or credential entry was attempted. The tab was closed. No
browser-security warning or restricted surface was bypassed.

## Digest and continuity distinctions

[Netlify's API guide](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/)
distinguishes static-file SHA1 from function-upload SHA256. A historical bundled-handler
file hash must not be compared blindly with an upload/archive hash: algorithm and byte
domain must match, or an authoritative manifest must connect them. Upload-requirement
lists such as `required_functions` are not a complete deployed function inventory.
No upload, bundle download, environment/key lookup or source extraction was used here.

[Netlify documents deployed functions as immutable](https://docs.netlify.com/build/functions/overview/)
and provides a branch selector in its Functions UI. This creates a smaller possible
continuity proof: establish from trusted provider records that the current rehearsal
alias still serves the exact previously accepted immutable deploy, then review that
mapping with the retained October 3 upload/artifact/hardcoded-binding provenance.
That may avoid demanding redundant new archive hashes. It is an evidence inference
for coordinator review, not permission to waive the required binding gate. If a
different deploy is active or provenance is insufficient, new comparable artifact
attestation is required before acceptance. A null commit_ref is not invented as a Git match.

## Exact minimum owner/provider attestation

The [attestation request](WAVE3_ATTESTATION_REQUEST.md) is prepared, not sent.
The smallest unresolved item is a dated, trustworthy provider record linking:

`site 70b03a42 → rehearsal alias → active immutable deploy ID`.

The record must explicitly concern
`https://rehearsal--jade-unicorn-642f40.netlify.app`, not the site's default published
Functions list. Confirm whether the active ID is `6abfd81ccee16b59b75711a0`. Review the
accepted historical artifact chain if it is; do not infer continuity if it differs.
If fresh function identity is needed, return only function/deploy IDs and digests with
algorithm/byte-domain declarations plus a trusted matches-reviewed-binding boolean.
No env values, keys, tokens or function source are requested.

## Acceptance and release prerequisites retained

| Boundary | Current disposition |
|---|---|
| Current alias/artifact/backend binding | BLOCKED by missing trusted alias mapping and, where required, comparable artifact evidence. |
| Isolated SQL state | Wave 2 prior evidence: 280, paused=true, schemaReady=true, protocol278-v1, actual read-only ON/5s/30s and zero service-note table/column privileges. Not re-queried in Wave 3. |
| Frontend/CSP/unauthenticated denials | Wave 2 evidence retained. No repeat GET or unauthenticated route test. These do not replace the binding attestation. |
| Course and manager | Exact-fa294f7 October 3 course 280 and manager AAL1/MFA/AAL2 acceptance remains PASS within recorded limits. No reset or retest. |
| Real CAPTCHA | Separate d71d079 Auth 274 candidate remains incomplete; real 300030 failure is not a course regression. |
| Optional browser lost-ack | Still unverified; no browser fault or positive course window authorized here. |
| API exposure/security | Carry Wave 2 actual grants/defaults evidence and October 30 provider notice; refresh relevant creator defaults/RPC/REST exposure before the applicable release. No grants changed. |
| Production release | Not ready: member disposition/containment, independent PDF-byte recovery/custodian, operator availability, final-write PITR coverage, trusted-duration population, legacy-client notice/drain, exact publishing route and explicit release/reopen authorization remain. |

Thirteen authoritative duration/provenance records and the immutable 275→280 sequence
remain in the existing packet. Production migration 275 is not applied by this task;
no isolated 275–280 replay is allowed. Lessons 11–13 retain Media Coming Soon. The two
published websites and all other repositories remain untouched.

## Actual checks and integration readiness

Performed: existing Git/base/status inspection; current reader-schema inventory;
three official provider-document reviews; two filtered isolated metadata calls;
one unsuccessful provider-page inspection; prior-file preservation and new-document
JSON/link/secret-pattern/checksum checks. No SQL, four-page GET, unit suite, full suite,
build or migration replay was repeated. Documentation-only changes are reviewable.
There is no new application integration or production authorization.

The blocker is not an automatic-approval rejection: the missing operations are absent
from the callable connector, and the provider UI did not produce usable state. No
workaround, credential prompt, remote change or unsupported raw API call was attempted.

A single local documentation-only checkpoint is authorized after validation, staging
only the new Wave 3 files. The final report records its SHA; no history is amended.
Evidence: [access-review.json](evidence/wave3-2026-11-01/access-review.json).

Smallest next action: owner/provider supplies the sanitized current-alias attestation
through a supported read-only surface. Until reviewed, keep the binding gate BLOCKED,
maintenance ON and all new authenticated/positive acceptance held.
