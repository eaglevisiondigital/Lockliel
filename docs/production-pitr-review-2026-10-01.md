# Production PITR configuration review, 2026-10-01

## Recovery configuration completed, 2026-10-01

The later explicit Small-compute/PITR approval was executed and verified. See
`production-pitr-enabled-2026-10-01.md`: production now uses Small with seven-day PITR,
ACTIVE_HEALTHY, unchanged version/region and 274 migrations. Dashboard UTC window
was 2026-09-24 21:06:12 through 2026-10-01 19:11:17. This supersedes the OFF/Micro
blocker below, not the separate release gates. No restore, migration or deploy occurred.
RPO <= 2 minutes and planned course maintenance <= 30 minutes are targets. Before
cutover recheck the usable pre-cutover point, Owner/MFA/restore rights, independent
Storage protection, provider stability and the remaining application/security gates.

**LOCKLIEL PITR NOT ENABLED / REQUIRES ACTION**

## Scope and result

Started from clean development HEAD `332f03097cbaffbbf27f1797eb78a79f540ee93b`
on `lockliel-backend-v1`. The assignment authorized only seven-day production PITR,
explicitly prohibited compute changes, and required stopping for unsupported billing
or plan confirmation. No hosted configuration was saved. The unsaved seven-day
selection was cancelled and the add-on read back DISABLED.

## Current before and after state

- Project: Lockliel Platform, `bsndfhbemstyrrglajat`, us-east-1,
  PostgreSQL 17.6.1.166, ACTIVE_HEALTHY before and after.
- Organization: Eagle Vision Digital, `exvcwjbzbhckgtowsdiw`, Pro plan.
- Compute: Micro / t3.micro, 1GB, selected rate $0.01344/hour.
- PITR: OFF. No configured PITR retention or earliest/latest recovery timestamps.
  Approved seven-day retention is a desired policy, not an enabled setting.
- Latest listed physical backup: 2026-10-01 07:30:56 UTC. Scheduled backup history
  and Restore controls are visible. No Restore action was clicked.
- Owner role, current dashboard MFA assurance, recovery factor and actual restore
  authority are NOT VERIFIED by seeing a Restore button. No credentials were read.

## Exact blocker and cost

