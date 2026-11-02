# WAVE 10I-B DIAGNOSTIC CORRECTION RESULT

November 2, 2026. **LOCAL DIAGNOSTIC CORRECTION VERIFIED. DEPLOYMENT REMAINS HELD.**

## Exact source and authorized work

Source commit: **5cc6af45c9c8323b13f6d71ee0881e6b823ddfa3**, branch codex/wave10-hosted-composition, existing Wave10 worktree. Local source changes are limited to scripts/member-hosted/database_preflight.py, tests/member_hosted_database_preflight_test.py, the Node bridge's Python-count assertion and docs/member-hosted-database-preflight/README.md. Starting checkpoint: 2e2ff1279d9f2fb3f8c6f0aff7b1eed1b8af5977.

Helper SHA256: **c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba**. The original application327ba098628f70aa65140862b8b14cd709bfd711, uploader/receipt51857e44642ac79a4b1f458de786b97d98762082 and course release runner remain unchanged. No new Auth/session system, deployment transport, database query, startup setting or dependency.

Owner approved the [previously prepared local diagnostic proposal](WAVE10I_CONNECTION_DIAGNOSTIC_CORRECTION_PROPOSAL.md). That preparation-only restriction is superseded only for this local implementation/test/review. It does not authorize a live diagnostic or deployment in this assignment.

## Categories and phases implemented

| Fixed category | Evidence family, not a root-cause guarantee |
|---|---|
| IPV6_DNS_FAILED | Typed local AF_INET6 lookup failure |
| NATIVE_NAME_RESOLUTION_FAILED | Recognized native name-resolution error |
| IPV6_ROUTE_UNAVAILABLE | Recognized no-route/network-unreachable diagnostic |
| TCP_REFUSED | Recognized connection refusal |
| CONNECTION_INTERRUPTED | Reset, unexpected close or EOF; protocol stage unknown |
| TLS_VERIFY_FAILED | Recognized certificate/hostname/trust-file error |
| TLS_HANDSHAKE_FAILED | Recognized SSL/TLS handshake error distinguished from verification |
| TLS_REQUIRED_UNAVAILABLE | Server reports required SSL unavailable; no fallback |
| AUTHENTICATION_FAILED | Recognized password-authentication rejection phrase |
| AUTH_NEGOTIATION_FAILED | Recognized SASL/SCRAM/other negotiation rejection |
| SERVER_ACCESS_REJECTED | Recognized access policy rejection |
| CONNECT_TIMEOUT | Recognized timeout; protocol stage unknown |
| SERVER_STARTUP_REJECTED | Recognized database/role/startup-parameter/capacity rejection |
| NATIVE_HANDLE_UNAVAILABLE | Native connection handle absent; allocation cause not assumed |
| DRIVER_LOAD_FAILED | Typed local native-library/symbol loading failure |
| DRIVER_OPERATION_FAILED | Other unexpected local driver-stage failure without exception text |
| DIAGNOSTIC_OUTPUT_UNAVAILABLE | CLI output containment/restoration failed; no success |
| CONNECTION_FAILURE_UNCLASSIFIED | Absent, unknown, localized/unrecognized, oversized or ambiguous native evidence |
| DIRECT_PREFLIGHT_UNAVAILABLE | Other local setup/input failure, preserving safe generic denial |

Existing fixed CA/project/settings/security guard codes remain intact. Categories are diagnostic hints, always failures. No category can grant a deployment or convert requested policy into observed database safeguards.

Allowlisted local stages now distinguish setup, CA validation, TTY/hidden input, driver load, IPv6 DNS, connection configuration, credential validation, native connection and guarded inspection. The native_connect phase does not by itself establish TCP, TLS or authentication success. Separate native protocol substeps are not invented. Fixed output includes code/stage, validated helper SHA256, bounded native-call elapsed milliseconds, fixed required policy and safeguardsVerified=false.

## Credential and output protections

Native PQerrorMessage now returns a pointer instead of an unbounded c_char_p conversion. A capped NUL scan reads at most8193 bytes including the limit check and classifies at most8192 bytes in private memory. The primary bytearray is cleared. There is no raw native/exception output, message snippet, connection string, address extracted from error text, password-derived field, token, environment/connection-option dump or guessed SQLSTATE. Unknown/mixed evidence fails closed; TLS certificate errors can supersede their generic prefix only on the same unambiguous line.

