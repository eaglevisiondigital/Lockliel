# Production trusted-duration inventory

Read-only observation: 2026-09-30, project `bsndfhbemstyrrglajat`, production schema274.
All 13 active YouTube assets in Lessons1–10 have NULL duration_seconds. No production values were written.

| Lesson | Asset | Provider | Provider reference | Trusted duration needed | Proposed source | Readiness |
| --- | --- | --- | --- | --- | --- | --- |
| 1: How to Become a Christian | 42b28ff3-03fa-45b9-93e7-4a258b5bd768 | youtube | SJ5Ee7OXkkM | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 2: How to Be Sure You Are a Christian | 0772dfe1-2e03-430f-bdc6-f691e2de7fcb | youtube | AEfPf609RgU | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 3: How to Develop Your Relationship with God | c8b4ea07-47be-43cd-b07c-35e80cbba6cd | youtube | 3CSBKubDefw | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 4: How to Talk to God | 495191a6-42c1-4c65-9aef-66de0f98583a | youtube | _NSjbNFcqQA | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 5: How to Hear from God | 9f91268c-923f-46af-a9aa-e75ddf68b889 | youtube | nWS8Km2kfKg | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 6: How to Obey God | 6ab8a12a-f13c-48dc-8048-afe5fb26359f | youtube | enGySOvV4jg | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 6: How to Obey God | 754a7b50-3f7b-455e-a147-18bf6ff3cd18 | youtube | TjuLVCy4gnQ | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 7: How to Experience God's Love and Forgiveness | 2cacacc1-b174-4d0a-b17b-6db3a56936ed | youtube | q_vUBJ8EgaU | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 8: How to Be Filled with the Holy Spirit | 41595092-d6b9-4ee0-aa61-5b6bf3917ec1 | youtube | 2VDVveA4RUQ | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 8: How to Be Filled with the Holy Spirit | 8697594b-35e7-42ac-be40-520546fc2181 | youtube | g8b964SWekE | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 9: How to Be Sure You Are Filled with the Spirit | 793e65ec-6eff-4a86-b650-6d9cb2dcff29 | youtube | HY1OyDdODL8 | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 9: How to Be Sure You Are Filled with the Spirit | dadd7b47-5288-43d2-bd9b-f66d31f3ffd0 | youtube | vjY2BTUzxGU | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |
| 10: How to Grow and Develop Your Faith | 3b9819c7-b197-4e2e-af13-06ee5836b6ed | youtube | 5-1B6IouUNk | Missing, positive seconds required | YouTube Data API contentDetails.duration or content-owner Studio evidence | BLOCKED |

Authoritative acquisition: fetch the matching IDs through an approved YouTube Data API credential and retain the dated provider response; convert its ISO8601 `contentDetails.duration` to seconds. Alternatively obtain dated evidence from the content owner's YouTube Studio showing each exact video ID and duration. The provider documents the duration field in [YouTube video resources](https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration).

A direct public YouTube metadata request returned HTTP429. No bypass or repeated scraping was attempted. No approved Data API credential or owner export was available, so no duration was invented or inferred from an untrusted learner player. Inventory is complete; authoritative values remain missing.

After a separate production assignment, an existing authorized manager with active Auth and MFA/AAL2 can enter duration plus a 10–500 character verification source through the reviewed manager flow. The database owns the verification timestamp. Preserve current video IDs and content. No staff bootstrap or direct privileged content write is implicitly approved. Confirm every active required video1–10 before reopening. Lessons11–13 retain the approved Media Coming Soon treatment.

