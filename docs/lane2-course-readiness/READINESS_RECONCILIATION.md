# Lane 2: course 280 readiness reconciliation

November 1, 2026. **Readiness packet prepared; production release remains blocked.**

## Authority and exact source

Dave authorized the next bounded phase. Root `docs/coordination/NEXT_PHASE_AUTHORIZATION.md`
and `docs/coordination/assignments/W2-course-readiness.md` govern this packet. It authorizes
read-only isolated identity reconciliation, local verifier checks and these documents.
It does not reopen maintenance, authorize credential provisioning, or permit hosted
positive writes, migration replay, deployment, push, merge or production action.

- Branch: `codex/lane2-course-readiness`.
- Base/head: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
- Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane2-course-readiness/Lockliel`.
- Exclusive writes: `docs/lane2-course-readiness/**`.
- Shared Auth, schema, release tooling, navigation, build configuration and root registers remain locked.

The tracked AGENTS.md at the historical branch base contains superseded October 1
stops. Current root instructions and the explicit November 1 assignment supersede them.
Consumed historical maintenance windows are not reusable authorization.

## Fresh observations versus existing evidence

| Boundary | Evidence | Result and limit |
|---|---|---|
| Git/source | Fresh local branch/head; coordinator's November 1 remote read | Local base/head exact fa294f7; development/PR #4 same source, draft/open/unmerged, auto-merge disabled; main `1599ab2`. No remote mutation. |
| Migration source | Fresh existing `verifySource()` with network guard | All 280 source files and pinned Git-source bytes match sealed manifests at a09280eede4fd12391a6aa97e91eac65ef638e3f. No migration replay or package preparation. |
| Local ACL verifier | Fresh focused test file | Nine tests passed, zero failed, with network guard; synthetic in-process catalog/ACL evidence only, not fresh hosted security acceptance. |
| Isolated database | Coordinator's fresh November 1 read-only baseline | 280, paused=true, schemaReady=true, protocol278-v1; effective service_role note table/column privileges zero. Lane2's additional read-only call returned an internal tool error; no second success is claimed. |
| Management discovery | Coordinator's fresh November 1 baseline | get_project says not found and project listing omits qjks, while parent branch listing reports healthy and SQL succeeds. Availability is not treated as deletion. |
| Isolated deploy | Fresh allowlisted Netlify metadata | Site `70b03a42-6329-476e-bf4b-2b1ce30e9567` is named jade-unicorn-642f40. Deploy `6abfd81ccee16b59b75711a0` remains ready, rehearsal branch-deploy, commit_ref=null. |
| Served frontend | Fresh credential-free HTTPS GETs | Four HTML responses return 200 and exactly match historical fa294f7 artifact hashes: sign-in, sign-up, journey and admin/person. Sign-in's initial HTML has method POST and disabled controls. No browser or JavaScript execution. |
| Current backend binding | Fresh metadata limitation | No comparable deployed function digest entries exposed. Frontend parity cannot certify current function bytes, outbound guard or runtime qjks binding. Keep this gate open. |
| Auth/manager acceptance | Existing October 3 report, exact fa294f7 | A/B separation, manager password, AAL1 denial, normal MFA/AAL2 and approved learner projection passed; roles unchanged and synthetic sessions cleaned up. Do not reset/retest merely because older failures exist. |
| Positive course 280 | Existing October 3 report, exact fa294f7 | Persistence/restoration, A/B privacy, notes, actual watch/progression/completion, protected synthetic PDF, eight duration cases and server retry passed within documented fixture limits. |
| CI | Coordinator's fresh metadata read of completed October 2 runs | Push run `37031917928` and PR run `37031925904` succeeded at fa294f7. Historical totals: 580 JavaScript tests, 280 migrations replayed and 17 SQL files and configured validation; no rerun today. |
| CAPTCHA containment | Separate d71d079 line and October 19 reports | Real proof failed 300030; positive email/session/manager/Sites compatibility remains incomplete. This neither invalidates course acceptance nor establishes containment readiness. |

The historical manual deploy has no commit_ref. The provenance chain is the prior
packager/handler evidence plus the four freshly matching frontend files, not a newly
certified complete deploy-to-Git binding. Neither a redeploy nor credential test was
used to fill that gap. Static GETs followed no redirects, carried no credentials or
cookies, and printed/saved no response body. An initially restricted network attempt
failed; the authorized unrestricted static retry succeeded.

## Acceptance reconciliation

Getting a Grip remains Model A: Watch to Advance / Answer to Complete, 95%, no score,
optional private notes. Actual 94.81% remained below threshold in the October 3 run;
further real playback crossed 95%, with the next visible observation 97.18%. Do not
claim an exactly 95.00% browser frame. Actual seeking did not manufacture the threshold.
Historical legitimate completion remained complete and notes remained editable.

Answers/notes were independently restored after navigation, refresh and account
switching. Manager AAL1 denial and AAL2 projection were verified without expanding
roles or exposing private notes. The same-request retry preserved its revision;
browser lost-ack/network-interruption recovery was not reproduced and remains a
bounded optional gap, not a newly observed failure.

Lessons 11–13 are approved to remain Media Coming Soon with honest gates. Missing
videos do not justify fabricated completion or invented assignments. The known narrow
acceptance artifact's unavailable personal-guidance home card is not evidence of a
course regression. It does not certify unrelated member tools.

## Production gates carried to coordinator

The coordinator's fresh November 1 baseline is production 274, 181 Auth users/181 profiles,
28 confirmed, zero staff roles, one enrollment, zero lesson/media progress and RLS 56/56.
Member legitimacy/authorization remains unresolved; Lane2 performed no production query
or account disposition. Current main and Netlify production/Sites 25 identity remain
preserved by the coordinator's verification, not a separate Lane2 audit.

Fresh PITR UI evidence shows enabled seven-day retention and a visible rolling window.
Small compute is prior October 19 evidence, not freshly verified. No restore, factor
challenge or recovery rehearsal was performed. Independent 13-PDF byte recovery,
Storage custodian/retrieval proof, Dave's release-window/factor availability, final
accepted-write PITR coverage, notice/save-copy/old-tab closure, drain, member disposition,
exact publishing route and explicit execution/reopen authority remain gates.

See [future isolated matrix](ISOLATED_ACCEPTANCE_MATRIX.md) and
[release order/recovery/duration packet](RELEASE_ORDER_RECOVERY_DURATION.md).

## Provenance and handling limits

Historical October 3/19 reports and the fresh coordinator baseline are currently
available only in the original checkout, not in this lane's historical Git base.
Their absolute paths and byte fingerprints are in
[evidence/2026-11-01/source-report-fingerprints.json](evidence/2026-11-01/source-report-fingerprints.json).
They are attributed local evidence, not claimed committed artifacts. A future scoped
documentation checkpoint must preserve the selected source reports or a verified
archive before treating this packet as a portable evidence bundle.

One local source read inadvertently displayed a checked-in public publishable-key
field. It was not a private/service credential, was not loaded for requests, and no
key value is copied into these documents/evidence. All connected metadata subsequently
used an allowlist. No environment-variable or key inventory was fetched. No protected
credentials, member PII, tokens, private notes, signed URLs or PDF bytes were requested.

No source/schema/configuration, Auth, maintenance, hosting, permission or production
state changed. No browser, account/session test, full suite, build, SQL replay, push,
merge, deployment or commit was performed. Maintenance remains ON by observed baseline
and no Lane2 toggle. Smallest next action: obtain read-only deployed-function/binding
attestation for this exact alias/artifact; do not reopen or redeploy implicitly.
