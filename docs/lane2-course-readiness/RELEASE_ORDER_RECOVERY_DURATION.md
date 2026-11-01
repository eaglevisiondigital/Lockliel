# Exact release-order, recovery and duration packet

Prepared November 1, 2026. **Plan only; no production execution authority.**

This packet preserves the approved course source and immutable migration history.
It does not schedule a release, request credentials, reopen either environment,
populate durations, activate content, merge PR #4 or choose a publishing route.

## Immutable migration sequence

Application: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
Migration source: `a09280eede4fd12391a6aa97e91eac65ef638e3f`.
Manifest: `supabase/verification/course-release-280/manifest.json`.
Pinned CLI: 2.118.0, SHA256
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
CLI availability/binary identity was not newly tested; revalidate before an authorized stage.

| Ordinal | Exact file | SHA256 |
|---|---|---|
| 275 | `20260929215159_lockliel_course_engine_standard.sql` | `2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1` |
| 276 | `20260930092000_lockliel_course_release_trigger_execution.sql` | `83c7ea72d55b518c0ecb3704bc052bbc8be535c9b6b5461a6bf2224f2044b8ed` |
| 277 | `20260930092500_lockliel_course_conflict_http_status.sql` | `42ca6baea8c16e599f04f5aa52823362b862761943e9e37e4e7ba19c986bcaf0` |
| 278 | `20260930145334_lockliel_media_publication_authorization.sql` | `7b86fc4647338537a4da06e363b716ce2f7960cb02fb28ec8acab2f26c926ea0` |
| 279 | `20261001133500_lockliel_private_notes_service_privileges.sql` | `5fbcf6d942583ea2e79cb2ae356f6ee712314fe749fb97130e9a21e962c10f71` |
| 280 | `20261001211009_lockliel_current_trusted_duration_progression.sql` | `bb8af646303725c9c29ddc7119c5d8aefe2bf0afb91c206ffa8baa1a08e1b1c3` |

The existing local source verifier freshly checked all 280 files and their pinned
Git-source bytes. It did not prepare staging directories or run CLI dry-runs/migrations.
Production remains 274 by coordinator evidence; expected pending set begins 275.
Isolated 280 is completed: never replay 275–280 there. Do not use the old 274 runner
on this branch, edit applied bytes, renumber files or trust a successful client exit
without independent ledger/catalog/postcondition verification.

## Trusted duration inventory, not production population

The following is the approved October 1 provider inventory from
`docs/getting-a-grip-duration-inventory-2026-10-01.md`, not a fresh provider fetch.
Production NULL observations in the copied table are historical October 1 evidence,
reconfirmed in October 19 readiness review, not a new November 1 production read.
No duration value is written by this packet.

