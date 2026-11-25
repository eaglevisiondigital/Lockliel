# WAVE 10I-D ISOLATED DATABASE CREDENTIAL RECOVERY REVIEW

November 2, 2026. **READ-ONLY REVIEW COMPLETE. RECOVERY/RESET/RETRY NOT EXECUTED. DEPLOYMENT HELD.**

Smallest next owner action: authorize a narrowly reviewed, protected read of the existing qjks branch database credential, followed by ONE separately bounded direct read-only authentication/safeguard check. Try non-mutating credential recovery before considering a password reset. No current password was retrieved or tested in this assignment.

## Verified branch identity and limits

Read-only branch metadata maps course-cutover-rehearsal-274 to qjksggxorghaxvpyslip, parent bsndfhbemstyrrglajat, is_default=false, persistent=false, status FUNCTIONS_DEPLOYED and preview_project_status ACTIVE_HEALTHY. Its branch ID is7091bfd6-83ce-4c11-ac30-8ce85e09be2d. Only nonsecret metadata fields were retained. One isolated get_project lookup returned an error/no usable record; the parent-scoped branch listing independently returned the exact isolated relationship. This management lookup inconsistency remains a limitation, not evidence the database is deleted.

The parent listing was used only to identify its isolated child. No production database connection or production credentials/settings inspection. ACTIVE_HEALTHY is provider metadata, not proof of application maintenance, the migration ledger, password validity or on/5s/30s. Last verified280/maintenanceON remains historical; no SQL was executed to refresh it.

## 1. Separate password from the production parent

