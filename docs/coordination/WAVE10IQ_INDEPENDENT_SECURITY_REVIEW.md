# Wave 10I-Q independent security review

Date: 2026-11-03. Reviewer: native subagent `/root/wave10io_security`, separate from the provisioning implementation agent and coordinator/native adapter author. Scope is local source inspection and synthetic offline tests only. No hosted identity, password, key, database, provider or deployment was accessed.

## Decision

**SYNTHETIC FIXTURE TOOL INCOMPLETE** for live execution. The implemented local primitives and disabled offline package can be reviewed and preserved. They do not yet establish a trusted end-to-end creation capability, original A/B provenance, hosted acceptance or release readiness. This is not an approval to create fixtures or activate an operator.

## Reviewed boundaries

- The child-only Admin transport fixes HTTPS hostname/SNI to `qjksggxorghaxvpyslip.supabase.co`, port 443 and `POST /auth/v1/admin/users`. TLS verification is required. It exposes no list, reset, delete, invite, role update, session, production or fallback operation. The live factory is disabled before input or networking.
- Synthetic transport handles are module-branded. Arbitrary callbacks and plain caller authority objects cannot mint live authority. Mock results explicitly say zero hosted users, `liveAuthority=false` and `UNVERIFIED_OFFLINE_ONLY` provenance.
- Serial A then B dispatch is bounded at two; failures close the synthetic provider capability. A timeout or ambiguous response never authorizes a second try, replacement user or cleanup action. A response may represent a completed remote write even when parsing fails; live reconciliation remains necessary before any future action.
- The native inventory reuses the hash-pinned direct PostgreSQL guard and inventory. It verifies actual connection identity and transaction witnesses around queries, requires read-only/5s/30s, and rolls back/closes. Its CLI denies execution. An injectable driver and returned receipt data are plumbing, not provider or operator authority.
- Public preservation inventory matches 57 table names reconstructed from retained migration DDL. Authentication subject comparison uses private domain-separated projections. No password, token, auth identity payload or raw member row content is queried or hashed by this added inventory.
- Hidden TTY input has no import-time prompt, restores terminal state, clears owned input buffers and has bounded cancellation. Secret-bearing arguments, environment and files are not input mechanisms. JavaScript, HTTP and parsed JSON immutable copies cannot be guaranteed zeroized; a future private process must exit after use. Actual credentials were not requested.
- Fresh nonsecret offline grants use owner-only roots, read-only exclusive files, an external hash anchor and atomic durable consumption before mock input. Interrupted or duplicate consumption cannot resume. This is an offline ledger API, not an installed live grant. Owner deletion or replacement is outside its guarantees and must be addressed by the future fixed trusted installation/approval anchor.

## Corrections independently reviewed

The implementation agent corrected review findings before the final test run: unsafe error accessor evaluation, an unknown native phase bypass, malformed factor/boolean shape acceptance, premature PASS, continuation after a terminal outcome, missing absolute HTTP deadline, completion timestamps evaluated against request-start time and unbounded hidden input wait. The final transport review confirmed the late-response done guard, which prevents queued response data from repopulating cleared buffers after termination. The implementation agent additionally corrected TTY raw-mode-before-prompt ordering and restoration of initially nonflowing stdin; these corrections were inspected independently.

These fixes preserve fail-closed behavior. No provider response field was relaxed to make mocked acceptance appear live. Strict factor-array and timestamp-format assumptions remain compatibility questions until supported by independently acquired provider evidence.

## Tests and evidence

- Independent JavaScript security file: `tests/fixture-provision-independent-security.test.mjs`, **31 passed, 0 failed**, with `tests/support/network-guard.mjs` imported.
- Cases include hostile getters/proxies, sanitized errors, credential-field projection exclusion, wrong/privileged identities, native safeguards, freshness, cross-user tuple mismatches, unauthorized effects, changed old-record fingerprints, forged capabilities, ledger ownership/modes/hardlinks/symlinks, premature completion, terminal failure and process-restart protection.
- A genuine two-OS-process race against one fresh synthetic ledger produced one claim and one denial. A third reopened handle was denied. The first test assertion needed to strip the network guard's test reporter footer; this was a test-output parsing correction, not an allowance bypass.
- Independently reran coordinator-authored `tests/fixture_native_inventory_test.py`: **27 passed, 0 failed**. Socket resolution/creation, password input and native library loading are patched to deny in these tests. The driver is synthetic; SQL strings were not executed against PostgreSQL.
- Local sanitized logs: `/private/tmp/lockliel-wave10iq-security-final.log` and `/private/tmp/lockliel-wave10iq-native-independent.log`. The 27 Python tests overlap the coordinator run and must not be added twice to a unique test total. The 31 independent JavaScript tests are part of any full JavaScript suite that includes this file.
- This reviewer did not rerun the application build, TypeScript or full suite. Coordinator validation is reported separately.

## Remaining hard live gates

