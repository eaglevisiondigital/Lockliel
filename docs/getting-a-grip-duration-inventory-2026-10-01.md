# Getting a Grip provider duration inventory, 2026-10-01

**TRUSTED DURATION INVENTORY: PASS.**
**TRUSTED DURATION PRODUCTION POPULATION: REQUIRES SEPARATE AUTHORIZATION.**

Local follow-up reused the existing verified inventory. No video was fetched again
and no production value was written. NULL is the last read-only observation in the
prior October 1 review, not a new production query in this local-only assignment.

READ-ONLY REVIEW. Proposed production values only; nothing has been populated.

All13 active assets across Lessons1–10 are individually listed below. Production
inventory was queried read-only and each canonical YouTube HTTPS page was retrieved
independently. Authority: YouTube publisher structured `meta itemprop="duration"`.
Method: canonical URL identity match plus ISO8601 duration conversion. This is provider
metadata, not browser/player timing alone. No API credential or video playback was used.
Actual below means provider-published duration at whole-second precision, not a
frame-accurate source-file measurement. The proposed value uses that published duration.

For every row: provider=YouTube; current production duration=NULL and verified_at=NULL;
source/provenance column not yet present at274. Readiness=METADATA VERIFIED / PRODUCTION
REQUIRES ACTION. Full timestamp/method/extracted metadata evidence is retained in
`evidence/final-production-readiness-resumed-2026-10-01/provider-durations.json`.

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

Lessons6,8,9 each contain two separate assets. No combined timing was assigned.

On five pages (3CSBKubDefw,_NSjbNFcqQA,nWS8Km2kfKg,HY1OyDdODL8,5-1B6IouUNk),
additional player length fields include one second less as well as the published
value. This discrepancy is retained, not hidden. The structured publisher duration
is the selected authority; do not shorten the threshold based on those player fields.
No frame-precision or independent file measurement is claimed.

All13 provider values are available. Dave does not need to supply durations for
these current IDs. A later authorized configuration assignment must preserve this
asset-ID/source/timestamp mapping, recheck video identity, and record complete trusted
provenance using the approved schema-compatible sequence. No production content
activation,staff setup or RLS bypass is authorized by collecting this inventory.
If the selected metadata authority requires a stronger content-owner standard, supply
an official YouTube Data API `videos.list(part=contentDetails)` export keyed to these
13 IDs or original-file metadata with a verified file-to-video mapping, not a password
or API key in chat. Never replace missing data with the synthetic1344s fixture value.

Lessons11–13 retain Media Coming Soon and no assigned video. All13 lesson PDF
mappings remain intact. See the final readiness report for the release gates.
