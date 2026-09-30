# Lockliel security model

## Isolated acceptance boundary (2026-09-30)

The temporary acceptance artifact pins a distinct Netlify site/project, rejects
production invocation context and forged request-header identities, and rejects
production/SMTP/other outbound fetch targets. This is a separately compiled binding,
not an environment switch that enables production-backed ordinary previews. No service
credential is included. Anonymous hosted notes/gates access is denied. Authenticated
A/B and manager privacy checks remain unexecuted. The Supabase branch inherited custom
SMTP; no Auth write/email was attempted and signup is absent from the current runtime
until branch-only isolation is approved. Do not mistake runtime egress denial for
control over Supabase Auth's configured downstream email service.


## Course readiness hardening (2026-09-30)

Trusted duration requires stored seconds, server verification timestamp and provenance.
Course members cannot alter it. Existing active-session/MFA/role RLS protects managers;
the API requires a descriptive source and verifies the returned persisted result.
Changing provider/media identity invalidates the timing configuration. Previously earned
watch/completion remains durable; replacement media requiring new credit must use a new
asset identity and a separately reviewed material-version policy, never erase progress
silently. The telemetry boundary rejects browser percent/ranges, direct seek credit,
missing duration and absent required media. Private grading keys now explicitly enable
RLS in addition to revoked privileges. Grip rules cannot be weakened by empty/nullable
configuration. Notes remain owner-only, excluded from all admin projections, and are
included only in explicit owner lesson exports (and existing owner privacy export).

No preview guard bypass or new live transport is introduced. PDF import is explicitly
disabled in the existing admin API and its activation control removed. Malformed save
acknowledgements retain unsynced drafts instead of reporting Saved. Hosted Auth/RPC/RLS
and actual device behavior still need the isolated acceptance matrix; local mocks are
not production or hosted acceptance evidence.


## Course engine candidate boundaries (2026-09-29)

New save RPCs bind expected identity to auth.uid(), active session, published enrolled
course and trusted lesson gate. Optimistic revisions and completed-answer immutability
stop stale overwrites; same-payload retries acknowledge an already committed result.
Configured courses deny direct member progress writes through restrictive RLS. Media
samples use server elapsed time and interval-derived thresholds, never posted percent.
Notes are owner-only in separate storage, absent from every staff/admin query. Explicit
course-manager roles/MFA retain submitted-answer access, not notes. Versioned score
keys remain private. Configuration audit contains no responses or notes. Inputs are
bounded and React escapes text. Unsynced browser drafts are account/lesson-scoped,
not encrypted storage against someone controlling the device. Preview production
backend and form guards remain intact. Migration 275 is local/development only;
real hosted acceptance requires isolated infrastructure. See reconciliation evidence.

## Production application verification (2026-09-29)

Exact approved PR #3 release is live. GET-only verification confirms member noindex and framing/referrer/content-type headers, production unauthenticated session 401, and no protected course path exposure in invitation HTML. Read-only before/after database fingerprints and write counters match, 274 migrations remain, all 56 public tables retain RLS and Security Advisor is clear. No accounts, grants, settings changes, payments or content activation. Full Auth/SMTP settings and delivery were not independently tested. See `docs/production-application-release-2026-09-29.md`.

Baseline: 2026-09-26 at `47409a2796a5275e12684cb4a182cb008c4d5414`.
This is a focused continuity assessment, not a complete penetration test or
certification. Evidence and omissions are recorded in `CURRENT_BUILD_STATE.md`.

## Production release verification at 274 (2026-09-29)

The two authorized migrations completed with unchanged release security fingerprints: RLS/ACL, column grants, policies, public/app_private functions, public/Auth triggers and event triggers. All 56 public tables retain RLS, Security Advisor is clear, public/Auth/Storage row-write counters are unchanged, and the canonical email CHECK is validated. Only expected ledger additions and the CHECK changed. Protected content/configuration fingerprints and hosting identities match; Auth/SMTP were not modified, but no complete independent settings snapshot is claimed. See `docs/production-migration-release-274-2026-09-29.md`.

