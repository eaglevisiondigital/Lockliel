# Wave 10I local connection diagnostic correction proposal

**PREPARED FOR SEPARATE REVIEW. NOT IMPLEMENTED. NO LIVE RETRY AUTHORIZED OR EXECUTED HERE.**

## Exact scope

Change only error observability in scripts/member-hosted/database_preflight.py after separate review. Add focused offline cases to tests/member_hosted_database_preflight_test.py and adjust the Node bridge's expected Python count if those tests are added. Update the reviewed helper hash in a NEW one-attempt private launcher only after the changed helper is approved; do not reuse either spent launcher. Do not change database parameters, credentials, query inventory, startup safeguards, transaction verification, deployment code or provider configuration.

Baseline helper SHA256: d9df69e2f1b512bb46934e743c16fd3379815b11f951f6cc867ac84e8563d853. Original application327ba098628f70aa65140862b8b14cd709bfd711, uploader/receipts51857e44642ac79a4b1f458de786b97d98762082 and additive guard846d9f7e4b491af283ad8bdd778da0cb8e00b17d are preserved.

## Smallest proposed correction

1. Add an explicit allowlisted local phase marker immediately before CA validation, native driver loading, AF_INET6 DNS resolution, hidden-input validation, native connection establishment and guarded SQL. A phase records where execution was, not where a remote protocol failed. Never infer TCP/TLS/authentication success from reaching native_connect.
2. Replace the one-line raw-byte ternary with one pure private classifier. It must accept only bounded native diagnostic bytes in process memory and return a fixed enum. Never return snippets, raw text, paths, addresses extracted from the message, connection strings, SQLSTATE guessed from prose, or exception repr/str/tracebacks. Unknown, oversized, ambiguous, differently worded or localized diagnostics fail closed as CONNECTION_FAILURE_UNCLASSIFIED. Missing native handle is NATIVE_HANDLE_UNAVAILABLE rather than assumed out-of-memory.
3. Add typed local exception classification, based only on operation and type: socket.gaierror at ipv6_dns becomes IPV6_DNS_FAILED; native library load failure becomes DRIVER_LOAD_FAILED; other unexpected driver errors become DRIVER_OPERATION_FAILED without exception text. Do not catch-and-continue or retry. Explicit existing GuardError settings/identity/security denials remain unchanged.
4. For native errors, recognize only fixed reviewed patterns as observations, using the table below. If multiple incompatible classes match, return unclassified. Do not treat every SSL error as certificate verification failure, and do not treat all authentication errors as an incorrect password.
5. Emit only code, phase, helper source identity, elapsed native-call milliseconds and fixed policy/observation fields. The requested policy may say verify-full is required, but TLS/hostname/authentication remain unverified on failed establishment. No password length/hash/fingerprint, credentials, environment dump or native option dump. A successful native connection must still pass the existing actual on/5s/30s, same-physical-connection/transaction and rollback checks before producing any success receipt.

| Fixed native evidence pattern family | Proposed enum, diagnostic only |
|---|---|
| password authentication failed | AUTHENTICATION_FAILED |
| SASL/authentication negotiation rejection | AUTH_NEGOTIATION_FAILED |
| no pg_hba.conf entry/access policy rejection | SERVER_ACCESS_REJECTED |
| certificate validation/hostname mismatch | TLS_VERIFY_FAILED |
| other recognized SSL/TLS handshake errors | TLS_HANDSHAKE_FAILED |
| server reports SSL unsupported while required | TLS_REQUIRED_UNAVAILABLE |
| native name resolution error | NATIVE_NAME_RESOLUTION_FAILED |
| network unreachable/no route | IPV6_ROUTE_UNAVAILABLE |
| connection refused | TCP_REFUSED |
| connection reset/server closed unexpectedly | CONNECTION_INTERRUPTED, protocol stage unknown |
| connection timeout expired | CONNECT_TIMEOUT, protocol stage unknown |
| recognized database/role/startup parameter rejection | SERVER_STARTUP_REJECTED |
| no usable native handle | NATIVE_HANDLE_UNAVAILABLE |
| absent/unrecognized/ambiguous/oversized diagnostic | CONNECTION_FAILURE_UNCLASSIFIED |

These enums describe observed error families. They are not independent proof of a root cause, a bad password, complete TLS verification or authenticated safeguard success. Repeated/combined server messages need conservative precedence or an unclassified result. Preserve older public codes where useful without falsifying their meaning.

## Offline acceptance before any separate live step

Use fake native libraries and blocked socket/DNS functions only. Test route, refusal, reset, native timeout, Python DNS exception, native DNS text, verification versus handshake failure, SSL-required rejection, password-specific versus other auth rejection, startup rejection, missing handle, local driver exception, unknown/localized/oversized/multiple diagnostics, safe enum-only output and no retries. Include synthetic credential-looking strings in mocked messages and assert none is reflected or stored, without using real credentials. Test all error paths still close the handle/clear owned input buffers and stop before inspection/reservation. Preserve all existing21 Python and17 Node safeguards and actual same-connection tests; the current13 classification reproductions test OLD behavior only and do not validate this proposed change.

## Preserved boundaries and next step

Direct qjksggxorghaxvpyslip only; exact database/user postgres, port5432, AF_INET6, documented CA and hostname verification, sslmode=verify-full, on/5s/30s, explicit READ ONLY transaction, no reconnect/pool/Session Pooler/fallback, no persistent settings, no production, no deployment. Original cleanup and one-reservation controls unchanged.

Exact next step: review this local-only diagnostic change and its offline test plan. If approved, implement and validate offline first. Any later network/password diagnostic must be separately bounded and use a fresh hidden prompt if needed. This proposal neither opens that prompt nor authorizes a connection or deployment. The existing deployment allowance remains unused and conditional on actual safeguards and every original gate.
