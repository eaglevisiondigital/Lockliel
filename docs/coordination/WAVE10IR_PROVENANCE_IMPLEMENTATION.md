# Wave 10I-R private provenance implementation

Local implementation only. No private registry was installed, no credential was read, and no hosted account was created. The ordinary acceptance-fixture provenance register remains the coordination index. This module implements its private evidence-record design rather than a competing account registry.

## Delivered implementation

`scripts/fixture-provision/provenance-store.mjs` provides:

- `createFixtureProvenanceStore`: initializes one new generation in two already-existing empty owner-only directories. It neither creates a live grant nor chooses an installation location.
- `appendFixtureProvenance`: appends a bounded, schema-validated lifecycle event for exactly A or B.
- `reopenFixtureProvenanceStore`: verifies every immutable record and anchor against an independently retained expected checkpoint. A directory alone cannot supply its own expected head.
- `inspectFixtureProvenance`: returns noncredential logical state, always with `authority:false`, `hostedAcceptance:false`, and `retryAllowed:false`.
- `prepareFixtureMappingEvidence`: returns a private, hash-only derivative after both accounts have recorded verification. Its status is `REQUIRES_INDEPENDENT_APPROVAL`; it cannot satisfy the deployment operator's independently approved mapping or any of its sixteen Auth flags by itself.

The strict creation header fixes qjksggxorghaxvpyslip, course-cutover-rehearsal-274, its approved branch identifier, and purpose `isolated-my-lockliel-ordinary-ab-acceptance`. It records only source/authorization/independent-identity/attempt/native-before hashes, generation, creation time and synthetic-test classification. These are references to evidence, not self-authenticating authority. The trusted operator must establish the original sources before invoking the writer.

No password, token, raw session, raw user UUID, email, arbitrary provider response or free-text error is admitted. Private subject/profile/creation/login digests remain privacy-sensitive and must not be copied into ordinary reports or Git. Hashes must refer to the reviewed allowlisted noncredential projection, never to credential-bearing payloads.

## Lifecycle and reconciliation

Initial state is PLANNED for A and B. Allowed transitions are:

- PLANNED -> CREATE_CLAIMED -> CREATED_UNVERIFIED, AMBIGUOUS or REJECTED.
- CREATED_UNVERIFIED -> VERIFIED only with matching provider-projection evidence and independent native-post evidence.
- AMBIGUOUS -> RECONCILED_PRESENT or RECONCILED_ABSENT only with a separately authorized reconciliation reference and native evidence.
- RECONCILED_PRESENT -> VERIFIED; no reconciliation outcome permits another create claim.

B cannot be claimed before A has a recorded confirmed creation. A confirmed and B unattempted is PARTIAL. Ambiguous outcomes remain explicit. A and B must have distinct digests in every existing strict identity field. Both verification events must refer to the same native-post evidence. Rejected, interrupted and absent-reconciled records never authorize retry, replacement, account deletion or role changes.

A pending write marker remains after an interrupted append. Unbalanced record/anchor files, stale external checkpoints, missing files, bad sequence, invalid transition, or corruption stop reopening. A new process cannot silently reset a generation or retry its claimed account. Durable attempt consumption remains a separate operator control and is not replaced by these records. Wave 10I-J stays consumed.

## Integrity and filesystem boundary

Each record and anchor is exclusively created with mode 0400 and fsynced. Both directories must be canonical, different, non-nested, owner-owned mode 0700 paths. Symlinked paths, hardlinked records, permissive modes, substituted directory inodes, unknown files and noncanonical JSON are rejected. Records hash the preceding record; independently stored anchors hash the current record and preceding anchor. The caller must retain each returned checkpoint independently before advancing the operation. Reopening requires exactly that checkpoint, preventing silent rollback when either or both local chains are truncated.

This is an append-only API over trusted owner-controlled local storage, not an immutable filesystem against a malicious owner or privileged attacker. An attacker who can rewrite both roots and the independently retained checkpoint is outside this integrity boundary. Filesystem permissions and two sibling directories alone do not establish independent custody. Ordinary documentation is never the external approval seal. All failures return only `PROVENANCE_UNAVAILABLE`.

## Exact eventual installation and cleanup approvals

A separate exact hosted-creation assignment must name a custodian, approve the fixed private record and anchor locations outside Git/evidence/cloud synchronization, establish independently retained checkpoint custody, and bind the reviewed source and generation to the new dedicated allowance. No location, backup, sync service or live grant is installed by R. The fixed operator must reject alternate paths or caller-supplied execution authority.

Retention should cover the explicitly approved fixture lifetime and its later reconciliation history. A cleanup approval must separately identify the generation and exact synthetic records, verify no existing learner or course account is included, inspect dependent bootstrap rows, and specify account/data effects before any removal. No automatic hosted deletion, cascade, private-store erasure, retention expiry action, or old-course fixture modification is implemented or authorized. Keep partial and ambiguous provenance for independent reconciliation.

## Offline validation

`node --test tests/fixture-provenance-store.test.mjs` passes 29 tests: successful persistent two-account history, partial/ambiguous outcomes, real process restart, no duplicate claim, explicit reconciliation, exact targets and approval fields, leakage through getters/proxies/extra fields, lifecycle and digest mismatches, stale/truncated checkpoints, interruption marker, record/anchor corruption, missing/extra files, hardlinks, writable modes, symlink paths, traversal, directory replacement, and counterfeit handle rejection.

The independent reviewer identified an input-destructuring error that could let a hostile getter throw before sanitization. Entry arguments are now cloned and validated inside the fixed-error boundary, and the regression covers getters and proxies. Offline fixtures are synthetic and removed after tests. They provide no hosted provider or identity evidence.
