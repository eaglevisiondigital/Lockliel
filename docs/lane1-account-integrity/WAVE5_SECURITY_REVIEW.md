# Wave 5 security review: retained evidence and acceptance gates

Date: 2026-11-01. Actual reviewer: `/root/security_wave4`. Branch: `codex/lane1-account-integrity`. Starting checkpoint: `3141ae054fc9989798fd40cf43a235a7c286ccf4`.

Scope is existing evidence and procedure review only. No live account query, provider log extraction, real CAPTCHA/browser challenge, credential input, Auth/session/email acceptance or settings change was performed. This document supplements the retained real-CAPTCHA procedure and Wave 4 security review; it does not authorize execution or repeat completed course acceptance.

## Exact source separation

| Artifact | Exact source/checkpoint | Meaning and limit |
|---|---|---|
| Production main baseline | `1599ab271e0120a5cdc4e38e225ba749dd214721` | Retained baseline; not freshly verified deployed state in Wave 5. |
| Standalone Auth candidate | `d71d079126f48e49f8d3df591373c0381b9f91e1` | Direct child of that main baseline, separate schema-274-compatible Auth correction candidate. Real-proof and client acceptance remain incomplete; not a deployed production correction. |
| Course release source | `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098` | Separate schema-280/course candidate with historical course/manager acceptance. It is not a substitute for the standalone Auth candidate. |
| Wave 3 member integration | `649a3f5d5acf5702427b908c5600da290b747ee1` | Synthetic-only member/Faith composition. No live Auth or persistence adapter. |
| Wave 4 combined contracts | `f43cc3ac24beee3050a3382d82ee696a2523cfef` | Synthetic L5–L8 contracts, distinct from deployed authorization. |
| Wave 5 integration starting checkpoint | `46d003673bf6ef4d877c0731ac47cf678dbed494` | Documentation checkpoint on the combined review history, observed as the new share-integration worktree's initial HEAD. The coordinator must identify the final exact Wave 5 source after implementation; this review does not certify uncommitted or future panel behavior. |

The planned default-OFF, mock-backed ShareReview panel cannot close a production Auth gate. A build flag is not authentication. Caller-provided synthetic organization, identity, consent, grants, session markers and AAL are test inputs, not trusted claims. No panel or contract test may imply real session validation, CAPTCHA protection, live entitlement, authorized delivery or actual administrative authority. Review its actual final source separately for private-data projections, stale consent/confirmation, organization/identity/revision changes and outbound effects.

## Historical account evidence, not a current account audit

- The prior November 1 bounded observation recorded 181 Auth users/181 profiles, 28 total confirmed and an October 7–22 cohort of 180. Wave 3's fixed cohort had 27 confirmed, 153 unconfirmed and 27 recorded last sign-ins. The total/cohort denominators differ; neither number is a new Wave 5 count.
- Retained recovery timing and paced signup/recovery requests support an automation risk hypothesis, with incomplete coverage. Equal request/creation counts are correlation, not an event join; HTTP 200 is not proof of a unique account, successful session or delivered email. A last sign-in is not necessarily the first authenticated session.
- Owner answer remains **none known** for an approved campaign, import, signup/recovery test or onboarding process explaining the October 7–22 growth. O01 owner context is answered. O02 disposition/containment is still open. Owner knowledge is not proof that no external process existed.
- Actor, intent, purpose, legitimacy, abuse and compromise remain UNDETERMINED. Editable source tags, campaign/referral metadata, confirmation and timing cannot settle attribution or leadership permission. Do not select accounts for deletion, disablement, password reset, merge or session revocation from these aggregates.
- Prior zero cohort enrollments/progress/staff findings do not prove that no reads or other activity occurred. The production ledger 274, isolated ledger 280 and maintenance ON are retained observations, not fresh Wave 5 database checks.

Future investigation requires a specific question and bounded UTC window, minimum aggregate fields, pagination/coverage accounting and explicit authority. Do not retrieve member names, emails, addresses, private notes, credentials, raw token-bearing messages or broad logs simply because tools expose access. Account remediation remains a separate owner-reviewed proposal and execution decision.

## Browser failure and real proof