## Prepared release cache boundary (2026-09-29)

The only optional generated path is a regular `supabase/.temp/cli-latest` in each prepared stage, under a real directory with no other children. The update-cache contents are not executable selection or migration input. Every prepared migration hash, config and manifest byte remains checked; root/stage siblings and symlink substitutions fail closed. Actual pinned-CLI regression ran against a private disposable PostgreSQL cluster with verified OS IP egress denial. Production TLS, timeouts, authorization, backup/MFA and staged stop/recovery requirements remain unchanged. See `docs/release-verifier-cache-fix-2026-09-29.md`.

## Getting a Grip invitation boundary (local, 2026-09-27)

The public page renders approved static copy only: no private query reflection,
recipient identity, protected lesson media/storage paths, or member data fetch.
Referral and signup injectable factories preserve guarded default exports and
rate limits. The whole-site HttpOnly referral cookie remains authoritative fallback;
original inviter resolution stays in existing database bootstrap.

New isolated SQL evidence covers immutable inviter, owner-private notes, no staff
grant, draft exclusion, published-course idempotent enrollment and unenrolled
lesson denial. Generic/person sharing still prepares only, with consent checks and
explicit share confirmation. Production-backend preview guards remain fail-closed.
Local tests had OS production network denial; browser APIs were synthetic mocks.
No production service was changed or contacted. This is not fresh live production
readiness evidence. See `docs/getting-a-grip-invitation.md`.

## My Five deployed preview verification (2026-09-27)

Exact implementation `9eee9ee` produced ready preview
`6ab908caa929c30008a61d79`. Twenty-six unauthenticated GET/empty POST checks,
including new My Five and sharing routes/direct function paths, returned no-store
503 production-backend denial without cookies or redirects. Ten static pages
passed; public detection attributes remain removed. No guard bypass or real-data
write tested this boundary. Source/CI checks complement the edge HTTP evidence.

Production preservation compares 272-entry migration ledger, RLS/ACL/function
fingerprints, five Edge Function versions and 93-table write counters, along with
both website publication baselines. All inspected before/after values match.
This does not establish live authenticated integration or a complete settings audit.
See `docs/my-five-remote-checkpoint-2026-09-27.md`.

## My Five guided follow-up (local, 2026-09-27)

The new person endpoint authenticates an active session, validates the contact ID,
loads by ID plus caller owner, and stops on a missing contact before related reads.
It uses the caller JWT, not service credentials. Existing owner-only contact RLS
still denies other members and even AAL2 staff access to private notes. The new
SQL fixture proves those boundaries and preserves the five-active limit via the
existing fixture. No policy, column grant or role changes were made.

Notes are at most 3,000 characters, rendered as React text, and saved with a
version condition to reject concurrent edits. New endpoint and sharing are rate
limited to 30 requests/minute/IP/domain; existing Connections now has a 60 limit.
POST origin checks supplement existing SameSite session cookies on new person
and share paths. No private notes enter referral metadata or staff-visible tasks.

Linked engagement requires current `inviter_followup` consent for the exact
subject/caller pair and an exact linked-member signup/course-start event on the
caller's person-specific links. Only a coarse engagement sentence is returned.
Anonymous visits, raw events, recipient timestamps, assessments, contacts and
faith answers are not included. Revoked/absent linked consent blocks new guided
follow-up/share writes and recommendations. Own note/history access remains.
This is application filtering over existing RLS, not a new database consent policy.
An unlinked contact's private name is not proof of a platform recipient's identity.

Share preparation records only `share_initiated`. Explicit member confirmation
updates their own latest-share field. No delivery/open claim, automatic send,
bulk send, new entitlement or original-inviter overwrite occurs. Approved landing
navigation does not bypass protected delivery. All default Netlify handlers remain
behind the trusted production-context guard; previews cannot use the live backend.
Tests use mocks/disposable SQL only. Neither passing them nor a synthetic browser
run establishes live authenticated integration. See the focused implementation record.

## Member Journey deployed preview verification (2026-09-27)

