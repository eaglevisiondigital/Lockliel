# LOCKLIEL MY FIVE DISPOSABLE DATABASE VALIDATION RESULT

Continuation from `775ed05`. Local PostgreSQL 17 validation only. **LOCAL DATABASE CORRECTION BLOCKED**: the one disposable run stopped on a test-harness error before all required acceptance checks completed. The SQL correction itself did not cause this error.

## Actual ownership

| Lane | Agent | Branch / worktree |
|---|---|---|
| Disposable database; sole fixture owner | continuity_member | codex/myfive-disposable-sql; /private/tmp/lockliel-myfive-sql-validation |
| API/database compatibility | continuity_myfive | codex/myfive-sql-compatibility; /private/tmp/lockliel-myfive-sql-compatibility |
| Independent security/performance review | continuity_adapter | codex/myfive-sql-review; /private/tmp/lockliel-myfive-sql-review |
| Safeguarding, release proposal and coordination | coordinator | codex/myfive-sql-coordination; /private/tmp/lockliel-myfive-sql-coordination |
| Independent Faith Boost schedule continuation | continuity_myfive, cross-reviewed by continuity_adapter | codex/faithboost-dst-review; /private/tmp/lockliel-faithboost-dst-review |

Original implementation/review worktrees and root dirty work are preserved. No branches are merged. The candidate cap SQL remains outside canonical migrations.

## Actual disposable execution

Executed source/evidence is preserved at `b9eca8ac1ad4ea3c05b6e638fdaedc45f13d8f49`. The first corrected but unexecuted harness is `bfd5de3b2ad0aa60f36f679bb7c49325e8e3afe7`; its three offline SQL-structure tests and lint passed. These structural tests do not certify PostgreSQL parsing or runtime acceptance.

One approved PostgreSQL 17 cluster used a unique private Unix socket, with TCP disabled and inherited connection settings stripped. Its data directory and socket-only connection were checked before SQL. The original fixture was stopped and removed after failure; no replacement was created.

Completed: all 280 unchanged migrations; all 17 existing SQL files; existing readiness/paused-read regressions; original sixth-contact cap reproduced; proposal transaction rollback; unchanged policies, ACLs, triggers, indexes and role attributes; authenticated creation and exactly-once cursor traversal of 5, 25, 100 and 1,000 rows; cross-owner SELECT hidden. These comprise 12 extension checks, separate from the 17 baseline SQL files, not a combined test count.

Stopped at cross-owner UPDATE/DELETE: a data-modifying WITH statement was incorrectly placed inside a SELECT subquery. PostgreSQL requires the data-modifying WITH at the top level. This is a validation-helper defect, not evidence of an authorization failure or success. The original receipt is `docs/myfive-sql/failed-run.txt` in the validation worktree.

Not reached or incomplete: cross-owner mutation and identity-column denials after the stop, complete search/status filtering, concurrent additions/updates/removals and same-row conflicts, duplicate/stale cases, session revocation, post-correction course compatibility, query plans/performance and full expanded-data rollback. Baseline course tests passed before the proposal; that does not substitute for post-correction compatibility. Performance and raw before/after catalog data were not emitted before the failure; equality assertions passed, but a retained full catalog/performance receipt is absent.

The unchanged source distinguishes API session checks from owner-only reach_contacts RLS. The fixture's auth helpers consume synthetic claims, not signed provider tokens. No conclusion about actual hosted token revocation follows from this unfinished run.

## Local compatibility correction

`f49581c57c035465c44d57cf5cf465d8be3c3759` fixes response character counting to match PostgreSQL code-point limits rather than JavaScript UTF-16 length. Existing 120/500/3000-character limits and all owner/shape/order/status checks remain. 17 focused tests (9 new and 8 retained), TypeScript and scoped lint passed. Search collation matching was not relaxed; actual SQL collation evidence remains pending. Whole-list reach metrics and active-page counts have distinct semantics and must not be conflated. Provider row limits and truncation remain hosted-acceptance requirements.

## Independent review

Review `0848f27872d074882a8ce7318a5693adf25aca2b` independently inspected the executed log, exact source and removed fixture path. Three source/proposal tests passed; the reviewer separately reran the three harness-structure tests and four Faith Boost tests. These repeated checks are not added to the author totals. The corrected fixture remains unexecuted, so the reviewer explicitly withholds runtime security/performance acceptance. Safeguarding and the narrow Unicode correction were reviewed without relaxing policy or owner boundaries.

Final review `fc9628ddb23765bfb7cc09e3271c0f1c8495e23c` seals prepared source `aef4e0283223bd89b1505d6b729c18b3f4b1f865`, verifies exact compatibility-file parity and corrected Unicode expectation, and independently passes 12 offline tests overlapping the author's 20. Runtime SQL acceptance remains blocked.

## Smallest next action

Prepared source `aef4e0283223bd89b1505d6b729c18b3f4b1f865` combines the corrected harness with exact reviewed helper/test bytes from `f49581c`, by explicit file copy and traceable local commit, not branch merge. The future SQL Unicode assertion now expects the corrected 120-code-point response behavior. Twenty focused offline tests and scoped lint passed; this count includes the original eight pagination, nine compatibility and three harness tests and must not be added to the earlier overlapping totals.

Obtain authorization for **one new disposable PostgreSQL 17 fixture** using this reviewed source, unchanged 280 migrations and the same unnumbered SQL proposal. The original single fixture was consumed and cleaned up. Do not recreate it or proceed to a canonical/hosted migration from this report. The exact command, after separate authorization, is `/opt/homebrew/opt/node@24/bin/node scripts/test-myfive-sql.mjs` in `/private/tmp/lockliel-myfive-sql-validation`, with PostgreSQL17 `/opt/homebrew/opt/postgresql@17/bin` on PATH. The harness strips inherited connection settings and creates only its own private Unix-socket cluster. Any further failure must preserve partial receipts and stop without automatic replacement.

## Safeguarding

[Explicit decision matrix](SAFEGUARDING_DECISIONS.md): adults-only initial member release is owner-approved direction. Adult eligibility evidence, whether contacts must be adults, permitted sensitive information, retention/deletion/withdrawal/suppression and a named accountable safeguarding owner remain unresolved. No new minor-data collection or inferred communication permission. Independent reviewer continuity_adapter reviewed the matrix without finding invented approval.

## Proposed next package

[Separately gated migration/release proposal](RELEASE_PACKAGE_PROPOSAL.md). A successful local test cannot authorize a hosted migration, certify provider/Auth behavior or resolve safeguarding decisions. A rollback must preserve records above five.

## Independent parallel continuation

Faith Boost source `f14e6dc5` was reviewed in its own worktree. Commit `50c79fa242ccc02f9ed23d8baea01172ded94d3e` adds four missing focused daylight-saving regressions for fall 2026 and spring 2027, exact daily 7 PM America/Chicago scheduling, boundary-state/reminder safety and seven identity series. All four tests and scoped lint passed; continuity_adapter cross-reviewed. No product defect or visual change was found, so application source was preserved. This is new regression coverage, not a new live broadcast or notification capability.

## Preserved boundaries

No provider operation, live credential access, hosted Auth, managed SQL, production change, message, payment, Netlify reservation, deployment, push or merge is part of this package. Local fixture writes use synthetic data only. J remains CONSUMED; application reservation remains UNUSED. No final visual approval or feature-live status is asserted.
