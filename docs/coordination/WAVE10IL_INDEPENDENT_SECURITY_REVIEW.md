# Wave 10I-L independent security review

November 2, 2026. Actual independent reviewer: `/root/wave10il_security`. The reviewer did not implement the operator, native inventory, evidence registry or launcher. Reviewer-owned changes are the separate attacker test file and this report. No credential, managed database/provider access, native connection, hosted Auth, kit/grant mutation, reservation, upload, deployment, push or merge was performed by this reviewer.

**LOCAL PREPARATION SECURITY REVIEW PASSED after the corrections below. OPERATOR INTEGRATION REMAINS INCOMPLETE.** This is not clearance for a fresh preflight connection or deployment. The live factory deliberately has no authority issuer and cannot execute. The disabled launcher has only an offline verification entry point. No missing provenance, current operator authority, independent provider evidence or privileged acceptance is manufactured.

## Reviewed snapshot

| File | SHA256 |
| --- | --- |
| scripts/member-hosted/deployment-operator.mjs | f35e6d25fe16b44ff4b3de540439f76bb33eccdf971e29a12bf7b686a29f14a7 |
| scripts/member-hosted/deployment-evidence.mjs | feca6917bab530e38d0ec64b35e35b4226009e68f3443b964ccc1572fde335f1 |
| scripts/member-hosted/deployment_database_preflight.py | c367e660e07d42286ec1be321fd65593a82aa2ad85bd883383b677cd139e75db |
| scripts/member-hosted/deployment-preflight-baseline.json | 1b17b93a1c4d21d19cda04cd62c57785f276797c929fd5906c90b75ecf39e8ae |
| scripts/member-hosted/deployment-preflight-launch.command | 076d3836253ccf6848379f06922719b07af8f2b162906c55f80b50349a15275a |
| scripts/member-hosted/deployment-preflight-launcher.py | 7d79a3e9864606326a5c55a1f05adef1fb04ca33bdc3889e40ad3be2238842eb |
| scripts/member-hosted/deployment-preflight-launcher-manifest.json | b461561ba1f7d7bf260e3a7f9ab0efd731e286a024bc0ba94f715f69b486693d |
| scripts/member-hosted/deployment_preflight_attempt.py | aa3957eebe9509de4cf6aaeff4a56cc060ec7c8d04cb979ed9ad87accf05a7ac |
| tests/member-hosted-deployment-operator-security.test.mjs | c2b3d06e23776799b3032e88965235a3632e0c3456563fc8d2ba704b9acd0bd4 |

Read the current owner attachment, exact prepared IL assignment, IK review, H independent review and the unchanged uploader, provider receipt, rich consumer and native guard. Application327, uploader518, source-bound J guard and consumed allowance remain separate identities. No new application or provider workflow was substituted.

## Findings corrected and independently rechecked

1. **Ambiguous clock recovery.** A malformed clock sample denied one operation but allowed a later corrected sample to reuse the receipt. Independently reproduced: the first attacker run passed12/13 and failed this case. The registry now permanently poisons normal evidence after any clock callback, shape, monotonic or wall-time ambiguity. The implementing agent also rejects accessor/toJSON/Proxy/cycle input without executing hooks. Independent rerun passes. Cleanup identity remains available after ambiguity or expiry.
2. **Early protected-handle disposal.** A native preflight exception before construction of the existing lifecycle operator left a supplied synthetic protected key usable. Independently reproduced:17/18 attacker cases passed and the key could still construct a protected transport. The offline composition now disposes its owned key in a finally block on every path. Independent disposal regression passes. No real credential was supplied.
3. **Incomplete dependency seals.** The preparation seals initially omitted the approved package builder and final verifier. The operator now hashes both unchanged files alongside uploader, provider reader, native guard/inventory, baseline and evidence registry. Preparation and the independent source-seal assertion pass.
4. **Native inventory proof details.** Review requested strict JSON boolean matching for readiness, rich observed TLS/PID/transaction fields, preservation of acquisition start time, and metadata validation before invoking a privileged readiness function. Implementer corrected these and added regressions. The reviewer reran the final45 Python tests. A subsequent implementer-found early source/nonce setup cleanup gap is also corrected: the outer owner wrapper closes the supplied driver on all exits. No original J source was changed.

No actionable security defect remains in this preparation-only snapshot. The operational gaps below remain blockers, not defects to bypass.

5. **AAL meaning reconciliation.** Review reconciled the legacy `aal2AuthorizedOnly` field with the exact Wave10B/IK non-escalation meaning. All four ordinary/negative observations and eight source/route/runtime negative observations are required. Every missing field denies. This does not establish positive manager/AAL2 or staff acceptance, which remain explicitly NOT_TESTED. No privileged operation or additional permission is authorized.

## Boundary and authenticity review

The live factory accepts zero arguments, rejecting arbitrary request/authorize/native/callback substitutions without invoking them. Its private WeakSet has no issuer, so caller JSON, saved J JSON, fixture handles and successful offline results cannot authorize execution. Imports do not prompt or connect. The trusted dependency function references are captured internally, but capturing them is not completed protected process/operator installation. The separate fixture kernel is explicitly synthetic and cannot mint live capabilities.

