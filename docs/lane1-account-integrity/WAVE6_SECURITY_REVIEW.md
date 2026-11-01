# Wave 6 security review and proposed account disposition contract

November 1, 2026. Assigned reviewer: `/root/security_course_wave6`.
Branch: `codex/lane1-account-integrity`.
Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane1-account-integrity/Lockliel`.
Starting clean checkpoint: `51706bdecc84fb681802ff34920b41766923d8f4`.

**Account origin remains UNDETERMINED. Real CAPTCHA acceptance remains NOT VERIFIED.**
This package prepares a concrete, synthetic-test-ready decision matrix. It does not implement or authorize an account operation, new production investigation or Auth configuration change.

## Evidence and source boundaries

Read the current root AGENTS instructions, Wave 5 coordinator result, owner-context follow-up, Wave 2 risk/remediation proposal, lane Wave 3/4/5 reports, [real-CAPTCHA procedure](REAL_CAPTCHA_ACCEPTANCE_PROCEDURE.md), and original browser diagnosis. Earlier documents remain unchanged.

The retained November 1 production observation was 181 Auth users/181 profiles and 28 total confirmed; the fixed October 7–22 cohort was 180 accounts with 27 confirmed, 153 unconfirmed and 27 recorded last sign-ins. These are different denominators and historical observations, not fresh Wave 6 counts. Retained paced signup/recovery timings and limited provider request samples support an automation-risk hypothesis. Log coverage, pagination gaps, absent event joins and lack of whole-cohort attribution prevent person-level conclusions. HTTP 200 does not prove a unique creation, delivered email or legitimate person; last sign-in is not first authentication. Lack of recorded course/staff activity does not establish absence of reads or other activity.

Dave reports **none known** for an approved campaign, import, signup/recovery test or external onboarding process. O01 is answered; O02 disposition/containment remains open. This owner answer does not prove malicious intent, compromise or that no external process existed. Editable tags, original inviter, latest campaign, mentor/group assignments, confirmation and access permissions remain separate facts. None confers leadership or resolves legitimacy.

Exact artifact distinctions:
- Production main retained baseline: `1599ab271e0120a5cdc4e38e225ba749dd214721`.
- Auth-only, schema-274-compatible candidate: `d71d079126f48e49f8d3df591373c0381b9f91e1`, not a deployed production correction.
- Accepted historical course source: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`, separate from standalone Auth.
- Wave 5 synthetic source: `af99a5211e9af55645fb0817d7976d3e0b1b6893`; documentation checkpoint `24a6159efb2daba4e8dddf2c075694ac599d9a83`. A synthetic flag/context or privacy panel is not session authentication, server authorization or a changed live preference.

## Signup protection review

Read-only Git object inspection confirms declared Netlify signup 15/60 seconds and recovery 8/60 seconds, aggregated by IP, in retained main1599ab2. The d71d079 candidate retains those declarations and login 30/60 seconds, and introduces proof forwarding for signup/login/recovery. Source declarations are not a fresh deployed enforcement test.

Provider controls and Netlify controls are distinct. Direct public Supabase Auth is outside Netlify function rate limits and any app-only proof gate. A frontend-disabled button cannot close that route. Distributed/paced traffic can remain below burst limits; shared network users can also be harmed by indiscriminate tightening. Do not treat rates or confirmation/leaked-password protection as CAPTCHA or attribution.

