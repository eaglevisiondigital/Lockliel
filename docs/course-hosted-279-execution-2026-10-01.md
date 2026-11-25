# Isolated migrations 276–279 execution result

**ISOLATED 276–279 VERIFIED; MAINTENANCE ON**

## Authorization and scope

Dave explicitly approved: “Approve isolated 276–279. Proceed in order on
`qjksggxorghaxvpyslip` only. Keep maintenance ON. Do not replay275. Do not touch
production.” That confirmation supersedes the previous automatic-review block.
The authorized sequence is now consumed. No further migration, operational change,
deployment, reopening, push, production release or cleanup is implied.

Repository branch: `lockliel-backend-v1`. Clean execution parent:
`0f73571ad552a226f00592ac99d4a663d3e82f46`. Validated tooling commit:
`63159f3139fd01bda157deafac02b5fe141a2162`. Migration source anchor:
`a2254aaa3890e2aff7c51b9c84c45021a7b7ba20`.

## Executed and verified

Read-only inspection first reconfirmed the existing275 ledger, exact reviewed
catalog/default ACLs and closed maintenance. Migration275 was not replayed.
The wrapper pinned `db.qjksggxorghaxvpyslip.supabase.co:5432`, sealed source hashes
and Supabase CLI2.118.0 with its reviewed binary hash. Each CLI plan exposed exactly
one next migration. Each was executed once, then independently inspected using
fresh read-only TLS verify-full connections before proceeding.

| Stage | Repository version | Result | Ledger after | Maintenance |
| --- | --- | --- | --- | --- |
| 276 | 20260930092000 | COMMITTED, exact catalog and postconditions PASS | 276 | ON |
| 277 | 20260930092500 | COMMITTED, exact catalog and postconditions PASS | 277 | ON |
| 278 | 20260930145334 | COMMITTED, exact catalog and postconditions PASS | 278 | ON |
| 279 | 20261001133500 | COMMITTED, exact catalog and postconditions PASS | 279 | ON |

All four CLI processes succeeded. No execution retry, alias substitution, seed,
account creation, real-data testing or hosted destructive privilege probe occurred.
All279 local migration hashes remained pinned and unchanged, including historical
1–278. Full filenames and SHA256 values are preserved in the execution evidence.

Final additional read-only check matched the just-verified279 catalog. Connections
reported PostgreSQL17.11, TLS1.3, transaction_read_only=on, lock_timeout=5s and
statement_timeout=30s. Final status:

```json
{"paused":true,"protocol":"278-v1","schemaReady":false}
```

## Security result

Migration279 removed the inherited unnecessary service_role notes privileges.
Final effective table/additive-column checks cover all eight privileges for anon,
authenticated and service_role on notes and private grading keys. The only allowed
entry is authenticated SELECT on notes. PUBLIC grants are zero; service_role has
zero notes privileges. Notes and keys retain RLS. Exact catalogs preserve owner,
policies and other objects outside each migration's intended delta. Learner saves
retain the postgres-owned RPC and explicit identity/session/enrollment/revision
checks. No live learner save was performed in this execution.

The read-only isolated security advisor returned two no-policy INFO findings for
intentionally private keys/control tables, four authenticated SECURITY DEFINER
warnings for the intended status/gates/media/save RPCs, and the known disabled
leaked-password-protection warning. This is not an all-clear Auth audit. No Auth
setting was changed. Advisor timestamps are service-reported and may precede this
execution; direct catalog and privilege checks above establish the final DB result.
See [RLS advisory guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
[SECURITY DEFINER advisory guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Validation and evidence

This assignment executed the already fully validated package. It did not change
application or tooling code or repeat the entire local suite. Prior recorded
validation remains564 JavaScript tests,279 fresh disposable migration replay,
16 SQL/RLS files, build/type/Netlify/configured lint, zero production dependency
vulnerabilities, and the pinned five-stage failure/TLS/maintenance rehearsal.
TRUNCATE denial was proven in disposable tests, never against hosted data.

Current evidence:
- `docs/evidence/course-release-review-2026-10-01/isolated-276-279-execution.json`
- `docs/evidence/course-release-review-2026-10-01/isolated-279-security-advisors.json`

The compact execution evidence contains stage classifications, exact hashes,
read-only connection settings, semantic checks, maintenance states and final
privilege matrix. Protected credentials and member data are excluded. Complete
operator snapshots remain outside the repository in the private temporary evidence
directory. Continuity documents and the active runbook were updated locally.

## Preservation and unresolved work

No command in this assignment targeted production. No production DB write,
migration, deployment, Auth/SMTP/payment/staff/Share Library setting change, main
merge, Git push or published-site modification occurred. Production was deliberately
not queried again: its last verified baseline remains database274/main1599ab2,
Netlify deploy6abbb27a1cdd6d00081b0e8e and ChatGPT Site25. Those are retained prior
evidence, not a fresh external-state audit. The other isolated278 project
jxtgtfffdiwzxocxoqxk and both retained sites were not modified or deleted.

The existing hosted readiness function still checks278. It briefly reported
schemaReady=true at278 while paused remained true, then correctly returned false
at279 under that old definition. No readiness function, maintenance flag or hook
was changed. A successful schema transition does not prove full hosted app cutover.
The old autosave403, original-client media retries, copy-and-close policy and all
production release gates described in prior reports remain relevant.

## Next recommended package

Separately authorize a narrowly reviewed isolated readiness-function update for279,
preserving its hook, ACLs and paused flag. Verify it read-only with maintenance ON.
Then scope candidate deployment and fresh-client hosted acceptance explicitly;
maintenance reopening and production release require separate authorization.

## Chat handoff

Completed the explicitly approved isolated276→277→278→279 sequence on
qjksggxorghaxvpyslip. Every stage committed once and passed exact catalog/ledger and
independent security checks. Migration275 was not replayed. Final ledger279,
maintenance ON, service_role private-note privileges zero. Existing readiness
still expects278, so schemaReady=false. No deployment, reopen, push or production
action occurred. Full application transition is still unverified. Next: separately
review/authorize only the isolated279 readiness update while keeping maintenance ON.
