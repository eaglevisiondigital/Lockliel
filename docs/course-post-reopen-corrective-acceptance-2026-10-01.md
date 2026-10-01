# Isolated post-reopen corrective acceptance, 2026-10-01

Assessment: **ISOLATED POST-REOPEN ACCEPTANCE STILL INCOMPLETE**.

The manager, synthetic-duration, footer, and modern recovery gaps are corrected.
The original client is reproducible and fails the required reload/retry UX, while
server-side stale-write protection succeeds. This is not production authorization.

## Scope and exact identity

- Authorized isolated Supabase: `qjksggxorghaxvpyslip`, retained branch
  `course-cutover-rehearsal-274`, schema279.
- Authorized Netlify site: `70b03a42-6329-476e-bf4b-2b1ce30e9567`.
- Starting application: `406c1691aee11311783ef83a7e970c6a4d5acd13`, deploy
  `6abe7a6b1490c08d003640dd`. Starting local documentation HEAD: `17d7f92`.
- Corrected application: `21ac4a5172a7dd7082b659d65533385e231892ef`.
- New isolated deploy: `6abe8f4f75e5a756b7d0cd9a`, ready, `branch-deploy`, branch
  `rehearsal`, `published_at=null`.
- URL: <https://rehearsal--jade-unicorn-642f40.netlify.app>.
- The manual deploy has no provider commit_ref. Provenance uses the clean source
  commit, prepared artifact identity, handler hashes, and exact served HTML equality.
  All nine handler hashes match the prior 406c169 artifact; four inspected served
  HTML files equal the prepared artifact. Guard probes:36 denials, zero outbound calls.
- Maintenance remains OFF: paused=false, schemaReady=true, protocol=278-v1. No new
  migration, RLS change, maintenance toggle, development push, or PR merge.

## Manager fixture and privacy

Added only the existing `discipleship_admin` role to the existing synthetic manager,
retaining `content_admin`. No new role or broader access model was created. AAL1
access is denied; existing TOTP MFA/AAL2 permits the learner-progress view. The real
browser shows permitted course enrollment, progress, worksheet completion and media
activity. Contact fields remain withheld and Personal Notes are absent.

Ordinary A/B members receive403 on manager routes; cross-user notes/progress/media/
enrollment reads return no rows. Direct read-only SQL under actual authenticated
claims confirms A/B owner isolation, permitted manager progress, and no manager
private notes. Effective service_role notes privileges and PUBLIC notes grants remain
zero. Catalog comparison matches the pre-correction baseline.

## Synthetic video correction

Thirteen isolated synthetic video records use the same exact YouTube test video
`M7lc1UVf-VE`. Their erroneous100-second duration was corrected to1344 seconds,
22:24, matching the actual player and the supplied authoritative duration. Provenance
is recorded as manual-manager verification with a server timestamp. Existing audit
and recomputation triggers ran. Historical completed worksheets and their original
content snapshots were preserved, not rewritten to manufacture results.

Real browser playback at the corrected duration stayed locked at94.30% and94.67%,
then unlocked at95.41%. Lesson status remained in_progress until explicit completion.
The playing tab had an empty local worksheet, so its Complete control remained
unavailable even after watch met; another authorized browser had already saved the
cloud worksheet during outage testing. An empty-answer completion request returned400
and preserved the exact cloud answers, notes and revision. Playback reached its normal
22:24 end with97.64% actual coverage and no previous duration error. Refresh retained
the threshold and restored cloud answers/notes; explicit Complete Lesson then succeeded.
Final read confirms A completed/next unlocked and B in_progress/next locked. No
accelerated clock, seeded watch credit or generated media samples were used.

User B played briefly, visibly sought to the end, and reached Replay Video. The
server reports position1343.661 but only28.397 covered seconds/2.11% watched, with
watch_met=false and the next lesson locked. Seeking cannot manufacture completion.
Lessons11–13 remain media-pending; no production asset or duration was changed.

## Worksheet footer

The only application change adds `color:#172943` to `.course-completion` in
`app/my-lockliel/journey/lesson/workspace.css`, avoiding inherited white text from
the general footer style. Foreground23,41,67 on background237,244,252 yields13.21:1
contrast. Browser views1440/768/390 have no horizontal overflow. Desktop retains its
two columns; tablet/mobile retain the existing single-column layout. Minimize/Expand
works. No unrelated visual redesign.

## Network recovery

A dedicated Chrome test tab used DevTools Offline. While offline, User A entered
synthetic answer and private-note changes. The UI showed Offline Draft Saved, not
cloud Saved. Independent reads confirmed cloud revision0 still had no new answer
or note. Restoring No throttling led through Saving to Saved, one cloud revision
increment, and one progress/note row. Refresh restored both exact values. Drafts
survive until acknowledgment; no blank overwrite or account crossover was observed.
The modern saver has a bounded retry policy; the controlled outage did not exhibit
the unbounded periodic behavior seen in the old client.

