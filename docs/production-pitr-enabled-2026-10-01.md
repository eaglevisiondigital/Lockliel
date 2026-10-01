# Production Small compute and seven-day PITR, 2026-10-01

**LOCKLIEL 7-DAY PITR ENABLED AND VERIFIED**

## Authorization and exact changes

User explicitly approved: "Approve Small compute and 7-day PITR." This follows the
quoted Small $0.0206/hour and PITR $0.137/hour (approximately $100/month), before tax.
It supersedes the prior compute prohibition only for Micro-to-Small. All other
production prohibitions remain. Starting development HEAD was
d8375608ff47d8cbb15bc0ad47618c2e6d733648; clean working tree.

Used the official production dashboard for Lockliel Platform,
`bsndfhbemstyrrglajat`, Eagle Vision Digital Pro. The resize confirmation listed only
Micro→Small; estimated compute changed $9.68→$14.83/month (+$5.15), excluding tax.
It warned of automatic restart and potentially longer-than-normal downtime. Confirmed
once around 19:07:40 UTC. Dashboard showed Resizing project, then returned to Small;
MCP reported ACTIVE_HEALTHY before 19:09 UTC. This bounds the observed operation, not
an independently measured service-outage duration. Disk stayed 2 GB/gp3/3000IOPS/125MB/s;
region us-east-1 and PostgreSQL 17.6.1.166 stayed unchanged. No disk resize was selected.

Selected seven-day PITR at the unchanged $100/month dashboard quote. Initial attempts
were not accepted while Supabase processed add-on changes. Fresh readback confirmed
OFF; the next response explicitly requested a one-minute wait. Waited, then submitted
the same seven-day choice. Dashboard confirmed successful update and Enabled at about
19:11 UTC. No alternate retention or billing/plan/Spend Cap change was made.

## Readback and recovery availability

- Compute: Small, 2 GB memory, $0.0206/hour.
- PITR: enabled; maximum retention **7 days**.
- Dashboard says database changes are logged every 2 minutes.
- Display timezone explicitly selected UTC, a presentation-only choice.
- Earliest provider-listed recovery timestamp: **2026-09-24T21:06:12Z**.
- Latest provider-listed recovery timestamp: **2026-10-01T19:11:17Z**.
- Project: **ACTIVE_HEALTHY** after configuration.
- Latest pre-change listed physical backup: 2026-10-01T07:30:56Z.

These are provider-displayed recovery bounds, not a completed restore test or proof
that every point in the displayed range has been exercised. The earliest bound
predates enablement; record it as reported without inventing historical PITR coverage.
Never click Start a restore for verification. No restore was requested.

## Data and settings preservation

Read-only MCP aggregates at 19:06:50.830699 and 19:11:49.743880 UTC matched:

| Item | Before | After |
|---|---:|---:|
| Migration ledger |274|274|
| Profiles / Auth users / enrollments |1 /1 /1|1 /1 /1|
| Courses / lessons / lesson assets |1 /13 /40|1 /13 /40|
| Lesson progress / media progress |0 /0|0 /0|
| Storage objects |13|13|
| Staff roles / payment connections / Share Library assets |0 /4 /3|0 /4 /3|

Last migration remains 20260926212002. Each query used BEGIN READ ONLY, local
lock_timeout=5s, statement_timeout=30s and ROLLBACK. Aggregate parity does not prove
all row contents or Storage bytes identical. No application DML or schema SQL was
executed. Provider-managed backup/WAL work and compute restart are the intended
infrastructure effects, not course/member test writes.

Only the authorized compute and PITR settings were changed. No Auth/SMTP, RLS,
service_role, content, member, staff/payment, Share Library, Storage configuration,
maintenance, region, database version or unrelated setting was edited. No main merge,
push, app deployment, migration, account creation, real-data test, restore or deletion.
Netlify production, Sites25 and both isolated environments were not operated on.
No claim of independently re-auditing every unrelated remote setting is made.

No direct DB session was used. The MCP transaction does not verify the Mac's direct
IPv6/sslmode=verify-full authentication path. Future direct checks must retain the
approved db.bsndfhbemstyrrglajat.supabase.co:5432 endpoint, IPv6, verified TLS,
authentication, read_only=on, 5s lock/30s statement timeouts and no Session Pooler.

## Recovery policy and remaining gates

Approved long-term baseline is seven-day PITR, RPO <= 2 minutes and planned course
maintenance <= 30 minutes. These remain targets, not a restore-time guarantee or measured
RPO result. Before a future migration release, verify a usable fresh UTC pre-cutover
point after the approved write drain. Require an authorized Owner/operator with
verified MFA, recovery factor and restore permission; these capabilities remain
unverified, since a visible Restore button is insufficient evidence.

[Supabase backup documentation](https://supabase.com/docs/guides/platform/backups)
explains that PITR uses physical backups plus WAL and replaces separate Daily Backups.
Do not claim two independent retained Supabase backup systems. Database restore affects
broader platform state, not only courses. No down migration is assumed; committed 275+
may require coordinated database and application recovery. Storage object bytes need
independent protection; future archival/Storage work was not performed.

[Official billing](https://supabase.com/docs/guides/platform/manage-your-usage/point-in-time-recovery)
charges PITR hourly outside the Spend Cap. Quotes are before taxes and not total
organization invoices. No monthly hard spending cap was created.

Provider status remains Partially Degraded Service: API Gateway degraded; Eastern US
latency incident w91bvbjhqf0f identified/unresolved, latest update 2026-09-30T21:26:46.634Z.
Project health does not clear this separate migration gate. No production migration
may run during the unresolved incident. [Provider status](https://status.supabase.com/).

## Evidence and local validation

`docs/evidence/pitr-enabled-2026-10-01/` includes before/after redacted aggregate/project
records, provider status, compute confirmation/applied screenshots, PITR retention and
UTC bounds screenshots, and SHA256 checksums. Screenshots contain no credentials.
Reviewed current official changelog and compute/backups documentation. The recent
Postgres 17.11 breaking changes concern an upgrade, which was neither selected nor
performed. Current database version remains 17.6.1.166.

Checked evidence hash integrity, before/after aggregate equality, targeted credential
patterns and git diff whitespace. Only continuity/recovery documentation and evidence
were changed locally. No app tests, migration replay or production fixture was run
because application and migration source were unchanged. Local documentation is not
pushed. The prior blocked report remains historical, with a superseding notice.

## Smallest next package

A separate final production-readiness package: exact candidate development checkpoint
and CI/preview verification; trusted video durations; separately authorized Auth
remediation; Owner/MFA/recovery capability; independent Storage protection; stable
provider window; fresh direct authenticated verify-full production preflight; and the
reviewed production maintenance/cutover package. Preserve manual legacy tab-close
policy. No migration, deployment, restore or maintenance change is authorized by this
completed compute/PITR assignment.
