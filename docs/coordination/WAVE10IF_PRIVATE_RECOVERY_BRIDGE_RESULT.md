# WAVE 10I-F PRIVATE RECOVERY BRIDGE RESULT

November 2, 2026. **LOCAL IMPLEMENTATION AND OFFLINE REVIEW COMPLETE.**

**PRIVATE RECOVERY BRIDGE READY FOR CONTROLLED EXECUTION**

This assessment covers the local private bridge. No live credential was retrieved, no input prompt was opened, and no database or provider account connection was attempted. Actual authentication and on/5s/30s safeguards remain unverified. The existing conditional Wave 10I-E recovery authority is preserved for a later execution step; its one direct diagnostic and the separate deployment reservation remain unused. No deployment resume is authorized by this assignment.

## Exact source and files

Branch: `codex/wave10-hosted-composition`.
Source commit: `f3d1eb9e6b66937276a37f5b57534b638e08e386`.

- `scripts/member-hosted/supabase_recovery.py`: additive private worker.
- `tests/member_hosted_supabase_recovery_test.py`: 46 synthetic offline boundary regressions.
- `tests/member-hosted-supabase-recovery.test.mjs`: authoritative suite bridge.

Bridge SHA256: `9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2`.
The PostgreSQL helper remains byte-identical to reviewed source `5cc6af45c9c8323b13f6d71ee0881e6b823ddfa3`, SHA256 `c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba`. Existing application, Netlify protected uploader, receipt adapter and dependencies are unchanged. Documentation is committed separately; source identity above does not refer to an application rebuild.

## Private transport architecture

The Supabase-specific Python worker owns the entire operation in one exclusive short-lived local process. It uses native HTTPS directly to fixed `api.supabase.com:443`, never a secret-bearing connector/CLI result or model-visible tool response. There are no caller-supplied URLs, request implementations or credential-consumer callbacks in the execution path. Test mocks replace private dependencies only offline.

The only Management operations are GET of the parent branch listing to identify the exact child, followed by GET `/v1/branches/qjksggxorghaxvpyslip`. The parent ref is used solely as metadata context and is never a database destination or credential-recovery target. Fresh branch id/name/ref/parent/nondefault/nonpersistent/healthy metadata must match before the secret endpoint is reached. No production or sibling credential endpoint is allowed.

The provider response remains inside native local HTTPS and worker memory. The selected credential passes directly to the pinned DirectLibpq constructor in the same process. It never becomes a tool result, IPC message, argument, environment value, shell command, file, Git content or diagnostic field. Unrelated JWT material is discarded without use. This is an internal private operation, not an ordinary tool response with secrets filtered afterward.

Fixed-origin certificate and hostname validation, TLS1.2/1.3, GET-only paths, no proxy/redirect/retry, status/header/length checks, a bounded 64KiB body and bounded read deadline fail closed. JSON duplicate keys, invalid constants, malformed/ambiguous identity and unreviewed credential/config formats are rejected. The reviewed format accepts only classic read-authorized PAT input and bounded printable database passwords; different provider formats require review, not fallback. Real schema compatibility and current credential validity remain unknown until separately executed.

The operator token is obtained only through a future hidden local TTY prompt with no echo fallback. No token store, environment, keychain, browser credential view or connected-tool secret output is read. No prompt was opened in this assignment. Existing operator authority and a privately available, read-authorized token remain prerequisites; no new token creation is authorized here.

## Exposure and lifetime boundary

Before private input, the worker requires isolated Python, a single thread, no trace/profile hooks, disabled core dumps and successful output containment. It rejects nonempty SSLKEYLOGFILE, SSL_CERT_FILE and SSL_CERT_DIR without modifying the owner's environment. An enabled SSLContext key-log path also denies. The installed CLT Python3.9.6/LibreSSL2.8.3 lacks that optional property; absence denotes no Python key-log support, while the environment rejection remains mandatory on all runtimes.

Python stdout/stderr and logging are suppressed, native fd1/fd2 are sunk, and saved standard/log streams plus C stdio are flushed while still suppressed. Failed setup/restoration/cleanup cannot yield success. Only fixed categories, pinned identity and validated nonsecret settings cross the result boundary. No raw provider/native exception, response, traceback, credential or arbitrary success-receipt string is emitted.

