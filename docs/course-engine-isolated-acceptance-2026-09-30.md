# Isolated course engine hosted acceptance, 2026-09-30

## Result and scope

The authenticated isolated matrix passed after narrow fixes. Production release is
not authorized. Exact implementation: `91611ad89933333891bdf2bb3791314fdd03012e`.
Development checkpoint and remote CI evidence are recorded separately below when
available. This report supersedes the earlier email-isolation blocker, not its history.

Source authorization: Dave's subsequent full hosted acceptance assignment explicitly
permits branch-only SMTP/confirmation changes, three synthetic users, MFA, synthetic
fixtures, necessary fixes and a development push. No production operation is included.

## Environment and Auth

- Supabase `jxtgtfffdiwzxocxoqxk`, branch `course-engine-acceptance`, branch ID
  `fe1a83bb-02a8-4113-b93a-973b307d4621`, parent `bsndfhbemstyrrglajat`.
- The fresh branch began with 274 migrations, zero users and zero storage objects.
  No production member data was copied. It now contains 277 migrations.
- Custom SMTP was disabled and saved on this branch; a fresh dashboard navigation
  confirmed OFF. Email confirmation was disabled and verified after reload. Public
  Auth settings report `mailer_autoconfirm=true`, password/email signup enabled,
  anonymous signups disabled. Real signup returned no confirmation requirement.
- No email send, recovery email, SMS or payment was requested. Inherited custom Resend
  SMTP is disabled. Its previous secret was neither read nor copied; deletion of any
  retained provider-side credential is not independently established by the OFF toggle.
- Exactly three synthetic identities use `example.com`: A, B and course manager.
  Passwords, cookies and the test TOTP secret are in a private temporary file, never Git.
- Manager has `discipleship_admin` only, with one verified TOTP factor. Real AAL1
  application access returned 403; real challenge produced AAL2 and authorized access.
- Secure, HttpOnly, SameSite=Lax cookies were verified. The HTTPS-only acceptance
  binding now explicitly sets Secure, correcting the initial manual-runtime cookie.

## Deployment identity and isolation