Authorized development push `cc6f430` produced ready preview
`6ab8fab5b738c40008b06835`, with 60 serverless functions and one edge function.
Seventeen harmless unauthenticated probes, including onboarding/next-step APIs and
direct function paths, returned expected 503/no-store denial without cookies or
redirects. Five public form pages lack detection attributes. No connected backend
was enabled. Edge denials plus exact-source CI guard tests support this boundary;
they do not establish successful authenticated preview integration.

Before/after read-only preservation found identical production deploy/page hashes,
Sites version 25/publication/access metadata, 272-entry Supabase ledger fingerprint,
table/column ACL, RLS/policy/function fingerprints, five Edge Function definitions
and write counters for 93 tables. No production write, migration, settings or
permission change was performed. These are scoped observations, not exhaustive
management-settings or third-party-activity auditing. Full evidence and limits:
`docs/member-journey-remote-checkpoint-2026-09-27.md`.

## Member Journey Core privacy boundary (2026-09-27, local only)

New recommendation/onboarding handlers retain active-session validation, the
caller's JWT and existing row-level policies. They do not use a service-role key
or accept a caller-selected member ID/role. Responses use the existing no-store
helper. Recommendation reads select only required fields and return counts and
navigation, without faith answers, contact identities, notes, worksheet answers,
storage URLs or a sensitive explanation trace. Failed reads return unavailable;
they are not treated as empty accounts or proof of completion.

The onboarding write is a bounded, allowlisted minimal upsert of the caller's
growth interests and explicitly chosen new-believer stage. It requires profile
completion and privacy acknowledgment, rejects a mismatched Origin, and preserves
other fields. Empty optional answers are valid. It never writes group/hosting
preferences: existing triggers on `wants_group`/`wants_host` create or close
staff-visible requests. No onboarding change grants contact consent, a leadership
role or staff access. Stage names never enter authorization decisions. Existing
MFA/AAL2, deletion, financial and purpose-based access controls are unchanged.

Both handlers fail closed outside trusted production invocation context. Local
tests mock transports with network protection; disposable PostgreSQL tests prove
member ownership, cross-member read/write denial, protected onboarding/journey
fields, preserved connection requests, five-active-person enforcement and no role
grant from faith selections. Those tests do not claim live RLS/Auth/Storage parity.
Synthetic browser validation made zero external requests. No production fixtures,
migrations, member data, credentials or configuration were used or changed.

UI telemetry hooks expose allowlisted event names only, respect Do Not Track, and
have no persistence or collector. A future durable analytics design requires its
own privacy scope. See `docs/member-journey-core.md` for validation and limitations.

## Release security and recovery gates (2026-09-27)

Production remains at 272 migrations. No live schema, ledger, data, permissions or
settings changed. Read-only project/security evidence remains ACTIVE_HEALTHY with
no Security Advisor findings. The full aggregate/catalog baseline and exact release
preflight live under `supabase/verification/release-*`; no PII/secrets are recorded.

Dave's manual dashboard evidence, accepted by Chat, shows Pro scheduled physical
backups at 2026-09-26 07:28:11, 2026-09-25 07:26:32 and 2026-09-24 21:09:11 UTC.
Restore and Restore to new project are offered. PITR is disabled. Retention duration
and actual restore success are unverified. These observations establish visible
backup availability, not complete disaster recovery. A fresh completed backup,
timestamp, Restore action and Owner recovery access must be reverified immediately
before release; conversation screenshots cannot satisfy that gate indefinitely.

There is one visible organization member, an Owner with MFA disabled. Engineering
recommendation: **OWNER MFA REQUIRED BEFORE MIGRATION**, because that control-plane
account governs the database and recovery. This is a security gate, not a technical
requirement of PostgreSQL or a claim that settings were changed. Verify a secured
backup factor/recovery access separately; do not collect secrets. Additional trusted
administrative coverage is a broader resilience follow-up. MFA setup is outside
this preparation package.

PITR is not required for these two files on the verified zero-profile database:
bridge is catalog verification only, email has no DML, and a recent recoverable
physical backup is the proposed release gate. Storage object bytes are excluded
from database backups. Neither file accesses or changes those bytes; separate
protected-asset recovery is required before broader launch, not for this release.

