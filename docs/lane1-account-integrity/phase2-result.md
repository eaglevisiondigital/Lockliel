# W1 Security and Account Integrity: bounded next-phase result

November 1, 2026. Owner: Main Codex coordinator /root. Dedicated branch
codex/lane1-account-integrity from d71d079126f48e49f8d3df591373c0381b9f91e1.
Worktree: /Users/davesmacbookpro/.codex/worktrees/lockliel-lane1-account-integrity/Lockliel.
No child security agent is claimed. Latest directly typed next-phase authorization
permits bounded investigation, with production accounts/Auth/CAPTCHA unchanged.

## Fresh privacy-preserving follow-up

Read-only production session on bsndfhbemstyrrglajat observed read_only=on,
lock_timeout=5s, statement_timeout=30s. No password or private API credential was
requested, extracted or used through a local input helper. The connected read-only
query returned aggregate statistics only.

181 Auth users and181 profiles remain; production ledger remains274. Of these,
180 accounts were created on or after October7. All181 paired profiles have creation
timestamps within5 seconds of their Auth row; there are zero duplicate normalized-email
groups. None of the180-account cohort has a course enrollment. Staff roles, lesson
progress and media progress remain zero.172 accounts have a latest recovery timestamp
within one minute after creation. The newest account creation date remains October22.
The earlier same-day coordinator observation independently recorded28 confirmed users,
177 recovery timestamps and editable source marker my-lockliel for all181.

These counts are consistent with the normal bootstrap producing profiles promptly;
they do not establish human identity, legitimate purpose, first-sign-in sequence,
operator attribution or a specific source application. A stored recovery timestamp
can be the latest recovery request, not its complete history. Confirmation is not
legitimacy evidence. Zero enrollments/progress/staff does not prove absence of earlier
reads or other activity. Current accounts were not labeled, reset, deleted, disabled,
merged, restricted or granted permissions.

Classification remains consistent with an automated signup/recovery workflow, moderate
confidence, with intent/authorization unknown. The prior retained request timing is
historical evidence with coverage gaps; no whole-cohort event join is claimed. Current
read-only aggregates narrow bootstrap/duplicate/enrollment questions but cannot supply
missing owner campaign/test/import context. A concise non-PII run-reference question
is pending with Dave; no answer is inferred if none arrives.

## Source and protection review

The current production source1599ab2 signup handler calls signup only; recovery requires
a separate explicit forgot-password request. No automatic signup-to-recovery behavior
was located in the reviewed source. Editable metadata/tags cannot grant staff/leadership
privileges. The first phase's read-only control observations remain the latest audited
settings: confirmation/leaked protection ON, CAPTCHA OFF, configured provider and app
per-IP limits. No settings were changed or load-tested in this phase.

The retained standalone d71d079 candidate forwards proof through Supabase's documented
security metadata and preserves session/refresh/MFA/cookie behavior. Missing/malformed
proof fails closed while the feature is enabled; a proof-shaped string is never treated
as server verification. Provider-side enforcement is still necessary because a public
Auth endpoint is not protected by frontend checks alone. Neither dummy proofs nor
these mock-provider tests prove real challenge/secret pairing or delivered email.

The pre-hydration POST/disabled-input protection is present in this Auth-only candidate.
Production remains on1599ab2, so candidate success must not be reported as a deployed
production fix. A minimal pre-hydration-only release can be prepared for separate review;
no application patch, production deployment or release authority is inferred here.

## Local validation and limits

A first focused run passed19 provider/session tests but the3 static-form tests could
not run because this fresh worktree had no out/ export. This was a missing-artifact
precondition, not evidence of an Auth source regression. A new local webpack/static
build then passed37 generated pages and its TypeScript phase. Production-associated
credential environment variables were removed and network transports were blocked;
Next telemetry was disabled. No migrations or production HTTP/Auth requests ran.
The temporary dependency symlink was removed after the build.

The focused rerun passed all22 tests:19 CAPTCHA/provider/session/MFA/cookie tests and
3 actual exported-form native-submit safety tests. This validates the exact retained
candidate, not real CAPTCHA acceptance. No new feature test was invented and no broad
course/SQL suite was rerun. Build outputs remain ignored local artifacts.

Real CAPTCHA positive acceptance, email confirmation/recovery delivery, manager AAL2
under real proof and external Site25 compatibility remain incomplete. No keys were
requested or loaded, no CAPTCHA was solved, and no isolated Auth window or synthetic
session was opened. Prior helper/session retirement remains in force.

## Narrow next steps and gates

1. Resolve the pending owner campaign/test/import reference. If none is known, return
   a containment/disposition proposal; no destructive account action follows automatically.
2. Owner-operated password-free Cloudflare diagnostic in a second supported browser
   on unchanged network remains the next compatibility discriminator. Do not request
   keys, rotate widgets, disable protections or spoof browser/network characteristics.
3. Prepare any Auth-only274 containment or hydration release as a separate exact-source,
   compatibility and rollback packet. Preserve the course280 branch and its prior passes.

No production account/data/Auth/settings/CAPTCHA/session/permission changes, migration,
push, merge, deployment, maintenance/SMTP/Storage/PITR/compute/content change occurred.
No real member information was extracted. Only this lane's sanitized documentation
and ignored local build artifacts were created; application source is unchanged.
