# W4 Bible and Faith Journey contracts

## Wave 2 status, November 1, 2026

Dave subsequently authorized actual isolated memory-only React prototypes. See
[WAVE2_RESULT.md](WAVE2_RESULT.md) for that implementation and verification scope.
The historical Wave 1 text below remains a contract-only snapshot; live providers,
durable persistence, sharing delivery and crisis runtime remain held.


Recorded November 1, 2026. Status: implemented local contracts and synthetic tests;
not integrated, released or verified against a live Bible provider or hosted database.

Authorization is Dave's new next-phase assignment, reconciled in the root coordinator's
`docs/coordination/NEXT_PHASE_AUTHORIZATION.md`. The narrower override governs the
older prepared drawer assignment. No broad feature or release authority is inferred.

- Branch: `codex/lane4-faith-contracts`.
- Exact base and current HEAD: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
- Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane4-faith-contracts/Lockliel`.
- New files remain uncommitted for coordinator review. No checkpoint or push performed.

## Artifacts

| File | What exists |
| --- | --- |
| `lib/faith-journey/contracts.ts` | Typed version, rights-review, edition-specific reference, provider, private-domain and sharing-review shapes |
| `lib/faith-journey/index.ts` | Pure reference parser/edition validation, guarded synthetic provider, private memory-only prayer/anchor drafts and non-delivering share-review checks; no network, keys, storage or real verses |
| `tests/faith-journey-contracts.test.mjs` | Guarded synthetic reference, rights, unavailable, response integrity and privacy-envelope regressions |
| [Provider and licensing analysis](provider-licensing.md) | Current official public terms, unresolved decisions and provider-specific readiness gaps |
| [Private domain architecture](private-domain-architecture.md) | Data boundaries, future lifecycle/sharing interfaces and held privacy/crisis gates |

This is actual contract implementation, not a claim that Bible, Prayer Board or action
plans are functioning member features. Existing course-language `translation_key`
remains separate from Bible version identity. Existing My Five Pray remains transient
reflection, not a durable Prayer Board. No existing source files were changed.

## Contract behavior and limits

Requests must name provider, version and edition. There is no default translation or
silent fallback. Syntax parsing alone does not establish an edition-valid passage:
all coordinates must be present in the injected versification and inside the request
budget. The synthetic adapter invents small verse-count maps and clearly marks every
text placeholder as not Scripture. Its fixture rights expire at a fixed date and tests
use an explicit fixed clock, so synthetic evidence cannot authorize a real version.

The parser initially recognizes 66 English book names/IDs and selected abbreviations,
with a single explicit verse or same-book verse range. This is a bounded parsing
vocabulary, not an approved product canon. Chapter-only inputs, multiple passages,
verse suffixes and unrecognized books/locales fail closed. Future canon, language and
versification support needs explicit contracts and tests; no text is silently remapped.

A reviewed rights object must explicitly permit the use, territory, attribution and
telemetry decision. Display permission does not imply cache, export or sharing rights.
Unavailable versions, rights failures, provider errors and mismatched responses do not
select another version. Provider errors and unknown tracking fields are not forwarded.
Plain text rejects HTML/control payloads; a future UI must still render as text and must
not use untrusted HTML. No UI or accessibility acceptance was executed for a drawer.

Rights metadata here is not an entitlement or legal authorization engine. A future
live service must load policy from a trusted reviewed server registry, bind the real
API credentials there, enforce aggregate/provider-specific limits, and revalidate
rights immediately before any display/cache/export/delivery. Browser-supplied approvals
must never grant access. Current contracts are not a complete compliance implementation.

TypeScript `Readonly` annotations are not database RLS or runtime authorization. Draft
owner IDs are supplied synthetic identifiers, not authenticated identities. Share-review
success means only that a synthetic form can be reviewed; delivery remains held.

## Checks performed

Final focused validation: 67 JavaScript tests passed, isolated strict TypeScript passed
without a tsconfig change, and targeted ESLint passed. Tests were run
with the repository's `tests/support/network-guard.mjs`, which blocks fetch and Node
network transports and fails on an attempted call. No production access or licensed
content ingestion occurred. The entry point uses only erased type imports, so native
Node 24 type stripping and the unchanged project TypeScript settings both accept it. Isolated strict TypeScript and targeted lint cover the new
contract files. No migrations, full application build, SQL replay or hosted acceptance
are needed to claim this unintegrated contract slice, and none is claimed here.

## Held work and smallest next action

Interactive Scripture drawer, member preference persistence, live provider adapter,
licensed text ingestion, schema/migrations, durable prayer/growth/actions, sharing
runtime, recommendation runtime and crisis intervention remain held. Shared Auth,
course-player, tokens, navigation, dependencies, build/manifests and root registers
were not edited.

Next: coordinator reviews this local contract diff; owner records provider/version,
commercial-use classification, default/fallback policy and sensitive-data lifecycle
choices. A separately authorized synthetic drawer can then consume these contracts
through Lane 3's design contract, with Lane 2 integration requested rather than edited.
No provider account, purchase, credential request or production change is part of this step.

## Reproducible focused commands

Run from the dedicated worktree with the already installed Node 24 and repository dependencies:

```sh
/opt/homebrew/opt/node@24/bin/node --import ./tests/support/network-guard.mjs --test tests/faith-journey-contracts.test.mjs
/opt/homebrew/opt/node@24/bin/node /Users/davesmacbookpro/Documents/ChatGPT/Lockliel/node_modules/typescript/bin/tsc --noEmit --strict --target ES2020 --module preserve --moduleResolution bundler --skipLibCheck lib/faith-journey/*.ts
```

Targeted lint used the installed ESLint against `lib/faith-journey/*.ts` and
`tests/faith-journey-contracts.test.mjs`. A temporary `node_modules` symlink to the
existing root dependencies was removed afterward; no install, dependency or lockfile
change occurred. A full application build, SQL replay and hosted acceptance were not run. Final scope
inspection found six new files, all in the allowed paths, with no tracked-file changes.
All 280 migration files matched the exact HEAD bytes by SHA-256 comparison. The
worktree remains at its base HEAD; no commit, push, merge or deployment occurred.
