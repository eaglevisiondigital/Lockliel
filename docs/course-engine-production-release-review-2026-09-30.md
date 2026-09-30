# Course engine production release review, 2026-09-30

**COURSE ENGINE PRODUCTION RELEASE PACKAGE NOT READY**

Review/preparation only. No production migration, merge, deployment, configuration,
content activation, staff grant, fixture, or account test was performed. Acceptance
infrastructure is retained. This report is not execution authorization.

## Exact source and evidence

- Production: `1599ab271e0120a5cdc4e38e225ba749dd214721`, database
  `bsndfhbemstyrrglajat`, 274 repository versions applied.
- Validated implementation: `91611ad89933333891bdf2bb3791314fdd03012e`.
- Reviewed remote candidate: `a58626b2f0a46b2fad84e1f79e88dbfb13c81a22`.
- Review parent: `766f0f4`, local evidence only. Initial working tree was clean.
- PR4 remains draft/open/unmerged, targets main, auto-merge absent. Both GitHub
  `Lockliel Preview Check` runs 36698905067 / 36698909952 remain successful.
- Isolated project `jxtgtfffdiwzxocxoqxk` has 277 applied entries. Dedicated Netlify
  site `60579b8e-d0ca-4ac1-abe5-7128f4243e8b` remains available.
- Fresh aggregate/catalog evidence: [evidence directory](evidence/course-release-review-2026-09-30).
  Production snapshots span 12:37:01–12:42:29 UTC. They contain no row-level member
  responses, notes, contact information, credentials, or SQL activity text.
- Exact SQL, hash manifest, catalog reference and offline checker:
  [verification directory](../supabase/verification/course-release-277).
  Snapshot fingerprints are comparison aids, not backups or cryptographic attestations.

## 1. Repository to isolated ledger mapping

Repository filenames remain authoritative. Tool-assigned isolated versions are
provenance only and must never replace repository filenames or production versions.

| Ordinal | Repository file | Isolated version / name | Purpose |
|---|---|---|---|
| 275 | `20260929215159_lockliel_course_engine_standard.sql` | `20260930083553` / `lockliel_course_engine_standard` | Course rules, private notes, atomic saves, trusted timing, progression, audit |
| 276 | `20260930092000_lockliel_course_release_trigger_execution.sql` | `20260930091336` / `lockliel_course_release_trigger_execution` | Allow the release trigger to execute its private readiness helper |
| 277 | `20260930092500_lockliel_course_conflict_http_status.sql` | `20260930092041` / `lockliel_course_conflict_http_status` | Return HTTP 409 for stale revision without serialization retries |

SHA256, freshly checked against local bytes and the exact source inventory:

```text
275 2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1
276 83c7ea72d55b518c0ecb3704bc052bbc8be535c9b6b5461a6bf2224f2044b8ed
277 42ca6baea8c16e599f04f5aa52823362b862761943e9e37e4e7ba19c986bcaf0
```

All 274 original hashes match `supabase/verification/release-migrations.json`.
There are exactly 277 migration files, with no hidden fourth pending migration.

### Migration 275 inventory

DDL adds:

- `lesson_assets.duration_verification_source` text, length 10–500 when present;
  source/duration consistency CHECK; existing verified-at consistency remains.
- `courses.learning_rules` non-null JSONB default `{}`; shape CHECK and permanent
  Getting a Grip Watch to Advance / Answer to Complete, sequential 95%, zero score,
  worksheet-required rule.
- `lessons.configuration_version` positive integer default 1.
- `lesson_progress.revision` bigint default 0, `content_snapshot` JSONB default `{}`,
  `watch_requirement_met_at` and `review_approved_at` timestamps.
- `media_progress.last_sample_at`, `last_sample_position`, `sample_session`.
- `public.lesson_private_notes`: composite owner/lesson PK, cascading FK to progress,
  text capped at 12,000, timestamp; RLS and owner/current-active-session SELECT only.
- `app_private.course_answer_keys`: composite lesson/version PK, cascading lesson
  FK, JSON object CHECK; RLS enabled, no anon/authenticated/PUBLIC table grants.
- Two new implicit PK indexes on initially empty tables. No concurrent index build.

Top-level DML is limited to two UPDATEs: label existing non-null durations as
`existing_verified_configuration` (currently **0 rows**) and install Grip learning
rules (currently **1 course**). This does not publish a course, populate timing,
change video IDs or grant a role. No progress/answer/note backfill occurs. Existing
UPDATE triggers may maintain timestamps; future preflight must recalculate impacts.