The pinned CLI's actual sessions were observed at lock_timeout=5s and
statement_timeout=30s. Independent 272/273/274 checkpoints, ledger-failure injection,
real timeouts and pre-commit connection termination proved atomic schema/ledger
rollback. The rehearsal used generated local credentials, SCRAM, private sockets,
no TCP listener, and verified OS-level IP egress denial. No production credential
was used. Whole-public-table data fingerprints remained unchanged at success.
Post-commit lost acknowledgment is covered by a decision tree, not a claimed test.

Follow `docs/production-migration-runbook.md`: STOP, read ledger, read catalog, read
health, determine commit state, then decide. Never blindly retry, bypass the bridge,
rewrite historical files, repair the ledger, relax RLS or remediate live rows to
make a migration pass. Owner MFA, fresh recovery/health/data/traffic evidence,
verified direct TLS connectivity and explicit separate authorization remain gates.

## Remote guard verification (2026-09-26 America/Chicago)

The single authorized push of `b2adf96` produced Netlify preview deploy
`6ab8807f33f3d00009cbf189`, with 58 serverless functions and the edge guard. All
12 harmless unauthenticated probes returned the expected no-store 503 code and
no cookies/redirects. Native form POSTs had empty bodies and no form-name;
the referral GET used an invalid code that could not create a tracking record
even under the old handler. Five served form pages lack detection attributes.
This verifies the deployed boundary on representative paths, not an exhaustive
production account journey. Neither guard was disabled or bypassed for testing.

Push and PR CI both passed 377 Node tests and seven SQL files after 274 migrations
in disposable PostgreSQL. All four job tokens had Contents, Metadata and Packages
read permissions; only expected CI cache writes occurred. No migration/deployment
command ran against production. Full install audit reported 19 findings, while
the explicit production dependency audit reported zero; do not conflate them.

Supabase migration history and Edge Function metadata match before/after. RLS/ACL,
policy/function-definition fingerprints and 91 application/Auth/Storage table
write counters are unchanged. These statistics corroborate absence of database
writes during the inspection window, but are not an exhaustive external activity
or hosted Auth configuration audit. Production Netlify deploy identity/body hash
and Sites version/publication metadata also match. No real-data test was run.
Authenticated Netlify Forms/Blobs audit access was unavailable. Empty requests
were rejected before application handling, and no valid form submission was sent.

See `docs/remote-validation-2026-09-26.md` for exact routes and evidence. Older
immutable preview deployments remain unsafe; the PR alias is now protected but
must be tied to the reviewed deploy before future testing. No isolated writable
backend was created. Production release, permissions and business rules remain
outside this completed validation package.

## Preview isolation implementation (2026-09-26)

At `47409a2` through `ce7439f`, previews shared production-connected functions.
`SUPABASE_URL` and `SUPABASE_KEY` are source constants in `lockliel-core.mjs`, not
deploy-context environment configuration. Resource handlers POST to production
Netlify Forms and mirror CRM leads; `getStore` uses shared site-wide Blobs.
Referral GETs can write events and session GETs can refresh Auth tokens.
Blocking only mutation methods would not isolate the backend.

The forward security package rejects nonproduction, local and unknown contexts
at every serverless entrypoint using trusted Netlify `context.deploy.context`.
Only the exact value `production` permits execution. Headers, hostname,
NODE_ENV and build CONTEXT cannot grant runtime access. The edge guard rejects
native form POSTs to any path and connected GETs, and is configured `onError: fail`.
Preview export removes Netlify form-registration attributes before deployment.
Blocked responses contain no data/cookies/redirect and have no-store caching.
They expose the common message that no information was submitted. Production
handler bodies, Auth/session checks, AAL2 requirements and RLS remain unchanged.

Work verified main-only production publishing, enabled PR previews, disabled
standalone branch deploys, no listed build hooks/plugins/dashboard variables,
empty repository webhooks, disabled Pages and no Supabase Git connection/branches.
These scoped observations do not remove Netlify's built-in Blob credentials.
See `docs/deployment-safety-review.md` for the full trace and per-commit risks.

