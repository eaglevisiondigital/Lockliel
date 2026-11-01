# Future isolated acceptance matrix

Prepared November 1, 2026. **Plan only; no new Auth or positive course test authorized.**

## Fixed target and permission gates

Target only Supabase `qjksggxorghaxvpyslip` / branch `course-cutover-rehearsal-274`
and Netlify site `70b03a42-6329-476e-bf4b-2b1ce30e9567`. Expected application source
`fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`; historical deployment
`6abfd81ccee16b59b75711a0`, current observed alias
`https://rehearsal--jade-unicorn-642f40.netlify.app`. Four frontend pages match the
historical artifact; current runtime function bytes/backend binding remain unverified.
Stop on an unexpected target, source, function digest, schema, protocol or security state.
Do not substitute another candidate or redeploy as a diagnostic shortcut.

The current assignment permits only the read-only/local checks reported in the
reconciliation. The following gates control any future dispatch:

1. **Binding attestation:** safe read-only current artifact/function/binding evidence,
   not only a ready status or matching static HTML. No key/env inventory is needed.
2. **Synthetic Auth authority:** a separately approved exact test window and protected
   credential/session mechanism. Current authorization does not permit new password/MFA
   provisioning, key loading, real CAPTCHA activation or account mutation. Previously
   used helpers/credentials and maintenance approvals are consumed, not reusable.
3. **Positive course authority:** explicit bounded isolated maintenance OFF/test/ON
   approval after fresh pre-exit checks. Keep maintenance ON until then. No successful
   autosave/media/progression probe can be required while closed.
4. **Cleanup:** sign out only the newly authorized synthetic sessions, discard temporary
   credentials, restore maintenance ON immediately, independently verify closure/security
   and record scoped before/after state. Never touch production or unrelated fixtures.

If only binding evidence is missing, close that evidence gap first. Do not repeat the
complete October 3 matrix by default. Retest only a changed surface or an explicitly
selected unresolved case, with its dependency gates satisfied.

## Matrix

