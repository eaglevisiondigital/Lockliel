# Five-stage course release package

**Local follow-up, 2026-10-01:** See [verifier/duration report](verifier-duration-policy-2026-10-01.md).
The default-ACL verifier mismatch is corrected and rehearsed locally. The approved
strict duration policy fails on authoritative279. Its additive correction is only a
local disposable-tested proposal, so this five-stage release sequence remains BLOCKED.
Inventory PASS is separate from production population, which requires authorization.
Do not execute this historical279 plan as though the duration correction is included.

## Superseding resumed review, 2026-10-01

See `final-production-readiness-resumed-2026-10-01.md` and
`final-production-operator-sequence-2026-10-01.md`. PR4 is now current, all13 provider
durations are collected, and Owner/MFA/Small/PITR are verified. Production release
remains blocked by unsupported arwdDxtm defaults in the verifier, unresolved provider
incident, incomplete direct authentication/recovery/Storage gates and the documented
duration ordering/history-policy limits. No production action is authorized. Earlier
stale-PR and no-authoritative-duration statements below are historical.

## Recovery configuration completed, 2026-10-01

The later explicit Small-compute/PITR approval was executed and verified. See
`production-pitr-enabled-2026-10-01.md`: production now uses Small with seven-day PITR,
ACTIVE_HEALTHY, unchanged version/region and 274 migrations. Dashboard UTC window
was 2026-09-24 21:06:12 through 2026-10-01 19:11:17. This supersedes the OFF/Micro
blocker below, not the separate release gates. No restore, migration or deploy occurred.
RPO <= 2 minutes and planned course maintenance <= 30 minutes are targets. Before
cutover recheck the usable pre-cutover point, Owner/MFA/restore rights, independent
Storage protection, provider stability and the remaining application/security gates.

## Recovery policy update, 2026-10-01

See `production-pitr-review-2026-10-01.md`. Primary Chat approved 7-day PITR,
RPO <= 2 minutes and planned course maintenance <= 30 minutes. These are targets, not
verified restore duration or proof of a usable recovery point. Actual PITR remains
OFF: current Micro requires a separately authorized Small compute change plus billing
approval; the scoped enablement task explicitly forbade compute changes. No settings
were saved. Supabase PITR replaces separate Daily Backups; independent archival and
Storage-object protection are still future work. Before migration release verify a
usable pre-cutover point and an authorized Owner/operator with MFA/restore capability.
No down migration is assumed; recovery after a commit may require coordinated full
DB and application restoration. Provider incident and other release gates remain.
Earlier missing numeric-policy or no-PITR-authorization statements below are historical;
they do not override this approved target or authorize the required compute upgrade.

## Current production-readiness decision (2026-10-01)

Read `course-final-production-readiness-2026-10-01.md`. Review is NOT READY for
production authorization. Primary Chat accepts the original-client acceptance gate
by the existing manual policy: **CONTROLLED BY MANUAL CUTOVER POLICY**. The old
client is not passed, fixed or compatible. No bridge is authorized. The historical
isolated execution/paused state below is superseded: qjks is279/maintenance OFF after
verified post-reopen acceptance. Current application21ac4a5/isolated deploy
6abe8f4f75e5a756b7d0cd9a; remote PR4 still3a7b7b9. No production execution follows.

### Why the manual gate remains mandatory

Old1599ab2 uses the schema274 upsert and lacks the new revision/private-note RPC
contract and278-v1 protocol. Schema275+ does not support that old write contract.
The operational PostgREST hook separately enforces426 on stale writes. Isolated
old writes were denied without persistence, but the old UI hides autosave errors
and continues media requests. A new deployment cannot patch memory-only old tabs.
Never weaken426/maintenance/RLS or claim recovery of memory-only drafts left there.

### Exact future cutover order, requiring a new execution assignment