[Supabase backup documentation](https://supabase.com/docs/guides/platform/backups)
requires at least Small compute for PITR. Current Micro does not meet that published
prerequisite. The dashboard allowed an unsaved seven-day selection, but this is not
proof that Micro is supported. Do not confirm it, attempt an implicit upgrade, or
change compute under this assignment.

The official dashboard quote is $100/month before applicable taxes for seven days.
It states hourly proration and billing at cycle end. Small compute is displayed at
$0.0206/hour, versus current $0.01344/hour. At 730 hours, Small is about $15.04 total
compute, approximately $5.23 more than Micro; PITR is additional. These are planning
estimates, not the organization's total invoice or a guaranteed tax-inclusive cap.
Credits and other projects are not evaluated.

[Official PITR billing](https://supabase.com/docs/guides/platform/manage-your-usage/point-in-time-recovery)
lists $0.137/hour, approximately $100/month, bills each started hour and excludes
PITR from Spend Cap protection. A new decision must explicitly address Micro-to-Small,
the recurring charges/spending limit, and a separately reviewed timing/availability
plan for any compute resize. No resize was staged or executed and its operational
impact has not been rehearsed here. No charge was initiated.

## Approved recovery policy, implementation pending

- Production PITR retention: **7 days**, approved target; currently OFF.
- Target RPO: **at most 2 minutes**. This is an objective, not verified loss tolerance.
- Planned course maintenance target: **at most 30 minutes**. This is not a guarantee
  of Supabase restore duration or an automatic deadline to reopen unsafely.
- Recovery operator: an authorized Owner/operator with verified MFA, restore rights,
  securely held recovery factor and available recovery arrangement.
- Before migration release: independently verify a usable UTC pre-cutover recovery
  point after the approved write drain, its coverage and acceptable whole-DB loss.
- A database restore affects broader platform state, not just course tables. There
  is no assumed down migration. After committed 275+, rollback may require coordinated
  database recovery and application recovery; restoring only old 1599ab2 is incompatible.
- Storage object bytes require independent protection. DB backups cover metadata.
  No independent archive, Storage backup, restore or destructive drill was performed.

Supabase states PITR replaces separate Daily Backups with its physical-backup and WAL
recovery mechanism. Therefore the approved long-term model must not be represented as
PITR plus two independently retained Supabase backup services. Regular managed backup
protection remains part of PITR; independent long-term archival and Storage-object
protection are future work. Verify actual retained backups/window after enablement.

## Read-only preservation

MCP aggregate reads at 18:58:12 and 18:59:22 UTC matched:

| Item | Before | After |
|---|---:|---:|
| Migration ledger |274|274|
| Profiles / Auth users / enrollments |1 /1 /1|1 /1 /1|
| Courses / lessons / lesson assets |1 /13 /40|1 /13 /40|
| Lesson progress / media progress |0 /0|0 /0|
| Storage objects |13|13|
| Staff roles / payment connections / Share Library assets |0 /4 /3|0 /4 /3|

Last ledger version remains 20260926212002. Both transactions were READ ONLY with
lock_timeout = 5s and statement_timeout = 30s, followed by ROLLBACK. These aggregate counts
are preservation evidence, not proof of row-by-row or object-byte identity. No schema,
data, migration, Auth/SMTP, RLS, service_role, Storage, staff/payment, Share Library,
maintenance, compute, version, region or other hosted setting was changed by this task.
No push, merge, deploy, member test, restore or deletion occurred. Both published sites
and isolated environments were outside the mutation scope and were not changed.

No direct database session was attempted in this task. MCP is not evidence of direct
IPv6/libpq verify-full authentication. The earlier review's verified TLS handshake
does not complete that release gate. Any future direct check must use only
`db.bsndfhbemstyrrglajat.supabase.co:5432`, IPv6, sslmode=verify-full, authentication,
read_only=on, lock_timeout = 5s, statement_timeout = 30s; no Session Pooler.

## Provider gate

Fresh public status feed reports Partially Degraded Service; API Gateway degraded,
incident `w91bvbjhqf0f`, Intermittent latency in Eastern US, identified/unresolved,
last updated 2026-09-30T21:26:46.634Z. Project ACTIVE_HEALTHY does not clear the regional
gate. No production migration may proceed during this unresolved incident.
[Provider status](https://status.supabase.com/).

## Evidence and validation

`docs/evidence/pitr-review-2026-10-01/` contains redacted project/organization and
before/after counts, provider summary, dashboard screenshots and SHA256 checksums.
Only documentation/evidence changed. Documentation diff/whitespace and evidence hashes
were checked; application tests/replays were not rerun for this documentation-only stop.
No production fixtures, secrets, connection strings or member rows were exported.

## Smallest next decision

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Project Lockliel, production Supabase bsndfhbemstyrrglajat. Seven-day PITR was not
enabled: current Micro fails Supabase's published Small minimum and the assignment
prohibited compute changes. Decide whether to authorize a separately reviewed
Micro-to-Small resize and recurring seven-day PITR billing. Dashboard rates are
Small $0.0206/hour and PITR approximately$100/month ($0.137/hour), before applicable
taxes; PITR is outside Spend Cap. Specify a spending limit and acceptable resize
window/availability conditions. Alternative: defer both changes, leaving PITR OFF and
the production release blocked. Do not waive near-zero-loss recovery or silently
substitute daily backups. Preserve all existing no-migration/no-deploy/no-restore,
Auth/SMTP/RLS/content/member/staff/payment/Storage/maintenance restrictions. After any
separately approved configuration, verify health, enabled 7-day retention, usable
recovery bounds, 274 ledger and aggregate preservation. Only then return to final
readiness covering trusted timings, Auth remediation, Owner/recovery capability,
provider stability, direct verified authentication and exact candidate CI/preflight.
