# Course release transition preparation: migration278

Latest authorized local/disposable/isolated work, 2026-09-30. This supersedes the
prior278 STOP proposal, not the production release prohibition. Preparation is
**INCOMPLETE** because hosted maintenance/mixed-app acceptance and the existing-tab
preservation decision remain unresolved. Production release is blocked.

## Completed correction

Implementation commit `678f9a962e767dd5127f0bc2a280837214e57c13` adds exactly one
migration: `20260930145334_lockliel_media_publication_authorization.sql`.
SHA256: `7b86fc4647338537a4da06e363b716ce2f7960cb02fb28ec8acab2f26c926ea0`.

It replaces only `public.lockliel_sample_media(uuid,uuid,numeric,boolean)` and
restates its narrow execute grants. Eligible canonical enrollment and selected
content publication are checked before writes. Deterministically ordered row locks
and eligibility rechecks prevent publication/enrollment/media changes racing a
sample. Active identity/session, unlock rules, server timing, enrollment, private
notes, RLS and authenticated-only execution remain intact. Empty search_path and
security-definer ownership remain as reviewed. No new table, data backfill, policy
or historical-credit deletion is in278. All previous277 migration hashes, including
the original274, match the exact pinned source. Exactly278 migration files exist.

Focused disposable tests cover published controls, canonical draft/archive,
published translation versus ineligible canonical, unpublished translation,
ineligible fallback, no new95%/unlock, historical credit, republish, direct RPC,
staff non-bypass and identity mismatch. Existing engine fixtures cover remaining
ownership/session/media interval invariants. Two-session tests additionally prove
sampling locks block publication changes until commit and an unpublication that
wins first causes a waiting sample to fail.

## Isolated affected-path acceptance

278 was applied once to `jxtgtfffdiwzxocxoqxk`; MCP ledger alias20260930145615.
Do not apply its repository timestamp there a second time. The isolated ledger is
278; production remains274. Existing hosted app91611ad was used without redeploy.

Real synthetic authenticated requests passed English/Spanish94→95, canonical
draft/archive denial, translation denial, unpublished-content denial, original
fallback denial, republish/historical95 preservation, A/B enrollment isolation,
owner save and private notes isolation. Denied calls returned403/42501 and did not
change media rows. Learner locale was restored. See `hosted-278.json` in the evidence
directory for exact scope and two explained test-harness observations.

## Local validation

- Supported Webpack build/static export and all556 JavaScript tests pass.
- Full278 fresh replay and15 SQL/RLS files pass in disposable PostgreSQL17.
- TypeScript, Netlify validation (74 modules,62 handlers), configured tooling lint
  and targeted new-tooling lint pass.
- Production dependency audit: zero vulnerabilities; no dependency changes.
- Historical277 hashes match; new278 hash recorded; no hosting/workflow edits.
- Production network access blocked in unit/SQL/release rehearsal validation.

The four-stage runner uses pinned CLI2.118.0 and the required binary SHA. It verifies
one pending migration at each exact prefix, then reconnects read-only for catalog,
ledger and semantic postconditions. Verify-full rejects wrong hostname/CA. Actual
CLI writer connections assert lock_timeout5s, statement_timeout30s and TLS.

Disposable failure checks cover SQL error, permission error, actual lock timeout,
statement timeout, server connection termination before commit, real TCP loss after
commit, client-failure classification after commit and ledger-only/object-only
mismatches. Rollback and committed states are recognized; mismatches are UNKNOWN/STOP.
No blind retries. `rehearsal-278.json` records results and pending scope. This is not
a production execution certificate or a tested production credential/path.

## Maintenance and stale clients

Local operational SQL starts a narrow course pause, drains in-flight writes using
table locks, blocks direct writes and applies a PostgREST route/protocol gate.
Restrictive read policies cover embedded course reads. Reopening fails closed if
ledger/final function compatibility is wrong. New app saves/samples carry protocol
278-v1; the journey handler checks backend status before accessing course data.
Unknown/missing status returns maintenance. Unrelated profile requests are allowed
in the SQL hook test; public static HTML remains independent.

The new saver keeps private drafts on503/426, blocks automatic retries, exposes the
retained draft and requests reload. Storage failure asks for a manual copy. Account
isolation and conflict behavior remain intact. Tests prove this for new-client code.
The proposed operational SQL is outside the migration ledger and has only been
installed in disposable clusters. It is not an approved implicit production schema,
permission or PostgREST setting change. See `course-release-278-runbook.md`.