Prerequisites before scheduling: final candidate checkpoint and exact-head CI;
trusted timings1–10 and approved provenance; Auth warning remediation; a concrete
near-zero-loss recovery method/RPO/RTO; Owner MFA/restore operator; Storage recovery;
fresh direct verify-full authentication/timeouts; stable provider window; and a
sealed production-specific maintenance/operator package with exact reviewed hashes.
Current production has no maintenance installation. Installation and read-routing
follow-ups are operational DDL/grant/PostgREST changes requiring explicit scope.
The existing isolated-only follow-ups must not be silently run against production.

1. Notify affected Getting a Grip learners using the separately authorized channel.
2. Allow active learners time to save/copy unsaved answers and Personal Notes.
   Explain that unsaved memory-only drafts left in old tabs cannot be guaranteed.
3. Require every existing Lockliel course/lesson tab closed, across browsers/devices.
4. Record the operator's explicit ALL-old-course-tabs-closed confirmation. Stop
   before maintenance if this confirmation is absent. Notification alone is not proof.
5. **MAINTENANCE ON:** perform only the separately approved, production-bound
   installation/control transaction. Require correct project, paused=true, current
   schema274, exact hook/guards and initial fail-closed readiness. No unrelated settings.
6. Verify course writes denied at app, PostgREST/RPC and guarded-table boundaries
   using approved denial probes, never real learner mutations. Preserve operator safety.
7. Drain affected work. Observe fresh transaction/lock/waiter and course write-counter
   snapshots in independent sessions; require stable counters and no in-flight writes.
   Investigate unexpected activity; do not auto-kill sessions or assume a fixed sleep.
8. Capture and verify the approved recoverable point after drain. Record UTC point,
   acceptable whole-database loss, object-copy correspondence, operator and abort time.
9. Execute **275**, once, pinned CLI, exactly one pending file; fresh read-only verify.
10. Execute **276**, once; fresh exact ledger/catalog/security verify.
11. Execute **277**, once; fresh exact ledger/catalog/security verify.
12. Execute **278**, once; fresh exact ledger/catalog/publication security verify.
13. Execute **279**, once; fresh exact ledger/catalog and zero effective service_role
    notes privileges verify. Never reopen intermediate275–278. UNKNOWN_STOP stops.
14. Apply only the separately reviewed production operational read-routing chain,
    where required for paused acceptance. Verify exact final279 readiness, protocol278-v1,
    paused=true and preserved permanent RLS/resource privileges. No ad hoc gate bypass.
15. Deploy the exact approved normal application source. Since main auto-publishes,
    any authorized merge belongs HERE, after verified279, never ahead of migrations.
    Do not publish the isolated artifact. Record immutable deploy ID and source SHA.
16. Verify production site/backend identity, build context, route/handler/source
    provenance and unchanged published design. Confirm fresh tabs run the new app.
17. With maintenance ON, verify fresh-client login/MFA, approved reads, private-resource
    handling and honest maintenance UX. Writes must still be denied; a save PASS cannot
    be claimed while paused. Check stale writes remain denied through approved probes.
18. Only if all gates and explicit exit approval hold, **MAINTENANCE OFF** using the
    reviewed transaction; verify paused=false, schemaReady=true, protocol278-v1.
19. Run separately approved controlled fresh-client post-release autosave/notes/course
    verification with no real member data. Check cloud acknowledgment/restoration,
    identity isolation, denied stale writes and protected settings/resources. If any
    safety gate fails, use the approved re-pause stop procedure and investigate.
20. Reopen learner access with fresh-tab instructions, after successful smoke checks.
    Retain426 protection, recovery evidence and both isolated environments. No automatic
    cleanup, content activation, staff bootstrap, payment/Auth/SMTP changes or new work.

No course schema migration may execute before MAINTENANCE ON, write denial, drain,
and recovery point. Required core sequence:
MAINTENANCE ON → drain → recovery point →275→verify→276→verify→277→verify→278→verify
→279→verify→deploy→identity/backend→fresh read-only acceptance→stale protection
→MAINTENANCE OFF→controlled fresh write verification→reopen access.

