# Verifier and trusted-duration policy review, 2026-10-01

**VERIFIER AND DURATION POLICY REQUIRE CORRECTION**

The ACL verifier is corrected and verified locally. The approved duration policy is
now explicit and reproducible, but the authoritative279 application/database package
still fails two cases. A minimal additive SQL correction passes the focused tests
only as a disposable overlay. It is outside the authoritative migration directory
and is not in PR4. The current release package therefore cannot be cleared.

## Completed and changed

- Starting clean HEAD: `50b68755dadeea258b982bd629f49d695bbe3432`, branch
  `lockliel-backend-v1`. Previous remote-tracking development/PR4 baseline:
  `eaff3fea36d4ce489009ebf2070071311619f9c2`; application `21ac4a5`.
- Corrected only the known ACL-profile assumption in `notesCreationACL` and the
  closed-maintenance intermediate security assertion. The exact production
  `service_role=arwdDxtm/postgres` creation profile is accepted. Unknown defaults,
  global defaults and unrelated grants still stop verification.
- Added a two-profile real SQL catalog/security matrix and exercised both profiles
  through the exact pinned five-stage CLI runner. Added focused JS presentation
  checks and an eight-case actual SQL/RPC duration regression.
- Prepared a two-function additive correction at
  `supabase/proposals/trusted-duration-policy/20261001204920_lockliel_current_trusted_duration_gate.sql`.
  No authoritative migration was added. None of the279 existing files was edited.
  No frontend layout, dependency, workflow or hosting configuration changed.

## Default privileges and final notes security

Defaults concern newly created objects. The captured production postgres/public
table default remains `service_role=arwdDxtm` before and after all five migrations.
It is not the final notes table ACL. All eight inherited service privileges are
accepted only at stages275–278 with maintenance closed;279 must remove them all.

Final `lesson_private_notes`: authenticated SELECT through the existing owner and
active-session policy; zero service_role table privileges and zero effective column
privileges; zero anonymous/PUBLIC access and no direct member writes. Private
grading keys remain inaccessible to these roles. Existing RLS, policies, function
owners and function ACLs match exact expected catalogs. No grants were added.

