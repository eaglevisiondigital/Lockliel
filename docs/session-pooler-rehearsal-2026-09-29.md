# Session Pooler rehearsal: startup safeguards not preserved

Observed 2026-09-29 11:00:41 UTC. Inspected clean development HEAD:
`3851f6d0caeb59b771feb6a3dfafa66cb07bc46a` on `lockliel-backend-v1`.
This assignment permits read-only connection review only, not migration execution.

## Endpoint and TLS

Authenticated project dashboard Connect dialog identified Session Pooler for
`bsndfhbemstyrrglajat`: `aws-0-us-east-1.pooler.supabase.com`, port `5432`,
username `postgres.bsndfhbemstyrrglajat`, database `postgres`. No transaction
pooler or port 6543 was used. IPv4 TCP connectivity succeeded.

Strict certificate and hostname verification succeeded with the official CA
linked by the project's Database Settings page:
https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt
The default local trust store initially rejected the chain; using the official
CA resolved trust without relaxing verification. Python TLS validation returned
TLS 1.2 and a matching `*.pooler.supabase.com` certificate. Authenticated psql
subsequently connected with `sslmode=verify-full` and this explicit `sslrootcert`.

## Observed incompatibility and stop

The URL supplied the unchanged startup options:
`-c lock_timeout=5s -c statement_timeout=30s -c search_path=public,extensions -c default_transaction_read_only=on`.
The only executed SQL was SHOW statements and `select current_database()`.

| Check | Required | Actual |
| --- | --- | --- |
| transaction_read_only | on | off |
| lock_timeout | 5s | 0 |
| statement_timeout | 30s | 2min |
| search_path | public,extensions | Default user entry, public, extensions |
| current_database | postgres | postgres |
| server_version | 17.6 | 17.6 |

Authentication worked after the operator used the separate project database
password. Earlier account-password attempts failed before SQL. Hidden local input
was passed via ephemeral PGPASSWORD with an empty mode-600 PGPASSFILE. No password
was placed in a URL, repository, persistent environment file or report.

The startup safety assertion stopped the helper immediately. This connection did
not preserve the reviewed settings. It is not approved as a transport-only
substitution. No claim is made that every pooler/client configuration behaves the
same; exact internal cause and any safe alternative remain unverified. Do not
remove the assertion or proceed with default settings.

## Checks completed and not completed

All 274 repository migration hashes and isolated prepared copies pass the
unchanged verifier. CLI version 2.118.0 and binary SHA-256 match:
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
No CLI database command ran. Exact plan, seeds, roles and actual runner behavior
through this pooler remain UNVERIFIED.

Pooler ledger/catalog identity, both release preflight captures, email
compatibility, public RLS fingerprints and quiet-window counters were NOT RUN.
Prior connector evidence at 272 is historical and does not replace these gates.
Expected pending versions remain `20260925035350` and `20260926212002`; this
rehearsal did not refresh the ledger. Earlier in this assignment the connector
reported ACTIVE_HEALTHY and no Security Advisor findings, and the public homepage
matched SHA-256 `2960679d8a5548ed57bbfc1a8c4e9daac241c80c450c99e022599758efee754d`.
These health observations preceded the final authentication attempt.

## Impact and next step

No migration, schema/data/ledger write, settings/permissions change, deployment,
merge or push was performed. No application, migration or release-tooling file
was changed. Both published websites were left untouched. The SQL session was
write-capable despite the requested read-only option, but only the listed
read-only statements ran before the stop.

SESSION POOLER NOT APPROVED FOR CONTROLLED MIGRATION RELEASE

Next proposed package: review how to restore connectivity to the approved direct
IPv6 endpoint and rehearse its strict TLS/startup options and pinned dry-run.
Alternatively, separately authorize investigation of a runner-compatible method
that proves all safeguards on the actual execution connection. No runner or
network/settings changes are authorized by this rehearsal. A new explicit
execution assignment and fresh release gates are required before migrations.
