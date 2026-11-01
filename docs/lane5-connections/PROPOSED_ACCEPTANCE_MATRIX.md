# Lane 5 proposed acceptance matrix

PREPARED ONLY. No cases below were run and no implementation exists in this lane.

| Area | Meaningful future cases | Required outcome |
| --- | --- | --- |
| Ownership | A owns fixture; B/public/absent/malformed actor; mixed-owner list | A allowlisted preview only; all other projections denied |
| Sensitive fields | Extra private note, prayer, assessment, finance, email, phone and nested objects on input | None appears in any output or error; input remains unmodified |
| Separate concepts | Change inviter, campaign, mentor, group, tag or application independently | Other concepts unchanged; no derived consent, privilege or leadership |
| Consent | Invited, accepted, declined, revoked, missing, expired, wrong owner/contact/scope | Only current matching accepted consent eligible |
| Access | Matching explicit narrow permission; missing, revoked, expired or wrong subject/scope | No consent-only or metadata-only access |
| Capacity | Four to five; five to six; active update; paused/completed update; reactivation; duplicate IDs | Five boundary mirrors existing statuses; invalid lists fail closed |
| Confirmation | Explicit current confirmation; false/missing; swapped owner/contact/resource; stale contact/resource/consent revisions | Only exact current confirmation eligible |
| Revocation race | Valid first intent followed by revoked consent before retry | New attempt denied; cached confirmation not authority |
| Resource | Approved synthetic projection; missing/retired/unapproved/protected route/arbitrary URL | Only reviewed fixture metadata; no protected path/token output |
| Group/host | Self-request; forged B requester; tags/application status asserting leader | Human-review-only for self; no role/membership grant or save |
| Effects | Successful and denied intents; frozen fixture inputs; blocked global transports | No send, schedule, save, grant, mutation or network access |
| Contract dependencies | Missing catalog/permission/revision; stale or malformed values | Unavailable/denied is honest; no fallback to an unrelated resource or actor |

Future verification commands must use existing Node 24, the repository network guard, a focused test file, scoped strict TypeScript and targeted ESLint. No install, build, SQL replay, external call or production dependency is needed for this slice. UI keyboard/zoom/responsive/screen-reader review is not applicable until a UI is separately authorized and actually implemented. Actual server/session/RLS/concurrency acceptance remains a later integration gate and cannot be established by these unit tests.