| ID | Case | Expected result | Existing evidence/current status | Future authority and minimal method |
|---|---|---|---|---|
| I01 | Current alias and static Auth/course/admin shells | Exact artifact bytes; initial sign-in POST/disabled controls | Fresh November 1: four200/hash matches; no JavaScript execution | Read-only static GETs permitted and complete; no repeat needed absent change. |
| I02 | Current deployed functions and backend transport | Exact reviewed handler/binding/outbound-guard digests, only qjks destination | Unverified: deploy commit_ref=null and metadata exposes no comparable digests | Binding attestation gate. Obtain owner-accessible safe digests/immutable artifact record; no credentials, bundle-content or env dump. |
| I03 | Closed database identity/readiness/security | Exactly280, paused=true, schemaReady=true,278-v1; notes effective service table/column privileges0 | Fresh coordinator baseline passes; Lane2 follow-up tool errored | Bounded read-only catalog inspection if required for a future window; actual read-only/5s/30s safeguards. No migration replay. |
| A01 | Synthetic A and B separate sign-in | Distinct sessions, own data only; no cross-user contamination | October 3 PASS on fa294f7 | Binding + synthetic Auth authority. Only if relevant Auth/source changed; no automatic reset. |
| A02 | Manager password/AAL1 | Normal password sign-in requires MFA; privileged route403/mfa_required | October 3 PASS | Binding + synthetic Auth authority; retain existing roles, no broader grants. |
| A03 | Normal manager MFA/AAL2 | Normal challenge reaches AAL2 and approved limited learner view; private notes excluded | October 3 PASS | Binding + synthetic Auth authority. A new factor reset would need explicit authority; do not infer it. |
| A04 | Logout/downgrade | Privileged access removed with expired/ended session or AAL1; safe sign-in return | Source/local cases and prior acceptance scope retained; not a fresh November 1 test | Explicit focused Auth dispatch if needed. No real account/session inspection. |
| C01 | Autosave and independent restoration | Honest Saving/Saved/error/conflict states; exact cloud revision; refresh/logout/account switch restoration | October 3 PASS | Binding + Auth + positive course authority. Synthetic unfinished lesson only. |
| C02 | Revision CAS/exact-request retry | Stale revision conflicts; replay of original identical expected revision is idempotent | October 3 PASS for server retry | No rerun absent relevant change. Do not use a newly current revision as if it were a retry. |
| C03 | Browser lost-ack/network interruption | Draft retained, no false Saved, bounded retry without duplicate/conflicting write, restoration after reconnect | UNVERIFIED browser case | Optional smallest new test described below; requires all three gates and a disposable browser/request-scoped fault. |
| C04 | A/B and manager privacy | No cross-user answers/notes/media/enrollment reads; manager projection omits private notes and unreleased answers | October 3 PASS | Focused future synthetic check only if touched. Do not extract real learner data. |
| C05 | Real watch threshold | Actual playback below 95% does not grant watch; further legitimate coverage permits progression | October 3 PASS:94.81% unmet, later 97.18% visible met | Future positive window only if changed; no seeded interval/percentage substituted for real playback. |
| C06 | Seek/forged percentage | Seeking to end and browser-forged coverage cannot establish threshold | October 3 PASS within SQL/browser limits | Synthetic request/player only in approved positive window; no production probe. |
| C07 | Explicit completion and history | Worksheet rules enforced; completed answers immutable; owner notes editable; prior legitimate completion preserved | October 3 PASS | Retest changed rules only with positive authority; never erase durable completion by inference. |
| C08 | Trusted duration missing, no/partial evidence | New advancement/completion denied | October 3 eight-case rollback regression PASS | No rerun absent change; if assigned, isolated synthetic fixtures and rollback, exact gate authority. |
| C09 | Stale historical threshold with current trust removed | No NEW progression/completion from old cached threshold | October 3 PASS | Preserve legitimate historical completion; no destructive history rewrite. |
| C10 | Trusted duration restored | Legitimate current evidence resumes progression | October 3 PASS | Only approved isolated fixture, never populate production durations in a test. |
| C11 | Wrong video or NULL/blank/invalid provenance | No advancement without current trusted identity/provenance; watched identity immutable | October 3 PASS within documented fixture/constraint limits | Never bypass permanent constraints to persist invalid positive-duration rows. New material video uses new asset identity. |
| C12 | Protected resource and owner export | Entitled synthetic private PDF delivered; paths/keys excluded; own export explicit | October 3 PASS via independent authenticated630-byte synthetic PDF request; browser download interception stalled | Future reads still require verified binding/Auth scope. Synthetic fixtures are not production recovery bytes. |
| C13 | Lessons 11–13 | Media Coming Soon; no fake completion or next-lesson unlock, worksheet/notes/resources preserved under policy | Approved pending state, prior UI/source tests | Preserve status; no invented video assignment. Positive note/resource tests need the corresponding authority. |
| C14 | Closure and maintenance denials | paused=true, readiness/278-v1 intact; representative writes denied503; exact security/catalog preserved | Prior October 3 PASS; fresh coordinator state remains closed280 | Mandatory independent final check after any authorized future window. Keep closed on uncertainty. |

## Smallest optional browser lost-ack test, not executed

Only if the owner selects this remaining gap after binding attestation:

1. Name a synthetic learner and one unfinished synthetic lesson; record expected cloud
   revision and existing content privately. Use a disposable, account-isolated context
   with production egress denied and a separate unaffected maintenance-restoration path.
2. Obtain a new bounded isolated maintenance OFF/test/ON authorization, with strict
   timeout and an operator able to restore closure independently. Do not disconnect
   the entire Mac/network, alter DNS or jeopardize the direct restoration path.
3. Use a documented browser/request-level fault to drop only the response of one
   otherwise ordinary save after the server accepted it. If that fault cannot be
   applied safely with available tools, stop and retain UNVERIFIED status.
4. Verify the UI does not falsely claim Saved without an accepted acknowledgement,
   retains the draft and retries the identical original request/expected revision.
   Independent synthetic read must show one revision advance and exact intended body,
   not duplicate completion or overwrite of newer work.
5. Restore the request path, confirm acknowledgement/cloud restoration, then immediately
   restore maintenance ON. Verify280/paused=true/schemaReady=true/278-v1, service-note
   table/column privileges0, retained synthetic data and session cleanup.

A failure means retain maintenance, preserve evidence and report the smallest defect.
It is not permission to patch shared code, alter schema, reopen production or merge PR #4.
A simulated in-process transport case is useful unit evidence but cannot close this
specific browser lost-ack acceptance gap.
