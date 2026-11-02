# WAVE 10I-C DIRECT DIAGNOSTIC RESULT

November 2, 2026. **STOPPED: AUTHENTICATION_FAILED. DEPLOYMENT REMAINS HELD.**

One owner-authorized direct isolated diagnostic ran. It returned a recognized PostgreSQL password-authentication rejection in522ms at native_connect, before any SQL. No retry or deployment followed. The one diagnostic allowance is consumed; the separate deployment reservation allowance remains unused.

## 1. Exact helper/source verification

Reviewed source: **5cc6af45c9c8323b13f6d71ee0881e6b823ddfa3**. Helper: scripts/member-hosted/database_preflight.py, byte-identical to that commit before launch and after the result.

- Helper SHA256: **c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba**.
- New launcher: /private/tmp/lockliel-wave10ic-direct-diagnostic.command.
- Launcher SHA256: **f0478b529252bd69098a8e02d06a3d8a3715c0356ae1093bd1cfefe6a259ceaf**; verified at preparation, immediately before opening and after result. zsh syntax check passed.
- CA SHA256: 700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7; existing documented official Supabase CA validated locally, no new trust source.
- Direct target only: db.qjksggxorghaxvpyslip.supabase.co:5432, database postgres, username postgres, AF_INET6. No pooler, fallback target or substituted older helper.

Automated Terminal opening did not execute because automatic approval review exceeded its deadline. It was not a security rejection or a database connection. Dave then manually ran the new verified launcher once and privately entered the isolated password. The atomic one-attempt marker and single sanitized result are present; no replacement launcher or automatic execution/retry.

## 2. IPv6 and TCP outcome

The source-enforced AF_INET6 lookup returned addresses before native connection establishment. A PostgreSQL password-authentication rejection was received, establishing a transport exchange with the configured direct endpoint. The exact resolved AAAA address and separate TCP timing were not retained.522ms is the combined native connection attempt, not a TCP-only latency or stability sample. No extra DNS/TCP/TLS probe was run.

## 3. TLS verification

The reviewed helper enforced sslmode=verify-full, the pinned official CA and expected hostname, with no weaker mode or pooler. The result category was authentication rejection, not a TLS error category. However, this failure result contains no independent successful TLS/hostname receipt or authenticated pg_stat_ssl witness. Do not promote the required policy fields to observed successful TLS/session evidence. TLS version/cipher and authenticated SSL metadata were not reached/recorded in this attempt.

## 4. Authentication outcome

**AUTHENTICATION_FAILED**: the native error matched the reviewed password-authentication rejection family. No authenticated session was established. This identifies the rejection category; it does not prove why the supplied credential was rejected, which password Dave supplied, a password reset requirement or provider/network instability. No password inspection, reconstruction, reuse or retry by Codex.

## 5. Actual safeguards

| Actual required safeguard | Result |
|---|---|
| transaction_read_only=on | **NOT VERIFIED** |
| lock_timeout=5s | **NOT VERIFIED** |
| statement_timeout=30s | **NOT VERIFIED** |
| Same physical connection/read-only transaction | Guarded SQL not reached |

The result's required object repeats requested policy. Those on/5s/30s values are not observed SQL values. safeguardsVerified=false is the authoritative failure status. No authenticated database/version query, migration/RLS/private-note aggregate or current ledger/readiness check ran.

## 6. Sanitized category and phase

Fixed category: **AUTHENTICATION_FAILED**. Local phase: **native_connect**. Native connection elapsed: **522ms**. Helper identity matches the reviewed hash. No raw provider/exception text, credential, connection string or password-derived field is in the result or this report. The local phase does not invent a separately instrumented TLS/authentication protocol substep.

## 7. SQL reached

**NO.** Failure occurred inside DirectLibpq construction before BEGIN READ ONLY or any SELECT. The failed handle was closed and owned input buffers cleared by the reviewed error path. No SQL transaction was opened, so no rollback is claimed. No migration, data/schema/RLS change or persistent database setting change.

## 8. Credential protection

Dave used the hidden local /dev/tty prompt. Password handling stayed in process memory and the intended isolated database connection; no password in ChatGPT, argv, environment, shell command history, repository, evidence or result. Native/exception output containment and fixed-result emission were the reviewed Wave10I-B implementation. No credential file/session receiver remains in this workflow. Complete immutable/native-memory erasure is not guaranteed or claimed. No raw native message was retained or recovered.

## 9. Production and deployment preservation

No production connection/query/change; no Netlify/provider configuration operation, reservation, upload/deployment, protected-key provisioning, hosted Auth, password reset, settings/Auth/SMTP/PITR/compute/maintenance change, migrations, staff/manager role/account mutation, payment/message/content/duration/Share Library activation, purchase, push or merge. The original application327ba098, uploader/receipt51857e4, main, coursePR4, historical deployments/aliases and both published websites are preserved by no action, not a fresh remote audit.

All280 local migration files, all original tracked source bytes, other user refs and original dirty checkout were unchanged before documentation. Current production274 and isolated280/readiness/maintenance are historical observations, not freshly reverified. All37 inventory rows/statuses and twelve registers remain reconciled, none newly Live. No subagent dispatched or source/test/dependency change; prior Wave10I-B offline review/tests remain prior evidence and were not unnecessarily rerun.

The isolated diagnostic connection allowance was used once. **Deployment reservations:0. The deployment allowance remains unused.** No deployment or hosted Auth session exists to retire; no cleanup or404 claim.

## 10. Smallest next action

Owner verifies the current PostgreSQL database credential/provenance for this exact isolated branch locally, without posting it or using a production credential. Correct parameters and offline literal-password handling are already verified; no new code defect or need for password reset is established. Do not automatically rerun this spent launcher, reset credentials or change settings. Any further connection attempt needs separately bounded authority and a fresh one-attempt prompt. Deployment remains held until a real authenticated direct session proves on/5s/30s and all original release gates pass; this assignment authorizes no deployment even if a later diagnostic passes.

[Sanitized result](evidence/2026-11-02-wave10ic/sanitized-result.json), [source/launcher/preservation verification](evidence/2026-11-02-wave10ic/verification-and-preservation.json), [checksums](evidence/2026-11-02-wave10ic/SHA256SUMS). Prior [reviewed diagnostic correction](WAVE10IB_DIAGNOSTIC_CORRECTION_RESULT.md).
