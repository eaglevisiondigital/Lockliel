# Lockliel MAIN CHAT #1 handoff: verifier and duration policy

RECOMMENDED THINKING LEVEL: HIGH

VERIFIER CORRECTION RESULT

Completed locally on lockliel-backend-v1. The captured production default ACL
service_role=arwdDxtm is now accepted as a creation default. It is kept separate
from actual final table/column access. Unknown profiles still fail closed.

FINAL NOTES SECURITY

Disposable final279 has zero service_role table and additive-column privileges.
Owner-only authenticated SELECT, session checks, RLS and private grading-key
protections remain intact. PUBLIC/anon access and member writes remain denied.
No migration bytes or production privileges changed.

DISPOSABLE ACL MATRIX

- A: Full production-like defaults, exact275–279 replay and CLI stages: PASS.
- B: Restricted defaults, same final zero service access: PASS.
- C:13 deliberate excessive actual table/column grant variants per profile: rejected.
- D: Missing279 and incomplete revocation: rejected by ledger/security verification.

DURATION POLICY

Approved: missing current trusted duration blocks NEW threshold achievement,
advancement and completion. Preserve telemetry and valid completed lessons.
Restored trusted configuration permits legitimate progression again.

The exact279 release FAILS cases3 and8 because cached historical watch credit
still authorizes new advancement/completion after trust is removed. This is now
reproduced by actual disposable authenticated RPC tests.

A local additive SQL proposal passes all8 focused cases. It checks current trust
before cached credit and preserves completed-lesson notes editing through a narrow
save-path correction. It is outside supabase/migrations, has NOT been promoted to
an authoritative280 migration, is NOT in PR4 and has not been deployed anywhere.

DURATION TESTS

| Case | Current279 | Local proposal |
|---|---|---|
| No duration/no evidence | PASS | PASS |
| No duration/partial evidence | PASS | PASS |
| Stale threshold must not grant NEW advancement/completion | FAIL | PASS |
| Historical completion and private notes remain intact | PASS | PASS |
| Trusted duration restored | PASS | PASS |
| Forged browser percentage | Denied | Denied |
| Seek-to-end | No threshold | No threshold |
| Wrong video identity or NULL/blank provenance | FAIL | PASS |

DURATION INVENTORY

TRUSTED DURATION INVENTORY: PASS.
TRUSTED DURATION PRODUCTION POPULATION: REQUIRES SEPARATE AUTHORIZATION.

All values below reuse the previously verified YouTube publisher structured metadata.
No new provider fetch and no production write occurred. Production NULL values are
the last read-only observation, not a fresh query in this local task.

