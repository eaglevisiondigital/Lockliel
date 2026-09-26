# Lockliel security model

Baseline: 2026-09-26 at `47409a2796a5275e12684cb4a182cb008c4d5414`.
This is a focused continuity assessment, not a complete penetration test or
certification. Evidence and omissions are recorded in `CURRENT_BUILD_STATE.md`.

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

Read-only catalog inspection and expression evaluation verified an over-escaped
email-format constraint in the live database. A local corrective migration is
prepared and regression-tested, but not deployed. No live RLS, grants, roles,
authentication settings or permissions changed. Full repository ESLint debt and
production journey validation remain unresolved.
