# Narrow My Five acceptance surface — offline only

This package is not installed, exposed, authorized for hosting or executable against any provider. Its planner models bounded synthetic operations without a transport. It reuses the canonical pagination validator; it does not create another relationship system. Fixed invented A/B UUIDs are test constants, not real account provenance.

## Exact proposed route/function inventory

| Route | Methods in proposed surface | Existing source | Constraint |
|---|---|---|---|
| /api/lockliel/connections | GET | netlify/functions/lockliel-connections.mjs | Require exactly one view=reach; only reachStatus/reachSearch/reachLimit/reachCursor query fields. Canonical owner-bound cursor parser. No general connections fanout. |
| /api/lockliel/connections | POST | same | Only addReachContact with invented-adult label, updateReachContact with exact run-created row and praying/paused state. No message, leader, permission, task or activity claims. |
| /api/lockliel/my-five | GET | netlify/functions/lockliel-my-five.mjs | Exact run-created owner row ID only. |
| /api/lockliel/my-five | POST | same | Versioned synthetic private-note test only. Reminder, shared/followed-up and generic update-details excluded from first surface. |

Existing function declarations are 60 requests/60 seconds and 30 requests/60 seconds per IP/domain respectively. These are source declarations, not independently observed provider enforcement. There is no new route or hosting configuration in this package. Source hashes are in ROUTE_MANIFEST.json. The original authenticated preview's three-route authority (member-read/login/logout) remains unchanged and cannot silently host these routes.

## Local controls actually implemented

lib/acceptance-281/synthetic-plan.mjs has no fetch, provider callback, credentials, persistent state or live activation. Commands are strictly allowlisted, immutable projections. Opaque object tickets tie acknowledgments to in-memory owner/action intent. Only acknowledged exact newly created IDs qualify for subsequent row operations. Attempts consume the proposed 70-add budget (A at most64 including four concurrency probes, B at most6) before acknowledgment; at most four in-flight and260ordinary requests preserve40of300 for separately reviewed cleanup. Failed/ambiguous acknowledgments interrupt the run; pending work is invalidated. Unknown rows, cross-owner mutations, foreign tickets, duplicate acknowledgment and DELETE are rejected. No name-prefix cleanup.

The budgets are proposed acceptance bounds, not owner approval or durable hosted single-use enforcement. A process restart creates a new synthetic model; this must NEVER be used as the execution-grant ledger. The existing consumed J grant and unused deployment reservation are untouched. Read mock completion {ok:true} only marks a planned step completed; it does not verify a canonical read response or independent receipt. Mutation test receipts are deliberately minimal synthetic projections, not raw production data. A separately reviewed native executor must positively allowlist/reconcile actual response fields and clear credentials without exposing notes.

## Mandatory unresolved write and containment gates

Course maintenance does not guard reach_contacts. A local planner/HTTP wrapper cannot prevent a session using direct REST or a different canonical route. Existing bare owner claims can satisfy row ownership after session invalidation even though the canonical API's session check denies. A hosted My Five acceptance therefore needs a separately reviewed database-enforced run/owner/operation boundary or equivalent demonstrably complete containment. No such guard is claimed implemented here. Do not issue real sessions for this planner.

Canonical APIs have no delete endpoint. Pausing is not deletion, and changing a row to paused is not cleanup. The exact created-ID/owner list can support a future independent cleanup proposal; no DELETE request is generated. A cleanup executor must bind the run, independently confirmed owners and baseline, verify row IDs twice, delete only those rows under separate authority, verify absence and preserve historical fixtures. Lost or ambiguous create acknowledgments require independent reconciliation before any continuation; never blindly retry or assume the unacknowledged row does not exist.

No migration or ledger rollback is planned as cleanup. After post-commit failure, stop writes and retain maintenance ON; use separately approved forward correction/recovery. Do not drop tables, truncate, delete historical contacts or restore production.

## Session and concurrency limits

Existing canonical requireSession checks active server session. Eight existing mocked-handler release tests cover revoked/missing session and expired/invalid token denials. SQL RLS and API session revocation remain distinct. Notes use caller version plus owner/updated_at compare-and-swap. Generic status uses a fresh read and predicate, not a client-stale-version protocol. Same-name add is not idempotent. These limitations remain visible; no fabricated at-most-once provider guarantee.

## Required independent evidence before execution

Fresh child-project/branch/operator authority and A/B synthetic provenance; exact migration281 statement/catalog/readiness fingerprints; same-connection safeguards; function/table/column ACLs, RLS, ownership, course security; exact installed source and provider route/rate receipts; approved adults policy; separately authorized surface, DB write guard, durable operation budget and exact-ID cleanup; independent fresh checks within five minutes. All currently missing live fields remain UNKNOWN.
