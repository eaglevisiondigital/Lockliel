# A Heart for the Lost: coming soon

Public page: https://lockliel.com/a-heart-for-the-lost

The homepage Faith Boost section adds one invitation after the existing free-book invitation. The supplied front and back artwork is preserved, encoded as JPEG for website delivery. No release date, price, or immediate download is promised.

The signup collects first name and email for this book’s release only. Explicit purpose/consent appears immediately above the submit button. Records include the resource, server timestamp, consent text/version, and available UTM/source information. General marketing consent and mailbox verification are false. A duplicate normalized email preserves the original entry and returns the same generic success message without disclosing subscriber details.

Netlify Forms inbox: `heart-for-the-lost-release`.

Durable backup: Netlify Data & Storage > Blobs > `book-release-notifications`. Keys under `heart-for-the-lost/leads/` hold private records; `heart-for-the-lost/form-sync/` records delivery to Forms. A failed Forms delivery retries on another signup. Access is limited to authorized Netlify project members; no public subscriber-list endpoint exists.

The notification list is ready to collect signups. This does not send an immediate email or automatically announce release. When the book is ready, use these book-specific consent records with the approved email provider to send the announcement. No general mailing list enrollment is performed.

Validation: `npm run build`; `node --test tests/book-release.test.mjs`. Use a clearly marked QA name and example.com email for a live form test.