New RPCs: `lockliel_course_gates()`,
`lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean)`,
`lockliel_sample_media(uuid,uuid,numeric,boolean)`. They use active-session/identity,
enrollment and progression checks; save uses published-course checks, per-lesson
transaction locks, revision comparison, bounded payloads, idempotent retry,
immutable completed answers, and atomic owner notes. Samples use server elapsed
intervals/session identity, not client percentages or browser duration.

Private helpers: `course_watch_met(uuid,uuid)`, `course_lesson_unlocked(uuid,uuid)`,
`audit_learning_configuration()`. Replaced functions:
`normalize_lesson_asset_duration_verification()` and `validate_lesson_completion()`.
All privileged engine helpers/RPCs have an empty search path. Private helpers are
not callable by anon/authenticated; public RPC execution is authenticated only.

Triggers: replace the existing duration-normalization trigger, adding source as a
watched field. Add `audit_learning_course`, `audit_learning_lesson`,
`audit_learning_media`, `audit_learning_duration_source`. Audit records changed
configuration fields/hashes, not private notes or answers. Existing completion and
normalization triggers remain bound to their replaced functions.

Policies: `lesson_private_notes_owner`; four RESTRICTIVE authenticated INSERT/UPDATE
policies `engine_lesson_insert/update`, `engine_media_insert/update`. They block
legacy direct progress writes for configured courses, retaining legacy writes only
for unconfigured courses. This is a behavior change, not merely additive DDL.
Authenticated gets column-scoped INSERT/UPDATE of duration source, subject to existing
staff/MFA RLS, and owner SELECT of notes. No new role, seed, Vault entry or bucket.

No DROP TABLE/COLUMN, DELETE or TRUNCATE. The one DROP TRIGGER is immediately followed
by replacement. It must execute atomically with the rest of 275. Rollback after commit
requires a reviewed compensating migration or recovery; neither is supplied here.

### Migration 276 inventory

ALTER FUNCTION `app_private.validate_course_release()` to SECURITY DEFINER with
empty search path; revoke all execution from PUBLIC, anon, authenticated. Owner is
postgres in both inspected environments. It does not change the trigger signature,
readiness helper, course RLS, MFA requirement, rows, columns, indexes or policies.
No top-level DML/backfill/destructive statement. The isolated invoker trigger had
failed with permission denial calling its private helper. Executing as its controlled
owner resolves that failure while retaining complete publication readiness checks.

### Migration 277 inventory

CREATE OR REPLACE the exact save RPC, replacing business-conflict SQLSTATE `40001`
with `PT409`. A local body comparison verified that is the only function-body change.
It explicitly repeats authenticated EXECUTE and PUBLIC/anon revocation. Runtime
INSERT/UPDATE in the function body is unchanged; defining it does not execute it.
No top-level DML, table/index/policy/trigger changes. This prevents PostgREST retrying
an intentional stale-write conflict as a serialization failure. See the
[Supabase retry guidance](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b).

## 2. Hosted fixes classified

| Defect | Location / repair |
|---|---|
| Stale save retries/timeouts | 277 RPC SQLSTATE plus application journey-handler recognition of PT409 |
| Conflict draft recovery | Application-only autosave controller and lesson UI: retain archived local draft, explicitly adopt cloud revision, resume saving |
| Ready-course publish denied by private helper | 276 trigger execution context; no weakening of release threshold |
| Manager response body consumed twice | Application-only `lockliel-admin-person.mjs`, read enrollments once |
| Incorrect completion denominator/current lesson | Application-only full lesson inventory/manager response and person UI |
| Isolated artifact sign-in/signup support | Acceptance preparation/verification tooling, not production Auth configuration |

## 3. Production compatibility and preservation observations

Fresh production contains one Auth user/profile, one enrollment, no lesson/media
progress, and no audit events. All inspected invalid-duration, question-shape,
duplicate, orphan, enrollment-state, progress-state, completed-timestamp and answer-
shape counts are **0**. Enrollment states are checked against `active/completed`.
All public tables have RLS enabled. Required source tables, duration trigger,
constraints, function signatures and privileges match the recorded 274 catalog.
New table/column/constraint/policy/function/trigger names do not collide. Existing
functions intended for replacement have compatible signatures/owners. No enum change.