**Unresolved:** production1599ab2 tabs keep drafts in React memory and ignore failed
autosave responses. A server change cannot retrofit persistence or a reload message
into those running tabs. Dave was asked whether a mandatory confirmed copy-and-close
step is acceptable. No answer is assumed. No members were contacted. Full hosted
PostgREST maintenance/hook behavior and the exact old-app→new-app browser transition
have not been exercised; the current isolated hosted artifact remains91611ad.

The local sequence verified is274→pause/drain→275→verify→276→verify→277→verify→278
→verify→SQL protocol reopening checks, plus unit-tested candidate client/handler.
The actual hosted candidate deployment and browser reopening segment is NOT VERIFIED.

## Inventory, Auth and recovery

`course-duration-inventory-2026-09-30.md` lists all13 active video assets across
Lessons1–10, exact provider IDs, missing durations, authoritative source and readiness.
All stored durations remainNULL. YouTube Data API/owner evidence is still needed;
a public metadata request returned429 and was not bypassed. No production values
were written. Lessons11–13 remain approved Media Coming Soon.

`course-release-recovery-auth-2026-09-30.md` gives the exact single-setting leaked
password remediation plan, separately authorized operator verification, PITR/cost
and near-zero-loss recovery prerequisites, MFA/restore permission checks, recovery
point and network/provider gates. No Auth/SMTP/PITR change or purchase was made.

## Refreshed release gates

| Gate | Status | Evidence or remaining work |
| --- | --- | --- |
| Minimal278 and historical integrity | PASS | Exact278 manifest and commit678f9a9 |
| Local engine/security regression | PASS | 556JS,278replay,15SQL; publication concurrency |
| Hosted affected RPC paths | PASS | Synthetic isolated evidence; production never used |
| Four-stage CLI/failure handling | PASS in disposable environment | Exact binary, TLS, stages, postconditions, no blind retry |
| Local pause/drain/direct-write/protocol mechanism | PASS in disposable tests | Operational SQL and new-client tests |
| Old production tabs/draft preservation | BLOCKED | Explicit confirmed copy-and-close decision pending |
| Hosted maintenance/mixed-app transition | NOT VERIFIED | No operational hook install or new maintenance artifact deployed |
| Trusted video durations before reopening | FAIL | 13 missing values; complete inventory/source plan available |
| Leaked password protection | FAIL | Fresh production Advisor warning persists; remediation plan only |
| Near-zero-loss recovery/PITR | NOT VERIFIED | Last Dashboard evidence disabled; separate authorization required |
| Owner MFA/restore capability | NOT VERIFIED | Fresh operator verification and isolated restore needed |
| Stable direct production TLS/network/provider path | NOT VERIFIED | Prior IPv6 no-route; disposable TLS is not live proof |
| Exact production app-release authorization | NOT AUTHORIZED | PR4 remains draft; no merge/release |
| Production preservation | PASS for inspected identities/actions |274, main1599ab2, same Netlify deploy/hash, Sites25 |

## Git and preservation

Branch `lockliel-backend-v1`. Remote remainsa58626b2f0a46b2fad84e1f79e88dbfb13c81a22;
main remains1599ab271e0120a5cdc4e38e225ba749dd214721. PR4 open/draft/unmerged,
auto-merge disabled. No push is appropriate until the incomplete maintenance path
is resolved; no new CI or preview result is claimed. Local implementation checkpoints678f9a9 (278) and17054a1 (cutover/runner)
preserve all work; the separate continuity commit records this report. No history rewrite, main change, production migration, deployment,
Auth/SMTP/PITR/settings/permissions/payment/staff/Share Library change or real-data
test occurred. Netlify production deploy6abbb27a1cdd6d00081b0e8e and homepage hash
match; ChatGPT Site25 remains active with its original update timestamp.
These checks are not an exhaustive audit of unrelated third-party changes.

## Smallest next action

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Accept or reject a mandatory cutover prerequisite: Dave must copy any unsaved
answers/notes and confirm every old production course tab is closed before course
maintenance starts. Existing1599ab2 tabs cannot be patched remotely to preserve
memory-only drafts or display honest autosave failure. Recommended: confirmed
copy-and-close, then finish isolated hosted maintenance and exact candidate browser
cutover acceptance. Alternative: retain automatic old-tab recovery as mandatory;
then the release stays blocked pending a separately designed recovery bridge.
No decision authorizes production execution, migrations, Auth changes or PITR purchase.

After that decision, continue the existing isolated project/site, verify the actual
PostgREST hook and full274→278/app transition without replaying existing hosted
migrations. Use disposable274 for the migration chain and hosted278 for the final
hook/app acceptance. Preserve infrastructure, synthetic identities and all release
history. Only then consider a development checkpoint and separate production review.