The pre-existing read-only security query already combines table privileges with
`has_any_column_privilege` and separately checks PUBLIC table/column ACLs. It was
retained, not weakened or replaced by a default-ACL comparison. PostgreSQL documents
the additive role/column behavior in [REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html)
and its [privilege inquiry functions](https://www.postgresql.org/docs/17/functions-info.html).

## Disposable ACL matrix

| Case | Result | Actual evidence |
|---|---|---|
| A: production full8 defaults | PASS | Exact275–279 replay and CLI stages; unchanged defaults; final service access zero |
| B: restricted defaults | PASS | Same replay/CLI sequence; final service access zero |
| C: excessive actual grants | PASS, denied |13 deliberate table/column grant defects per profile rejected by the real security-query output |
| D: missing/incorrect279 | PASS, denied | Intermediate full8 reports fail final security; missing279 fails ledger; residual MAINTAIN fails final security |

The13 injected defects cover service SELECT/MAINTAIN, all four additive service
column privileges, anonymous table/column SELECT, authenticated UPDATE/TRUNCATE,
PUBLIC table/column SELECT, and service grading-key column SELECT. A missing or
incomplete revocation never becomes safe because the defaults are recognized.
These are synthetic disposable PostgreSQL17 checks, not new hosted observations.

## Approved duration policy and actual implementation status

Missing current trusted duration must prevent new watch threshold achievement,
advancement and completion. Keep **Lesson Being Prepared**, preserve accumulated
telemetry and historical achievement timestamps, and preserve valid completed
lessons. Restoring trusted configuration allows legitimate progression again.
Preserving history does not grant permission for new progress without current trust.

Exact279 returns early from `course_watch_met` when a stored achievement exists.
The regression earns that achievement through the real authenticated sampling RPC,
then withdraws metadata. Both the next-lesson gate and a fresh completion are
incorrectly allowed. This is now an actual disposable reproduction, not just code
inspection. The ordinary suite remains green because it previously approved this
historical-credit behavior; it does not prove the new policy.

The proposal checks every current active video before consulting stored achievement.
It changes neither the stored evidence nor already-completed status. A second change
is necessary: the existing save RPC uses INSERT ON CONFLICT even for completed rows.
Its INSERT trigger rechecks current watch requirements before conflict resolution,
which would break notes edits after metadata loss. The proposal uses UPDATE for the
already-completed row after all existing ownership/session/revision and immutable
answer checks. No privilege or policy change is involved.

| Focused case | Authoritative279 | Local proposal |
|---|---|---|
|1. Missing duration, no prior evidence | PASS | PASS |
|2. Missing duration, partial evidence | PASS | PASS |
|3. Earned threshold, metadata removed: preserve evidence, deny NEW progression/completion | **FAIL** | PASS |
|4. Valid historical completion remains, including later private-note save | PASS | PASS |
|5. Trusted duration restored, legitimate progress resumes | PASS | PASS |
|6. Forged browser percentage | Denied | Denied |
|7. Seek-to-end | No threshold | No threshold |
|8. Wrong video identity or missing/blank provenance with historical credit | **FAIL** | PASS |

Case8 verifies provider replacement clears old provenance and separately injects
NULL/blank provenance in a rolled-back disposable fixture. It does not claim that a
free-text manager assertion is cryptographic proof of a video's length. The approved
provider inventory and a scoped future operator population/readback remain necessary.
No real member or provider playback was used in these tests.

## Duration inventory and independent gates

**TRUSTED DURATION INVENTORY: PASS.** All13 previously verified values and exact
asset/video/source/timestamp mappings are retained in the [complete inventory](getting-a-grip-duration-inventory-2026-10-01.md).
The machine-readable copy is in this report's evidence directory. No provider was
queried again. Lessons11–13 remain Media Coming Soon.

**TRUSTED DURATION PRODUCTION POPULATION: REQUIRES SEPARATE AUTHORIZATION.**
All13 production values were NULL at the prior read-only observation and no values
were written here. This assignment did not query production again. At274 the new
provenance field is absent. Seal a schema-compatible population order during the
later release review; inventory availability alone does not satisfy that gate.

## Validation and migration integrity

- 578 JavaScript tests pass, including nine focused notes-verifier tests and25
  readiness tests. The guarded test runner and OS outbound-network denial were active.
- All279 authoritative migrations replay;16 SQL/RLS files pass.
- The baseline duration regression explicitly records six passes and two known
  policy failures. The additive proposal passes8/8 cases and three additional
  existing authorization, persistence and private-notes SQL files.
- Exact catalog comparison of the proposal finds only the two intended function
  definition changes. Owners, ACLs, RLS, policies and other targeted catalog fields
  are unchanged. Final private-note privilege verification passes with the overlay.
- Five-stage pinned CLI rehearsal passes for the original, full8 and restricted
  profiles; TLS verify-full/negative certificate checks, drain, failure/rollback,
  disconnect classification and publication concurrency tests pass. All use only
  disposable localhost clusters, with external IP egress denied.
- Supported Webpack build/static export37 pages, TypeScript, Netlify75 modules/
  62 handlers, configured lint and targeted lint pass. No dependency change;
  dependency audit was not repeated for this tooling/proposal-only assignment.
- All279 SHA256 values match the pinned manifest and source commit. In particular,
  migrations275–279 and the actual279 eight-privilege revocation are unchanged.
  The candidate SQL hash is tracked separately in evidence, never substituted into
  an existing migration hash or the279 manifest.

The first full validation invocation exposed the completed-save trigger issue in
the initial proposal. It was corrected; the entire SQL/RLS/replay suite was rerun
successfully, including the new security/persistence checks. Build/type/JS results
remain valid because only proposal SQL/test tooling changed afterward. The evidence
retains the first failure as well as the successful final SQL run.

## Production preservation and limits

No production or hosted-isolated project was accessed or mutated in this local task.
No DB data/schema/privilege write, production duration/content write, migration,
Auth/SMTP/PITR/compute change, Share Library activation, account test, push, merge,
deployment, setting change or environment deletion occurred. Both published sites
and both isolated environments were preserved by taking no actions against them.

Last verified live baseline remains production274, main
`1599ab271e0120a5cdc4e38e225ba749dd214721`, draft/open/unmerged PR4 at eaff3fe,
Netlify production `6abbb27a1cdd6d00081b0e8e`, ChatGPT Site25, Small compute and
seven-day PITR. Local origin/main and origin/development refs remain at those SHAs.
No local main branch was created. PR/site/database/settings are carried-forward
observations, not fresh remote fingerprints or a guarantee against third-party changes.

## Documentation, unresolved work and next recommended build

Updated AGENTS, CURRENT_BUILD_STATE, ARCHITECTURE, SECURITY_MODEL, DECISIONS,
README, the inventory, readiness review, operator sequence and279 runbook. Evidence
is under `docs/evidence/verifier-duration-policy-2026-10-01` with checksums.

The ACL blocker is resolved. The remaining engineering blocker is that the two-function
duration correction is not in the authoritative release chain or remote candidate.
The current279 maintenance readiness correctly pins the old function definitions;
do not bypass it or execute the proposal as undocumented operational SQL.

Smallest next package: integrate and review the additive duration correction as a
new release stage, preserve all279 hashes, revise expected catalogs/readiness and
the operator sequence, reconcile superseded historical-credit test expectations,
and rehearse the complete revised staged release locally. Follow with separately
scoped isolated acceptance and a controlled development checkpoint. Do not merge,
populate production durations or deploy production under this assignment.

Provider stability, release-window operator/authenticated network proof, recovery/
Storage protection, leaked-password remediation and production population remain
separate previously documented gates. They were not reevaluated here.