The offline helper validates this exact baseline, but it is not a global schema
attestation: target catalogs/functions are enumerated in `snapshot.sql`. It does not
certify unrelated production features. Production and isolated pre-existing function
ACLs are not entirely identical: ten older functions have a production service_role
EXECUTE entry absent in isolated, including deletion helpers, group assignment and
Grip readiness. Function bodies match; ACL ordering differences also occur. These
are outside 275–277 and must be preserved, not copied from isolated wholesale.
`expected-catalog-277.json` includes only the nine intended new/replaced functions.

Across the review interval, ledger, target function/catalog/grant data, protected
row fingerprints, member counts, stats-reset marker and public/Auth/Storage write
counters are unchanged. Target locks, waiters and other active transactions were
empty at both observations. This demonstrates a quiet observation interval, not a
future maintenance window or impossibility of concurrent writes.

Security Advisor now reports **WARN: leaked password protection disabled**. This is
an observed existing Auth setting, not changed by the package. Obtain an explicit
risk disposition or separate authorization for remediation. No Auth setting was
changed in this review.

A focused unverified edge case remains: the media-sampling RPC does not explicitly
filter the enrolled course to published, and the content resolver can fall back to
its original lesson. Existing-enrollment draft/archive transitions were not part of
the supplied hosted matrix. A disposable negative test should establish the intended
publication boundary before release sign-off; do not probe this with real members.
No claim of cross-account access or live exploitation is made.

## 4. Locks and downtime

| Migration | Lock / work | Current impact / estimate |
|---|---|---|
| 275 | ALTER TABLE needs ACCESS EXCLUSIVE; CHECK validation scans; new FK/PK objects and trigger/catalog work; two UPDATEs | Largest affected table including indexes is 122,880 bytes. 1 course update, 0 duration updates. Low work volume, but waits can dominate; no production runtime measurement |
| 276 | Function catalog/ACL update | No table scan/rewrite; expected short catalog transaction, duration unmeasured |
| 277 | Function replacement/ACL update | No table scan/rewrite; expected short catalog transaction, duration unmeasured |

Measured total relation sizes: courses 81,920; lessons 122,880; assets 81,920;
enrollments 65,536; lesson/media progress 24,576 each; audit 98,304 bytes.
Constant defaults on PostgreSQL 17 ordinarily avoid a table rewrite, but constraint
validation still reads rows. See [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/17/sql-altertable.html).
No seconds-level promise is justified before exact-runner rehearsal. Proposed future
limits are lock_timeout 5s and statement_timeout 30s, subject to rehearsal; a timeout
must stop the release, not trigger a blind retry. A controlled quiet/write-pause
window is required for compatibility as well as locking.

## 5. Content and trusted duration

Production has 13 lessons, 13 protected PDF rows with matching Storage objects, and
13 active video rows across lessons 1–10. Lessons 6, 8 and 9 each have two videos;
every required active video needs trusted timing. No video exists on 11–13. All
production duration values are null, so all lessons currently lack complete trusted
watch configuration. Course status is already published; this review did not publish
it. Worksheets contain 20 questions each for 1–4 and one each for 5–13.

After 275, trusted values reside in `lesson_assets.duration_seconds`,
`duration_verification_source`, and server-managed `duration_verified_at`. The
manager endpoint requires an active authorized manager/staff session and MFA/AAL2;
existing RLS plus column grants apply. Source is 10–500 characters; duration is finite,
positive and at most 86,400 seconds. Provider/ref/URL/path changes invalidate timing.
A browser-reported duration is never authority. Configuration can be performed after
engine release under a separate assignment. No staff row currently exists, so any
staff bootstrap is a separately authorized prerequisite to that manager workflow.

`lessonReadiness()` and the server watch gate keep 1–10 at **Lesson Being Prepared**
and 11–13 at **Media Coming Soon**. The first unlocked lesson may retain worksheet
work/notes; sequential advancement and completion remain blocked. Worksheets alone,
forged percentages and absent video cannot meet Model A. Previously earned durable
watch/completion evidence is intentionally retained after later configuration changes;
production currently has no such progress, so that exception cannot grant an initial
completion here. This is safe fail-closed content behavior, not a claim the course is
ready for uninterrupted completion. Release before timing requires an explicit
product decision accepting that blocked experience. Do not waive video requirements.