The new native inventory uses the unchanged pinned direct IPv6, official CA, hostname verification and startup guard primitives. It verifies the same native handle/socket/PID and transaction around all seven fixed inventory queries. Counts are explicit:7 inventory inspections,15 guard witnesses,BEGIN/ROLLBACK,24 actual statements. It checks the full280 observed ledger entries and stored MD5 values, sealed catalog, effective private-note privileges, RLS57/57, grading-key denial,11 projection grants and three current RPC security/definition records. Fixed SELECT allowance and a1MiB result cap do not introduce caller SQL. Rich receipts retain actual acquisition start/end; rollback and close are mandatory.

The source does not certify existing A/B provenance from aggregate counts or editable metadata. Its current result is intentionally `ok:false`, `deploymentReady:false`, `SYNTHETIC_IDENTITY_BASELINE_MISSING`. Branch linkage is independently retained historical metadata and explicitly `fresh:false`. Caller REST evidence is explicitly false until hosted acceptance. Neither is re-dated or relabeled as a fresh provider observation.

The evidence registry binds exact app/site/project and later actual deployment/manifest, uses real wall plus monotonic intervals, retains acquisition age and a five-minute run window, prohibits per-kind replay and consumes opaque capabilities once. Saved/serialized/cross-registry handles, interrupted runs and timestamp renewal fail. Its standalone exported fixture/data APIs are not independent provider authority. A future live bridge must own the registry internally and bind the actual native process channel, exact worker and runtime, not accept JSON as proof.

The AAL matrix distinguishes ordinary A/B member reads, anonymous/expired denial, AAL1 privileged denial, MFA-required denial, positive verified AAL2 and staff-role authorization. The legacy verifier flag can be satisfied only by all required exact-source, route inventory, absence-of-privileged-surface and actual negative observations. Ordinary sign-in or catalog inspection alone cannot satisfy it. Positive manager/AAL2 and staff acceptance remain NOT_TESTED, not new blockers requiring broader permissions. Missing actual negative evidence still stops the synthetic composition before reservation. Its reused lifecycle is not a completed sealed live operator or successful hosted containment execution.

## Launcher and single-attempt limit

The reviewed shell and Python template accept only `--offline-verify`. They pin the CLT Python runtime/inventory and fixed source manifest, explicitly declare `executionAuthorized:false`, and do not import the native worker or access any spent J kit. Zero arguments and execution flags deny. This reviewer ran its offline verification successfully:zero credentials,zero connections,attempt state untouched.

An additive unwired attempt primitive implements source-bound nonsecret grant validation, owner/mode/no-follow/single-link checks, advisory exclusive locking, atomic READY-to-CONSUMED rename and parent-directory fsync. It has no initializer, reset path, prompt, native call or executable CLI. Thirty-four disposable-only tests include real child-process concurrency/restart, interruption and fsync/expiry failures. It rechecks actual time immediately before and after durable claim. Caller-supplied operator SHA syntax is not authority: the future sealed operator must independently verify the actual source digest and expiry before input/connection. No actual kit or grant was created, read or modified. The spent J allowance remains permanently separate and consumed. Future source-bound installation and protected native binding remain missing.

## Independently executed validation

- **122 JavaScript tests passed**, zero failures/skips, with the deny-network preload:43 composition,59 evidence and20 separate attacker tests. These are subsets of the coordinator full suite, not additional unique totals.
- **45 native inventory Python tests passed**, synthetic driver only, real socket/DNS/native-library/password input denied by the suite.
- **27 disabled-launcher Python tests passed**, covering missing/ambiguous/consumed/interrupted/restart-shaped state specifications and source/runtime mismatches.
- **34 durable-attempt Python tests passed**, exclusively owned temporary nonsecret directories and two real child-process restart/race tests. No database or network operation.
- The actual launcher `--offline-verify` returned preparation verified with execution disabled,zero connections and no attempt-state touch.
- Compared all **280 migration file bytes** independently to application327:all unchanged.

The native agent separately supplied a disposable PostgreSQL17 Unix-socket-only validation receipt and recipe. This reviewer read that evidence rather than rerunning PostgreSQL. Seven queries executed and effective RLS/notes/grading-key/projection/RPC assertions passed after280 unchanged sources replayed. Whole catalog/hosted statement-array MD5 parity did not pass in that local compatibility fixture and is explicitly not claimed. No managed SQL or live synthetic acceptance is established by that evidence.

## Remaining exact blockers and safe next work

The local source is safe to retain, but is **not ready for controlled deployment preflight**. Still required:

- Independently established exact existing synthetic A/B identity/provenance binding, without PII in reports.
- Actual source/provider/runtime negative AAL observations under the resolved legacy non-escalation matrix. No positive manager or staff test is required or claimed under this scope; do not infer it from member login.
- A sealed native worker-to-Node receipt channel, source/runtime/operator installation and disabled-template-to-real single-use execution binding. No caller callback/JSON authority or copied J grant.
- Fresh child-only provider/branch/operator/billing/key provenance evidence, actual protected material availability, source/artifact integrity and an executable five-minute schedule. Offline timing simulations are not performance measurements or current provider receipts.
- Actual final caller-RLS/Auth observations, required ACK/route/rate evidence and independent exact-ID retirement under the already bounded deployment authority, only after all local gates and fresh-preflight authority are satisfied.

No application reservation was consumed. Existing production, main/course references, PR4, historical course acceptance infrastructure and published sites were not accessed or changed by this review. Preservation is by no action and local source evidence, not a new live audit. Do not request credentials, reconnect, reserve or deploy from this review result.
