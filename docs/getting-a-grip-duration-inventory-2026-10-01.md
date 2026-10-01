# Getting a Grip provider duration inventory, 2026-10-01

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

| Lesson | Lesson title | Asset UUID | Provider/reference and authority | Published actual | Proposed seconds | Stored | Readiness |
|---|---|---|---|---|---:|---|---|
| 1 | How to Become a Christian | `42b28ff3-03fa-45b9-93e7-4a258b5bd768` | [YouTube SJ5Ee7OXkkM](https://www.youtube.com/watch?v=SJ5Ee7OXkkM) | PT24M40S (24:40) | 1480 | NULL | Metadata verified;not populated |
| 2 | How to Be Sure You Are a Christian | `0772dfe1-2e03-430f-bdc6-f691e2de7fcb` | [YouTube AEfPf609RgU](https://www.youtube.com/watch?v=AEfPf609RgU) | PT23M57S (23:57) | 1437 | NULL | Metadata verified;not populated |
| 3 | How to Develop Your Relationship with God | `c8b4ea07-47be-43cd-b07c-35e80cbba6cd` | [YouTube 3CSBKubDefw](https://www.youtube.com/watch?v=3CSBKubDefw) | PT24M18S (24:18) | 1458 | NULL | Metadata verified;not populated |
| 4 | How to Talk to God | `495191a6-42c1-4c65-9aef-66de0f98583a` | [YouTube _NSjbNFcqQA](https://www.youtube.com/watch?v=_NSjbNFcqQA) | PT22M30S (22:30) | 1350 | NULL | Metadata verified;not populated |
| 5 | How to Hear from God | `9f91268c-923f-46af-a9aa-e75ddf68b889` | [YouTube nWS8Km2kfKg](https://www.youtube.com/watch?v=nWS8Km2kfKg) | PT21M42S (21:42) | 1302 | NULL | Metadata verified;not populated |
| 6 | How to Obey God | `6ab8a12a-f13c-48dc-8048-afe5fb26359f` | [YouTube enGySOvV4jg](https://www.youtube.com/watch?v=enGySOvV4jg) | PT24M16S (24:16) | 1456 | NULL | Metadata verified;not populated |
| 6 | How to Obey God | `754a7b50-3f7b-455e-a147-18bf6ff3cd18` | [YouTube TjuLVCy4gnQ](https://www.youtube.com/watch?v=TjuLVCy4gnQ) | PT24M17S (24:17) | 1457 | NULL | Metadata verified;not populated |
| 7 | How to Experience God's Love and Forgiveness | `2cacacc1-b174-4d0a-b17b-6db3a56936ed` | [YouTube q_vUBJ8EgaU](https://www.youtube.com/watch?v=q_vUBJ8EgaU) | PT25M1S (25:01) | 1501 | NULL | Metadata verified;not populated |
| 8 | How to Be Filled with the Holy Spirit | `41595092-d6b9-4ee0-aa61-5b6bf3917ec1` | [YouTube 2VDVveA4RUQ](https://www.youtube.com/watch?v=2VDVveA4RUQ) | PT21M57S (21:57) | 1317 | NULL | Metadata verified;not populated |
| 8 | How to Be Filled with the Holy Spirit | `8697594b-35e7-42ac-be40-520546fc2181` | [YouTube g8b964SWekE](https://www.youtube.com/watch?v=g8b964SWekE) | PT23M28S (23:28) | 1408 | NULL | Metadata verified;not populated |
| 9 | How to Be Sure You Are Filled with the Spirit | `793e65ec-6eff-4a86-b650-6d9cb2dcff29` | [YouTube HY1OyDdODL8](https://www.youtube.com/watch?v=HY1OyDdODL8) | PT22M18S (22:18) | 1338 | NULL | Metadata verified;not populated |
| 9 | How to Be Sure You Are Filled with the Spirit | `dadd7b47-5288-43d2-bd9b-f66d31f3ffd0` | [YouTube vjY2BTUzxGU](https://www.youtube.com/watch?v=vjY2BTUzxGU) | PT24M32S (24:32) | 1472 | NULL | Metadata verified;not populated |
| 10 | How to Grow and Develop Your Faith | `3b9819c7-b197-4e2e-af13-06ee5836b6ed` | [YouTube 5-1B6IouUNk](https://www.youtube.com/watch?v=5-1B6IouUNk) | PT24M1S (24:01) | 1441 | NULL | Metadata verified;not populated |

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