## 6. Application release scope

The exact production-to-candidate diff is 49 files, recorded with all full commit
SHAs in `evidence/.../application-diff.txt`. Application-bearing commits are
`ca5f09b85fee2689329b716b95d07e199746a6a2`,
`f11a97afb051f9c90b15faca95265698363cfaf1`, and
`91611ad89933333891bdf2bb3791314fdd03012e`. `02062da` adds isolated acceptance tooling;
remaining intervening commits are documentation/continuity.

Runtime changes cover course overview, member guidance/dashboard, lesson workspace
and YouTube interval reporting, persistent save controller/conflict recovery,
safe auth return path, manager content/duration/person UI, journey/admin/readiness/
privacy-export functions, course state/readiness libraries, and worksheet/notes export.
No homepage, public assets, dependencies/lockfile, hosting manifest or CI workflow
change appears in this range. No unrelated visual redesign. Acceptance artifact
transforms are tooling, not part of the normal production build command.

Production homepage currently returns 200, 128,071 bytes, SHA256
`a184c485520cc5fa6bd5cee0b0e47cdaf46575e1e9794f9afa25743466cfbe00`.
Its source/assets are preserved in production commit 1599ab2. Future build output
may change chunk identifiers; require visual/source preservation rather than assuming
future HTML must have this same hash. Current production Netlify deploy remains
`6abbb27a1cdd6d00081b0e8e`; Sites remains active version 25, unchanged timestamp
2026-08-27T22:28:57.301945+00:00. No Sites release is part of this package.

## 7. Required release order and compatibility

**Neither simple rolling order is safe without a coordinated course-write pause.**

- Old app + schema 277: old journey handler directly upserts progress. New restrictive
  policies reject configured Grip writes. Reads may work; autosave does not. This is
  not an acceptable functional fallback.
- New app + schema 274: loader selects new columns/notes and calls absent RPCs.
  It is incompatible. Application-first is rejected.
- Proposed sequence: establish a reviewed, tested maintenance/compatibility mechanism;
  pause affected course reads/writes and drain activity; snapshot/backup; migrate 275,
  verify; 276, verify; 277, verify; release exact reviewed application; check identity,
  backend/read-only behavior and page rendering; require stale tabs to reload; reopen.

No such coordinated pause/stale-client bridge has been demonstrated in this package.
A browser notice alone cannot stop direct authenticated REST or existing in-flight
clients. The preparation package must explicitly cover those routes without bypassing
preview guards or weakening RLS. Do not deploy an improvised maintenance change now.
The existing production autosave bug must not be compounded by an exposed mixed state.

## 8. Backup, recovery and provider health

Refreshed production dashboard lists physical backup **2026-09-30 07:30:55 UTC**, about
5h 11m old at review, with Restore controls. Project/organization identity matched.
This proves backup listing and an available restore entry point, not a restore drill,
current Owner MFA/recovery capability, or zero data-loss recovery. No Restore was clicked.
PITR page says the add-on must be enabled: **PITR is not enabled**.

For this package, require a physical backup no older than 24h AND an explicitly
accepted recovery point relative to the quiet window. A 24h age by itself is
insufficient: there is now a real member/enrollment, and future learning work could be
lost. Recommend PITR reaching the pre-cutover instant, or a verified recoverable
physical snapshot taken after the write freeze plus an approved recovery-point/data-
loss plan. PITR is not syntactically required by these additive migrations, but it is
required if a near-zero-loss rollback is expected and the alternative cannot meet it.
Do not carry forward the old zero-member release's backup waiver. No add-on purchase
or configuration is authorized. Owner MFA, operator recovery and restore permissions
must be freshly checked before execution.

