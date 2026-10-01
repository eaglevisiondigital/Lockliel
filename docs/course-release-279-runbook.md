# Five-stage course release package

The active package is `supabase/verification/course-release-279/manifest.json`.
It supersedes the 278 package without modifying its historical migration files.
Source commit: a2254aaa3890e2aff7c51b9c84c45021a7b7ba20. Original274 manifest and
each275–279 hash are pinned. Pinned CLI2.118.0 SHA256 remains
8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4.

No production execution is authorized. Hosted rehearsal is currently blocked by
automatic approval review of the first proposed276 command. Nothing ran. Retained
qjksggxorghaxvpyslip is275/maintenance ON. See the correction report and request
explicit confirmation before advancing that retained branch. Do not replay275.

## Exact staged order and safeguards

Required order: **275 → 276 → 277 → 278 → 279**. Never insert279 ahead of276–278.
`scripts/course-release/prepare.mjs` verifies all279 source hashes against Git and
the manifest, then creates five sealed prefix directories. Only one repository
migration may be pending at each stage. No seed, role, Vault or alias substitution.

The runner verifies the exact prior ledger prefix, closed maintenance, direct
verify-full TLS and actual read-only preflight settings (lock5s, statement30s).
Pinned CLI discovery must name exactly the next file with empty seeds/roles.
Execution happens once, followed by a fresh read-only ledger/catalog/postcondition
check. Reconnect failures or ambiguous catalog state stop immediately. No automatic
retry, rollback, reopen, production transport selection or account fixture follows.

For the retained branch, independently verify already-applied275 before276. The
read-only classification is INTERMEDIATE_VERIFIED_CLOSED_PENDING279, not final
security clearance. A reviewed operator must bind the exact branch, current
assignment, protected credentials and expected catalog to each stage invocation.
The generic authorized boolean is not permission by itself.

## ACL expectations and final security gate

New notes-table expectations derive from captured postgres/public default ACLs,
then migration275's explicit authenticated SELECT and anon revocation. PostgreSQL
per-schema defaults are additive to owner privileges. Unknown global defaults or
extra default grants abort. Only the reviewed hosted Dxtm, disposable arwdDxt, or
no-service default profiles are understood. This is exact derivation, not ignoring
ACLs or substituting observed post-migration privileges for an expectation.

Stages275–278 may retain only these known intermediate service privilege profiles
and only while maintenance is closed. All other private-data permission checks
remain enforced. Stage279 must have **zero service_role table or column privileges**
on notes. PUBLIC/anon cannot access notes; authenticated has SELECT only. Grading
keys remain postgres-only. The independent semantic check catches excessive
privileges even if a reference catalog also contains them.

Migration279 changes only the notes table ACL, revoking SELECT, INSERT, UPDATE,
DELETE, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN from service_role. Exact table,
column, index, policy, trigger, function and other grant fingerprints must otherwise
remain unchanged. All prior ledger entries remain intact.

## Maintenance and application compatibility

Keep maintenance ON throughout all five schema stages, artifact deployment and
verification. The old1599ab2 application has a schema274 upsert403 and memory-only
drafts. Confirm copied drafts and closure of all old tabs before a future release.
No compatibility bridge or grant expansion is authorized by this package.

The revised `maintenance-install.sql` requires ledger279, expected final function
fingerprints and absence of service-role note privileges before schemaReady can
be true. The client compatibility protocol remains278-v1 because279 changes ACLs,
not request semantics. Count278 can no longer reopen this revised gate.

The retained branch's existing operational status function still targets278.
Do not reinstall the full maintenance script over an existing hook/schema. A
separately reviewed isolated operational update of that function will be needed
before candidate acceptance/reopening at279. Preserve the existing hook binding,
ACLs and paused flag. That update was not executed in this package.

`maintenance-reopen.sql` remains a non-executable operator template. A successful
schema correction is not permission to deploy a candidate or reopen. Full fresh-
client acceptance, trusted production durations, recovery/Owner MFA, provider and
production direct-network checks remain separate gates. Keep both isolated sites
and branches until cleanup is explicitly authorized.

## Disposable validation

Full SQL: `npm run test:sql`, PostgreSQL17, socket-only disposable cluster. Focused
before/after: `npm run test:sql -- --review-279`; exact ordered275–278 plus actual279
inside rolled-back fixtures under both defaults. Tests first demonstrate the old
TRUNCATE grant, then require denial after279, including when revocation is repeated
with grants already absent. That disposable repeat is not permission to replay any
applied hosted migration.

Pinned CLI rehearsal uses `scripts/course-release/rehearse.mjs` under sterile
credentials and OS outbound denial, with localhost TLS as the only TCP allowance:

```sh
/usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network-outbound)(allow network-outbound (remote ip "localhost:*") (subpath "/private/tmp") (subpath "/private/var/folders"))' \
  /usr/bin/env -i PATH='/opt/homebrew/opt/postgresql@17/bin:/opt/homebrew/bin:/usr/bin:/bin' \
  TMPDIR=/private/tmp LOCKLIEL_SUPABASE_BIN='<verified absolute binary path>' \
  node scripts/course-release/rehearse.mjs
```

The new279 canonical reference is generated in a disposable clone using the exact
pinned CLI and checked for only the intended ACL delta before use. Existing stage
catalogs are preserved against the same source. Five-stage execution, per-stage
failure, timeout, wrong TLS CA/hostname, disconnect, post-commit connection loss,
ambiguous catalogs, maintenance/drain and publication-concurrency checks pass.
Evidence: `docs/evidence/course-release-review-2026-10-01/rehearsal-279.json`.
Disposable results never establish hosted application cutover success.
