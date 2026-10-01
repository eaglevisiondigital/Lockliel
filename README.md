# Lockliel

The supported application is Next.js static export (`out/`) with Netlify functions
and Supabase. Read AGENTS.md and the four continuity documents before changes.
`README-V63.md`, Sites/Vinext helpers, D1 examples and `db:generate` are legacy
artifacts, not the member platform migration or deployment contract.

## Local validation

Use Node.js >=22.13 (CI uses 22; this package verified locally on 24.20) and npm.

```sh
npm ci
npm run validate:netlify
npm run lint:tooling
npm test
npm run typecheck
npm run test:sql
npm run lint
```

For the fixed migration-275 security investigation only, run
`npm run test:sql -- --review-275`. It creates the same socket-only disposable
PostgreSQL 17 cluster, replays 274, reproduces the original upsert failure, then
tests exact 275 under disposable and hosted default grants in rolled-back
transactions. The fixture demonstrates excessive inherited service privileges and
proves the learner RPC works after a **test-only** revocation. It is not an applied
fix, does not advance any hosted branch, and accepts no connection parameters.

The corrective regression profile is `npm run test:sql -- --review-279`. It preserves
the old274 upsert reproduction, applies275–278 in order inside disposable
transactions, demonstrates inherited service-role TRUNCATE, then applies the exact279
file and requires denial and working learner/RPC access. Both default-ACL profiles
are covered. The full `npm run test:sql` now replays279 and includes the post279
private-notes privilege test. See `docs/course-release-279-runbook.md` for the pinned
five-stage package and remaining hosted approval boundary.

`npm test` builds with Webpack, then runs every Node test with network protection.
`npm run test:unit` reuses an existing `out/` build. `npm run validate` combines
these supported checks except repository-wide lint, whose existing debt remains
visible through `npm run lint`. Do not describe that narrower gate as a clean
repository-wide lint result.

Webpack is the supported Next.js build and development path. Turbopack is not
required. `npm run dev` serves the frontend; it does not emulate Netlify functions.
Static exports do not support `next start`, so that misleading script was removed.
Netlify deploys `out/` and functions according to `netlify.toml`. No deployment is
performed by local validation. Module validation is not Netlify cloud integration
or browser validation. Never use real member accounts for automated tests.

Deploy previews and local/unknown Netlify contexts render static pages but return
503 for connected features. All handlers require trusted invocation
`context.deploy.context === 'production'`; there is no local environment-variable
bypass. Handler tests explicitly supply simulated production context and fake
transports under the network guard. Do not point local development at live data.
Builds strip Netlify form-detection attributes unless build CONTEXT is production;
the production build preserves the original forms. An edge guard separately
blocks native form submissions and connected GET routes in previews. See
`docs/deployment-safety-review.md` before any controlled push or browser testing.

## Isolated SQL tests

Install PostgreSQL 17 and place `initdb`, `pg_ctl`, and `psql` on PATH. On macOS
with Homebrew PostgreSQL 17, use `export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"`
(adjust for Intel installations). Run as a normal user, not root. CI installs
PostgreSQL 17 from its official Ubuntu package repository.

`npm run test:sql` creates a disposable cluster with a private Unix socket and no
TCP listener. It accepts no connection arguments, discards database/environment
credentials, verifies cluster identity, rolls back fixtures and removes its own
cluster. It never connects to the linked Supabase project. No Docker is required.

Tests use real PostgreSQL RLS and repository functions, with minimal test-only
Auth/Storage compatibility tables. They do not emulate GoTrue, PostgREST or
Storage HTTP behavior. The authoritative chain now includes a guarded reconstruction of missing historical
review/share DDL. It replays without historical test supplements. The ordering
exception, existing-environment safety, targeted schema comparison and pending
email release plan are documented in [the reconciliation record](docs/migration-reconciliation.md).
Do not run linked database pushes or history repairs as local validation.

## Test network safety

The Node preload blocks fetch, HTTP(S), HTTP/2, WebSocket, TCP/TLS, UDP and DNS.
Attempts fail the process even when caught by application code. Explicit test
transport mocks are allowed. Resource signup tests inject both Forms and CRM
transports. The guard prevents accidental calls through covered Node interfaces;
it is not an OS sandbox against arbitrary native child processes or malicious
replacement of built-ins. Never supply production credentials to tests.

Keep local secrets in ignored environment files. No secrets are needed for these
checks. Source, SQL migrations, templates and continuity documents remain tracked.

## Exact migration-release rehearsal

This additional release gate is distinct from the all-274 fresh replay. It starts
at a reconstructed 272-entry live-like ledger, then uses the actual pinned
Supabase CLI 2.118.0 to reach 273 and 274 independently. It accepts no connection
arguments and never uses production credentials. Supported here: macOS arm64,
PostgreSQL 17, the reviewed CLI binary and an OS-level outbound IP deny policy.
Do not substitute a production connection or run these fixtures live.

Install the pinned CLI outside the repository as described in
[the runbook](docs/production-migration-runbook.md). Set `LOCKLIEL_SUPABASE_BIN` to
its absolute darwin-arm64 binary path. Its version and SHA-256 are enforced by the
rehearsal. On macOS, run with native subprocess/socket permission as needed:

```bash
/usr/bin/sandbox-exec \
  -p '(version 1)(allow default)(deny network-outbound)(allow network-outbound (subpath "/private/var/folders") (subpath "/private/tmp"))' \
  /usr/bin/env -i PATH="$PATH" TMPDIR=/private/tmp \
  LOCKLIEL_SUPABASE_BIN="$LOCKLIEL_SUPABASE_BIN" \
  node scripts/rehearse-migration-release.mjs
./node_modules/.bin/eslint scripts/prepare-migration-release.mjs \
  scripts/check-migration-preflight.mjs scripts/rehearse-migration-release.mjs \
  tests/migration-release-preflight.test.mjs
```

It fails closed if IP egress denial is not verified, uses generated local SCRAM
credentials, verifies its private cluster and removes only that disposable cluster.
The statement-timeout negative test intentionally takes about 30 seconds.
Seven SQL files run at each checkpoint, with transaction rollback. Platform stubs
and reconstructed ledger statement formatting limit full Supabase equivalence.
The offline packaging/preflight regressions are included in the standard Node suite.
The rehearsal also proves the actual CLI generates only the permitted
`supabase/.temp/cli-latest` cache after dry-run, verifies the package again, and
rejects an extra cache child. All other package paths and migration hashes remain
exact; symlink substitutions are rejected.

`prepare-migration-release.mjs` only copies hash-verified files into a new external
directory. `check-migration-preflight.mjs` only checks JSON captures offline. Neither
connects to the database. Read the runbook's manual gates and STOP conditions;
passing scripts alone does not authorize production release or account changes.