All 58 entrypoints were tested across ten blocked contexts and seven methods
under the fail-closed network preload. Production pass-through, representative
tracking, auth denial, edge routing, form export and unknown context cases pass.
The full build/tests also passed with OS outbound traffic denied. This is local
evidence, not deployed CDN/Forms or full hosted Supabase validation.

Older immutable preview deployments remain unsafe. The guard does not revoke
direct access to public production endpoints, protect unrelated origins or stop
someone intentionally leaving the preview for production. Public external video
and social links can still contact third parties. No cross-origin production
browser transport was found in the current app. Do not perform write-based
browser testing before confirming the new deployed guard, and never use real
accounts. Future backend browser testing needs a separately scoped isolated
environment or mocks. Preserve both published visual experiences unchanged.

## Identity and authorization

- Member requests use Supabase Auth and caller-scoped REST/RPC access. Netlify
  access and refresh cookies are HttpOnly, SameSite=Lax and Secure in production
  and Netlify preview/branch contexts (`netlify/lib/lockliel-core.mjs`).
- `requireSession` validates the user and checks
  `public.lockliel_current_session_active`. The live wrapper calls
  `app_private.current_session_is_active`, which checks the JWT subject and
  session ID against `auth.sessions`, including `not_after` expiry.
- Live `app_private.has_staff_role` requires that active session, AAL2, and a
  matching `staff_roles` row. Neither tags nor application status substitutes
  for this authorization. All live staff-role counts are currently zero.
- No service credential belongs in browser code. Edge Functions read privileged
  credentials from their runtime environment. Secret values were not fetched.
- RLS, column grants, guarded functions and database-owned identity/lifecycle
  fields protect the data. Checks in client components alone are insufficient.

## Relationships and private information

Original inviter lineage, campaign attribution, assigned leader/group, and
permission to contact are separate. Preserve human-reviewed leadership and
consent-controlled messaging/follow-up. Private faith assessments, private notes,
giving and staff-only information are not exposed merely because somebody is an
inviter or leader. Connection and finance cards serve different access scopes.

Relevant migration families include profile relationship protection, consent
relationship guards, approved leadership roles, group membership guards,
private faith-profile hardening, enrollment-scoped assets and fail-closed grants.
See `supabase/migrations/`; inspect the latest replacement of a function/policy,
not only its original migration.

## Privileged deletion and export

The deployed `process-account-deletion` version 2 matches repository source. It
validates the user through Auth, requires AAL2, checks active session and admin
role, requires an in-review request claimed by that administrator, and rejects
self-processing. It checks responsibilities, suspends sign-in, revokes sessions,
deletes through Auth, verifies resulting state, and scrubs nonfinancial records.
Database functions guard execution identity, audit and completion. Financial,
operational and audit retention must not be casually removed.

Gateway JWT verification is false for this function, but the handler performs
its own authentication and authorization. That setting alone is not evidence
that anonymous deletion is possible. Public intake handlers have separate
validation/rate-limit boundaries and use their service credentials internally.

`lockliel-privacy-export.mjs` and `lockliel-export-pages.mjs` implement scoped
pagination, stable identity ordering, exact-count and duplicate checks, and
failure on invalid/incomplete pages. Defaults request 500 rows per page, limit
each source to 10,000 rows, and bound accumulated serialized row bytes at
4,000,000. This is not an atomic cross-table snapshot, and the row-byte budget
should not be described as a precise cap on the entire HTTP response envelope.

## Live read-only observations

- Security Advisor returned an empty findings list.
- All 56 public ordinary tables have RLS enabled; 111 public policies exist.
- No public table grants to `anon`/`PUBLIC` were returned by the grant query.
- No public views without `security_invoker=true` were found.
- No unvalidated constraints were found in `public` or `app_private`.
- No `app_private` function was executable by `anon` in the privilege query.
- Five public SECURITY DEFINER functions exist: `upsert_public_lead_contact`,
  `consume_public_rate_limit`, `lockliel_prepare_account_deletion`,
  `lockliel_scrub_deleted_nonfinancial_records`, and
  `lockliel_account_deletion_state`. None was executable by `anon` or
  `authenticated`; all set an empty search path.
