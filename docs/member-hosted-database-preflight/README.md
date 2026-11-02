# Direct isolated database safeguard gate

<!-- wave10ib:begin -->
## Wave 10I-B local diagnostic correction (November 2, 2026)

The approved local correction now emits fixed categories for local/native DNS, IPv6 routing, TCP refusal/interruption, TLS verification/handshake/required-SSL failure, password-specific versus other authentication rejection, timeout, server rejection, native-handle and driver failures. Unknown, mixed, localized/unrecognized or oversized diagnostics fail closed. Phase markers describe the local operation, not proof of remote protocol completion. Failure output includes only allowlisted codes/stages, the helper source SHA256, bounded native-call elapsed milliseconds, fixed required policy and safeguardsVerified=false. Requirements are never presented as observed database values.

PQerrorMessage is a pointer with a capped NUL scan before copying; at most8192 diagnostic bytes are classified privately. No raw native/exception text, connection string, credential or password-derived field is emitted. The primary native bytearray is cleared. CLI-only fd1/fd2 suppression prevents direct native notices/errors bypassing Python sanitization; explicit hidden /dev/tty input is unchanged. One JSON result is emitted after output restoration, and restoration/setup failures deny without success. Offline output tests cover direct descriptor writes and this helper's own result path, not arbitrary third-party buffered C output.

All49 Python tests pass, including the preserved21 safeguards and28 diagnostic/output tests; the17 Node bridge tests remain included in the1,853-test JavaScript suite. Configured/scoped lint and full1,853 JavaScript tests pass. A separate native Codex security reviewer passes with offline limits, after reproducing and closing the native-output gap;84 additional adversarial assertions are a separate review count. No actual connection or credentials were exercised. Owned ctypes input and primary diagnostic-buffer wiping do not guarantee whole-process immutable-memory erasure.

The direct qjks host/database/user, AF_INET6, verify-full CA/hostname policy, on/5s/30s startup options, fixed query inventory, same physical connection/transaction checks, rollback/no reconnect and deployment gate remain unchanged. Historical errors below retain their original meaning; the latest DIRECT_CONNECTION_FAILED cannot be retrospectively diagnosed. New classifications do not establish live connectivity or actual safeguards.

No new launcher was prepared or executed, no password requested, and no original spent launcher was modified. Any future controlled check needs a freshly reviewed helper hash and private one-attempt prompt under separately bounded authority. Do not run the helper as part of this local-only assignment. Deployment remains held and its one reservation remains unused.
<!-- wave10ib:end -->

Wave 10I-A is an additive operator correction, not a new Auth system or deployment command. It uses only qjksggxorghaxvpyslip's direct IPv6 endpoint. No I/O occurs on import. The existing application 327ba098628f70aa65140862b8b14cd709bfd711 and uploader/receipt source 51857e44642ac79a4b1f458de786b97d98762082 remain unchanged.

## Why the earlier check stopped

Wave 10I sent a session-default SELECT through the generic Supabase SQL connector. That call did not use the reviewed direct libpq startup options or an explicit read-only transaction. Its off/0/2min result does not demonstrate that PostgreSQL ignored supplied options, nor establish the connector's physical connection or pooling behavior.

The historical course runner supplies startup options, but each psql invocation creates a connection. Its identity call cannot attest a different inspection connection. That runner is preserved without modification. Connection startup parameters affect the connection being opened; session settings affect that session; transaction-local settings end with the transaction. Proof must come from the same connection and transaction as the inspection.

## Narrow implementation

- scripts/member-hosted/database_preflight.py uses already-installed libpq17 through Python ctypes, not a pool, subprocess psql invocation or generic SQL service. It resolves only IPv6 for the exact db.qjksggxorghaxvpyslip.supabase.co:5432 host and validates the documented Supabase CA fingerprint. No hostname/TLS fallback, reconnect, alternate host or persistent database settings.
- Startup options request default_transaction_read_only=on, lock_timeout=5s, statement_timeout=30s and an empty search_path. The native connection is required to be idle, then BEGIN READ ONLY starts one explicit transaction. Actual SQL current_setting values, pg_stat_ssl, database and backend PID are checked before and after each of the two fixed inspection SELECTs. Native handle/socket/PID, transaction status and transaction timestamp must stay fixed. Requested options alone never count as proof.
- Only a fixed query inventory can execute. Inspection checks a narrow migration/RLS/private-note baseline. A successful result requires ROLLBACK and disconnect. Failure or connection loss stops; there is no silent reconnect. This necessary session gate does not replace the remaining full Wave10H backend/readiness/function/provenance/operator/provider checks.
- scripts/member-hosted/database-preflight.mjs exposes createDirectDatabaseVerifier and createDatabaseGatedOperator. The latter requires a fresh, opaque successful database receipt before it constructs/runs the existing one-shot deployment operator. Normal operations recheck the five-minute receipt; cleanup and begin-containment remain available after expiry. Original retirement requirements are unchanged.

## Explicit trust and credential boundary

The execute dependency must be sealed trusted operator code invoking only the reviewed Python helper, privately capturing its allowlisted output. A callback can lie; the wrapper is not a sandbox for untrusted callbacks. Do not wrap arbitrary JSON, MCP rows or browser claims into a verifier. Registering a receipt prevents later JSON/cloned-handle substitution, not a malicious trusted dependency.

The explicit helper entry is CLT Python -I -B scripts/member-hosted/database_preflight.py --isolated-readonly ABSOLUTE_CA_PATH. Do not invoke it without the approved protected Terminal workflow. It cannot deploy. It accepts the password only through hidden getpass on a controlling TTY, rejects echo fallback, disables core dumps and prevents ambient PG credential/service/SSL fallback. No password in argv, environment, files, history, Git or evidence. Output contains only fixed result codes or an allowlisted non-secret receipt. Owned native input buffers are zeroed, references discarded and libpq closed. Python/native libraries do not provide a guarantee of complete immutable-memory erasure; no such guarantee is claimed.

The temporary owner launcher verifies the exact helper SHA, uses a private one-attempt directory and a clean environment, and records only sanitized result JSON. It is not a reusable credential session. A local TTY setup defect was corrected from r+ to w; synthetic hidden entry/no echo/terminal restoration passed before real entry.

## Actual execution boundary

On November 2 the separate password-free IPv6/TCP/PG SSLRequest probe verified the documented CA and hostname with TLS1.2. One native credentialed direct connection then returned AUTHENTICATION_FAILED at direct_connection. No SQL ran. Authenticated TLS introspection, actual on/5s/30s and current ledger/readiness remain unverified. Do not substitute the separate TLS probe or mocked tests for this missing proof. No reservation, key provisioning, hosted Auth or deployment followed; the one allowance remains unused. No automatic credential retry or password reset is authorized by this result.

## Validation

The authoritative Node suite runs the 21 offline Python state-machine regressions through a bridge; all 1,853 JavaScript tests and scoped/configured lint pass. The 17 new Node tests are included in 1,853. Python's 21 cases are a separate language count executed by one of those tests, not 21 additional JavaScript tests. Tests cover ignored startup options, wrong connection/project/database, proxy/backend replacement, transaction replacement/loss, wrong safeguards, TLS downgrade, query failure, rollback failure, opaque receipt forgery/staleness and stop-before-reservation behavior. Tests use synthetic drivers and blocked production egress. No new schema or application build was needed.

References: [libpq connection options](https://www.postgresql.org/docs/17/libpq-connect.html), [TLS verification](https://www.postgresql.org/docs/17/libpq-ssl.html), [direct Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres).
