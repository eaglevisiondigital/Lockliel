# Wave 10I-O A/B provenance reconciliation

November 3, 2026, America/Chicago. Bounded local read-only investigation by `wave10io_provenance`. Inspected checkpoint `fd24c876c3c761fdf1731fcbe8047330a1f74f8a`; target only `qjksggxorghaxvpyslip`, branch `course-cutover-rehearsal-274`. No hosted operation, credentials, account change or activation occurred.

## Finding

**Historical qjks fixture creation provenance was located; exact A/B mapping authority remains UNVERIFIED.** This improves the historical chain beyond Wave 10I-N but does not satisfy the reviewed live mapping contract. The bounded search did not find a complete independently approved original creation-record-to-subject/profile/creation/login digest artifact. It does not establish that the owner lacks such a record elsewhere.

The strongest newly traced source is `docs/course-hosted-275-stop-2026-09-30.md`, lines 21–32 and 54–59. It explicitly identifies qjks and course-cutover-rehearsal-274, records a starting zero-account isolated branch, and reports creation of exactly three synthetic Auth Admin accounts: two learners and one content manager, without real people or confirmation email. The document entered retained history at `fbcb2b5` and its latest path change is `5df0ffde24b67e6bad7dc5c61266c947a85af4e6`. That is an authored historical completion record, not a provider-issued per-account creation receipt. It does not preserve the exact A/B subject, matching profile, creation timestamp and login digest tuple required now.

## Evidence chain and boundaries

| Record | Established historical observation | Limit |
| --- | --- | --- |
| September 30 `course-engine-isolated-acceptance` | Three synthetic accounts in older jxt environment | Different project, branch and site. No transfer or substitution to qjks is established |
| September 30 `course-hosted-275-stop` | qjks starts empty; two synthetic learners plus content manager created under isolated authorization | No exact per-account identity/creation manifest in that document or its inspected evidence directory |
| October 1 `course-paused-acceptance-4204249` and `paused-4204249-sessions.json` | Designated A/B subjects and isolated issuer reportedly matched, manager AAL2, separate browser sessions | Receipt contains only identity label, issuer, subjectMatchesSynthetic and AAL. No raw credentials inspected; receipt cannot reconstruct exact four-digest mapping |
| October 1 `post-reopen-preflight.json` | Exact qjks/branch, three expected users and profiles | Counts do not prove exact ownership or provenance |
| October 1 corrective acceptance and `fixtures.json` | Existing manager has content_admin and discipleship_admin; ordinary A/B denied manager routes; owner isolation reported | `fixtures.json` stores project/readiness/roles/media assets, not account creation records |
| October 3 root-only Auth/manager acceptance | A/B ordinary sessions in separate browsers, zero staff roles, manager two roles, cleanup reports zero sessions | These narrative records are untracked in the preserved root checkout and absent from the current worktree. Hashed in place, not promoted into independently signed provenance; no exact mapping |
| November 1 Wave 9 provider/SQL projection | qjks branch linkage; A/B each exists with matching expected fixture identifier, profile, zero staff roles and sessions; manager has two roles | Sanitized roster omits exact subject/profile/creation/login tuple and creation record. It is historical, not current verified account state |

All exact inspected paths and content SHA256 values are indexed in `evidence/2026-11-03-wave10io/provenance-index.json`. File hashes identify the inspected bytes; they do not independently prove provider truth. Raw account UUIDs, login identifiers and session material are deliberately absent from this new report/index. Root records were not modified. Private helper processes, credential stores, browser storage and screenshots were not inspected. The search used current worktree/root authorized documentation, sanitized JSON schemas/projections and retained Git path history. It did not inspect unrelated member data or claim an exhaustive search of owner-private records.

## Seven requested identity findings

| Requirement | Result |
| --- | --- |
| Exact isolated project | Historical qjks/branch linkage is supported by retained creation and Wave 9 metadata. Fresh provider proof remains pending |
| Synthetic User A identity | A label and historical match assertions exist. Exact approved subject/profile/creation/login tuple remains missing |
| Synthetic User B identity | B label and historical match assertions exist. Exact approved tuple remains missing |
| Distinct ownership | Historical separate sessions, distinct course progress and cross-user denials corroborate separation. Current exact mapping distinctness is unverified |
| Roles/permissions | Historical A/B zero staff roles; manager content_admin plus discipleship_admin. No current role assertion or privilege expansion |
| Fixture provenance | qjks empty-branch creation narrative located. Exact independently approved creation manifest linkage is incomplete |
| Freshness | Latest relevant roster observation is November 1. No existing record may be re-dated into the 24-hour mapping authority or five-minute hosted receipt window |

An account existing now, its metadata, email domain, browser claims, successful login or a caller assigning A/B labels cannot independently supply the missing original fixture authority. The extra fourth ordinary isolated account reported by Wave 9 must not silently replace A or B. The rollback-only synthetic duration fixtures are a different test mechanism and cannot be used as retained A/B identities.

## Smallest separately authorized next action

First request an owner/operator **private original-record review**, not another password entry. Provide the historical qjks creation record and retained acceptance dates as locating references. The operator may identify an independently retained original noncredential fixture record containing exact A/B identity labels and original creation details. Do not ask for emails, IDs, passwords or tokens in chat. No account reset, new fixture or manager operation is needed.

If that independently retained record is available, prepare the already-reviewed private four-digest mapping, with source record hash and explicit approval ID. Independently review exact project/branch, two distinct subjects/profiles/creation/login bindings and the original synthetic purpose. Keep only digests and nonsecret approval metadata in the reviewed private artifact; the four digests are private pseudonymous data, not public authorization. Preserve the existing schema/domain encoding, byte/canonical hashes, owner-only file controls and source seal; do not fabricate a new receipt from offline fixtures.

If required current values need hosted confirmation, propose a **separate identity-evidence-only authorization**: one child-only direct read-only qjks connection, fresh protected local input, official CA/TLS verify-full/hostname and IPv6, actual same-transaction read_only on/5s/30s. The reviewed procedure must privately compare only the independently identified A/B records against current Auth/profile/role metadata, derive exact approved digests in protected memory, and emit only allowed status/digest approval data to the protected artifact. No login, session, account creation, reset, email, parent query, migration or deployment. This acquisition procedure is not implemented or authorized by Wave 10I-O, and must not call the existing mapped preflight to bootstrap its own prior authority.

If no independent original record can establish the A/B labels and synthetic origin, **STOP**. A read-only current roster scan alone cannot prove historical creation provenance. Return that exact limitation for an owner provenance decision rather than quietly minting new mapping authority. Any proposal to recover or designate fixtures must be separately reviewed; no replacement is proposed here.

Only after approved mapping authority exists may a separately authorized fresh operator/native preflight compare it. Use a distinct, explicitly authorized one-connection grant, never the consumed Wave 10I-J allowance. Keep the application reservation UNUSED. This provenance review does not authorize a grant, installation activation, hosted test or application deployment.

## Review and preservation

Documentation and sanitized index only. No source, existing helper, dependency, migration file, attempt ledger, private installation, Git ref, root dirty file, account, role, maintenance, database, provider, hosted Auth, Netlify, production, push or merge change. All 280 migrations are preserved by no edit. J remains CONSUMED and deployment reservation UNUSED by no action. Independent coordinator security review must assess these conclusions before treating the next proposal as executable; no security review pass is self-certified here.