The optional throttled in-flight attempt completed before interruption, so an actual
mid-flight browser disconnect is **not verified**. It is not represented as a pass.

A separate lost-response test used the unchanged production autosave module against
the real isolated API. The controlled transport discarded the first successful
server acknowledgment. The draft remained dirty and not Saved. Retry returned an
idempotent acknowledgment: two successful responses, exactly one revision increment,
one progress row, no duplicate work. A subsequent real-browser refresh restored
User B's exact answer and private note. This is real hosted persistence with a
controlled response-drop adapter, not browser-level packet interception.

## Original client: reproduced failure

Retained immutable deploy `6abd778184898338b60d32b2` serves original application
`1599ab271e0120a5cdc4e38e225ba749dd214721` on the same isolated site/backend. Original
business JavaScript is preserved; the previous rehearsal adapter binds the isolated
backend/cookies/guards. No production page was used, and no old app was redeployed.
This recreates the old version against279; it is not a literally retained pre-cutover
tab with memory-only drafts.

- Original worksheet autosave receives426 Upgrade Required with a generic response.
  The browser silently swallows it while still claiming answers save automatically.
- Original media playback continues periodic requests after426. Network inspection
  observed the request count increase from8 to9. Original code lacks an error stop
  or finite retry limit for these playing-state samples. Local watch UI advances
  although cloud writes are denied.
- Old completion on media-pending lesson11 receives426 and displays a generic save
  failure, not the approved reload guidance. Its old overview misleadingly says Ready.
- There is no standalone Personal Notes input in this old1599ab2 client. A notes-only
  old UI path therefore could not be exercised and is not claimed to pass.
- Read-only verification finds no legacy marker persisted and no User B lesson11
  progress row. Existing completed work is preserved. The test tab was closed after
  recording evidence so it no longer sends these requests.

Therefore stale mutation prevention/no corruption PASS; approved stale/reload UX,
non-silent failure, and bounded old-media retries FAIL. We cannot retrofit JavaScript
already running in a user's old tab by changing a new static deployment.

## Regression and evidence

- Full supported `npm test`:573 JavaScript tests, all pass; supported webpack/static
  export builds37 pages.
- TypeScript, Netlify validation and configured tooling lint pass.
- Local validation retained fail-closed production network protection, including OS
  outbound denial. No live fixtures were used by the local suite.
- 25 focused hosted API authorization checks and fresh read-only SQL/RLS role/catalog
  probes pass. These supplement, rather than claim a rerun of, the prior16 disposable
  SQL files. No full279 replay was repeated because no schema changed.
- All279 repository migration hashes match. No dependency changes or cleanup.
- Evidence directory: `docs/evidence/course-corrective-acceptance-2026-10-01/`.
  JSON captures assertions; screenshots capture actual UI; logs capture local checks.
  Credentials, tokens, database connection strings and private test helper files are
  excluded. Initial test-harness expectation/claim errors were corrected without
  altering application/RLS behavior; final evidence is from passing reruns.

## Production preservation and retained environments

No production DB write, migration, deployment, Auth/SMTP change, payment/staff/settings
change, Share Library activation or content configuration occurred. No push, main
merge, or PR4 merge occurred. Only isolated manager membership, synthetic durations,
synthetic progress/notes/media/Auth sessions and the isolated footer deploy changed.

Production274, main1599ab2, Netlify production6abbb27a1cdd6d00081b0e8e and ChatGPT
Sites version25 remain the carried-forward verified baseline. This assignment did
not make a fresh production audit, so unchanged live external state is not newly
certified. Production lessons1–10 still need authoritative duration configuration;
lessons11–13 stay Media Coming Soon. Preserve qjksggxorghaxvpyslip,
jxtgtfffdiwzxocxoqxk and both isolated sites. No cleanup occurred.

## Smallest next decision

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Review only the reproduced original1599ab2 stale-client failure. Server rejection
protects data, but old autosave hides errors and media requests continue after426.
Keep the approved policy: copy/save unsaved work, close ALL old course tabs, confirm
closure, release, then reopen fresh tabs. Do not promise recovery of old memory drafts.

Choose whether the release acceptance gate may explicitly rely on this operator
policy while retaining the failed old-client UX finding, or requires a separately
scoped legacy compatibility/transition mitigation and isolated rehearsal. The first
choice needs an explicit risk acceptance and must not be called an old-client test
pass. The second must not weaken stale-write denial or private-note RLS and may need
a staged transition because already-running old JavaScript cannot be patched in place.
No production release, migration, content action, push or cleanup is authorized by
this recommendation. Do not begin another product package.
