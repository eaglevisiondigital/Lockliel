# Six-stage course release package280

**HOSTED UPDATE:** exact280 is already committed on qjksggxorghaxvpyslip. Final
readiness280/protocol278-v1 is verified, maintenance ON. Do not replay280. The latest
resume prohibits disabling maintenance even inside a rollback-only test transaction,
superseding step6 below. Full positive hosted acceptance is still incomplete; read
[hosted result](hosted-duration-280-2026-10-01.md). The preparation sequence below is
historical, not authorization to repeat completed steps or open maintenance.

Status: local replay and staged CLI PASS; hosted280 NOT executed. This runbook is
preparation, not production authorization. Supersedes the historical279 release package.
Read [current evidence](trusted-duration-280-2026-10-01.md) first.

## Immutable source

Migration source `a09280eede4fd12391a6aa97e91eac65ef638e3f`.
Manifest: `supabase/verification/course-release-280/manifest.json`.
CLI2.118.0 and exact binary hash are pinned in the manifest. All280 file hashes and
Git source bytes are verified before preparation. Historical279 are unchanged.
Never use the old274 release runner or rewrite/replay an applied migration.

## Local verification

Run supported `npm run validate` with OS outbound denial and PostgreSQL17 local
sockets. Run `node scripts/course-release/rehearse.mjs` with the pinned CLI and
loopback-only egress. The rehearsal derives reviewed catalog280 from279, verifies
only three replaced functions, one private trigger function and one enabled identity
trigger, and checks the ledger separately. Other catalog rows must remain unchanged.
Expected catalogs cover274,275,276,277,278,279,280.

The prepared six directories contain immutable prefixes ending at each stage.
Use `node scripts/course-release/prepare.mjs /private/tmp/<new-sealed-directory>`.
This is local preparation only; it does not connect to a hosted project.

## Remaining authorized isolated work

Only existing `qjksggxorghaxvpyslip` is in scope. Its last fresh read-only state is279,
maintenance OPEN, schemaReady=true, protocol278-v1. Direct IPv6 is currently unavailable.
No280 hosted attempt occurred. Existing21ac4a5 application remains unchanged.

1. Restore direct connectivity without changing database settings. Use fixed isolated
   hostname, port5432, TLS verify-full with trusted CA, hidden existing credentials,
   connect_timeout5s, lock_timeout5s, statement_timeout30s, read-only default. Never log
   a password/credential URL. Reconfirm ledger and exact prior catalog/readiness.
2. Prepare and verify all six immutable stage workdirs. Do not execute275–279 on this
   already279 database. Capture fresh before catalog and synthetic row-count baseline.
3. Close isolated maintenance using the existing control and course-table drain locks.
   Require protocol278-v1, no unrelated schema drift and zero service notes privileges.
4. Invoke exact stage280 once through the pinned runner. Dry-run must list only the
   timestamped repository280 file with no seed/roles. Compute expected catalog delta
   from fresh hosted279 and local279/280 references. After commit reconnect read-only.
   COMMITTED requires exact catalog, ledger and semantic parity. ROLLED_BACK or
   UNKNOWN_STOP means stop, retain maintenance and investigate, never blind retry.
5. Only after exact280 verification, apply
   `course-release-280/maintenance-readiness-update.sql`. It requires closed280 and
   the exact prior279 readiness fingerprint/security. It updates only the temporary
   readiness function to schema280/protocol278-v1. It does not reopen maintenance.
6. Execute synthetic duration regressions in one rollback-only transaction. Any
   transaction-local maintenance opening must remain invisible outside that transaction.
   Do not commit synthetic users/data or reopen the site. Hosted Auth session fixture
   requirements must be inspected first; local compatibility fixtures are not proof of
   hosted schema compatibility. Check all8 cases and history, notes/CAS/isolation.
7. Reconnect read-only and prove280, protocol278-v1, schemaReady=true, maintenance ON,
   zero service notes table/column privileges, unchanged targeted catalog and persistent
   row counts. Retain evidence and isolated environments. No deploy or production action.

## Future production boundary

Production remains274. Any future production release requires a separate explicit
assignment and refreshed recovery/operator/provider/network/content gates, old-tab
copy-and-close preparation, exact application binding and release-window review.
The eventual database sequence is275→276→277→278→279→280, exactly one pending migration
per stage, maintenance closed throughout. Readiness must require280 before reopening.
Trusted duration/provenance population remains separately authorized; do not populate
before275 creates its provenance fields. Retain original published sites and backups.
No command in this document authorizes production execution or a main merge.
