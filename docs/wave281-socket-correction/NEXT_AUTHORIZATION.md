# Proposed one-fixture authorization — NOT EXECUTED

Authorize exactly ONE disposable PostgreSQL 17 fixture from the corrected source identified in RESULT.md, after verifying its 25-file derived seal, preserved historical 22-file seal, all 280 baseline hashes, candidate 281 SHA256 cacea34fc29561bc905b61b7eb1f7767405f16cef0761e8e9534e59380c4fb5a and 40 protected operator files.

Use the source-pinned runner scripts/test-wave281-containment.mjs with installed PostgreSQL 17 binaries on PATH. The runner allocates one private /private/tmp/l281-* root, verifies resolved socket UTF-8 bytes including NUL, disables TCP, replays exact 280→281 and runs the unchanged reviewed SQL containment suite. Verify structural fingerprints, participant/nonparticipant owner isolation, direct SQL/RPC boundaries, concurrency, exact-record cleanup, rollback and final course/catalog restoration. Independently verify removal of only the owned fixture and its process.

Before execution require clean exact source and absent new startup/source/cleanup evidence directory AND absent fixed reviewed SQL evidence directory. Never delete previous evidence to make a run possible. Retain sanitized startup diagnostics, source receipts and cleanup evidence. Stop on mismatch, ambiguous ownership or failure. No automatic retry/replacement; forced termination or power loss requires owner review of exact residue.

No hosted REST acceptance is inferred from SQL. No hosted/provider/production access, credentials, accounts, messages, payments, Netlify reservation, deployment, push or merge. J diagnostic remains CONSUMED; application reservation remains UNUSED. This preparation creates no new allowance; explicit fresh owner approval is required before running.
