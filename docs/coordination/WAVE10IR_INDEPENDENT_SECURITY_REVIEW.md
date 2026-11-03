# Wave 10I-R independent security review

Date: 2026-11-03. Reviewer: `/root/wave10ir_security`, separate from the operator/provider author, provenance-store author and coordinator/native author. Review covered local source, public official provider contracts and synthetic offline tests. The coordinator executed the disposable SQL exercise; this reviewer inspected its result and source but did not repeat its database execution.

## Decision

The reviewed local implementation passes the focused independent security tests below. Confirmed local defects were corrected and rechecked. Live creation remains blocked by the specific independent provider-evidence acquisition requirement. The source-pinned installation remains disabled. This review does not authorize credentials, hosted reads, creation, member login, manager acceptance or deployment.

An uninstalled owner approval is an expected execution prerequisite, not an engineering failure. The separate unresolved issue is obtaining a supported, secret-safe, current child-only observation of branch identity, managed Auth version/hooks and operator credential provenance. A schema-valid JSON document or its digest is not independent provider evidence. The current pinned-seal loader correctly refuses to replace that missing evidence with caller assertions. Resolve that bounded acquisition procedure before an executable creation authorization; do not restart unrelated engineering work.

## Reviewed trust and execution boundaries

- The operator exposes no callback injection or alternative project/site selection. The actual child host, HTTPS SNI, Admin path and request operation are fixed. Ordinary A/B scopes remain distinct from staff, manager, MFA, member sessions and all 16 existing Auth acceptance requirements.
- The shell verifies the Node and runner hashes before execution, clears inherited environment, disables core dumps and accepts no arguments. The runner verifies the manifest and launcher before dynamic application imports. The package verifies all 12 fixture/native module files. No live approval seal or grant was installed.
- Private authority is issued only from the fixed, independently reviewed installation seal and exact owner-private evidence bytes. It enforces five-minute approval/evidence freshness and monotonic/wall-clock consistency. Public data validators and synthetic test handles cannot issue that capability.
- A durable dedicated grant is consumed before protected input. Fixed step claims precede native inspection or each A/B request. Transport/native boundaries independently require the correct consumed operation. Interrupted, duplicate, expired, replaced or ambiguous attempts cannot resume or create a replacement allowance. J is not reused.
- The private native worker uses the fixed Python runtime, exact worker/inventory/CA hashes, exact child identity and the existing pinned PostgreSQL guard. Inherited pipe input is private; no password arguments, environment or files exist. The worker rechecks private root/marker ownership, no-follow file access, step/generation, evidence freshness and consumed-before/after markers. Returned receipt data acquire trust only through the owned source-pinned channel and fresh nonce.
- Direct transport remains IPv6, certificate and hostname verification, actual same-connection read-only transaction, 5-second lock timeout and 30-second statement timeout. Every inspection is surrounded by transaction/connection witnesses, then rollback and close. No Session Pooler, arbitrary SQL or production fallback is present.
- Both new passwords are collected before the first create and registered for disposal immediately. Owned mutable buffers are cleared on success, failure, cancellation and B-input interruption. Node/Python immutable copies cannot be guaranteed physically zeroized; the private process exits and core dumps are disabled. No real secret was used in review.
- The private operator credential is limited to the supported isolated legacy service-role JWT format. Parsing only rejects a mismatching decoded project/role/expiry; it is not signature verification or credential provenance. PATs, production/sibling claims and opaque keys are denied. Actual key provenance and provider authentication remain future gates. The worker's create-only operation allowlist must not be confused with the broader provider powers of a service-role credential.

## Provider compatibility and containment

