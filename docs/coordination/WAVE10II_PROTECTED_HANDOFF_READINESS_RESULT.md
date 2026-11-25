# WAVE 10I-I PROTECTED HANDOFF READINESS RESULT

November 2, 2026. **LOCAL IMPLEMENTATION AND INDEPENDENT REVIEW PASSED. LIVE EXECUTION REMAINS OFF.**

## Exact source and scope

Source: `e3c3e382a53136fd57b3296b9d97876ecd7e4f7a` on `codex/wave10-hosted-composition`. The preceding documentation-only checkpoint `33dd1800fecbf0049210caa62d71080ddcf40b76` preserves Wave 10I-H. Application `327ba098628f70aa65140862b8b14cd709bfd711` is unchanged. No push or merge occurred.

The owner has now explicitly confirmed that the current isolated PostgreSQL password is already available privately. This supersedes Wave 10I-H's pending availability question. Its correctness and all live safeguards remain UNVERIFIED. No password, PAT or other credential was requested, entered, retrieved or inspected.

## Local implementation

- `scripts/member-hosted/manual_database_preflight.py`: hidden owner-only TTY input, no echo fallback, opaque special-character/UTF-8 handling, fixed isolated destination and pinned PostgreSQL guard. No Management API request or PAT. Reuses the reviewed F boundary for Python/logging/native-output suppression and owned-buffer disposal.
- `scripts/member-hosted/manual_recovery_launcher.py`: exact source/runtime verification and reuse of the unchanged durable recovery launcher. Same root and atomic READY-to-CONSUMED/fsync implementation. No initializer, reset, retry or second allowance.
- `scripts/member-hosted/manual-recovery-launch.command`: prepared Terminal bootstrap with exact Python, runtime, old boundary/support, guard, new worker/launcher and identity pins. It is repository source only, not installed into the live sealed kit. Do not run it in this assignment.
- `scripts/member-hosted/manual-branch-identity.json`: exact copy of independently captured provider evidence from Wave 10I-E, hash checked and strict fields verified before input.
- `scripts/member-hosted/manual-handoff-reconciliation-proposal.json`: exact prepared binding of the changed source to the same unused authorization, not an installed replacement grant.
- Python and JavaScript regression tests for input, identity, guard composition, disclosure, disposal, failed authentication, connection failures and durable duplicate/interruption behavior.

No existing application, guard, recovery worker, original launcher, runtime manifest, schema or dependency was modified.

## Source pins

| Artifact | SHA256 |
|---|---|
| manual_database_preflight.py | `24c9b04f1a696f6ad089614460842b20826a7f2b632f8bfe8a8589b53f1cb8b5` |
| manual_recovery_launcher.py | `ec07fb0d0c7b799bcd1307ae3097a68ededdfd1c3b8246ec450829ac99838821` |
| manual-recovery-launch.command | `6a3b3a694dfe2bad63e9a30b214119a32d37f58cd8366668cfe8d88d15841cb3` |
| manual-branch-identity.json | `e41d3b988c3f58cfd4f0feff37d831077f8adf7d6c150aeb390df5305356c5f0` |
| manual-handoff-reconciliation-proposal.json | `7f51141180922514687ed33fba90d0fd95c3748f9c163979414bde9e143de8e3` |

Pinned guard: `c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba`. The source hash pins cover the exact compiled bytes, not a filename claim. The reviewed commit supplies the operator's Git identity; the bootstrap additionally verifies the deployed byte identities before Python imports. Unreviewed replacement files or dependencies fail closed.

## Independently established nonsecret identity

The receipt's exact qjks reference, `course-cutover-rehearsal-274` name, branch ID `7091bfd6-83ce-4c11-ac30-8ce85e09be2d`, parent linkage and nondefault/nonpersistent status are independently collected provider metadata, not an application-generated claim or owner attestation. Wrong production/sibling references, name/ID/default changes, extra/duplicate rows or byte alteration deny before password input.

This is **historical metadata dated November 2**, not a new provider health check or proof that a branch was not subsequently renamed. The fixed isolated hostname plus certificate/hostname verification and same-connection PostgreSQL inspection establish the later connection destination and schema/security state. They do not independently return a branch display name. Any requirement for fresher provider branch metadata must be resolved without a credential request or production-parent permission expansion before execution. No fresh provider request was authorized or made here.

## Guard and credential protection

The unchanged guard enforces direct IPv6 only, fixed qjks host/5432/postgres, pinned official Supabase CA, TLS verify-full and hostname validation. It requests startup protections, then establishes BEGIN READ ONLY and verifies actual on/5s/30s plus backend/socket/transaction continuity before and after each fixed inspection. There is no pooler, fallback, reconnect, arbitrary SQL or persistent setting change. Rollback and close remain required.

No real database connection was attempted. These are tested code properties, not current authenticated observations.