- Both Storage buckets are private. Matching PDF object metadata was inspected,
  but signed-URL access and unauthorized downloads were not exercised live.
- The retired importer has gateway JWT verification on and returns HTTP 410
  unconditionally. Keep it disabled even though deployment status is ACTIVE.

## Unverified boundaries and follow-up

The resource signup tests inject the Forms transport but leave their handlers'
Supabase CRM `fetch` calls unmocked. A network-enabled run can attempt live lead
writes. This baseline used the restricted sandbox and then a temporary
network-denying preload; all 289 current CI tests passed with that preload.
Make unexpected outbound calls fail tests and inject the CRM transport in the
next implementation package before relying on network-enabled CI isolation.

Advisor results and catalog inspection do not prove every RLS policy is correct.
The four SQL fixture files create/update/delete test data and were not run on
the connected project. Cross-member, cross-group, consent-revocation and staff
AAL1/AAL2 tests need a disposable database/environment and test accounts.

Auth redirect settings and SMTP configuration were not accessible through the
available read-only Supabase tools. Their verification records remain false.
Netlify deployment configuration, runtime secrets, production served commit,
Forms/Blobs retention and end-to-end browser flows remain unverified. No
production account was created, modified or deleted for this assessment.

Book benefits, shipping, legal classification, retention policy changes and
payment activation require authoritative decisions. Existing draft data does
not authorize them.

## Local engineering verification, 2026-09-26

The previously identified unmocked CRM test path is corrected. Both resource
signup transports are injected in tests; the reusable Node network preload
forces nonzero exit for unexpected calls even if caught. Eleven transport probes
and a real unmocked signup path verify enforcement. Covered Node interfaces
cannot accidentally write to production during protected tests. Arbitrary native
subprocesses and intentional removal/replacement of the guard remain outside its
security boundary. Do not supply production credentials.

Representative real PostgreSQL tests verify anonymous denial, member own-row
access and cross-row denial, forbidden staff grants/lineage changes, staff MFA
requirements and revoked-session denial. The harness creates and identifies its
own socket-only PostgreSQL 17 cluster, ignores connection environment variables,
accepts no connection arguments and rolls back fixtures. Minimal Supabase stubs
and two historical catalog supplements limit equivalence with the live service.

Correction recorded 2026-09-27: the previous claim of an over-escaped live email
constraint was incorrect. Current production accepts ordinary addresses; its live
stored SQL uses one backslash. The historical repository file has two and remains
immutable. The pending canonical `[.]` migration is prepared and regression-tested
for convergence/replay consistency, but not deployed. No live RLS, grants, roles,
authentication settings or permissions changed. Full repository ESLint debt and
production journey validation remain unresolved.

## Reconciliation verification, 2026-09-26

Fresh replay no longer relies on historical schema supplements. Restored review
policies reject anonymous/member writes and AAL1 staff; AAL2 staff can record a
review only as themselves. Review insertion applies its decision and creates an
audit event; review edits remain denied. Acceptance does not grant staff rights.
Share staff insert/update policies and active-only member read behavior are
covered with real RLS fixtures. Catalog parity includes policies, RLS and grants.
Matching existing schemas accept the bridge in a read-only transaction; deliberate
partial schema, index loss and RLS disablement are rejected. No live permissions
were altered. The observed live Security Advisor has no findings.

The email correction remains unapplied. Read-only aggregate inspection found zero
profiles/users and no incompatible data. That preflight expires as data changes.
SQL regression covers NULL, normalization, malformed/overlength/raw-import inputs.
An incompatible legacy-email fixture also proves migration failure preserves the
previous constraint. The release plan requires verified recovery capability and prefers forward repair
over restoring the historical repository expression, which does not match the
actual live single-backslash baseline. The historical
hosting verification gap is superseded by the current preview isolation section.
Its technical push recommendation is not authorization to push or release SQL.
