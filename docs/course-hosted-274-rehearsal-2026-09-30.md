# Full hosted 274 to 278 cutover rehearsal: connectivity blocked

> Superseded continuation: see `course-hosted-275-stop-2026-09-30.md`.
> Connectivity is restored, migration275 applied, exact verifier UNKNOWN_STOP,
> maintenance ON. Do not use the historical resume instructions below.

Assignment: user handoff85eb986b, 2026-09-30. Inspected localHEAD
e71fbeda62909a68460a0db484153fa66ac3a686, development branch lockliel-backend-v1.
**FULL HOSTED COURSE CUTOVER REHEARSAL FAILED**: execution prerequisites are missing;
no migration or hosted runtime change was attempted. This is not a migration failure.

## Verified clean hosted starting state

- Branch course-cutover-rehearsal-274, ID7091bfd6-83ce-4c11-ac30-8ce85e09be2d.
- Project qjksggxorghaxvpyslip, parent bsndfhbemstyrrglajat, with_data=false.
- Branch status FUNCTIONS_DEPLOYED, preview_project_status ACTIVE_HEALTHY.
- Read-only SQL: PostgreSQL17.11, exactly274 migrations, first20260924211046,
  last20260926212002. Sorted-version MD5ec740c82caa10ffea369a8c2dcc44865 matches
  the original274 repository manifest.
- No Auth members, profiles, enrollments or progress. Migration-seeded baseline
  contains1 course,13lessons,40assets. No cutover status hook installed.
- get_project returned Project not found for the branch ref, but list_branches and
  successful branch SQL confirmed identity/health/ledger. Do not infer a missing
  branch or create a duplicate from the generic get_project response.
- Existing acceptance jxtgtfffdiwzxocxoqxk was not modified or deleted.

## Concrete blockers and required user action

The pinned CLI is not signed in. Its read-only branches get command returned
Access token not provided. No branch credentials were retrieved or exposed.
Use the existing pinned binary's browser login, not a password/token pasted into
chat. The CLI is not on the shell PATH; exact command:

```sh
/private/tmp/lockliel-npm-cache/_npx/a1b5715b105835db/node_modules/@supabase/cli-darwin-arm64/bin/supabase login
```

DNS resolves db.qjksggxorghaxvpyslip.supabase.co to IPv6
2600:1f18:4850:7c01:a8d4:c050:50de:3ade. A bounded direct TCP5432 probe returned
No route to host. Initial system resolver lookup failed; explicit DNS lookup
succeeded. TLS and database authentication were not reached. Connect this Mac to
the previously working T-Mobile iPhone hotspot, disconnect conflicting Ethernet/
Wi-Fi, and retest the exact isolated endpoint. Do not substitute Session Pooler or
MCP apply_migration for the explicitly required direct pinned CLI staged runner.

User questions for hotspot readiness and CLI login are pending. No org/cost approval
is needed to create this branch: it now exists and is explicitly authorized. Earlier
reports describing a missing second branch are superseded.

## Prepared independent work

Prepared and verified sealed workdirs /private/tmp/lockliel-hosted274-stages/275,
276,277,278. Each has the exact historical prefix plus one next candidate, seeds
disabled, no roles/Vault. This is local preparation, NOT a hosted dry-run/apply.
Pinned CLI2.118.0 binary SHA256 matches
8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4.
All278 file hashes and manifest source checks pass; no migration bytes changed.

The current runner permits only localhost and the production direct hostname.
Before isolated execution it needs a narrow reviewed allowlist addition for this
specific new branch, plus tests. No hostname guard has been bypassed or altered.
The requested runtime must use reviewed application source with explicit isolated
configuration. The previous acceptance source-replacement packager is not proof of
an untransformed candidate and will not be silently reused as such.

Production1599ab2 source review reconfirms old worksheet fetch failures are ignored,
old drafts stay in memory, and media sends continue periodically while visible and
playing. A server response cannot retrofit stop/reload handling into those old
scripts. The approved copy-and-close policy remains mandatory. Do not claim the
original stale-tab retry criterion passed without the requested hosted observation.

## Validation rerun

Full guarded npm test:556 JavaScript tests and supported webpack/static build PASS.
Disposable PostgreSQL17:278 replay and15 SQL/RLS files PASS. TypeScript, Netlify
validation and configured lint PASS. Production dependency audit0 vulnerabilities.
No source/dependency/hosting/workflow changes. No push or new CI runs needed for
this read-only starting-state investigation.

## Execution coverage

Old-app deploy and synthetic accounts: NOT STARTED. Maintenance/drain: NOT STARTED.
Stages275,276,277,278: NOT APPLIED, no hosted dry-run. Candidate deploy, stale/fresh
browser acceptance, maintenance exit and new hosted failure coverage: NOT RUN.
All previous retained278/disposable evidence remains separate and is not substituted
for the missing clean274 hosted sequence.

## Remote and production preservation

Fresh remote reads: main1599ab271e0120a5cdc4e38e225ba749dd214721 unchanged; development
3a7b7b9e647739e72746f9ff2cb6602b1e06ff8d unchanged. PR4 draft/open/unmerged,
auto-mergeNULL. Last verified production database274, Netlify6abbb27a1cdd6d00081b0e8e
and ChatGPT Site25 are carried forward from the immediately preceding verified
checkpoint; not freshly re-inspected in this blocked execution. No production DB
write, migration, deployment, Auth/SMTP, staff/payment/content/settings/permissions
or Share Library change was performed. No real-data tests. Neither branch deleted.

## Release gates

PASS means evidence exists at the stated scope; FAIL includes unverified/pending.

| Gate | Status | Scope |
| --- | --- | --- |
| A Exact migrations | PASS | Local hashes/replay, prior staged disposable compatibility |
| B Hosted maintenance | FAIL | Not installed/proven on new274 branch; prior278 evidence only |
| C Original stale-client transition | FAIL | Not run |
| D Hosted274 drain | FAIL | Not run; prior disposable drain evidence retained |
| E Staged runner | FAIL | Hosted route/auth missing; prior disposable pass retained |
| F Hosted failure coverage | FAIL | Not run |
| G Duration inventory | PASS | Prior complete13-asset inventory |
| H Trusted production durations | FAIL | Last verified13NULL; no values written |
| I Lessons11–13 pending | PASS | Prior verified pending state preserved |
| J Leaked-password protection | FAIL | Prior warning unresolved |
| K Recovery/PITR | FAIL | No verified PITR/equivalent recovery point |
| L Owner MFA/restore access | FAIL | Fresh verification required |
| M Direct IPv6 | FAIL | New isolated endpoint currently has no route; production not retested |
| N Provider/network stability | FAIL | Current network cannot execute direct rehearsal |
| O Exact candidate/CI | PASS | Prior exact3a7b7b9 remote CI; new hosted candidate not deployed |
| P Rollback plan | PASS | Documented plan; live recovery prerequisites remain FAIL |
| Q Preservation | PASS | No hosted mutation; remote refs unchanged; prior production identities retained |

## Resume

After hotspot and CLI login confirmation, retest direct isolated TCP/TLS/auth with
verify-full,5s lock and30s statement limits, retrieve branch credentials privately,
reconfirm exact274 ledger, then continue synthetic baseline and original-app setup.
Do not skip the original274 app stage or use migration aliases. No production release.