Hidden getpass input is taken only from a private TTY. Echo fallback is an error. CLT Python 3.9 exposed a synthetic non-ASCII decoding defect under the clean C locale. The fix temporarily selects process-local UTF-8 for getpass and restores LC_CTYPE in finally, with no environment/OS configuration change. A restoration failure wipes the created mutable buffer and fails before connection. Tests cover the failure and restoration paths.

Owned mutable password buffers are wiped and the native guard clears its owned libpq parameter buffers. References to immutable copies are cleared and the dedicated operator terminates promptly. Python/native transient copies and the trusted OS remain limitations; forensic eradication, protection from a compromised OS/debugger, or a sandbox against hostile loaded code are not promised. No password arguments, environment values, credential files, IPC, raw exceptions or provider diagnostics enter the report or fixed result.

## One authorization, reconciled locally as a proposal

The actual READY grant remains unchanged at SHA256 `433a71b3b4edad86b9d3508a3c46a5516bb1cde40eb5e4de2bacc4a38a9c3e7a`. No consumption or replacement occurred. The separate deployment reservation remains unused.

Prepared replacement canonical grant SHA256: `3c3398cf5908f52126ef260a05254e69bdefca410ec6f0e1f6cfe47094e7b583`. It binds the new worker/guard/runtime/identity hashes and previous grant hash; it permits **zero Management API recoveries and one direct database connection** under the same existing authorization and durable root.

Offline tests establish that the new launcher rejects the old PAT-bound grant without consuming it; the old launcher rejects a reconciled manual grant; after a successful claim neither entry point can repeat it. Concurrent processes, killed processes, restart, fsync failure, missing state and ambiguous state deny rather than repair or rearm. A later reconciliation must be exclusive, with no old operator in flight, preserving old evidence and changing the same unused grant binding only. Never create another READY root or reset a consumed state.

The owner's original isolated resource boundaries remain unchanged. The current local-only authorization covers this implementation/review and exact reconciliation proposal. It does not execute a live diagnostic or silently install the proposal into the existing sealed kit.

## Validation and independent review

- **1,856 JavaScript tests passed, 0 failed, 0 skipped**, with real outbound access guarded. The first clean-environment run skipped 11 toolchain-dependent cases; supplying the existing installed official toolchain resolved those skips in the final run. No installation occurred.
- **50 focused Python handoff tests passed**, also independently rerun. This suite is exercised by one of the JavaScript tests; counts are not additive unique JavaScript tests. Existing 46 recovery, 49 PostgreSQL guard and 32 launcher Python tests also pass via their wrappers.
- TypeScript, configured tooling lint, shell syntax and local Netlify validation passed. Netlify imported 83 modules/63 handlers without deploying.
- Actual independent agent `/root/wave10ii_security` reviewed exact corrected source, independently passed the final 50 tests and reviewed the reconciliation proposal. Its earlier 47 synthetic adversarial assertions were against the initial implementation. Final disposition: **PASS for local readiness; no material security findings**.
- Application build/migration replay were not repeated because application and all migration bytes were unchanged. Historical application/replay evidence remains separate. Temporary dependency reuse link was removed.

## Remaining operator requirements and smallest next step

Next controlled assignment: review this exact source, authorize exclusive installation/reconciliation of the same unused grant, then **one** protected manual-input direct diagnostic only. Do not resume deployment from this readiness result.

Before any prompt: verify no older operator is running; exact original READY hash and no CONSUMED/result; exact sealed source/runtime/Python/native/CA pins; prepared historical identity receipt and any separately required freshness evidence; correct active IPv6 network; and the exact isolated project/database. Stop on mismatched or ambiguous state without automatic repair. Preserve the old grant evidence. Do not ask for a PAT or recover/reset a password.

Only after that controlled prerequisite package may the owner enter the already-held isolated password once in Terminal. No chat/screenshot/password-manager export or secret-bearing command is permitted. Stop after the fixed sanitized result. Authentication failure or any on/5s/30s/identity/TLS failure forbids retry and deployment. Even a successful diagnostic does not authorize application deployment, hosted Auth or other work under this assignment.

## Preservation

All 280 migration sources, 37 feature inventory rows, old source/runtime/grant evidence and root dirty work are preserved. No production connection or write, private provider API request, password/token access/reset, hosted Auth, settings/Auth/SMTP/PITR/compute/maintenance change, migration, Netlify reservation/deploy, Git push/merge, account/role, payment, content or message action occurred. Production/main/course PR4 and published sites were not acted on; no fresh remote preservation audit is claimed. Historical isolated280/maintenanceON and production274 remain prior observations.

Only one agent was dispatched for this assignment, the independent security reviewer. The previous Wave 10I-H parallel lane audit remains prior evidence; no claim is made that all eight feature agents are actively coding here. Approved shared-contract/design boundaries remain intact.
