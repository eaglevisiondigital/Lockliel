# My Five canonical migration local validation

LOCAL SQL VALIDATION PASSED; APPROVED TOOLING PROVENANCE CORRECTED. No hosted execution or production release authorized.

Executed source: `e97c0d8baea35303eb67349b09cc840bd32a64e5`, branch `codex/myfive-release-sql`. Candidate `supabase/migrations/20261104141125_lockliel_expand_my_five_relationship_capacity.sql`, SHA256 `cacea34fc29561bc905b61b7eb1f7767405f16cef0761e8e9534e59380c4fb5a`. CLI-generated using installed 2.81.3; binary/hash/procedure in PREPARATION.md. Function/revoke body exactly validated proposal; canonical header replaces proposal-only header. Original 280 file bytes unchanged.

## Actual execution

One disposable PostgreSQL 17.11 cluster with TCP disabled/private Unix socket; two databases, no replacement fixture/retry/recovery. Exit0. Exact280 upgrade path replayed original history, original17 SQL test files, operational maintenance/readiness checks, then candidate with38 expansion assertions. Fresh second database replayed all281 and updated17 SQL test files. Counts overlap; not34 unique test files. Ten offline tests passed (8 harness/control +2 canonical/history).

Upgrade checks cover owner/anonymous denials, private notes/column identity controls, original inviter and synthetic approved mentor separation,5/25/100/1000 pagination, search/status/timestamps, CAS concurrency, concurrent inserts/removals/counts, duplicate ambiguity, revoked-session predicate, preserved course rules. Expanded data survives exact original-function rollback; original cap again rejects subsequent insertion. Deliberate division-by-zero after candidate DDL rolls back function replacement. Final reapplied upgrade function and normalized grants/RLS/triggers/constraints match fresh281. No historical migration edited.

Eight authenticated-owner plans recorded at all four scales. Single samples, not SLA or scalability guarantees:

| Rows | Insert wall ms (CLI/triggers included) | Pages | Owner plan execution ms | Filtered plan execution ms |
|---|---|---|---|---|
|5|18.07|1|0.066|0.059|
|25|18.48|1|0.047|0.071|
|100|22.73|4|0.081|0.092|
|1000|72.02|40|0.242|0.379|

Plans retain existing owner/status index and sorting; no index/policy addition. Exact plans and raw synthetic receipts in evidence.json. No full application build/UI test repeated for this SQL-only change.

## Remaining boundaries

Inherited owner-only bare SQL RLS still returns1008 synthetic rows after session deletion although current-session predicate denies revoked session. API session gate remains separate; no DB-level revocation guarantee or policy correction claimed. Fixture C locale does not establish hosted Unicode collation.120 Unicode-codepoint name boundary passes. Duplicate name is not idempotent. Actual PostgREST/provider row limits, hosted defaults/triggers, live application binding and safeguarding/retention/age proofs remain separately gated. Old exact280 operational readiness is preserved and not silently broadened to281; hosted maintenance readiness needs separate review.

Cleanup receipt confirms only owned `/tmp/lockliel-myfive-sql-JhiVip` removed. Independent reviewer verifies receipt and absence separately. Existing earlier run evidence unchanged. No managed database/provider/Auth/credentials/production, migration deployment, maintenance change, push, merge, message/payment or reservation. J diagnostic remains consumed; application reservation unused. This creates one local candidate migration, not permission to apply it remotely.

## Tooling provenance correction

Coordinator review identified that the approved runner is2.118.0, SHA256 `8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`, pinned in scripts/prepare-migration-release.mjs. I selected an installed2.81.3 cache binary without establishing that approval. This was a preparation error. The generated candidate and exact successful SQL evidence remain preserved, but candidate creation does not meet the approved-tooling prerequisite. No installed matching hash was found in bounded cache/tooling checks; a broader filename-only search was stopped without result. No download/install or replacement fixture occurred.

Smallest next owner action: identify the approved2.118.0 binary path (or separately authorize tooling correction). Verify its hash, use its migration-new command locally, reconcile the generated filename and identical SQL bytes explicitly. Existing SQL tests need not repeat solely for identical bytes under a different filename. Do not call the canonical release package ready while this gate is unresolved.

## Approved tooling correction completed

The coordinator supplied exact approved CLI2.118.0 with independently matched8bcf9b checksum. Initial clean-env invocation attempted a telemetry-file write outside the sandbox and failed; no migration was created. DO_NOT_TRACK=1 suppressed telemetry and version/help/local migration-new succeeded under normal sandbox/network restriction. The new canonical filename is `20261104142104_lockliel_expand_my_five_relationship_capacity.sql`. Its entire SQL file is byte-identical (cacea34f… hash) to the executed candidate. The previous local candidate alone was removed from the working migration directory; retained sourcee97c0d8 and original execution receipts retain its exact old filename.

Current harness/offline tests reference the new filename. No SQL rerun, provider call or extra fixture. CLI_PROVENANCE_CORRECTION.json records the exact mapping. This closes the local artifact-generation provenance issue; all hosted/security/owner-policy release holds remain.