The October 19 retained diagnostic records agent-controlled Chrome failure with console error **300030**. Dave separately reported failure in manually operated Chrome Incognito and supplied a screenshot showing failure. The screenshot does not expose an Incognito numeric code. Both showed green automation/clock/privacy/server heuristics; these are limited diagnostic heuristics, not proof that all network resources or browser capabilities worked.

Automation alone is not established as the cause. A disposable tab was not a clean cookie jar, and the manual and automated environments were not fully matched. No successful token or positive provider verification was observed. The exact internal failure between initialization, rendering, computation and token generation remains unverified. Do not turn this observation into a Lockliel code diagnosis, silently weaken protections, spoof clients, request keys again or treat test-key success as real acceptance.

The smallest proposed diagnostic remains owner-operated use of the same password-free public diagnostic in a second supported browser on the unchanged network, reporting only pass/fail and error code. This is a recommendation for a separately scoped task, not a browser action performed or requested during this review. No report identifiers, cookies, tokens, device fingerprints or network addresses belong in the result.

## Still-required preconditions for a new Auth window

1. Establish exact reviewed Auth source to immutable deployed artifact to current alias/function provenance to intended isolated backend. Ready metadata, static parity, CSP or a 401 denial is insufficient. The course lane's unresolved binding gate remains separate. No implicit candidate replacement or deployment.
2. Obtain fresh authorized isolated identity/readiness/security checks and keep course maintenance ON. Schema 280 hosted acceptance cannot alone prove a schema-274 Auth correction deployable. No migration replay or course write belongs in this window.
3. Resolve the browser prerequisite, then secure a fresh explicit bounded isolated Auth/CAPTCHA/callback/SMTP/synthetic-identity acceptance authorization. Old windows and retired helpers remain consumed. Existing approved inbox/sender context is retained; verify its applicability to the new window without publishing the inbox address or credentials.
4. Capture exact private configuration baseline and rollback before mutation. Prove missing/invalid/expired/replayed proof denial and actual fresh valid proof through the intended provider for signup/login/recovery. Public test keys, injected responses and proof-shaped strings cannot replace this evidence.
5. Separate signup request, account creation, actual confirmation delivery, one-use confirmation, callback identity and session. Separate recovery receipt, delivery, one-use completion and subsequent authentication. Verify A/B boundaries, refresh/logout/re-login, current roles and manager AAL1 denial/AAL2 success without a broader role. Resetting a synthetic factor/password requires its own explicit scope.
6. Preserve Netlify and Sites v25 compatibility as separately evidenced clients. Do not modify Sites or production to make an isolated test pass. Review direct provider paths independently; app-only forwarding does not by itself certify provider-enforced protection.
7. Use a newly validated protected memory-only input mechanism; no chat, plaintext file/environment, CLI argument, history, log, screenshot or credential-derived evidence. Restore and independently verify the exact isolated baseline, clear only test-owned sessions/secrets/processes, and confirm unchanged ledger/readiness and maintenance ON. An unverified restoration blocks a PASS.

## Review validation and preservation

Read current root engineering instructions, Wave 3/4 coordinator reports, owner-context follow-up, Wave 2 risk assessment, lane Wave 3/4 results, the real-CAPTCHA procedure and the original browser diagnosis. Fresh local Git checks confirmed lane identity and exact retained source objects. Document checks cover exact source separation, dated counts, manual-failure uncertainty, no proof substitution, no execution authority and no em dashes.

The **22 Auth/form mock tests passed under an outbound network guard in Wave 4**. No Auth source changed for this document, so that test evidence is retained and not counted as a new Wave 5 run or added to integration totals. No build, broad unit suite, database fixture/replay or completed hosted acceptance was unnecessarily repeated.

Only this review document changed. No production/isolated SQL, logs or API were queried. No browser/challenge, keys, password/helper, session, email, Auth/CAPTCHA/SMTP/settings/account/role/data/schema/content action, maintenance change, migration, push, merge or deployment occurred. No real member PII was processed or included. Existing infrastructure and all prior work remain preserved.

**Assessment:** account origin remains unresolved; real-CAPTCHA compatibility and positive Auth acceptance remain NOT VERIFIED. Synthetic ShareReview progress is independent and may continue within its authorized boundaries. Next smallest security actions are owner review of browser compatibility and trusted exact Auth deployment/binding evidence, followed only after those pass by a separately authorized bounded real-proof window. Production containment and course release gates stay closed.