Owned mutable authorization, response and password buffers are wiped on all exits, references are dropped, provider connections are closed, and the database guard rolls back/closes. Python JSON/HTTP/string handling and native libpq/TLS create transient immutable/native copies that cannot be guaranteed physically erased. A trusted short-lived process must terminate afterward. This design does not claim to protect secrets from a compromised OS, hostile native library, debugger, arbitrary malicious in-process code, audit-hook instrumentation or privileged memory inspection. Future launcher source pinning and clean-process review are mandatory.

The worker consumes one use per process, including failures. It cannot enforce a cross-process authorization allowance by itself. A future reviewed launcher must claim a nonsecret atomic marker before input and prohibit restarts/retries. There is deliberately no live CLI or launcher activated in this local package; direct script invocation returns OPERATOR_ENTRY_REQUIRED without prompting or connecting.

## Guarded PostgreSQL integration

The guard is compiled from the same bytes whose source hash was checked. Direct database host, username and database are compiled into that reviewed guard, never selected from provider JSON. The config's ref/host/port/user must independently match. There is no Session Pooler, reconnect, password reset, persistent setting change, write probe or alternate project.

The unchanged guard requires direct IPv6, the pinned official Supabase CA, verify-full and hostname verification. It establishes BEGIN READ ONLY and verifies actual read-only on, lock timeout5s and statement timeout30s on the same physical connection and transaction before and around the existing two fixed inspections. It requires the280/RLS57/private-note0/0 baseline, rollback and close. The bridge separately validates the guard result before projecting a fixed safe summary. These are offline-proven requirements, not claims of current live observation.

## Validation

- 1,854 JavaScript tests passed, 0 failed/skipped. This includes the new Python bridge test.
- 46 new recovery tests passed; 49 existing direct-guard tests passed. These Python totals run inside two JS bridge tests and are not additional unique JS tests.
- TypeScript (`npm run typecheck`), configured tooling lint, scoped bridge lint and local Netlify validation passed (83 modules, 63 handlers).
- Python AST parsing and in-memory compilation passed, without bytecode artifacts. Whitespace validation passed. No new Python lint dependency was installed.
- All real sockets, DNS, native database loading and credential input are denied by the offline Python fixtures. The authoritative JS suite also preloads its network guard. Zero forbidden I/O attempts were recorded.
- Wrong/production/sibling identity, ambiguity, missing authorization, malformed/duplicate JSON, redirects, secret-bearing errors, interruption, timeout, driver failures, disposal, wrong DB destination, ineffective safeguards, repeated calls, output/log/native buffering, weak TLS, key logging and cleanup failures are covered.
- All280 migration files and hashes remain unchanged and match application327ba098. No migration replay or application build was repeated, as instructed.

## Independent security review

Actual separately dispatched agent: `/root/wave10if_security`, read-only ownership. Final verdict: **PASS within reviewed local scope**, no remaining material findings. The reviewer independently reran all46 new recovery and49 existing guard tests, with zero forbidden I/O.

Material findings corrected before the final pass: normal HTTP socket detachment, hash-then-reload source race, delayed buffered output, and ambient TLS session-key logging/trust overrides. The final reviewed source hash matches the committed implementation. Independent review is not live provider authorization, password validation or database acceptance.

## Smallest next controlled action

Prepare and review the exclusive source-pinned local execution launcher and nonsecret atomic allowance binding described in `WAVE10IF_CONTROLLED_RECOVERY_EXECUTION_PREPARATION.md`. Use the preserved10I-E authority only after those execution prerequisites are established. Then, in a separate execution step, recover once privately and attempt at most one direct guarded check. Do not ask for a database password, reuse a spent launcher, retry automatically or resume deployment. A missing private operator credential or identity/TLS/safeguard failure must stop safely.

## Preservation and evidence

No live provider account call, credential retrieval/input/reset/rotation, database connection/SQL, hosted Auth, Supabase configuration, maintenance change, migration, Netlify reservation/upload/deploy, Git push/merge, staff/content/payment/message/purchase or production access occurred. Only public official API documentation was read online. Historical isolated280/maintenanceON and production274 are retained, not freshly reverified. Main, coursePR4, published websites, root dirty work and all37 feature statuses are preserved. No feature becomes Live from these tests.

The five root continuity documents, master inventory and all twelve coordination registers receive a dated additive record; historical entries and feature rows remain intact. Sanitized source, validation, review and preservation records are under `evidence/2026-11-02-wave10if/`.

Provider contracts: [branch configuration](https://supabase.com/docs/reference/api/v1-get-a-branch-config), [branch identity listing](https://supabase.com/docs/reference/api/v1-list-all-branches). These document the response and read permission mechanism; no live credential endpoint was used.