1. Install a separately reviewed source-pinned private worker that owns the native/provider acquisition, private input channels, trusted clock, source/dependency identity, fresh exact child/branch/operator authority and dedicated creation grant. Current mock input and caller-supplied native seals are not that authority.
2. Establish a reviewed current trigger/function graph seal and external Auth-hook/no-message evidence before a create. A digest match against an unapproved caller digest is insufficient. Retained SQL has not been replayed or executed in this package.
3. Complete per-subject safe bootstrap field/default checks. Current checks total two rows per allowed bootstrap table and check ordinary roles/sessions/course effects, but do not prove one safe bootstrap row for each A/B in every table. Excluding fixture-owned rows from old-record fingerprints requires an independent exact allowed-new-row audit.
4. Resolve private-schema preservation coverage and the physical tuple fingerprint limitation. `ctid`/`xmin` can change during maintenance and cause a safe false failure. No-row-content fingerprints do not prove every uninspected domain is unchanged. Do not broaden the inspected domains implicitly.
5. Establish actual provider creation-response compatibility and independent native comparison; the created identity must also be bound to the exact private planned login, request generation and authorized creation time. A provider claim alone cannot establish synthetic ownership or replace the missing original historical fixture records.
6. Approve private custody, new-generation fixture purpose, retention and any required rollback separately. No automatic deletion, account reset, email, staff role, MFA, existing progress change or cleanup is permitted by this local package.
7. Integrate new independently verified provenance through the unchanged identity/approval interfaces. Do not edit or weaken the old 40-file operator, 16 Auth flags, five-minute controls, consumed J allowance, unused Netlify reservation or mandatory exact-ID containment. Member acceptance still does not prove manager AAL2 or staff authorization.

## Preservation

Reviewer writes are limited to the independent test and this report. Temporary test directories are freshly created synthetic fixtures and removed by their owning tests. No production or isolated hosted action, credential retrieval, Auth operation, database connection, SQL execution, migration, maintenance change, reservation, deployment, push, merge or other-project change occurred. Existing application/source identities and migration/operator byte preservation are checked separately by the coordinator.

## Final source and focused rerun

After the implementation agent froze the package, the reviewer ran all three fixture JavaScript files together under the network guard: **93 passed, 0 failed** (60 workflow/envelope, 2 synthetic PTY, 31 independent). These overlap prior focused runs and are not additional unique tests. No actual password, network socket or SQL was used. The 27 native Python tests above are separate. The implementation report was reviewed and accurately leaves the live worker, registry, authority, schema compatibility and exact installation incomplete.

Hash snapshot of reviewed uncommitted files follows. The coordinator owns the eventual source commit; this reviewer creates no commit.

| File | SHA-256 |
|---|---|
| `scripts/fixture-provision/contracts.mjs` | `14b2bf6237bcaa15130e4ca2958adb10f39e267229b2e0e4f4ff9c2815754e17` |
| `scripts/fixture-provision/durable-ledger.mjs` | `12b45543951097aff1f81397edd7abb8b53eee6cc11b01c1292ae3a907cda2d7` |
| `scripts/fixture-provision/launcher.mjs` | `ba3937287b77b56d5de539f961d4b81302304b43985c1ab9cbe8c270e90144fc` |
| `scripts/fixture-provision/offline-verify.command` | `7e05c75d939d5ecebc3d114420e944a8a464b3d3c6c564da1e28d40564a64772` |
| `scripts/fixture-provision/protected-input.mjs` | `389a73fc3a4d68a425fb0741a871828cbc9cad9e8ad29119248cef55315eabc7` |
| `scripts/fixture-provision/source-manifest.json` | `d388d6bcfeeee7dcbaee3d7834bbdbab7cba88a4f4908cb15c0406e2563fd714` |
| `scripts/fixture-provision/transport.mjs` | `c280220c65202be49d1bc7fd569189554ee49a3a0efd7e2d7b0d231b6f1d6add` |
| `scripts/fixture-provision/workflow.mjs` | `2fc78084111279f983b5320748f8e8a97868f350f1f32ee5c212ef84311e17ad` |
| `scripts/fixture-native/fixture_inventory.py` | `22cb7e68ecbcd307e7962d202cdbba7a4896a91de8b2f416d646ff13cc2963a5` |
| `tests/fixture-provision-independent-security.test.mjs` | `bed0e459778d56be86b1a27d6f76a3edce9b68ae2609f18cfa66d5b1341cb8d5` |
| `/private/tmp/lockliel-wave10iq-reviewed-js.log` | `427952cb30500a5e81894698b76fba7d443cdcccab03292595691cef65b0c725` |
| `/private/tmp/lockliel-wave10iq-native-independent.log` | `31180f150f4fb0473d6a79a480f857af475ebfd04f8860dee3c6f8153ffdbef7` |

### Final input-buffer cleanup amendment

After the 93-test combined run, a narrow final amendment added `finally` zeroization of the mutable stdin Buffer, including early success, error and interruption returns. The reviewer inspected this exact change and confirmed that only `protected-input.mjs` and its two package pin files changed from the recorded snapshot. The updated hashes above supersede the earlier snapshot. Independently reran both synthetic PTY tests: **2 passed, 0 failed**. This focused rerun overlaps the earlier two tests; it is not an additional unique test count. No live input was requested. Runtime immutable-copy limitations and the incomplete live-execution decision remain unchanged.

Final sanitized PTY log: `/private/tmp/lockliel-wave10iq-final-pty-independent.log`, SHA-256 `2e3fdcb91bc56a1b9f9e942497d2c46c2d722f3a52a4531b5ac0942481c34cfa`.