Dedicated Netlify site: `60579b8e-d0ca-4ac1-abe5-7128f4243e8b`.
Final acceptance deploy: `6abcdb0c84404e24a9880ac6`.
[Acceptance URL](https://acceptance--lockliel-course-acceptance-jxtgtfff.netlify.app).
This is a manual nonproduction branch-deploy, with no Git production binding. Its
artifact identity records implementation `91611ad89933333891bdf2bb3791314fdd03012e`,
no uncommitted source diff, and SHA256 values for all 14 compiled handlers. It is not
an ordinary PR preview and does not claim a provider `commit_ref` for a manual deploy.

The separate compiled artifact pins exact site and isolated Supabase identities,
denies production invocation context, forged identity headers, other outbound fetch
origins and redirects. Original production handlers retain `withProductionBackend`.
No service key, production Supabase binding, Blobs, payment/email transport or public
campaign form is included. Hosted responses identify `isolated-course-acceptance`;
static pages have noindex and a restrictive connection policy. Signup was re-enabled
only after the authorized isolated Auth changes. No production guard was bypassed.

## Migration mapping and fixes

All original 274 SHA256 values were compared with production main `1599ab2` and match.
Candidate 275 is also unchanged, SHA256
`2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1`.

| Repository version | Isolated MCP ledger version | Purpose |
| --- | --- | --- |
| 20260929215159 | 20260930083553 | Original course engine candidate 275 |
| 20260930092000 | 20260930091336 | Course release trigger execution, 276 |
| 20260930092500 | 20260930092041 | Optimistic conflict HTTP status, 277 |

Do not reapply these files to the acceptance branch using their different repository
version identifiers. Preserve the mapping. Production contains none of these three.
Never use the old 274-release runner for this new three-migration release candidate.

Hosted defects repaired:

1. The legacy release trigger ran as invoker but called an intentionally private
   readiness helper. Ready-course publication failed with permission denied. The
   non-exposed trigger is now a tightly scoped definer with empty search path and no
   direct public/anon/authenticated execution. Existing course UPDATE privileges,
   staff/MFA RLS and the full readiness predicate remain. Incomplete publication still
   fails; complete synthetic publication passes via the original MFA application API.
2. SQLSTATE `40001` caused PostgREST transaction retries for a business revision
   conflict. New migration preserves the save function except its conflict SQLSTATE,
   now `PT409`. Real stale saves return prompt 409. The handler recognizes both codes.
   [Supabase explanation](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b).
3. Admin person route consumed the same enrollment response body twice, producing a
   hosted 502. It now parses once, with a real Response-body regression test.
4. Conflict reload previously re-blocked on the same retained draft. Explicit
   Keep Draft and Use Cloud Work archives that account/lesson draft, loads fresh
   cloud data and permits editing, while the earlier draft remains viewable.
5. Manager progress counted only started lessons (10/11). It now uses all course
   lessons (10/13), displays 77% and the first incomplete lesson, lesson 11.

No dependency, ordinary hosting manifest, workflow, branding or production setting
changed. Visible changes are restricted to conflict recovery and the manager summary.

## Hosted evidence matrix

| Area | Actual hosted result |
| --- | --- |
| Signup/login | A/B/manager real isolated Auth signup and password login pass; no confirmation email required |
| Signout/session/return | Browser signout/login round trips pass; intended lesson return works; external `next=https://example.invalid/escape` reduced to internal `/my-lockliel` before MFA |
| Manager MFA | Existing factor enrolled/verified; browser challenge AAL1 to AAL2 passes, no privilege bypass |
| Autosave | Multiple answers and separate Personal Notes show Saving, Saved and Last Saved; actual scoped database revision/rows observed |
| Navigation/refresh | Course overview, lesson return and refresh restore cloud answers and notes |
| Logout/login | A to B to A in the same browser restores A's completed answers and post-completion note; no B draft displayed |
| Independent context | A signed into IAB independently of Chrome and restored cloud answers/notes/progress/course position without shared browser storage |
| Save outage | Temporary compiled acceptance-only fixture returned 503 for journey POST before any DB request. Browser showed Save Failed/Retry Needed, retained B answer/note through reload and never falsely showed Saved. Fixture removed; retry showed Saving then Saved, one row/revision 1 |
| Lost response | Repeating identical committed payload returned the same revision, not a duplicate write |
| Stale conflict | Newer cloud revision wins; stale blank save rejected 409. Browser surfaced conflict, retained unsynced draft, then loaded newer answer via explicit recovery and saved new edits at revision 3 |
| Account identity | Delayed A-shaped request with B cookie rejected 409. B has its own answers, notes and 1% test media state, never A's 95%/completion/draft |
| Notes privacy | Real PostgREST B and manager queries for A notes return no rows. Manager ordinary UI has submitted worksheets only, no Personal Notes. Default export omits notes; explicit owner export includes them; cross-user export cannot fetch A notes |
| Completed work | Completed answers immutable, notes remain editable; notes-only save preserves completed status |
| Watch threshold | Real elapsed sampling reached 94% with lesson 2 locked, then 95% with lesson 2 unlocked while lesson 1 worksheet remained incomplete |
| Anti-forgery | Seeking 99 to 100 earned only 1%; posted arbitrary percent/intervals did not grant credit; direct table insert denied 403 |
| Durable watch | Replay to zero retains earned threshold. Watched intervals and threshold timestamps persisted |
| Duration/version | Separate synthetic timing lesson: unknown duration yields zero and blocks completion; real MFA duration verification succeeds; provider identity change clears duration/provenance and cannot reuse timing |
| Completion gates | Locked, premature and unenrolled completion rejected; required answers plus watched threshold complete without notes or score; no staff role granted |
| Lessons 2–10 | Real bounded elapsed sampling of every required asset followed by valid synthetic worksheet completion passes |
| Lessons 11–13 | Model A/95 retained; 11 unlocked with Media Coming Soon and usable worksheet/note/resource shell; 11 completion denied 400, 12/13 locked and denied 403, no fallback completion |
| Overview/Continue | Thirteen Grip lessons, 10 completed, 77%, Continue Course links to lesson 11 rather than lesson 1; locked and pending states shown |
| Full completion | Separate one-lesson synthetic course completed through real timed sampling and save RPC; browser shows 100%, 1 of 1, Course Completed and review link |
| Manager | MFA UI reads enrollment, current incomplete lesson, overall progress, worksheet completion, last activity and media percentage. Ordinary member admin route denied 403 |
| RLS/resources | Actual A/B cross-read empty, cross-write returns zero affected rows; anon journey 401, grading relation unavailable 404, enrolled private PDF bytes delivered, storage paths absent from journey DTO |
| Responsive | Authenticated 1365px sticky two-column, 768px collapse, 390px layout without overflow; minimize/expand, worksheet/note/save/resource/navigation controls inspected |
| Keyboard/fullscreen | Tab from question 3 focuses question 4 with solid focus outline; real provider fullscreen observed visually. DOM fullscreen flag did not reliably reflect provider view |
| Casting | YouTube Watch/Cast link and device-control guidance verified. Physical AirPlay/Chromecast and physical mobile keyboard are manual device checks, not claimed passed |

An early timed-watch run was discarded because a second browser was playing the same
asset. The successful 94/95 run was repeated with that player paused. One follow-up
save hit the expected short rate limit and succeeded after waiting. The synthetic
single-lesson timing sequence similarly respected rate limits before its valid run.
These were not counted as passing samples. The temporary 503 fixture is absent from
the final artifact. No real user or production-data testing occurred.

## Database evidence after acceptance

Three Auth users, one verified TOTP, three enrollments (A/B Grip plus manager synthetic
timing fixture), 13 lesson_progress rows, 15 media_progress rows, 13 private-note rows,
and 13 actual private synthetic PDF objects. Empty optional notes may have rows.
A has 11 lesson rows, 10 completed, revisions 1–7. B has one incomplete lesson at
revision 3. Manager's one synthetic lesson completed at revision 1. Eleven durable
threshold timestamps match the 11 completed lessons. No duplicate enrollment or
profile/lesson groups, no A/B note-label contamination, no public table with RLS off.
Original Grip lessons 11–13 have no invented teaching videos. The added timing course
is explicitly synthetic and uses existing observed provider references only.

## Local validation

Full `npm run validate` passed with OS outbound-network denial and a disposable
PostgreSQL 17 cluster with TCP disabled: 550 JavaScript tests, 277 authoritative fresh
migrations, 14 SQL/RLS files, supported Webpack/static build, TypeScript, Netlify
validation and configured lint. Targeted changed-function/artifact lint and artifact
egress/identity denial tests also pass. Production dependency audit: zero vulnerabilities.
Secret checks found no synthetic credentials or private-key patterns in changed files.

Isolated Security Advisor: private grading table without public policies is intentional
(default deny); three authenticated definer RPC warnings are expected for the scoped
session/identity/enrollment-checking APIs. These are not an empty-advisor claim.
Leaked-password protection is disabled on the isolated Auth project, left unchanged;
synthetic passwords are random. Review this setting separately for a production release.
[RPC advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
[private table advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
[password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Production preservation and limitations

Read-only production query confirms 274 migrations and zero course-engine/fix migration
entries, one existing Auth user and zero staff roles. Main remains
`1599ab271e0120a5cdc4e38e225ba749dd214721`. Published Netlify production remains
`6abbb27a1cdd6d00081b0e8e`; both public hostnames retain 128071-byte homepage SHA256
`a184c485520cc5fa6bd5cee0b0e47cdaf46575e1e9794f9afa25743466cfbe00`.
ChatGPT Site remains active version 25, last updated August 27, 2026.

No production database write, migration, Auth/SMTP/settings/permissions edit, payment,
staff assignment, Share Library activation, merge or production deploy was performed.
Provider-wide Auth/SMTP/payment settings were not independently fingerprinted end to
end. This confirms our operations were isolated and the listed baselines match; it
cannot prove absence of unrelated third-party activity across every provider setting.

Retain both acceptance resources and synthetic records for review. No cleanup, branch
merge, production release or content activation follows automatically. The smallest
next package is a separate production release REVIEW covering migrations 275–277 and
the application fixes, backups/recovery and authoritative production duration/content
readiness. Review must reconcile isolated ledger aliases without reapplying SQL.
