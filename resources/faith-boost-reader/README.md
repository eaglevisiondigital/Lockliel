# Lockliel Faith Boost reader

An improved standalone reader for **You Are Who God Says You Are**. The ten supplied JPEG book pages are byte-for-byte unchanged. The PDF is the attachment provided in the website conversation; its ten rendered pages match the PDF from the original ZIP.

## Open locally

Extract the entire ZIP and open `index.html`. Keep `reader.css`, `reader.js`, the logo, PDF, and `pages/` directory together. PDF download and ordinary links work without a server. Native sharing and clipboard copy depend on browser support and an HTTPS deployment; a normal-link fallback is provided.

## Controls

- Previous / Next, keyboard arrows, touch swipe, cover, and chapter selection.
- Enlarge / Fit page. Enlarged pages scroll normally; swipe-to-turn and arrow-to-turn are suspended so scrolling does not accidentally change pages.
- Page-load feedback, a retry control, and neighbor-page preloading.
- Reduced-motion preference respected. Page count changes are announced. The supplied pages are images: contextual alt text describes each page, but is not a complete screen-reader transcript of the book.
- The final page reveals direct follow links, notification guidance, sharing, gatherings, Founders 50, and partnership.

## Funnel integration

This is the reader component of the proposed funnel, not a signup form or email system. Do not promote this standalone reader as the public acquisition URL. Integrate it behind successful registration at `/who-god-says-you-are/read`; promote the canonical landing page instead.

The reader includes `noindex,nofollow,noarchive`. This discourages search indexing; it is not authentication or an access-control mechanism. Asset access and successful-registration validation belong to the host implementation.

No email delivery, SMS enrollment, social-follow verification, or lead capture is claimed or implemented in this package. Following is completed on the user's chosen social platform.

## Measurement

The reader dispatches `lockliel:resource` CustomEvents for reader opening, page changes, final page, PDF download clicks, social-follow clicks, Faith Boost / Founders 50 / partnership clicks, and successful share or copy actions. Connect these events to Lockliel's approved analytics collector during integration. They are integration hooks, not a working analytics service; they contain no subscriber details. A follow-link click is not evidence of a completed follow, and a PDF click is not confirmation of a completed download.

The supplied artwork and PDF have been preserved. No existing production website file is modified by this package.