### Rollback, abort and ambiguous-state handling

- **Before first migration:** abort without applying275. Keep the old application and
  historical274 data. If maintenance was installed, restore/reopen only using a reviewed
  operational reversal that preserves the captured pre-install hook/RLS/grants/settings.
  The279 readiness gate cannot simply be toggled open on274. No automatic teardown.
- **After a committed migration:** keep maintenance closed; capture exact ledger/catalog
  and security state read-only. Do not rerun committed versions. A reviewed forward
  repair/resume or coordinated recovery requires separate authority. There is no down
  migration. All275–278 intermediate notes ACL profiles are permitted only while closed.
- **After application deployment:** preserve immutable old and new deploys. Failure
  means stay/re-enter maintenance under approved stop scope and inspect. Rolling only
  the app back to1599ab2 while leaving schema275+ is incompatible and not a repair.
- **Ambiguous commit/client disconnect:** stop, reconnect read-only, independently
  compare before/expected/observed ledger and catalog. Classify COMMITTED, ROLLED_BACK
  or UNKNOWN_STOP using the reviewed classifier. Never infer state from CLI exit alone,
  edit a ledger to force parity, retry automatically or reopen with UNKNOWN_STOP.
- **Database recovery:** execute only an explicitly approved physical/PITR restore to
  the verified pre-cutover point with a qualified operator. Full recovery affects Auth,
  member, payment, audit and other platform state, not just course tables. It can erase
  legitimate writes after that point, including new private notes/progress. Preserve
  evidence securely, assess actual RPO and reconcile authorized external side effects.
- **Application recovery:** coordinate database274 recovery with immutable1599ab2 and
  its original configuration. Verify ledger/catalog/RLS, settings, content, member
  counts and recovery consistency before reopening. A newer matching forward repair
  requires its own reviewed deployment and acceptance.
- **Storage:** database restore rewinds metadata only, not object bytes. Verify the
  independently retained protected PDFs/object versions and reconcile missing/newer
  objects against the chosen DB point. Never make the bucket public or delete objects
  to hide mismatch. No restore drill or recoverability PASS is implied by this plan.

The active package is `supabase/verification/course-release-279/manifest.json`.
It supersedes the 278 package without modifying its historical migration files.
Source commit: a2254aaa3890e2aff7c51b9c84c45021a7b7ba20. Original274 manifest and
each275–279 hash are pinned. Pinned CLI2.118.0 SHA256 remains
8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4.

No production execution is authorized. Dave subsequently explicitly approved the
isolated276–279 sequence; all four stages committed and verified once on
qjksggxorghaxvpyslip. It is now279/maintenance ON. That authorization is consumed.
Read `course-hosted-279-execution-2026-10-01.md`. Do not replay275–279 there.
The ordering below remains the release procedure, not permission to rerun it.

## Exact staged order and safeguards

Required order: **275 → 276 → 277 → 278 → 279**. Never insert279 ahead of276–278.
`scripts/course-release/prepare.mjs` verifies all279 source hashes against Git and
the manifest, then creates five sealed prefix directories. Only one repository
migration may be pending at each stage. No seed, role, Vault or alias substitution.

The runner verifies the exact prior ledger prefix, closed maintenance, direct
verify-full TLS and actual read-only preflight settings (lock5s, statement30s).
Pinned CLI discovery must name exactly the next file with empty seeds/roles.
Execution happens once, followed by a fresh read-only ledger/catalog/postcondition
check. Reconnect failures or ambiguous catalog state stop immediately. No automatic
retry, rollback, reopen, production transport selection or account fixture follows.

For the retained branch, independently verify already-applied275 before276. The
read-only classification is INTERMEDIATE_VERIFIED_CLOSED_PENDING279, not final
security clearance. A reviewed operator must bind the exact branch, current
assignment, protected credentials and expected catalog to each stage invocation.
The generic authorized boolean is not permission by itself.

