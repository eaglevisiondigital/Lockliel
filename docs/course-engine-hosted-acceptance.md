# Course engine isolated hosted acceptance

Status: planned, not provisioned or executed. This is the exact next package after
local validation and the development checkpoint. No paid infrastructure, real
accounts, production credentials/data, settings change or release is authorized here.

## Environment requirements and entry criteria

1. Separately authorize one disposable Supabase project and one dedicated acceptance
   site, including cost/owner/lifetime and teardown responsibility. Record project ID,
   database identity, Auth origin, private storage buckets, site ID and exact commit.
   They must differ from production project `bsndfhbemstyrrglajat`, Netlify site
   `3096b319-3068-45ab-9837-ba0cce59d50f` and both published websites. A new database
   schema inside production is not isolation. Do not enable production Git integration.
2. Use fresh, separately scoped credentials, held only in that site's server-side
   secret store. Do not copy production users, sessions, SMTP, payment credentials,
   service keys, content activations or personal data. Use a test inbox/sink for Auth
   flows and dedicated synthetic A/B users; use a synthetic MFA course manager and
   unprivileged user. No real email/SMS, payments or production account testing.
3. Replay the 275 reviewed migration files only into the empty isolated project,
   compare the original 274 hashes and the exact candidate hash, and verify Auth,
   PostgREST and Storage integration. Never use the old production 274-release runner.
   Synthetic fixture setup needs its own reviewed script and explicit target identity
   check. No production project link, password, data export or fixtures are permitted.
4. The current runtime hardcodes the production backend and rejects every connected
   nonproduction request. Deploy Preview #4 is therefore a static/denial preview,
   not this acceptance environment. A separately reviewed binding package must route
   the dedicated acceptance site exclusively to its isolated project, with positive
   site/project identity checks and a hard rejection of the production project. Do
   not introduce an environment flag, hostname, request header or context override
   that disables `withProductionBackend` on ordinary previews. Keep that guard and
   its complete denial suite unchanged. Do not set preview context to production.
   Record the binding diff and approvals before authenticated browser work.
5. At the acceptance site's runtime and browser layer, deny production Supabase,
   `lockliel.com` write routes, the production Netlify site, live Blobs, live email and
   payment services. Assert this denial before synthetic writes. Separate site-scoped
   storage from production. A mocked fetch test alone is not proof of hosted isolation.
6. Seed only synthetic enrollments, worksheets, private test PDFs and approved test
   video references with independently verified durations/provenance. Use a 13-lesson
   Getting a Grip shadow course: 1–10 configured, 11–13 media pending, same Model A/95
   rule. No invented production media IDs. Add separate synthetic Model B/C/D courses
   with private grading keys/review approvals. Keep published production content inert.
7. Pin immutable acceptance deployment to the reviewed development SHA and record
   migration hash, Auth/RPC/RLS test identities and environment receipts without
   secrets. Independent production preservation snapshots must match before/after.

## Exact acceptance sequence

| Check | Expected evidence |
| --- | --- |
| Identity and isolation | Distinct project/site IDs, exact SHA, 275 isolated migrations, explicit production egress-denial probe, no production credentials |
| Auth and cloud save | Sign in synthetic A through real Supabase Auth; edit an answer and notes; observe Saving, Saved, Last Saved; record successful scoped RPC and returned revision |
| Reload/cross-session | Reload, sign out/in, then use a second browser/device; real cloud answers/notes/progress restore without relying on local storage |
| Offline and retry | Disconnect acceptance transport; see Offline Draft Saved/Cloud Sync Needed or visible retry failure; reload draft; reconnect and verify one acknowledged revision |
| Conflicts | Edit same lesson in two sessions; stale revision is rejected, newer cloud state retained, conflict draft remains recoverable; no silent blank overwrite |
| Navigation | Leave with an unsynced edit and verify warning; sign out during a delayed request, then sign in B; no A answers/notes/progress/draft/pending response appears |
| RLS/privacy | B cannot read/write A records through real PostgREST/RPC; stale A request and revoked session fail; ordinary/admin progress views omit notes; grading keys inaccessible |
| Trusted media | Missing duration never advances; manager can enter verified seconds plus source and DB timestamp; member/aal1/noncourse staff cannot; changed video identity clears timing |
| Watch boundary | Real bounded sampling fails at 94%, succeeds at 95%; seek-to-end and forged client percent/ranges fail; replay preserves durable achievement |
| Progression | 95% unlocks next lesson before worksheet complete; required answer + watch completes, optional notes not required; Model B score, C simple and D review behave as configured |
| Pending media | 11 displays Media Coming Soon once unlocked; resources/notes shell works; completion blocked; 12/13 remain locked; no fabricated media or no-video fallback |
| Owner exports/resources | Default answer export omits notes, explicit owner export includes them; private PDFs need enrolled session; unauthorized raw storage access fails |
| Responsive | Desktop, tablet, 390px; sticky media/minimize, keyboard focus and actual mobile keyboard, no horizontal overflow; verify real provider fullscreen/casting separately |
| Durability | Completed answers immutable, notes editable; new login restores completion; cosmetic content changes preserve snapshot/progress; no leadership grant |

Record pass/fail, exact timestamp/SHA, sanitized screenshots and request status for
each row. No screenshots or logs containing tokens, passwords or personal data.
Stop on identity mismatch, production route contact, unexpected writes or privacy
failure. Report actual failures before a release decision. Synthetic local browser
checks and disposable SQL are supporting evidence, not substitutes for this matrix.

## Exit and release review

Require the complete matrix, preserved production baselines and a reviewed migration
275 deployment/rollback runbook before a separate production migration/application
release decision. This assignment does not authorize either release. The current
production persistence bug remains live until such a release. Approved videos for
11–13 and authoritative duration values remain external content/configuration work;
engine completion does not claim these lessons are ready for learner completion.