| Lesson | Asset UUID | Video reference | Seconds | Source | Verification timestamp (UTC) | Last production value |
|---|---|---|---:|---|---|---|
| 1 | 42b28ff3-03fa-45b9-93e7-4a258b5bd768 | SJ5Ee7OXkkM | 1480 | [YouTube metadata](https://www.youtube.com/watch?v=SJ5Ee7OXkkM) | 2026-10-01T20:32:37.186832+00:00 | NULL |
| 2 | 0772dfe1-2e03-430f-bdc6-f691e2de7fcb | AEfPf609RgU | 1437 | [YouTube metadata](https://www.youtube.com/watch?v=AEfPf609RgU) | 2026-10-01T20:32:37.187764+00:00 | NULL |
| 3 | c8b4ea07-47be-43cd-b07c-35e80cbba6cd | 3CSBKubDefw | 1458 | [YouTube metadata](https://www.youtube.com/watch?v=3CSBKubDefw) | 2026-10-01T20:32:37.188346+00:00 | NULL |
| 4 | 495191a6-42c1-4c65-9aef-66de0f98583a | _NSjbNFcqQA | 1350 | [YouTube metadata](https://www.youtube.com/watch?v=_NSjbNFcqQA) | 2026-10-01T20:32:37.188565+00:00 | NULL |
| 5 | 9f91268c-923f-46af-a9aa-e75ddf68b889 | nWS8Km2kfKg | 1302 | [YouTube metadata](https://www.youtube.com/watch?v=nWS8Km2kfKg) | 2026-10-01T20:32:49.388570+00:00 | NULL |
| 6 | 6ab8a12a-f13c-48dc-8048-afe5fb26359f | enGySOvV4jg | 1456 | [YouTube metadata](https://www.youtube.com/watch?v=enGySOvV4jg) | 2026-10-01T20:32:49.423773+00:00 | NULL |
| 6 | 754a7b50-3f7b-455e-a147-18bf6ff3cd18 | TjuLVCy4gnQ | 1457 | [YouTube metadata](https://www.youtube.com/watch?v=TjuLVCy4gnQ) | 2026-10-01T20:32:50.674149+00:00 | NULL |
| 7 | 2cacacc1-b174-4d0a-b17b-6db3a56936ed | q_vUBJ8EgaU | 1501 | [YouTube metadata](https://www.youtube.com/watch?v=q_vUBJ8EgaU) | 2026-10-01T20:32:57.974716+00:00 | NULL |
| 8 | 41595092-d6b9-4ee0-aa61-5b6bf3917ec1 | 2VDVveA4RUQ | 1317 | [YouTube metadata](https://www.youtube.com/watch?v=2VDVveA4RUQ) | 2026-10-01T20:33:02.066825+00:00 | NULL |
| 8 | 8697594b-35e7-42ac-be40-520546fc2181 | g8b964SWekE | 1408 | [YouTube metadata](https://www.youtube.com/watch?v=g8b964SWekE) | 2026-10-01T20:33:04.960158+00:00 | NULL |
| 9 | 793e65ec-6eff-4a86-b650-6d9cb2dcff29 | HY1OyDdODL8 | 1338 | [YouTube metadata](https://www.youtube.com/watch?v=HY1OyDdODL8) | 2026-10-01T20:33:07.300480+00:00 | NULL |
| 9 | dadd7b47-5288-43d2-bd9b-f66d31f3ffd0 | vjY2BTUzxGU | 1472 | [YouTube metadata](https://www.youtube.com/watch?v=vjY2BTUzxGU) | 2026-10-01T20:33:13.498086+00:00 | NULL |
| 10 | 3b9819c7-b197-4e2e-af13-06ee5836b6ed | 5-1B6IouUNk | 1441 | [YouTube metadata](https://www.youtube.com/watch?v=5-1B6IouUNk) | 2026-10-01T20:33:13.517476+00:00 | NULL |

MIGRATION INTEGRITY AND VALIDATION

- All279 authoritative files/hashes unchanged, including275–279.
- 578 JavaScript tests pass.
- 279 migrations replay;16 SQL/RLS files pass.
- All8 duration cases pass with the local proposal overlay; three additional
  security/persistence SQL regressions also pass with it.
- Exact pinned five-stage CLI, full8/restricted defaults, TLS, rollback/timeout,
  disconnect classification, drain and publication-concurrency checks pass.
- Webpack/static build37 pages, TypeScript, Netlify validation, configured and
  targeted lint pass. No dependency changes; audit was not repeated in this package.
- Production networking was blocked for local validation. No real-data testing.

PRODUCTION PRESERVATION

No production/hosted-isolated DB access or writes, migrations, deployments,
Auth/SMTP changes, compute/PITR changes, privilege/settings changes, duration writes,
content activation, Share Library changes, main merge, push or environment deletion.

Last verified baseline is production274, main1599ab2, PR4 draft/open/unmerged at
eaff3fe, Netlify production6abbb27a1cdd6d00081b0e8e, ChatGPT Site25, Small and7-day PITR.
These remain carried-forward observations. This local task did not freshly audit
remote settings or guarantee that another operator made no changes.

ASSESSMENT

VERIFIER AND DURATION POLICY REQUIRE CORRECTION

The ACL mismatch is resolved. The duration fix still requires integration into a
revised authoritative release set. Passing the proposal does not make279 compliant.

NEXT STEP

Review/promote the additive duration correction, revise the staged release manifest,
expected catalogs and maintenance readiness, reconcile superseded history-policy
tests, and rehearse the complete revised release locally. Then separately scope
isolated acceptance and a development checkpoint. Do not deploy, merge or populate
production durations until a new explicit assignment authorizes those actions.
