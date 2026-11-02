# Wave 10I offline connection error diagnosis

November 2, 2026. **Connection cause undetermined; Wave10I remains safely blocked.** Strictly local/offline review only. No password retrieved, reconstructed or reused. No socket, DNS lookup, Supabase/provider API, authentication, SQL or deployment in this assignment.

## 1. What the existing classifier collapses

The native connection branch calls PQconnectdbParams, then maps an unusable connection by two case-sensitive English substring checks: password authentication failed becomes AUTHENTICATION_FAILED; certificate or SSL error becomes TLS_VERIFY_FAILED; everything else becomes DIRECT_CONNECTION_FAILED. The raw error is then discarded. The outer handler maps other untyped exceptions to DIRECT_PREFLIGHT_UNAVAILABLE, still at the broad direct_connection stage.

| Error class | Actual current behavior |
|---|---|
| Python AF_INET6 getaddrinfo failure | Exception becomes DIRECT_PREFLIGHT_UNAVAILABLE, not normally DIRECT_CONNECTION_FAILED. Empty returned addresses get DIRECT_IPV6_REQUIRED. |
| Native resolver error | If encountered inside libpq, ordinarily DIRECT_CONNECTION_FAILED. Hostaddr already supplied, so a native DNS failure is not established here. |
| IPv6 routing or TCP refusal/reset/interruption | Usually DIRECT_CONNECTION_FAILED unless text happens to match an earlier substring. No per-protocol telemetry retained. |
| Native connection timeout | DIRECT_CONNECTION_FAILED; connect_timeout requested8seconds, elapsed/protocol phase not retained. No evidence that timeout caused this attempt. |
| TLS certificate or any SSL error phrase | TLS_VERIFY_FAILED, which overgroups handshake errors with actual certificate failures. Other TLS wording, including SSL unsupported, may fall through to DIRECT_CONNECTION_FAILED. |
| Password-specific rejection | AUTHENTICATION_FAILED only for exact recognized phrase. |
| Other authentication/access negotiation failures | May collapse to DIRECT_CONNECTION_FAILED. No general authentication success/failure state retained. |
| Server database/role/startup-options rejection | DIRECT_CONNECTION_FAILED unless an earlier phrase matches. |
| Native null/bad handle or absent diagnostic | DIRECT_CONNECTION_FAILED. Cause cannot be inferred from absence of text. |
| Driver loading/symbol/encoding/unexpected Python error | Usually DIRECT_PREFLIGHT_UNAVAILABLE, not the native fallback. Explicit driver/version/identity guards have their own codes. |

Offline evaluation of the exact existing AST expression with sockets/DNS blocked reproduced all13 synthetic cases, including the overbroad TLS and generic authentication grouping. These are classifier tests, not historical server errors or proof of what happened remotely. [Sanitized fixture outcomes](evidence/2026-11-02-wave10i-offline-diagnosis/classifier-review.json).

## 2. What existing evidence establishes

The owner-operated retry returned exactly ok=false/errorCode=DIRECT_CONNECTION_FAILED/stage=direct_connection. Helper SHA256 matches the reviewed source and the launcher matches its prepared hash. This code is emitted only after DirectLibpq has validated the pinned CA file, loaded libpq17, obtained a nonempty AF_INET6 resolution, validated local input shape and called PQconnectdbParams. The native connection was not ready; guarded inspection was not entered and no SQL ran. This narrows the failure beyond an initial Python DNS lookup or library-load exception.

The workflow retained only its one-attempt marker and sanitized result. Its native error bytes were deliberately discarded in memory; no raw native error file was written. No attempt was made to recover process memory, inspect credentials/history or search unrelated potentially sensitive logs. Nonsecret timestamps distinguish this retry from the earlier AUTHENTICATION_FAILED attempt. The earlier separately successful password-free IPv6/TCP/TLS probe and earlier password-handling fixtures remain historical, not current route/TCP/TLS/auth proof. The eight offline literal-parameter fixtures found no special-character transformation; the raw supplied password was neither inspected nor inferred.

## 3. Unknowns

The actual native error, current route, TCP result, TLS/hostname outcome, authentication protocol stage and provider/server response are unknown for this retry. Whether a timeout, access rejection, TLS handshake issue, startup option error or another failure occurred cannot be distinguished from retained evidence. Do not attribute it to an incorrect password, Supabase incident or broken IPv6 route. Current actual read_only=on, lock_timeout=5s and statement_timeout=30s remain NOT VERIFIED. No fresh ledger/readiness proof.

## 4. Correction needed

Yes: diagnostic observability needs a narrow correction. No connection-parameter or password-handling defect is established. Prepared [exact file-level diagnostic proposal](WAVE10I_CONNECTION_DIAGNOSTIC_CORRECTION_PROPOSAL.md) adds fixed error enums and local stages, distinguishes certificate/handshake/auth families, and never reflects raw errors or secrets. It is NOT implemented. No helper, launcher, application, test source, dependency, migration, Auth or settings change was made.

## 5. Exact next step

Review the proposed local classifier/stage instrumentation and offline negative-test matrix. If approved, implement and test offline before any separately bounded connection attempt. Do not rerun spent launchers, request another password, reset credentials, open a connection or resume deployment from this review. The existing one-reservation allowance remains unused. An actual verified direct on/5s/30s session and every original operator/provider/security gate are still required before deployment.

## 6. Preservation

No network connection or remote action occurred. No production access; no password/token retrieval, logging or persistence; no database SQL/write/settings change, schema/migration/maintenance/Auth/SMTP/PITR/compute action, reservation/deploy, role/account/payment/message/content/purchase, push or merge. Historical environments, main, coursePR4, original dirty checkout and all280 migrations preserved. No feature promoted to Live. Runtime guard remains846d9f7; documentation starting checkpoint691d087. No new agent dispatched.

[Observed sanitized result](evidence/2026-11-02-wave10i-offline-diagnosis/observed-result.json), [classification evidence](evidence/2026-11-02-wave10i-offline-diagnosis/classifier-review.json), [checksums](evidence/2026-11-02-wave10i-offline-diagnosis/SHA256SUMS). No reconstruction of the discarded native message is possible from these records.
