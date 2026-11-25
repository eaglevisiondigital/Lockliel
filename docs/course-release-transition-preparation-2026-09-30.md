# Course release transition preparation: Part A stop

**COURSE ENGINE RELEASE TRANSITION PREPARATION INCOMPLETE**

Starting commit: `c6b7be445bfb6af39330baa09cf2b9b709d9d615`, branch
`lockliel-backend-v1`, initially clean. Reviewed application remains `91611ad`, remote
candidate `a58626b`, production baseline last verified as main `1599ab2` / database 274.
This assignment made no calls to either hosted database or hosting configuration.
No production migration, application release, Auth/SMTP/content/staff/payment change,
PITR action, remote push or acceptance cleanup occurred.

## Explicit stop condition reached

The user's attached assignment, Part A, states:

> if schema change is truly required, STOP and propose migration 278 for separate review

The publication-state defect is in PostgreSQL function
`public.lockliel_sample_media(uuid,uuid,numeric,boolean)`, introduced in immutable275.
It is SECURITY DEFINER, directly executable by authenticated clients. Its canonical
selection checks enrollment and lesson gates, but not the enrolled course's publication
status. The existing content resolver can return a published translation for an
unpublished canonical course, or fall back to the original unpublished lesson.

Correcting this PostgreSQL function is a database-definition change that must be
recorded in a new migration. Editing a Netlify function, browser UI or maintenance
banner cannot close authenticated direct `/rest/v1/rpc/lockliel_sample_media` calls.
Changing existing275–277 is prohibited. Revoking RPC access or replacing the function
out of migration history would also be a database change, not an application-only fix.
Supabase documents both remote database-function access and invoker/definer execution
in its [database-function guide](https://supabase.com/docs/guides/database/functions).

Implementation stopped here. No migration 278 was created or applied. This follows
the explicit task boundary, not an inferred approval requirement from a skill.

## Disposable reproduction and controls

The diagnostic is preserved at
`supabase/verification/course-release-277/publication-state-diagnostic.sql`.
It was temporarily copied into the supported SQL suite, run through `npm run test:sql`,
then removed from `supabase/tests`. The runner creates a private socket-only PostgreSQL17
cluster, discards database connection credentials, checks cluster identity, replays
all 277 files, rolls each fixture back and removes its own cluster. No hosted fixtures.

**Diagnostic success means the vulnerability reproduced, not that the security
requirement passed.** This known-vulnerability assertion is intentionally outside
the ordinary test suite. After an approved correction, convert it to denial/no-write
regressions in the regular suite.

All identities, courses, videos and timing values were synthetic. Fixture-owner setup
represented 94% earned while the course was published. The authenticated RPC then
attempted the next timed sample after a publication transition. Positive controls
ensure the test exercises real progress calculation rather than a mocked handler.

| Scenario | Observed result | Assessment |
|---|---|---|
| Published canonical course, prior enrollment | Authenticated timed sample moves 94%→95%, persists achievement, internally unlocks next lesson | Expected positive control |
| Published canonical and published preferred translation | Same correct positive behavior through translated media | Expected positive control |
| Previously enrolled canonical course becomes draft | Direct sample still moves 94%→95%, persists watch timestamp, internally unlocks next lesson | FAIL |
| Previously enrolled canonical course becomes archived | Same unauthorized new progression | FAIL |
| Canonical becomes draft, preferred translation stays published | Translated direct sample still grants canonical watch achievement and internal advancement | FAIL |
| Canonical becomes archived, preferred translation stays published | Same unauthorized new progression | FAIL |
| Canonical published, preferred translation draft | Resolver falls back to canonical; attempting unselected translated asset is rejected | Expected negative control |
| Both canonical and translation draft | Resolver falls back to original lesson; sampling a new canonical video creates a media-progress row | FAIL |
| Course status `inactive` | Database CHECK rejects it; supported states are draft/published/archived | Not a supported state |

For unpublished canonical cases, `lockliel_course_gates()` correctly returns an empty
list and `lockliel_save_lesson()` correctly rejects saving. Those controls do not undo
the media RPC's new durable achievement. The diagnostic proves internal unlocking;
it does not claim an unpublished lesson became visible in the UI or a worksheet
completion succeeded. There is no claim of cross-account data exposure.

## Minimal migration 278 proposal, not implemented

Scope: replace only the media-sampling RPC's eligibility resolution unless focused
regression/concurrency tests demonstrate a necessary shared-helper correction.

Required contract:

1. Retain current expected-user, active Auth session, enrollment, progression,
   input-bound, trusted timing and server-interval protections.
2. Require the enrolled canonical course to be published and enrollment eligible.
3. Resolve the learner's current eligible content and require its owning course to
   be published as well as the media asset active. An unpublished fallback is not
   eligible merely because the resolver returned an ID.
4. Reject before any media/progress INSERT/UPDATE when eligibility fails. A valid
   published canonical fallback may remain usable when a translation is unavailable.
5. Test publication transitions concurrent with samples. Define a transaction ordering
   that prevents a sample from earning new credit after a committed unpublication;
   review narrow row locking if necessary rather than assuming a pre-write SELECT
   eliminates a race. Preserve legitimate already-earned historical achievements.
6. Preserve the exact RPC signature, role grants, SECURITY DEFINER constraints and
   empty search path. Do not add new privileges, tables, roles or content activation.
7. Add regular SQL denial/no-write tests for all diagnostic cases, eligible published
   cases, active-session/account boundaries and concurrency. Retain95% rules, privacy,
   translation behavior and existing hosted acceptance guarantees.

Generate the actual filename with the pinned CLI only after separate authorization.
All 277 existing migration bytes must remain unchanged. If approved, the release set
becomes275–278: explicitly revise the release manifest, final-ledger expectations and
staged runner assignment. **Do not silently append a fourth migration to a275–277
runner or describe schema277 as the final safe release target.** Re-review the complete
set and revalidate the corrected isolated application/database combination.

## Accepted Primary Chat decisions carried forward

- Short course-specific coordinated maintenance window, not a large compatibility
  bridge. It must cover direct authenticated APIs/RPCs, in-flight writes and stale tabs.
- Near-zero-loss recovery is required. PITR reaching immediately before cutover is
  preferred, or an explicitly accepted equivalent. No purchase/enablement now.
- Do not reopen the rebuilt Grip course until every current required active video in
  lessons 1–10 has authoritative duration/provenance. Lessons 11–13 remain Media Coming
  Soon and retain their permanent required-video rule.
- Resolve leaked-password protection before production authorization, under a separate
  Auth assignment. No Auth change is included here.

Proposed maintenance copy for later implementation:

> Getting a Grip is being updated. Your saved progress is safe. Please check back in
> a few minutes. Keep this tab open if you have unsaved changes.

This copy is not deployed. Do not promise unsaved work is safe until the stale-client
and pending-draft preservation behavior has been proven.

## What was and was not completed

| Requested work | State |
|---|---|
| A: publication-state verification | Completed; unsafe behavior proven, database migration required |
| B–C: maintenance and stale-client mechanism | Not implemented or rehearsed because Part A requires STOP |
| D–F: new staged runner, failures, actual-connection/TLS safeguards | Not built or rehearsed; prior review plan is not executable release evidence |
| G: IPv6 plan | Existing known-good hotspot path remains the later fallback; no new production connection attempted |
| H: final duration inventory/provider verification | Not performed after stop; prior13-active-video/null-duration finding remains historical evidence |
| I: separate Auth remediation details | Requirement recorded; full setting/impact verification deferred |
| J: current PITR/cost/operator verification | Requirement recorded; not newly verified, no purchase/configuration |
| K: maintenance copy | Draft only, no UI change |
| L: full validation | SQL replay and diagnostic completed; full application validation deferred, no app implementation changed |
| M: documentation | Updated continuity/runbook/review documents and concrete migration proposal |

## Validation and preservation

- All 277 authoritative migrations replayed successfully in disposable PostgreSQL17.
- Existing14 SQL/RLS files passed, plus the temporary diagnostic (15 files total).
- The diagnostic contains 6 timed positive/reproduction scenarios, translation fallback
  controls, unpublished save/gate controls and unsupported-state verification.
- First sandbox attempt could not allocate PostgreSQL shared memory. The approved
  local-only run outside that sandbox completed successfully. This was not a database
  authentication or SQL failure.
- All 274 historical and all 3 candidate hashes remain unchanged; checked by the offline
  manifest verifier. No application, dependency or hosting files changed.
- JavaScript/build/TypeScript/Netlify/lint/audit were not rerun after the explicit stop.
  Prior550-JS/277-replay/14-SQL candidate results are historical, not a new full-package pass.
- No production or acceptance service was mutated or cleaned up. Production274/main/
  Netlify/Sites25 preservation is based on no actions in this assignment and the last
  review's observations, not a new remote snapshot.

## Refreshed release gates

| Gate | Result |
|---|---|
| A: complete migration/security readiness | FAIL: published-state RPC defect confirmed;278 approval required |
| B: near-zero-loss recovery | NOT VERIFIED; explicit requirement recorded |
| C: direct TLS/auth/safeguards | NOT VERIFIED this assignment; prior no-route finding remains |
| D: final production preflight/Auth remediation | NOT VERIFIED; no production settings changed |
| E: exact app scope | Existing candidate identified; unchanged, but insufficient with unsafe RPC |
| F: rollback execution readiness | Prior plan only; no new failure/recovery rehearsal |
| G: content readiness before reopening | FAIL on last verified state: required video durations absent |
| H: corrected validated candidate | NOT AVAILABLE until approved fix and validation |
| Maintenance/stale-client/runner transition | NOT IMPLEMENTED / NOT REHEARSED |

## Copy-and-paste assignment for Primary Chat

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Codex completed Part A of course-release transition preparation and stopped at the
explicit migration boundary. Disposable PostgreSQL tests proved that the authenticated
media-sampling RPC can award new watch credit and durable advancement after an enrolled
canonical course becomes draft or archived, including through a published translation.
Application-only guards cannot protect direct Supabase RPC calls. Production is untouched;
all 277 migration files remain unchanged. No migration 278 exists yet.

Recommended decision: authorize one minimal new migration 278 replacing media-sampling
publication eligibility, with no history edits, no production execution, no new staff/
Auth/settings/content changes and no acceptance cleanup. Require the scenario matrix
above and publication-change concurrency regressions, preserve valid published fallback
and historical earned progress, and retain all existing privacy/timing/session guards.
If approved, explicitly expand release preparation from 275–277 to 275–278 and refresh
its exact manifest, stage checks and final-ledger target before continuing maintenance,
stale-tab, runner/failure, trusted-duration, Auth and PITR preparation.

Alternative: withhold278 and keep the course release blocked. An application-only fix
or releasing the current 277 schema would leave the reproduced direct-RPC defect open.
Do not authorize production release as part of this correction. Return a separate scoped
Codex assignment, then resume the remaining preparation with the corrected release set.