Independent review identified that native descriptor output could bypass Python exception sanitization. It was reproduced with synthetic local writes and closed by CLI-only fd1/fd2 suppression during main. Explicit hidden /dev/tty handling is unchanged. Main returns its existing success object; one JSON is emitted only after descriptor restoration. Setup failure stops before main; restoration failure denies without emitting success. No intermediate credential file, new credential transfer, connection/retry or settings behavior was introduced.

Wiping claims are limited to owned ctypes input buffers and the primary diagnostic bytearray in tested paths. Whole-process erasure of immutable Python/native copies is not guaranteed. Output tests cover direct native-style descriptor writes and this helper's own result path; they do not certify arbitrary third-party buffered C output or establish any historical secret disclosure.

## Validation and independent review

- **1,853 JavaScript tests PASS**, zero failures/skips; the existing17 focused Node tests are included in that total.
- **49 Python tests PASS**: all21 original same-connection/security/rollback safeguards plus28 diagnostic/output tests. They execute inside one Node bridge, not as49 extra JavaScript tests.
- Configured tooling lint and scoped Node bridge/guard lint PASS; git diff whitespace checks PASS.
- Native Codex agent **/root/wave10ib_security** was actually dispatched and performed a separate read-only review of the final exact hashes. Result: **PASS_WITH_OFFLINE_LIMITS**, no blocking findings.
- The reviewer independently reran49 official Python tests and84 additional adversarial assertions, including77 incompatible-family pairs. These84 are a separate review count, not additional JavaScript tests.

Offline tests globally block sockets, DNS, native driver loads and password input except explicit fake dependencies. Tests cover known native families, typed local errors, case variations, repeated same-family lines, mixed/unknown/localized/oversized input, missing handle/pointer, bounded reads, no reflected secrets, input-buffer/diagnostic wiping, no retries, handle closure, source/time metadata filtering, actual synthetic fd writes, output setup/restoration failures and all original safeguards. No actual driver connection, password prompt or SQL was used.

AST comparison independently confirms unchanged require/CA/native identity/witness/inspect_guarded logic, protected DirectLibpq query/close methods, project/host/CA/startup/query constants and connection parameter dictionary. All280 migration hashes are unchanged. No TypeScript/application/schema/build change warranted repeating builds or disposable migration replay; earlier Wave10H evidence is retained as historical rather than falsely reported fresh.

## Remaining unknowns and exact next controlled action

The previous generic DIRECT_CONNECTION_FAILED cannot be retrospectively classified; its raw error was discarded. Current live DNS/route/TCP/TLS/authentication and actual read_only=on/lock_timeout=5s/statement_timeout=30s remain unverified. Tests and categories do not establish a stable network or provider state. No current backend ledger/readiness audit or fresh synthetic Auth/manager/MFA acceptance occurred.

Smallest next action: separately authorize ONE fresh isolated direct read-only diagnostic using exact source5cc6af45c9c8323b13f6d71ee0881e6b823ddfa3 and helper hash above, with a new reviewed one-attempt private launcher and hidden local database-password input only if needed. Stop after sanitized connection/safeguard results; no automatic retry, password reset, reservation or deployment. Old spent launchers were not modified and must not be reused. No new launcher or input session was prepared here. Even a future successful diagnostic does not bypass any original Wave10I operator/provider/source/billing/key/acceptance/containment gate.

## Preservation

No database or other remote connection, DNS/network probe, password retrieval/reconstruction/reuse/input, hosted Auth, provider API, reservation/application upload/deployment, production access/change, migration/SQL, schema/RLS/settings/Auth/SMTP/PITR/compute/maintenance change, staff/manager role change, content/duration/Share Library activation, message/payment/purchase, push or merge. The one deployment reservation remains unused. Existing course rehearsal, main, coursePR4 and published sites are preserved by no action, not a new remote audit. All other original tracked source bytes, all280 migrations,37 feature rows/statuses, user refs and original dirty checkout are preserved. No new feature becomes Live; all12 registers remain reconciled. The temporary local dependency symlink was retired; no package installation.

[Independent security review](evidence/2026-11-02-wave10ib/independent-security-review.json), [validation](evidence/2026-11-02-wave10ib/validation.json), [source/preservation](evidence/2026-11-02-wave10ib/source-and-preservation.json), [checksums](evidence/2026-11-02-wave10ib/SHA256SUMS).
