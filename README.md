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
Storage HTTP behavior. Two catalog-derived historical schema supplements are
explicitly logged because the original migration history is incomplete:
`founders50_reviews` and six `share_assets` columns. A successful supplemented
replay does not prove clean migration reproducibility or full live schema parity.
See CURRENT_BUILD_STATE.md for the pending email constraint correction.

## Test network safety

The Node preload blocks fetch, HTTP(S), HTTP/2, WebSocket, TCP/TLS, UDP and DNS.
Attempts fail the process even when caught by application code. Explicit test
transport mocks are allowed. Resource signup tests inject both Forms and CRM
transports. The guard prevents accidental calls through covered Node interfaces;
it is not an OS sandbox against arbitrary native child processes or malicious
replacement of built-ins. Never supply production credentials to tests.

Keep local secrets in ignored environment files. No secrets are needed for these
checks. Source, SQL migrations, templates and continuity documents remain tracked.