Current official [Supabase rate-limit documentation](https://supabase.com/docs/guides/auth/rate-limits) describes endpoint limits and proxy IP handling. A future implementation must verify trusted proxy provenance, supported key type and forwarding configuration before relying on end-user IP enforcement. Never trust arbitrary forwarded headers or put a secret key in the browser. No rate, header, key or provider setting changed here.

Current [Supabase CAPTCHA documentation](https://supabase.com/docs/guides/auth/auth-captcha) covers sign-in, signup and reset proof. Provider enforcement plus compatible clients remains the proposed containment direction, subject to real proof and rollback acceptance. App-only protection has a direct-provider bypass limitation. No option is activated by this review.

## Real Turnstile compatibility, precise remaining evidence

October 19 agent-controlled Chrome failed with code300030. Manual Chrome Incognito also failed; its numeric code is not visible in Dave's screenshot. Green automation/clock/privacy/server heuristics did not prove all required capabilities worked. No successful token or accepted positive provider proof was observed. Automation alone is not established as causal, and the exact internal failure stage remains unknown.

[Cloudflare's current error table](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/) groups 300* as generic challenge failure. That broad category does not identify Lockliel's local root cause or prove account abuse. Do not bypass, spoof, weaken, substitute public test keys or infer success from mock tests.

Smallest browser prerequisite remains a separately scoped owner-operated, password-free diagnostic in another supported browser on an unchanged network, reporting only pass/fail and code. No new challenge, key request/load, browser-setting or network change was performed here. A later positive Auth window still needs exact source/deploy/backend provenance, protected memory-only input, dedicated real widget and fresh explicit isolated callback/CAPTCHA/SMTP/synthetic-identity authority. Confirmation delivery, one-use recovery, actual session, A/B isolation, manager AAL1 denial/AAL2 success and external Sites v25 compatibility remain separate acceptance items. Historical course/MFA PASS does not close them. Restore exact isolated settings and maintenance ON after any future authorized window.

## Proposed account-disposition decision matrix

This is an implementation-ready **proposal for synthetic contracts/tests**, pending owner approval of the policy. It is not a classification of actual accounts. Default outcome is preserve unchanged. No row allows an automatic account action, message, grant or production write.

| Proposed review state | Minimum evidence criterion | Permitted proposal output | Forbidden inference |
|---|---|---|---|
| UNRESOLVED | Incomplete coverage, unattributed events, disputed/absent owner context or no independently corroborated purpose | Preserve unchanged; document the exact missing evidence and bounded question | Unknown means malicious; absence of enrollment means disposable |
| EXPLAINED_AUTHORIZED | Named authorized run/campaign owner plus independently scoped event/run evidence linking the reviewed set to its approved purpose | Record explanation with coverage and reviewer sign-off; keep unchanged | A user-editable source tag or owner recollection alone proves membership |
| RISK_REVIEW_REQUIRED | Corroborated observable pattern or protection failure with explicit coverage limits; no demonstrated compromise | Propose separately authorized investigation/containment, scope and rollback | Timing, confirmation, address pattern, IP grouping or risk score selects a person for restriction |
| SUSPECTED_ACCOUNT_COMPROMISE | Independent, case-specific evidence of unauthorized access or verified owner report through a trusted process | Escalate to named human incident owner; prepare minimum-impact response proposal | Aggregate cohort resemblance proves compromise |
| VERIFIED_OWNER_REQUEST | Authenticated, independently authorized account-owner request and precise scope, with request freshness and legal/retention review | Prepare reviewed export/deletion/correction plan; execution remains separate | Inbox possession, an unverified email, support text or UI selection alone authorizes deletion |
| APPROVED_SYNTHETIC_CLEANUP | Exact synthetic run fixture IDs, creation provenance, no unrelated ownership, dependency review and separately approved cleanup instruction | Prepare exact cleanup plan and postconditions | All unconfirmed/new/inactive accounts are fixtures |
| ACTION_PROPOSAL_REVIEWED | Named authorized human decision bound to exact evidence revision, affected set, purpose, minimal action, impact, preservation, recovery and expiry | Output non-executable proposal requiring separate execution authority | A review label, AAL2 alone or leadership tag authorizes execution |

Decision precedence: invalid identity/organization/purpose/revision/time or missing trusted reviewer authority denies even proposal review. Conflicting evidence returns UNRESOLVED and human review. A verified owner request follows its own scoped privacy workflow; it never blanket-authorizes cohort cleanup. Suspicion can escalate review without changing the account's legitimacy label. Fresh contradictory evidence invalidates an earlier explanation/proposal. No state transition resets passwords, revokes sessions, sends notice, changes roles, disables, deletes or merges accounts.

### Proposed synthetic data contract

Use strict, allowlisted records only: synthetic organization, pseudonymous synthetic case/subject IDs, evidence revision, canonical UTC window and observation time, evidence provenance references, coverage completeness/known gaps, independent corroboration status, owner-context status, reviewer authorization scope, requested purpose, policy version, review expiry and decision reason enum. Preserve contradictions explicitly. No emails/names/contact information, credentials, token-derived hashes, private assessment/prayer/notes, financial data or raw log bodies enter the contract.

Separate a case's **observation**, **hypothesis**, **human disposition** and **execution authorization**. Never encode these as one tag. A future server adapter must obtain reviewer scope and identity from a trusted session and current authorization store, not caller grants or user_metadata. Synthetic fixtures cannot serve as production authority.

Output allowlist: synthetic case ID, state/reason enum, evidence revision/coverage, pending decision category and an always-false effects object. Do not echo arbitrary rationale or source records. Proposed effects remain save=false, send=false, grant=false, execute=false. No account mutation endpoint is part of this package.

### Implementation acceptance examples, not tests run

| Synthetic case | Required proposal behavior |
|---|---|
| Tag-only, confirmed-only, last-sign-in-only, no-course-activity-only or fast recovery | UNRESOLVED; no action |
| Owner none-known with incomplete request coverage | UNRESOLVED or risk-review proposal with uncertainty; never proven abuse |
| Same IP/user-agent across multiple fixtures | No identity merge or automatic classification |
| Corroborated authorized synthetic run and exact fixture membership | EXPLAINED_AUTHORIZED; unchanged effects |
| Missing reviewer scope, caller role escalation, stale evidence or wrong organization | Denied/no projection |
| Conflicting evidence after reviewed proposal | Invalidate proposal; UNRESOLVED; no action |
| Trusted owner request for one synthetic subject | Scope only that request; no cohort or role authority |
| Proposed deletion without explicit execution authorization/recovery | Non-executable hold |
| Arbitrary private fields or forged provenance | Reject strict input; never echo private data |
| Risk threshold crossed, expired proposal or changed affected set | Human review/denial; no automatic enforcement |

No numerical risk score can substitute for these gates. Implementing this proposed synthetic contract is a distinct assignment; no new source module was added this wave.

## Owner decisions, checks and preservation

O02: name the human account-integrity reviewer and approve/amend disposition criteria, evidence access limits, retention and escalation. Separately choose whether to pursue provider-enforced containment, exact Auth-only source, client-compatibility owner and new isolated acceptance scope. No credential is needed to review these decisions.

Performed fresh local checks: exact clean lane branch/HEAD, retained source-object rate/proof inspection, current official docs, report links, whitespace, private-value patterns and one-path diff scope. The Supabase skill was applied. Its Markdown changelog fetch was unsupported; the [official HTML changelog](https://supabase.com/changelog) was read. No relevant new implementation or schema change was made. Prior 22 guarded Auth mock tests remain historical, not a new Wave 6 total. No unchanged suite or production query was repeated for a documentation-only policy proposal.

No production/isolated SQL or logs, account/identity/session lookup, credentials, Auth/CAPTCHA/SMTP/rate/configuration change, email/SMS, maintenance toggle, migration, deployment, push, merge, payment, staff grant, content activation, infrastructure purchase or other-project action occurred. No real member information appears here. Prior production274/isolated280/pausedON remain retained observations, not a fresh audit. All previous files and history are preserved. This report changes only its owned path and will have a separate local documentation commit.