The branch has its own database instance and its own PostgreSQL login credential scope. The branch-config schema exposes a branch-specific db_pass. It is not the Supabase account sign-in password, an ordinary synthetic user's password or a publishable API key. Do not assume the parent's database password is correct for the child. No secret-value comparison was made, so actual equality, reuse or historical rotation is unknown. [Separate branch environments](https://supabase.com/docs/guides/deployment/branching), [branch config schema](https://supabase.com/docs/reference/api/v1-get-a-branch-config).

## 2. Can the current credential be verified privately?

The official Management API documents GET /v1/branches/{branch_id_or_ref}, accepting the isolated ref or branch ID, with a db_pass field. Thus the provider supports a protected branch-credential recovery path; it would be inaccurate to claim all branch database passwords are unrecoverable. The same response also includes jwt_secret, so a generic tool/CLI dump is inappropriate for this workflow. That secret-bearing endpoint and CLI branches get were NOT called. [Official branch configuration API](https://supabase.com/docs/reference/api/v1-get-a-branch-config).

A separately approved private reader would have to keep the response and selected credential out of ChatGPT, terminal output, logs, argv, environment/history, files/Git/evidence and screenshots; ignore/discard unrelated secret fields and return sanitized metadata only. This is a proposed protection requirement, not an implemented recovery helper. The provider-configured db_pass alone does not prove what the live postgres role currently accepts. Fresh direct verify-full authentication and actual same-connection on/5s/30s checks are still required, under new bounded diagnostic authority. No retrieval, comparison or authentication was attempted here.

## 3. Is a branch-only password reset supported?

The current official API exposes PATCH /v1/projects/{ref}/database/password with a password body, database:write scope and database_config_write permission. The branch is itself a distinct project ref, so any proposed password change must target qjksggxorghaxvpyslip, never the parent ref. The dashboard's documented password-reset control is Database > Settings after selecting the intended branch. [Project-scoped password update](https://supabase.com/docs/reference/api/v1-update-database-password), [dashboard password reset](https://supabase.com/kb/troubleshooting/how-do-i-reset-my-supabase-database-password-oTs5sB).

This establishes the supported project-scoped operation. Actual account permission, current branch dashboard control availability and successful execution were NOT tested. If the branch-specific control or exact identity cannot be established, stop for provider/owner clarification. No write call, reset or new password was prepared.

## 4. Production and other-environment impact

Under the documented branch-isolation model, a correctly scoped change to the child database credential does not change the parent's or sibling databases' passwords/schema/data. Scope must be verified immediately before any future write. Existing clients connecting to this SAME qjks database can be affected even if they belong to a different test workstream or hosting site. Their old database credential may no longer authenticate. Service reconnection/propagation/availability is not proven by this review. [Branch isolation](https://supabase.com/docs/guides/deployment/branching/working-with-branches).

A password reset is distinct from Reset branch, database reset, restore, recreate, rebase or merge. Those broader operations are not a credential-recovery shortcut and are prohibited here. A branch reset can discard data and replay migrations. Preserve all280 migrations and maintenanceON; do not touch production or other acceptance environments.

## 5. Tools, connections and automation affected

| Consumer reviewed | Effect of a separately approved branch password change |
|---|---|
| Reviewed direct diagnostic helper5cc6af4/c426f5b4 | Reads password through hidden input per invocation; no stored credential or source edit. Future prompt would need the current branch password and fresh one-attempt authority. Spent launchers stay spent. |
| scripts/course-release/runner.mjs | Caller supplies psql environment/private credential context; any future qjks invocation must use the current branch credential. No embedded password in its DSN. Historical release/migration commands are not authorized now. |
| Disposable local rehearsal fixture | Local generated PostgreSQL password belongs to a disposable fixture, not the hosted branch; no branch-secret update required. No fixture was run. |
| Repository GitHub workflow | No secrets references, qjks project reference or Supabase deployment/migration command found in the tracked preview-check workflow. No hosted DB secret update is established from this source. |
| External SQL clients, CI secrets, password managers or operator sessions | Could hold old qjks credentials; not inspected. No claim of a complete external dependency inventory. Update only confirmed branch consumers through protected mechanisms if a reset is later approved. |
| Netlify member package/transport | Uses isolated HTTPS API binding and deployment-specific publishable-key configuration, not a PostgreSQL password. No database password should be provisioned into its application/functions. |

Local source inspection only. No password manager, keychain, pgpass/credential file, environment values or provider secret store was read. Existing public client configuration source was inspected; no key values are copied into this report/evidence. No PostgreSQL password, private secret or access token was retrieved. [Source-based dependency inventory](evidence/2026-11-02-wave10id/dependency-review.json).

## 6. Protected deployment plan

The immutable application327ba098 and reviewed uploader/receipt51857e4 do not embed the database password. Their isolated HTTPS publishable-key binding is separate from the database operator's direct-auth credential. A branch database password recovery or scoped reset therefore does not by itself require application redesign, a new Supabase target, API-key rotation, Auth user-password/MFA changes, a deployment or a changed reservation allowance. This is a source-based dependency conclusion, not a live provider health test. [Supabase HTTPS versus PostgreSQL connection models](https://supabase.com/docs/guides/database/connecting-to-postgres).

Any future credential change invalidates older direct database-auth evidence. Re-establish actual on/5s/30s, identity,280 ledger/fingerprints, maintenanceON/readiness, RLS/private-note/function/provenance checks and all original protected operator/provider/billing/source/key/acceptance/containment gates. No deployment may start solely because a recovered or new password authenticates. Rehearsal remains closed. No API key provisioning or hosted Auth operations are part of this review.

## Exact next owner action, proposal only

Approve a protected recovery package for the existing credential of qjksggxorghaxvpyslip only: separately review the private branch-config reader and its handling of co-returned secrets, permit one non-mutating read with no raw response/secret output or persistence, then ONE fresh reviewed direct IPv6/verify-full guarded read-only check. Stop after its sanitized result. Do not reset, retry automatically, change maintenance, deploy, reserve, merge or migrate. An owner-private provider-supported recovery surface is also acceptable if it does not expose values to Codex or screenshots.

If protected recovery is unavailable or the provider-configured credential proves stale, return for separate authorization of a password-only reset on the exact child project. Do not infer reset permission from this review and do not use a production credential. This preserves a smaller first action than rotation while leaving a documented scoped fallback.

## Preservation and evidence

No credentials retrieved/verified/rotated/reset, no spent launcher retried, no PostgreSQL connection or SQL, production connection, mutation/settings/Auth/SMTP/PITR/compute/maintenance change, migration, reservation/deploy, key provision, hosted Auth, account/role/payment/message/content action, purchase, push or merge. Only nonsecret management metadata and official public docs were read; local documentation/evidence updated. No source/test/dependency change, new agent or unnecessary test/build/replay. All280 migration hashes, all other tracked bytes, other user refs and original dirty checkout were preserved before continuity edits. PR4/main/published websites and reservation allowance preserved by no action, not a fresh remote audit. All37 feature statuses and12 registers remain unchanged in product/release status, none newly Live.

[Isolated metadata](evidence/2026-11-02-wave10id/isolated-branch-metadata.json), [dependency inventory](evidence/2026-11-02-wave10id/dependency-review.json), [authoritative references](evidence/2026-11-02-wave10id/authoritative-sources.json), [preservation](evidence/2026-11-02-wave10id/preservation.json), [checksums](evidence/2026-11-02-wave10id/SHA256SUMS). Runtime source remains5cc6af45c9c8323b13f6d71ee0881e6b823ddfa3; helper SHA256 c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba.
