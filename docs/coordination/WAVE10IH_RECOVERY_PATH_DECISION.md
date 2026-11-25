# WAVE 10I-H RECOVERY PATH DECISION

November 2, 2026. **DEPLOYMENT AND LIVE RECOVERY REMAIN BLOCKED.**

Decision: prefer an owner-controlled hidden handoff of the **already privately available current isolated PostgreSQL password**, if the owner confirms availability. This creates no Management PAT and makes no parent-project API request. It is a conditional recommended architecture, not a completed or executed credential recovery. Password availability remains UNVERIFIED. If the owner does not already have it, no fully executable safe recovery path is established under the current evidence; obtain the nonsecret provider clarification described below, without a reset or scope expansion.

## Documented child-only operation

Supabase documents **GET /v1/branches/{branch_id_or_ref}**, accepting the branch project reference. Thus **GET /v1/branches/qjksggxorghaxvpyslip** is a supported child-addressed configuration request and does not inherently require a preceding branch-list request. Development Branches Read is a documented capability. This addressing guarantee is separate from unverified project-resource authorization for a particular scoped PAT. No private request was made. [Official configuration contract](https://supabase.com/docs/reference/api/v1-get-a-branch-config).

The documented response includes the ref, database host/port/user/status and secret credentials, including unrelated JWT material. It does not include branch name, branch ID, parent reference or is_default. Removing the parent's list call and _identity() would therefore remove the reviewed fresh branch-identity-before-secret gate. Checking a response after its secrets were fetched does not replace that gate. We did not make that change.

The documented nonsecret named branch lookup is still parent-addressed. A child project lookup exists but requires an extra Project Settings Read/project_admin_read permission and lacks the complete branch-linkage fields. Neither is a drop-in fix with only isolated Development Branches Read. [Branch lookup](https://supabase.com/docs/reference/api/v1-get-a-branch), [project lookup](https://supabase.com/docs/reference/api/v1-get-project).

## Comparison

| Path | Exposure and permissions | Complexity | Production isolation | Decision |
|---|---|---|---|---|
| Existing PAT + parent listing | Requires management credential; response co-returns password and JWT secret; isolated-only listing authority unverified | Existing private worker, but unresolved scope/format contract | Parent-addressed metadata route remains | Hold; do not widen permissions |
| Child-ref-only configuration | Same secret bundle; proposed isolated Development Branches Read; scoped resource authority not certified | Small routing deletion alone is insufficient; independent pre-secret identity mechanism still needed | No parent route for config itself | Supported operation, incomplete safe workflow |
| Owner-private existing isolated DB password | Only DB password enters reviewed memory-only input; no PAT or unrelated JWT material | Small separately reviewed wrapper plus exact one-attempt/source reconciliation | Fixed isolated direct DB host; no Management API calls | Preferred conditional next package |

A database password is privileged; calling its handoff private does not make it a read-only role. The unchanged fixed-SQL, same-connection READ ONLY/on/5s/30s guard remains mandatory. Owner account-password input, production-password substitution, fallback endpoints and retries remain forbidden.

## Smallest helper proposals

For a future child-config design, eliminate IDENTITY_PATH and remove its parent route from the private transport allowlist only **after** a supported child-only, metadata-only identity lookup or a separately approved replacement identity proof is established. Preserve exact project/host/port/user checks and unrelated-secret disposal. Do not invent an endpoint or fetch config before the identity gate. The provider must clarify whether child-only project_refs with branching_development_read authorizes the child config request, and which nonsecret child-only lookup establishes full branch linkage beforehand. No source change is proposed as safe to execute today without that contract.

For the preferred manual-input package, exact proposed file ownership is:

- Add scripts/member-hosted/manual_database_preflight.py: fixed isolated destination; hidden local TTY; no echo fallback; no PAT reader/request; reuse pinned guard and F's reviewed Python/log/native output containment and owned-buffer disposal. No password arguments, env, files, tool output or diagnostic strings.
- Narrowly update scripts/member-hosted/recovery_launcher.py and its exact bootstrap pins only for the reviewed manual source. Preserve runtime integrity, direct IPv6, official pinned CA, verify-full hostname/certificate validation, actual on/5s/30s in one connection/transaction, fixed read-only inspections, rollback/close, fail-closed results and immediate process termination.
- Add focused manual-wrapper/launcher tests for wrong-project confirmation, missing/echoed input, special characters, failed authentication, ineffective safeguards, output leakage, interruption, duplicate/restart/concurrent attempts and disposal. No application rebuild, new dependency or schema required.

This is a file-level proposal only. No adapter, launcher, source pin or grant was changed. The raw database_preflight.py CLI alone is not the proposed operator: it lacks the durable cross-process one-attempt enforcement and must not be supplied as an immediate workaround.

Fresh owner-only verification of exact qjks/course-cutover-rehearsal-274/direct-host selection must precede input. Label that as human confirmation, not an independent provider receipt. Changing the proof from programmatic branch metadata to owner attestation requires explicit review; it is not quietly equivalent evidence.

## Original authorization and grant

The original **isolated-only resource/action boundaries remain sufficient in principle** for one guarded check. No production access, parent-resource grant or Management credential is needed for the conditional manual path. That does not authorize a changed artifact automatically: the existing READY grant binds worker/source hashes, and a manual wrapper would have different hashes and proof handling.

After the local package is implemented and independently validated, the owner must approve its exact source and a controlled reconciliation of the same unused one-attempt authorization. Preserve the old grant evidence, prevent both old and new entry points from running concurrently, and do not create a second allowance, silently overwrite/rearm READY or reuse a spent diagnostic launcher. This assignment authorizes neither reconciliation nor execution. Current READY and the separate deployment reservation remain unchanged and unused.

## Exact remaining owner action

Answer availability only: **Do you already privately have the current PostgreSQL database password specifically for isolated qjksggxorghaxvpyslip?** Yes or no/unsure only. Do not look it up, retrieve it, enter it, paste it into ChatGPT, send a screenshot or reset it under this assignment. This question is distinct from the earlier PAT-availability question and from the Supabase account sign-in password.

If yes, the smallest next package is the offline manual-wrapper implementation/tests/review described above, followed by exact source/grant approval before any prompt. If no/unsure, keep recovery blocked and seek provider confirmation of a child-only identity/config path. No support message was sent.

Do not tell the owner that Connect can reveal a forgotten password. Official connection instructions show a password placeholder that the owner supplies; no existing-password readback guarantee was established. [Official connection instructions](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Independent review and offline checks

Actually dispatched independent reviewer /root/wave10ih_path_review conditionally approves the manual architecture and holds removal of the pre-secret identity gate. It independently reviewed official contracts and the pinned guard/worker proposal, with no edits, input or live requests. This is proposal review, not a certification of unimplemented code or real password validity.

Nine fresh offline contract/source checks passed against official OpenAPI SHA256 9ac6bd92b356d6de1fa551f1019075fd4e290e2552408e952eef986a412f0199. Fresh 46 recovery and 49 guard tests passed with synthetic data; no native database connection or real input. The existing full 1,855 JavaScript/TypeScript/lint/Netlify validation remains exact-source prior evidence, not a new full run. Application, worker, launcher and 280 migration bytes remain unchanged.

## Parallel lane continuation, separately verified

Actually dispatched /root/wave10ih_lane_continuity performed a bounded read-only contract/design/ownership audit and focused offline tests in parallel. It is actual continuation work, **not a claim that eight agents are coding**. No new feature implementation was dispatched in this assignment.

All L1-L8 worktrees are clean at their retained exact heads:

| Lane | Branch | HEAD |
|---|---|---|
| L1 Security | codex/lane1-account-integrity | 233f13edd42bc26ad8c89246ca523f327cc0e315 |
| L2 Course | codex/lane2-course-readiness | 3b9b610c26bde138122d716031e649e31cb5b392 |
| L3 Member/design | codex/lane3-member-design | e3a3dd00e8d3bbcf48e74a9e6a87666ebae95c48 |
| L4 Faith/Bible | codex/lane4-faith-contracts | f4c2a9f606beb4f7224a6da5d9c42724769d1432 |
| L5 Relationships/groups | codex/lane5-consent-followup | c933578e104c5b131d6866fc0669b7ca6f6c5af1 |
| L6 Content | codex/lane6-content-readiness | 72e4c530ccca0bb892e4794a11de0266e839f576 |
| L7 Commerce | codex/lane7-commerce-contracts | fcfd0f5ec077397a4dc40db5033ac6f1405cd809 |
| L8 Privacy/operations | codex/lane8-privacy-ops | 1c908a53065cf8b28d19d70a325948c41ca0febc |

Wave 3-9 integration checkpoints remain clean and preserved. Existing Auth/session, course, design/navigation, private-Faith/rights, consent/relationships, catalog, separate-merchant and purpose-scoped administration boundaries remain intact. Approved navy/blue/cream/Arial references and scoped module styles are retained; no competing theme or public-site redesign occurred. Actual zoom/spoken-reader/current-source motion and live rights/storage/sharing/finance gates remain open.

Fresh network-guarded Faith contract suite: 67 passed, 0 failed. A companion synthetic-context suite could not start because esbuild is unavailable in the current worktree; no contract assertion failed, no dependency was installed and no symlink was added. Future focused runs can use an approved existing toolchain without broadening feature scope. The inventory remains 37 rows: 2 live verified, 22 partial, 5 unreleased, 5 blocked, 2 proposed/decision pending, 1 approved not started. No new Live feature.

Independent safe continuations remain L1/L2 evidence/gate reconciliation, L3/L4 accessibility/privacy/rights review, L5/L6 consent/catalog compatibility, and L7/L8 merchant/purpose/retention contracts. Production activation is not part of those tasks.

## Preservation

No credential creation/retrieval/input/reset, live token, provider account request, PostgreSQL/production connection, settings/Auth/SMTP/maintenance change, migration, Netlify reservation/deploy, hosted Auth, GitHub branch/push/merge, account/role, financial, message or content action occurred. Local documentation/evidence only. Root prior dirty work remains73 collapsed status paths or 609 paths with all untracked files enumerated (603 untracked); those are two counts of the same retained work. All 280 migration sources, 37 feature rows, main/coursePR4, published sites and old source/grant evidence are preserved. Historical isolated 280/paused ON and production 274 are not fresh SQL observations.