## ACL expectations and final security gate

New notes-table expectations derive from captured postgres/public default ACLs,
then migration275's explicit authenticated SELECT and anon revocation. PostgreSQL
per-schema defaults are additive to owner privileges. Unknown global defaults or
extra default grants abort. Only the reviewed hosted Dxtm, disposable arwdDxt, or
no-service default profiles are understood. This is exact derivation, not ignoring
ACLs or substituting observed post-migration privileges for an expectation.

Stages275–278 may retain only these known intermediate service privilege profiles
and only while maintenance is closed. All other private-data permission checks
remain enforced. Stage279 must have **zero service_role table or column privileges**
on notes. PUBLIC/anon cannot access notes; authenticated has SELECT only. Grading
keys remain postgres-only. The independent semantic check catches excessive
privileges even if a reference catalog also contains them.

Migration279 changes only the notes table ACL, revoking SELECT, INSERT, UPDATE,
DELETE, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN from service_role. Exact table,
column, index, policy, trigger, function and other grant fingerprints must otherwise
remain unchanged. All prior ledger entries remain intact.

## Maintenance and application compatibility

Keep maintenance ON throughout all five schema stages, artifact deployment and
verification. The old1599ab2 application has a schema274 upsert403 and memory-only
drafts. Confirm copied drafts and closure of all old tabs before a future release.
No compatibility bridge or grant expansion is authorized by this package.

The revised `maintenance-install.sql` requires ledger279, expected final function
fingerprints and absence of service-role note privileges before schemaReady can
be true. The client compatibility protocol remains278-v1 because279 changes ACLs,
not request semantics. Count278 can no longer reopen this revised gate.

The retained branch's status function was separately updated and verified at279
on2026-10-01, with paused=true and protocol278-v1 unchanged. Read
`course-isolated-279-readiness-2026-10-01.md`. The guarded operational update is
consumed; do not rerun it or reinstall the full maintenance script. Candidate
deployment/acceptance and any eventual reopening remain separately authorized.

`maintenance-reopen.sql` remains a non-executable operator template. A successful
schema correction is not permission to deploy a candidate or reopen. Full fresh-
client acceptance, trusted production durations, recovery/Owner MFA, provider and
production direct-network checks remain separate gates. Keep both isolated sites
and branches until cleanup is explicitly authorized.

## Disposable validation

Full SQL: `npm run test:sql`, PostgreSQL17, socket-only disposable cluster. Focused
before/after: `npm run test:sql -- --review-279`; exact ordered275–278 plus actual279
inside rolled-back fixtures under both defaults. Tests first demonstrate the old
TRUNCATE grant, then require denial after279, including when revocation is repeated
with grants already absent. That disposable repeat is not permission to replay any
applied hosted migration.

Pinned CLI rehearsal uses `scripts/course-release/rehearse.mjs` under sterile
credentials and OS outbound denial, with localhost TLS as the only TCP allowance:

```sh
/usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network-outbound)(allow network-outbound (remote ip "localhost:*") (subpath "/private/tmp") (subpath "/private/var/folders"))' \
  /usr/bin/env -i PATH='/opt/homebrew/opt/postgresql@17/bin:/opt/homebrew/bin:/usr/bin:/bin' \
  TMPDIR=/private/tmp LOCKLIEL_SUPABASE_BIN='<verified absolute binary path>' \
  node scripts/course-release/rehearse.mjs
```

The new279 canonical reference is generated in a disposable clone using the exact
pinned CLI and checked for only the intended ACL delta before use. Existing stage
catalogs are preserved against the same source. Five-stage execution, per-stage
failure, timeout, wrong TLS CA/hostname, disconnect, post-commit connection loss,
ambiguous catalogs, maintenance/drain and publication-concurrency checks pass.
Evidence: `docs/evidence/course-release-review-2026-10-01/rehearsal-279.json`.
Disposable results never establish hosted application cutover success.
