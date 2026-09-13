# Faith Boost free-resource funnel

Public campaign URL: `https://lockliel.com/who-god-says-you-are`.

The homepage's existing Faith Boost section gains one scoped book invitation. All prior content and styles remain unchanged. The existing cover is used for the landing page and its social metadata; no book artwork is regenerated.

## Registration and access

The signup function validates first name, email syntax and explicit email-update consent. Phone is optional. SMS consent and email verification remain false. No delivery email or text is sent; no such promise appears on the success page.

Contacts are captured in Netlify under the Forms name `lockliel-faith-boost-book`. A private, read-back-verified record in the site's `faith-boost-resource` Blobs store prevents a Forms delivery problem from losing a lead. This store is visible only to authorized Netlify project members in **Data & Storage → Blobs**.

- `leads/`: one record per normalized email, keyed by SHA-256, with first signup timestamp, resource, phone if supplied, consent text/version, and attribution.
- `form-sync/`: whether the record has been delivered to Forms. Concurrent submissions use conditional writes to avoid duplicate delivery. Failed deliveries retry when the person submits again; retained records can also be recovered from Blobs.
- `sessions/`: hashed opaque 90-day reader sessions. The browser receives a Secure, HttpOnly, SameSite=Lax cookie containing no contact details. Session and lead reads confirm access on the ready page. No public endpoint lists or returns contacts.
- `events/YYYY-MM-DD/`: source-attributed funnel events. Source fields include utm_source, utm_medium, utm_campaign, utm_content, source and referrer hostname. Full referrer/query URLs, email and phone are never analytics payloads.

Repeated requests reopen the free book without overwriting a contact or claiming that the requester has proved ownership of an email account. This is access to a free resource, not an identity/login system.

The reader and original PDF are bundled privately with `faith-boost-reader`. Files are served only for a valid access session, through an explicit filename allowlist. Their response headers exclude indexing and shared caching. The ten page images and PDF match the approved reader package. The public cover is the only book image in the static export.

## Measurement

Recorded events: landing_visit, form_start, server-confirmed optin_success, repeat_access, read_online_click, pdf_download_click, reader_open, reader_final_page, social_follow_click, faith_boost_click, founders_50_click, partnership_click, share_completed and share_link_copied.

`optin_success` counts newly persisted, syntactically valid registrations with explicit email consent. It does **not** mean a mailbox has been verified. Follow-link clicks are not confirmed subscriptions, and PDF clicks are not confirmed downloads. Native share completion and copying a share link are recorded separately. Browsers requesting Do Not Track do not send optional client analytics; essential registration records still exist. Allow for this when comparing visits and conversions.

No third-party analytics, mail or SMS vendor is added. To enable welcome emails or SMS, connect an approved provider and complete delivery, consent, unsubscribe and failure-path testing first. If required later, remove the optional phone field until an actual reminder workflow is available.

## Validation

`npm run build`

`node --test tests/faith-boost-resource.test.mjs tests/founders50.test.mjs`

Production verification must check actual Netlify runtime persistence, cookie gating, all ten image responses and the original PDF, form detection, social routes, layout, and the existing homepage/Founders entry points. Synthetic QA records use `example.com` addresses and an explicit QA name; no email delivery is enabled.