The official [Auth User model](https://github.com/supabase/auth/blob/master/internal/models/user.go) supports omitted empty factors and variable fractional UTC timestamps. The local parser therefore allows an absent factor field without claiming factor absence; native `factorCount=0` remains mandatory. Timestamps normalize losslessly to microseconds; nonzero extra precision, invalid calendars and unknown shapes stop. Clock skew can conservatively stop request-time comparison. These are safe-stop limitations, not evidence that a particular hosted binary will return the accepted shape.

The official [Admin create implementation](https://github.com/supabase/auth/blob/master/internal/api/admin.go) creates Auth user/identity/audit state, applies role and confirmation, and returns a user. Its confirmation path adds `email_verified` metadata. This source supports the local compatibility model; it does not establish the isolated hosted version or absence of managed/custom hooks. The [public createUser contract](https://supabase.com/docs/reference/javascript/auth-admin-createuser) requires server-side administration. Current changelog and public source were read; no authenticated project API was used.

A serial A failure prevents B. An ambiguous outcome never retries or creates a substitute. Known A with failed B remains partial and requires separate reconciliation. Nonsecret durable lifecycle records retain the distinction between claimed, provider-reported, independently verified, rejected and ambiguous states. A timeout may conceal an applied provider write; no automatic deletion or reset follows. Any cleanup needs exact-new-subject provenance, cascade review and separate owner authority.

## Bootstrap, RLS and old-state protection

The native validator now requires one exact safe row for each subject in all seven allowed bootstrap tables, plus exact new Auth metadata and email-identity ownership. It rejects nonordinary claims, foreign identity subject/email, staff roles, factors, sessions, course enrollment/progress, notes, consent/inviter changes and unexpected defaults. Explicit A/B tuple matching uses only allowlisted noncredential projections.

The protected-state inventory covers 57 public tables, the three known private tables, course maintenance control, Storage metadata and specified Auth tables. It excludes only the new subjects' allowlisted bootstrap/Auth ownership and independently audits those excluded rows. Physical tuple fingerprints intentionally fail on incidental rewrites and do not certify uninspected managed-service internals. Managed Auth audit additions and external hook behavior remain separately declared effects/gates.

Coordinator evidence at `/private/tmp/lockliel-wave10ir-sql-result.json` records 280 actual unchanged migrations replayed in an owned Unix-socket-only fixture, 22 checks, exact per-account defaults/identity, prior enrolled learner/progress preservation, cross-owner denial, 57/57 public RLS and zero service-role private-note table/column privileges. Negative changes were rolled back; the owned fixture and cluster were retired. This is local trigger/schema evidence, expressly not hosted equivalence.

## Private provenance

The writer stores only exact project/purpose/source/approval and noncredential receipt digests, generation and per-account lifecycle. Two private immutable chains plus an independently retained checkpoint detect interruption, rollback, mismatched anchors and stale reopen. Owner-only directories, 0400 exclusive files, fsync, no-follow checks and hardlink rejection protect the filesystem boundary. An interrupted append leaves a durable stop marker. Ambiguous or rejected creation permanently halts later creation, even after separately authorized reconciliation.

The registry is integrity evidence, `authority=false`, not a provider signer. A complete pair produces only `REQUIRES_INDEPENDENT_APPROVAL` mapping evidence; it cannot activate the unchanged identity loader. An owner able to rewrite both roots and the external checkpoint is outside the stated filesystem trust model. Future installation must name the private custodian and independent checkpoint retention. No registry containing real accounts was installed.

## Corrected findings

1. Destructured registry arguments could evaluate hostile getters before error sanitization. Inputs now clone/validate inside the fixed-error boundary.
2. Authority validators read unvalidated seal/approval getters. All data arguments are now cloned before access.
3. Late child stdout could repopulate cleared buffers after terminal failure. The done guard and input-buffer cleanup now cover that path.
4. A-password memory was not registered for disposal until B input completed. Each successful input is now registered immediately; B interruption is tested.
5. Loaded authority alone was insufficient to enforce consumed operation order at transport/native entry. Each boundary now requires the durable operation claim.
6. Native consumed/prior-phase marker checks followed symlinks or checked existence only. Owner, mode, no-follow, exact content and step checks now precede connection.
7. The new shell initially checked Node only after starting it. It now hashes Node before exec and disables startup configuration with `zsh -f`.
8. Decoded JWT metadata initially used verification terminology. It now reports only decoded project-claim matching and still requires independent private provenance.
9. The new native worker supplies a mutable bytearray while the retained driver accepts a string. The factory now performs one short-lived conversion, sanitizes constructor failure and preserves caller-owned disposal; independent tests exercise the exact type handoff.

## Independent validation

- `tests/fixture-provision-wave10ir-security.test.mjs`: **36 passed**, no failures/skips. Covers forged authority, getter/proxy leakage, wrong project/purpose/hooks, freshness, private chain attacks, partial/replay/ambiguity, exact timestamps, separate scopes and the shared synthetic composition including input interruption.
- `tests/fixture_native_wave10ir_security_test.py`: **8 passed**. Covers exact native constructor handoff, bad input types/UTF-8, fixed-error failure, SQL allowlist and actual transaction, bounded result cleanup and private-file symlink/hardlink/mode/size rejection.
- Independent reruns: **31** coordinator native inventory tests and **4** operator native-worker denial tests passed. These overlap coordinator totals and must not be added again.
- Earlier combined fixture JavaScript run: **196 passed** including retained Q and new R tests. This overlaps the 36 above and is not an additional unique count. Final coordinator full regression/build/type/lint/Netlify evidence is reported separately.
- Independently compared all **40 operator files** to the retained N inventory and all **280 migrations** to application `327ba098628f70aa65140862b8b14cd709bfd711`: zero mismatches.
- Sanitized final logs: `/private/tmp/lockliel-wave10ir-security-final.log`, `...-native-security-final.log`, `...-native-inventory-final.log`, `...-native-worker-final.log`. All test credentials were synthetic markers. No native library or managed connection was used by this reviewer's tests.

## Preservation and next gate

No live credential access, hosted Auth/account action, managed database connection, production access, settings/maintenance change, migration, Netlify reservation/deployment, message, payment, role grant, Git push or merge occurred in this review. No existing acceptance environment was deleted. Application/source and 40-file acceptance boundaries remain intact; J remains consumed and the deployment reservation unused.

The smallest remaining action is the exact secret-safe child-only provider observation and independent sealing procedure, with explicit collector identity, fields, permission scope and read budget. Missing hook/version/branch/credential provenance must stop before any create. Once independently established and separately authorized, the reviewed local operator can perform at most two creations and two guarded inspections; this report does not execute or authorize them.

## Reviewed source snapshot

The hashes below identify the reviewed local bytes before the coordinator's source commit. No security-review commit was created independently.

| File | SHA-256 |
|---|---|
| `scripts/fixture-provision/contracts.mjs` | `6d61c0fa79d9cee43725bf126929ae6c491e73bbb8509f42f6af8ce5680413cf` |
| `scripts/fixture-provision/durable-ledger.mjs` | `12b45543951097aff1f81397edd7abb8b53eee6cc11b01c1292ae3a907cda2d7` |
| `scripts/fixture-provision/launcher.mjs` | `2a3abc15d0907a044500e95b05617a25da6782cf79130458d1ba351e10d2edee` |
| `scripts/fixture-provision/native-channel.mjs` | `76a39a9d52f2bae0624cdaa394c375df4788c2d0e887c92bde1a17d8294183ff` |
| `scripts/fixture-provision/offline-verify.command` | `296492891b2aaca3403fbe1059a8e6cd8107b3a0f97169f4ed40d3fd93cd03dc` |
| `scripts/fixture-provision/operator-authority.mjs` | `459f21ce113ef1774245c3d5c422128f3c826533fd034dd115da57690c71d8ae` |
| `scripts/fixture-provision/operator-installation-seal.json` | `b738cb178990863c08bb27868c770466bf3774cfa028771dac7b0654d05dd38c` |
| `scripts/fixture-provision/operator-launch.command` | `9412c78dc2a5e8b4ab0689dc66c192f536cfe8e73029c1bd19444364f84d8d40` |
| `scripts/fixture-provision/operator-runner.mjs` | `15f356d20331cfb0b32dd6b63ae944092b8f58d7e21fdece2241f0f353b41b2d` |
| `scripts/fixture-provision/operator.mjs` | `cf5fa0085f02b3e877ef84cc9c9c5240ce3d839d9eaf4c338f5267b0d2cc643f` |
| `scripts/fixture-provision/protected-input.mjs` | `389a73fc3a4d68a425fb0741a871828cbc9cad9e8ad29119248cef55315eabc7` |
| `scripts/fixture-provision/provenance-store.mjs` | `9d79d4f621135fe2e900a95dfe8bab58eeb55c6cab1be46c2db25ddd32b3146e` |
| `scripts/fixture-provision/source-manifest.json` | `9a7d50d496b4eb1b222e85f2df0a79f1f3178842e60bd50cde2692bec1aaa329` |
| `scripts/fixture-provision/transport.mjs` | `1226ce45a819389ce9e34a31728dd5a7597340a2a832917110c20c179c3e720d` |
| `scripts/fixture-provision/workflow.mjs` | `d340b203053583b88d66d3418fde689ac1b3ec3df4b0229ccfb37637e177cb6f` |
| `scripts/fixture-native/fixture_inventory.py` | `b5514243328a7bf6c04c0c14a4fdb2961115010b83cdc73690a62f4f5b4a4e52` |
| `scripts/fixture-native/fixture_native_worker.py` | `8b5d4cb302095c77a47d40cbc62ab590b41b6e111e19744c7c3706f87ca3c245` |
| `tests/fixture-provision-wave10ir-security.test.mjs` | `c641e910c122cb6c9868c8dc3bb3f3b1abff398b9499db95b6e106b1f19b69af` |
| `tests/fixture_native_wave10ir_security_test.py` | `f178974c8f65b57d9b2a0edf641d5ed53704151a52516bdae1ab4ef6c2514ff2` |
