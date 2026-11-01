# Bible provider and licensing analysis

Public official pages inspected November 1, 2026. No provider account, API key,
provider data API, translation archive or copyrighted verse content was accessed.
These are candidate constraints for owner review, not a provider selection or a finding
that Lockliel has obtained rights. Recheck the specific contract before activation.

| Candidate | Verified official constraints | Lockliel implication and unresolved gate |
| --- | --- | --- |
| API.Bible | Version-specific copyright/license metadata must be reviewed. Copyrighted commercial access depends on the particular paid-plan licenses, while the noncommercial agreement restricts monetization and has only a qualified donation exception. Cached content needs refresh at least every 30 days; attribution depends on content and plan. Web usage telemetry is required subject to local law. Format conversion and AI training have additional restrictions. | Broad translation access is possible, but do not classify Lockliel from its ministry mission alone. Books, giving, commerce, sponsorship and future subscriptions require an authoritative use classification. Review telemetry and per-version rights before designing private reading behavior. A free key or publicly listed version is not approval. [Official terms](https://www.api.bible/terms-and-conditions), [licensing guide](https://care.api.bible/article/369-understanding-api-bible-licensing). |
| Crossway ESV API | The documented API is for noncommercial use. Per query, display and local storage limits include 500 verses or half a book, whichever is less, with stated exceptions for short books. Rate limits are 5,000/day, 1,000/hour and 60/minute. Redistribution has additional proportion limits. Copyright notices, ESV identification and an esv.org link are required; access keys may not be shared. | ESV is one translation, not a multilingual provider replacement. A local cache or exported anchor cannot be treated as unrestricted Scripture storage. Commercial compatibility and any expanded rights need a separate decision/permission. Existing doctrine must be reviewed against provider conditions; no acceptance of terms occurred. [Official conditions](https://api.esv.org/), [API overview](https://api.esv.org/docs/). |
| Faith Comes By Hearing Bible Brain | Access uses an assigned key and a limited revocable application license. The license requires free end-user access, preservation of notices and compliance with upstream content restrictions; it prohibits a proxy distribution network. The published license describes offline use as requiring further consent. | Multilingual/media potential must be evaluated for the exact fileset and rights holder. Do not assume that platform access permits all text/audio reuse, offline downloads or shared cross-platform redistribution. License and provider-approved technology/faith conditions need owner review. [Official API license](https://www.faithcomesbyhearing.com/bible-brain/license). |
| World English Bible via eBible | The official publisher identifies WEB text as public domain, including commercial reuse. The name remains a trademark, and modified text must not be represented as unchanged WEB. Multiple editions differ in spelling, handling of God's name and included books. | A lower-friction text-rights candidate, not an automatic default or selected provider. Pin exact edition, publisher provenance and revision; distinguish text from separately copyrighted maps/artwork and from transport/provider terms. No archive was downloaded. [Official FAQ and editions](https://ebible.org/eng-web/webfaq.htm), [edition metadata](https://ebible.org/details.php?id=engwebp). |

## Contract decisions this analysis supports

1. Identity is provider + Bible version + exact edition, distinct from course/content
   locale. References also require reviewed versification; book names alone are insufficient.
2. Store a trusted decision-record reference, reviewed/expiry dates, territories, explicit
   permitted operations, attribution and telemetry status. A catalogue listing is not a license.
3. Keep rights to display, cache/offline, export and sharing separate. Preserve licensed
   text exactly; attribution and allowed format must travel with every authorized use.
4. Do not send private prayer, growth reflections, health/family details, member IDs or
   sharing recipients to a Bible provider. Even passage requests may reveal sensitive
   interests; provider telemetry/retention and client-vs-server routing need privacy review.
5. No silent fallback when a chosen edition is unavailable, loses rights or fails.
   Show unavailable and allow an explicit member choice among approved alternatives.
6. Prefer storing an anchor's versioned reference independently of verse bytes. Resolve
   text under current rights at display/export time; historical licensing must not be inferred.

## Not yet implemented by the contract slice

The current per-request verse budget cannot by itself enforce half-book fractions,
aggregate local caches, daily/hourly/minute rate limits, export-work proportions,
fileset restrictions or provider telemetry. A live adapter would require reviewed
provider-specific policy, expiry/invalidation, authoritative metadata provenance,
server-side secret handling and no raw provider diagnostics in user output.

No default translation, canon/edition scope, locale set, commercial classification,
provider telemetry arrangement, subscription or license purchase is approved here.
The owner and Primary Chat must record these decisions before a live adapter or text
import. No evidence in this package establishes a live Bible feature or legal compliance.
