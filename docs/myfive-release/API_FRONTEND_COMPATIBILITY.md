# Coordinated My Five API/frontend candidate

This branch explicitly composes the previously reviewed canonical API/frontend files from eae9997715b0a51a4a34ca4ee025c1614435951a. API_SOURCE_MANIFEST.json records exact source bytes. No feature branch was merged, no public API was opened and the pinned application is not replaced. The SQL candidate is separately owned/reviewed and must be bound by exact hash before any hosted proposal.

## Reused unchanged

- Canonical connections route: removes obsolete five-active add/reactivation prechecks; session-derived owner, bounded literal name search, default25/max50 keyset page, immutable created_at/id ordering and owner/query-bound cursor.
- Pagination helper: strict returned owner/field/stage/order/cursor validation, Unicode codepoint limits, no private-note search. Exact total remains null/completeness unverified; maximum51 lookahead requires provider acceptance.
- Client: always allows preparation of adding another relationship; first/next/filter/search, truthful page counts, generation/abort handling and session-boundary clearing. Superseded or session-invalidated replies cannot repopulate private data. No automatic uncertain mutation retry.
- Canonical add/status acknowledgment requirements preserved. Status PATCH has owner/id/status/updated_at predicate. The inherited generic route is not an idempotent full revision service; dedicated person-note endpoint retains optimistic concurrency.
- Personal notes/reminders, Share Hope recipient consent and original-inviter lineage stay in their existing contracts. Mentor/group affiliation is not original attribution or private-note authority. Dashboard six-row sample and strict narrower read projections stay bounded; a sample is not all due reminders.

## New offline session evidence

Eight focused tests load the actual shared requireSession/activeSession implementation and actual connections handler; only backend configuration, transport and deployment wrapper are replaced with synthetic in-memory fixtures. No network or credentials. Tests deny revoked/ambiguous/unavailable/error active-session results; anonymous request; expired access with rejected refresh; refreshed access whose session remains inactive; and revoked POST. All deny before downstream relationship/flag queries. This tests the API guard, not provider token revocation, JWT verification or production routing. The ordinary deployment guard is intentionally outside this harness; existing deployment tests remain separate evidence.

Prior client browser/session-invalidation evidence remains exact-source because the composed client is byte-identical. Do not call that a fresh hosted browser test. No new browser UI behavior was introduced in this package.

## Release limitations

Existing owner-only table RLS accepts bare authenticated owner claims independent of active-session helper. The previous disposable test demonstrated this limitation. Do not call database-level revocation verified. Any stricter database session policy is separate scope and migration review. Current API denies inactive sessions; potential time-of-check/time-of-use races are not solved by this cap-only correction.

Provider row caps, locale/ILIKE equivalence, PostgREST query/response semantics, hosted session invalidation and older consumers require a separately authorized isolated acceptance. Empty/short page cannot establish complete dataset. Keyset traversal is not an MVCC snapshot; refresh for newer records. Duplicate adds are distinct requests/records; reconciliation precedes retry after ambiguous acknowledgment. Counts have distinct active/reach definitions and must not be conflated.

Adults-only audience decision does not supply actual eligibility evidence. Unknown contact age, privacy ownership, retention and withdrawal decisions remain release holds. No new minor collection, Auth system, permissive endpoint, role, messaging, hosted write, provider operation or deployment.