Database backups contain Storage metadata, not object bytes. Preserve protected PDF
objects independently. Restore takes the project offline and restores other database
state, not merely the course engine. See [Supabase backups](https://supabase.com/docs/guides/platform/backups).

Dashboard banner and [Supabase status](https://status.supabase.com/incidents/w91bvbjhqf0f)
show an unresolved Eastern US intermittent latency incident at review. The project is
us-east-1 and reports ACTIVE_HEALTHY; do not equate that with incident resolution.
Require a stable provider/network window before release.

## 9. Future read-only preflight

These are plans, not commands executed against production by a release runner here.

1. Recheck branch/clean tree, exact main/PR4 candidate, draft/merge/auto-merge state;
   compare all filenames and hashes with `manifest.json` and historical manifest.
   `python3 supabase/verification/course-release-277/review.py` does only offline reads.
2. Confirm project ref/name/region, physical backup timestamp and recovery decision,
   Owner MFA/recovery, provider/Netlify health, maintenance mechanism and stale-client plan.
3. Direct endpoint remains `db.bsndfhbemstyrrglajat.supabase.co:5432`. Fresh DNS returned
   `2600:1f18:38df:9500::eef4`; bounded TCP returned **No route to host**. TLS verify-full,
   authentication and startup safeguards were not tested because routing failed.
   MCP query success does not establish direct-runner connectivity. Do not substitute
   the Session Pooler path that previously lost startup safeguards.
4. Future credentialed connection must use hidden input/local protected credential
   handling, `sslmode=verify-full`, trusted CA, hostname verification, connect timeout,
   and startup `default_transaction_read_only=on`, lock_timeout=5s,
   statement_timeout=30s. Assert `current_database()`, `version()`,
   `show transaction_read_only`, `show lock_timeout`, `show statement_timeout` and
   `select ssl,version,cipher from pg_stat_ssl where pid=pg_backend_pid()`.
   TLS acceptance must fail for wrong host/CA in a disposable rehearsal.
5. On that connection run `BEGIN READ ONLY;`, then `snapshot.sql`, then `ROLLBACK;`.
   Export only the snapshot JSON to a protected local evidence file. Run
   `review.py --snapshot PATH --phase 274`. Require exact ledger versions, baseline
   catalog, no new-name collision, all violation counts zero. Non-null duration count
   is an impact count, not automatically a violation; any new values require review.
6. Repeat snapshots after at least 10 seconds. Require same stats-reset marker,
   no unexplained insert/update/delete deltas, no target locks/waiters/long transactions,
   stable protected fingerprints. Do not kill sessions automatically. Recheck sizes,
   enrollment/progress counts, valid PDFs and media/timing readiness.
7. Read Security Advisor and resolve/document every relevant warning. Record staff,
   payment, flags, Share Library, storage and course fingerprints. Compare safe visible
   Auth/SMTP settings without copying passwords; absence of a settings write by this
   agent is not a complete independent settings audit. Keep settings unchanged.
8. Do not proceed if any gate is stale, failed or missing. Review new live rows rather
   than assuming this report's counts still hold.

## 10. New staged runner plan, not an executable release

Do not run the historical 272→274 preparation/release helper for this package.
This review supplies a new exact manifest, SELECT queries and offline checks, not a
production-capable migration executor. Building and rehearsing that executor is a
blocking preparation step, not permission to use the old one.

The new runner must pin exact repository source and the reviewed Supabase CLI 2.118.0
binary/hash (`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`),
or separately review a replacement. Copy the exact repository prefix into isolated
staging directories: 275 files for stage 275, 276 for stage 276, 277 for stage 277.
Hash every copied byte. No seed, extra migration, role import, Vault import, linked-
project fallback, `--include-all` historical replay or isolated ledger renaming.

Before each stage: reconnect read-only and verify the previous exact ledger prefix,
source hashes, backup/identity and expected catalog; calculate exactly ONE pending
repository migration. Stage 275 must only see 20260929215159; stage 276 only
20260930092000; stage 277 only 20260930092500. Require separately authorized execution
scope before creating a bounded write connection. Assert timeout settings on the
actual write connection. Apply only that stage, then close it and reconnect read-only.

Rehearsal must prove migration SQL and its ledger row commit atomically, including
mid-file errors, permission failures, lock timeout, network loss before/after commit,
and rollback behavior. Do not assume CLI transaction behavior without this evidence.
After a failure: stop, establish connectivity read-only, reconcile ledger AND objects.
Absent ledger + absent objects means rolled back; present ledger + matching objects
means committed; any mismatch/unknown state requires investigation. Never retry
merely because the client reported failure. Never auto-restore or drop new objects.

## 11. Stage postconditions

Run `snapshot.sql`, `postconditions.sql`, and offline `review.py --phase N` against
production evidence after each separately authorized stage. The helper is deliberately
not a complete release gate: stage 275/276 save-body hashes and transaction/ledger
handling still require exact local runner rehearsal. Do not feed isolated version
aliases to the production ledger check.

| Stage | Exact expected checks |
|---|---|
| 275 | Ledger 275 ending repository version 20260929215159; all new columns/defaults, 11 new constraints, 5 policies, 4 audit triggers and replaced duration trigger; two new table PKs/FKs/RLS; nine intended function states except later repair changes; save has 40001, not PT409; release validator still invoker; expected Grip rule; notes/keys initially empty; existing progress preserved |
| 276 | Ledger 276 ending 20260930092000; release validator now definer, postgres-owned, empty search path, no authenticated/anon/PUBLIC EXECUTE; all other intended catalogs and data stable |
| 277 | Ledger 277 ending 20260930092500; exact save signature and body reference, PT409 present and 40001 absent; authenticated EXECUTE only; all final catalog reference entries match |

At every stage: all constraints validated, indexes valid, expected triggers enabled,
public RLS enabled, notes owner/current-session SELECT only and no client writes,
grading keys inaccessible, public RPCs not anon executable, no unrelated ACL drift.
Compare the full snapshot to the immediately preceding phase and explain only the
manifested differences. For courses/assets/lessons, compare old-column projections
excluding the introduced columns and expected UPDATE timestamp changes; status,
content, provider/path, enrollment and original data must remain intact. Staff,
payments, flags, Share Library, storage and old ledger entries must match exactly.

`postconditions.sql` verifies rule/source consistency, notes/keys privacy, function
privileges, conflict SQLSTATE, validator context, orphan/negative revision/snapshot
counts and completion-count bounds. It was executed read-only against isolated 277
and all expected checks passed. Do not invoke save/sample RPCs or invalid writes in
production to test rejection. Semantic stale-write/owner/MFA/95% tests remain isolated;
read-only catalog inspection confirms deployed definitions, not a new end-to-end run.

## 12. Future application release verification

Only after schema 277, maintenance readiness, exact reviewed candidate, passing CI and
separate explicit authorization: merge/release the reviewed application, record merge
SHA and immutable Netlify production deploy/build context. Keep maintenance until
backend/catalog and stale-client checks pass. Do not send the isolated artifact to
production or adopt its SMTP/confirmation settings. Main auto-deploy behavior must be
rechecked and accounted for before a merge.

Read-only deployment checks: homepage/source/assets preservation, My Lockliel static
routes, course overview, lesson workspace shells, manager UI shell, mobile/tablet/
desktop layout, CSP/security headers, protected-area noindex, and production function
identity/expected unauthenticated denial. Confirm true production context and correct
backend without guard overrides. Unauthenticated denials alone do not prove member
functionality. Do not open a real signed-in lesson for a supposedly read-only check:
players/autosave may write automatically.

Autosave, notes, refresh/independent-browser restore, 94/95 behavior, missing-media UX,
manager totals/MFA and conflict handling should be rerun on the exact isolated release
artifact before cutover. Production authenticated smoke tests need their own explicit
scope/identity/data rules; otherwise report that limitation instead of inventing a
pass. No real signup, payments, emails, staff bootstrap or Share Library activation.

## 13. Rollback and stop conditions

Before any migration commits: abort and retain existing app/schema 274. After any
migration commits: keep the course paused, capture state read-only and stop on any
unexpected catalog/data/ledger effect. Prefer a separately reviewed forward repair.
No reviewed down migration exists. Restoring the old Netlify application alone after
275 does not repair progress writes. If a full rollback is chosen, coordinate database
recovery to the approved274 recovery point AND old application 1599ab2, then verify
ledger, privileges, content, member data, settings and storage consistency before
reopening. Restore can lose unrelated writes since the recovery point; never infer
permission to do it from migration authorization. After new notes/progress are accepted,
a 274 restore would discard those new rows. Preserve/export recovery evidence securely.

Stop for identity/hash drift, provider incident affecting the path, unknown commit
state, lock/statement timeout, backup/recovery failure, unexplained writes, privacy
or privilege discrepancy, failed app deploy, stale-client losses or guard regression.
Do not force retries, weaken guards, delete acceptance infrastructure or keep reopening
course writes while the app/database versions disagree.

## 14. Confidence and limits

Inherited verified package evidence: 550 JS tests, 277 fresh replay, 14 SQL/RLS files,
Webpack/static build, TypeScript, Netlify validation, configured lint and zero production
dependency vulnerabilities. Fresh remote check status matches that candidate. This
review did not rerun the entire unchanged application suite or production fixtures.
It validated new SELECT queries against production 274 and isolated 277, exact hashes,
catalog expectations, preservation snapshots and the offline checker including failure
cases. See the isolated acceptance report for real Auth/PostgREST/RLS/RPC, autosave,
A/B notes privacy, manager AAL2, stale conflicts, timed 94/95 and responsive evidence.

Still external/manual: final videos 11–13, authoritative production durations, physical
AirPlay/Chromecast, physical mobile keyboard, production release, operator recovery,
new staged runner failure rehearsal and the coordinated maintenance transition.

## 15. Release gates at review

| Gate | Result | Evidence / remaining requirement |
|---|---|---|
| A: migrations reviewed / compatible | PASS for inspected274 schema/data | Exact mapping/hashes, zero violations/collisions. Publication-transition edge case still needs focused disposable verification before full security sign-off |
| B: acceptable physical backup/recovery | FAIL / incomplete | Fresh physical backup exists, PITR off; current recovery-point acceptance and operator MFA/restore capability not established |
| C: direct DB safeguards | FAIL | IPv6 resolves, no route; TLS/auth/startup safeguards unverified |
| D: clean release preflight | FAIL / incomplete | Current data/catalog compatible and interval quiet; provider incident, Security Advisor warning, future quiet window and settings comparison unresolved |
| E: exact app scope | PASS | Production 1599ab2 to candidate a58626b, runtime 91611ad; 49-file inventory, homepage/config/dependency preservation |
| F: rollback plan recorded | PASS for plan only | Coordinated app+database recovery specified; execution/recovery rehearsal still required under B and transition gate |
| G: missing content/duration states | PASS | Current zero-progress state fails closed; product must accept blocked progression if timing remains absent |
| H: exact validated PR4 head | PASS | Draft/open/unmerged a58626b, both CI successful; recheck immediately before any later release |
| Additional transition/runner gate | FAIL | No demonstrated course-write pause/stale-client bridge or exact staged failure/recovery rehearsal |

**Next smallest action:** a local/disposable release-transition preparation package.
Prove the old/new mixed-state behavior, publication-transition negative case, implement
and rehearse a minimal course maintenance/compatibility mechanism and staged 275–277
runner, and refresh the review. Separately restore direct IPv6 and obtain the backup/RPO,
operator recovery, existing Auth warning and blocked-content decisions. No production
release is recommended until every required gate is satisfied.

## Chat handoff: decisions before the next package

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Lockliel course-engine production review is complete locally and NOT READY for
release authorization. Candidate is a58626b (implementation91611ad); production is
main1599ab2/database274. No production changes occurred. All original274 hashes are
intact.275–277 are compatible with inspected data, but old-app/new-schema saving and
new-app/old-schema loading are incompatible.

Please decide these exact release requirements:

1. Approve a short coordinated course maintenance window plus stale-tab protection,
   or require a compatibility bridge that avoids that interruption. Recommended:
   a bounded, honestly communicated maintenance window with disposable rehearsal;
   scope must cover direct authenticated writes and in-flight clients, not only UI.
2. Set acceptable recovery-point loss and downtime. Recommended: near-cutover PITR
   or a recoverable physical snapshot after freeze. A daily backup may lose real
   member changes; accepting that loss must be explicit. PITR enablement/cost would
   require a separate assignment and has not occurred.
3. Decide whether to release the engine with honest blocked progression until trusted
   durations are configured, or wait for timing on all active videos1–10. Lessons11–13
   retain their permanent video requirement in either option. Recommended: complete
   trusted timing before reopening the course unless blocked UX is explicitly accepted.
4. Resolve the existing leaked-password-protection warning by separate Auth remediation
   authorization or documented risk acceptance. Do not bundle an Auth change implicitly.

Then assign Codex a local/disposable release-transition preparation package: verify
publication-state sampling behavior, implement/rehearse the smallest approved pause or
bridge and a new exact275–277 staged runner with failure/commit-state detection, refresh
release gates, and report. Keep all277 existing migration bytes unchanged; if a fix
needs schema changes, propose a new migration and re-review the complete set. No push,
production migration/merge/deploy/settings change, real-member testing, or acceptance
cleanup is authorized by this handoff. DirectIPv6 connectivity and operator recovery
must be verified before any later execution assignment.