| Lesson | Asset UUID | Video reference | Seconds | Source | Verified at (UTC) | Last observed production value |
|---|---|---|---:|---|---|---|
| 1 | `42b28ff3-03fa-45b9-93e7-4a258b5bd768` | `SJ5Ee7OXkkM` | 1480 | [YouTube metadata](https://www.youtube.com/watch?v=SJ5Ee7OXkkM) | 2026-10-01T20:32:37.186832+00:00 | NULL |
| 2 | `0772dfe1-2e03-430f-bdc6-f691e2de7fcb` | `AEfPf609RgU` | 1437 | [YouTube metadata](https://www.youtube.com/watch?v=AEfPf609RgU) | 2026-10-01T20:32:37.187764+00:00 | NULL |
| 3 | `c8b4ea07-47be-43cd-b07c-35e80cbba6cd` | `3CSBKubDefw` | 1458 | [YouTube metadata](https://www.youtube.com/watch?v=3CSBKubDefw) | 2026-10-01T20:32:37.188346+00:00 | NULL |
| 4 | `495191a6-42c1-4c65-9aef-66de0f98583a` | `_NSjbNFcqQA` | 1350 | [YouTube metadata](https://www.youtube.com/watch?v=_NSjbNFcqQA) | 2026-10-01T20:32:37.188565+00:00 | NULL |
| 5 | `9f91268c-923f-46af-a9aa-e75ddf68b889` | `nWS8Km2kfKg` | 1302 | [YouTube metadata](https://www.youtube.com/watch?v=nWS8Km2kfKg) | 2026-10-01T20:32:49.388570+00:00 | NULL |
| 6 | `6ab8a12a-f13c-48dc-8048-afe5fb26359f` | `enGySOvV4jg` | 1456 | [YouTube metadata](https://www.youtube.com/watch?v=enGySOvV4jg) | 2026-10-01T20:32:49.423773+00:00 | NULL |
| 6 | `754a7b50-3f7b-455e-a147-18bf6ff3cd18` | `TjuLVCy4gnQ` | 1457 | [YouTube metadata](https://www.youtube.com/watch?v=TjuLVCy4gnQ) | 2026-10-01T20:32:50.674149+00:00 | NULL |
| 7 | `2cacacc1-b174-4d0a-b17b-6db3a56936ed` | `q_vUBJ8EgaU` | 1501 | [YouTube metadata](https://www.youtube.com/watch?v=q_vUBJ8EgaU) | 2026-10-01T20:32:57.974716+00:00 | NULL |
| 8 | `41595092-d6b9-4ee0-aa61-5b6bf3917ec1` | `2VDVveA4RUQ` | 1317 | [YouTube metadata](https://www.youtube.com/watch?v=2VDVveA4RUQ) | 2026-10-01T20:33:02.066825+00:00 | NULL |
| 8 | `8697594b-35e7-42ac-be40-520546fc2181` | `g8b964SWekE` | 1408 | [YouTube metadata](https://www.youtube.com/watch?v=g8b964SWekE) | 2026-10-01T20:33:04.960158+00:00 | NULL |
| 9 | `793e65ec-6eff-4a86-b650-6d9cb2dcff29` | `HY1OyDdODL8` | 1338 | [YouTube metadata](https://www.youtube.com/watch?v=HY1OyDdODL8) | 2026-10-01T20:33:07.300480+00:00 | NULL |
| 9 | `dadd7b47-5288-43d2-bd9b-f66d31f3ffd0` | `vjY2BTUzxGU` | 1472 | [YouTube metadata](https://www.youtube.com/watch?v=vjY2BTUzxGU) | 2026-10-01T20:33:13.498086+00:00 | NULL |
| 10 | `3b9819c7-b197-4e2e-af13-06ee5836b6ed` | `5-1B6IouUNk` | 1441 | [YouTube metadata](https://www.youtube.com/watch?v=5-1B6IouUNk) | 2026-10-01T20:33:13.517476+00:00 | NULL |

Provider authority: each canonical YouTube page's structured published ISO8601 duration,
converted to whole seconds with exact video identity/source/timestamp mapping. Five
pages also exposed a player length one second shorter; preserve the published metadata
choice and discrepancy rather than silently shortening thresholds. Lessons 6, 8 and 9 each
have two independent videos. Never use the synthetic 1344-second fixture value.

The current-trust 280 policy requires present trusted duration, provenance and the
correct immutable watched identity for NEW advancement. Historical legitimate completion
remains completed. Changes to material media use a new asset identity. Production
population requires separate authority after 275 creates provenance fields and while
maintenance is ON; the approved release sequence schedules it after independently
verified 280. Verify exact 13 identities, seconds and complete provenance. Lessons 11–13
retain Media Coming Soon with no invented video or bypass.

## Recovery and operator gates

| Gate | Evidence/status | Required completion before production window |
|---|---|---|
| Member baseline | Fresh coordinator 181 Auth users/181 profiles; purpose unresolved | Lane1/owner disposition and preservation baseline. No deletion/reset/grant by inference. |
| Storage bytes | Prior October 19: 13 production PDFs totaling 3,654,721 bytes; isolated 13 synthetic PDFs total 8,190 bytes | Named Storage custodian, approved private independent archive of exact originals, SHA256 manifest and retrieval check. PITR excludes object bytes; rehearsal fixtures are not backups. No export authorized here. |
| Restore operator | Dave named; prior Owner/MFA evidence | Confirm actual window availability and usable factor without sharing it. Dashboard visibility is not a recovery rehearsal. |
| PITR | Fresh coordinator UI: enabled, seven days; Small compute prior October 19 | Refresh actual available recovery range, usable pre-freeze point and coverage of the last accepted write after drain. Do not click restore as a probe. |
| Current isolated artifact | Four frontend byte matches; complete function/runtime binding uncertified | Safe current artifact/binding attestation before any new isolated credentials/test window. |
| Provider/network | Coordinator summary operational; earlier Ethernet/direct preflight passed | Fresh bounded provider/network/direct official-CA verify-full/hostname/authenticated read-only safeguards at actual cutover, under separate scope. No pooler substitution. |
| Legacy clients | Notice/save-copy/old-tab closure plan only | Separately authorized notice, allow draft/private-note preservation, confirm all old tabs closed, enable reviewed maintenance and drain. |
| Application release | PR #4 draft/open/unmerged; main controls Netlify production | Exact candidate/destination/window and one controlled publishing route chosen explicitly. No early merge or implicit combined Auth 274/course 280 activation. |

The PITR UI display in the coordinator's November 1 baseline spans October 25, 08:25:43
through November 1, 07:25:43, labeled Central Time. These raw display values cross the
seasonal clock transition; this packet does not infer UTC offsets from the single UI
label. Refresh unambiguous timestamps at cutover. A rolling window observed now is
not a future release recovery point, final-write guarantee or successful restore test.

## Ordered future production execution, requires separate assignment

1. Confirm named participants, Dave's restore availability/factor, Storage custody and
   verified byte-recovery source. Resolve member baseline and any selected containment gate.
2. Refresh provider, Ethernet/direct prerequisites and authenticated read-only production
   identity, 274 canonical ledger/catalog/security/aggregate preservation/locks checks.
   Require actual read-only ON, lock_timeout 5s and statement_timeout 30s for inspections.
3. Confirm usable PITR coverage, approved course-user notice, time to save/copy unfinished
   drafts and private notes, and closure of ALL old course tabs.
4. Under explicit authority enable only the reviewed course-maintenance mechanism; drain
   activity and verify recoverability of the final accepted write. Repeat closed preflight.
5. Apply exact 275 once. Reconnect read-only and independently verify ledger, expected
   catalog transition, postconditions, owners, ACLs and RLS. Stop on any uncertain result.
6. Apply exact 276 once and independently verify its stage, including reviewed trigger ownership/security.
7. Apply exact 277 once and independently verify conflict-status behavior/catalog transition.
8. Apply exact 278 once and independently verify publication/media authorization and protocol.
9. Apply exact 279 once and independently verify private-note effective service_role table
   AND column privileges zero. Creation defaults are not final privileges; TRUNCATE bypasses RLS.
10. Apply exact 280 once and independently verify current-trust functions, immutable media
    identity, security and exact ledger/catalog/postconditions. No unrelated delta.
11. While closed, populate only the separately approved 13 duration/provenance records,
    then independently verify identity, source, seconds, timestamps and trust requirements.
12. Deploy only the explicitly named compatible application via the chosen controlled
    route. Verify artifact/functions/backend binding and schemaReady for 280/278-v1.
13. Perform authorized read-only pre-reopen acceptance while maintenance remains ON.
    Successful autosave/media/progression is not a pre-exit requirement while closed.
14. Disable maintenance only after explicit exit authority and all gates pass. Run the
    separately authorized bounded positive checks with the approved data policy.
15. Independently verify security/preservation and close immediately on failure or
    uncertainty. Do not use synthetic-write permission as a real-member test authorization.

## Uncertain outcome and rollback

Before 275, abort without schema change if a gate fails. After any possible committed
stage, keep maintenance ON and classify the observed ledger/catalog as COMMITTED,
ROLLED_BACK or UNKNOWN_STOP using the sealed expected transition. A timeout or failed
client response is not proof of rollback. Never blind-retry an uncertain migration,
replay completed stages, repair the ledger or normalize away unexpected grants.

Never put the old 274 application onto schema 280. There is no assumed safe down migration.
A separately authorized database recovery needs the approved PITR point and compatible
application/database pair, plus Auth/Storage/configuration/security verification while
closed. Object bytes require the independent archive, not database restore alone.
Application repair uses a separately reviewed compatible forward release; this packet
neither republishes an old deploy nor authorizes a provider restore. Preserve both
published websites, all branches/migration history and the isolated environment.

Smallest next action is current read-only isolated function/binding attestation and
closure of the named evidence/owner gates, not execution of this sequence.
