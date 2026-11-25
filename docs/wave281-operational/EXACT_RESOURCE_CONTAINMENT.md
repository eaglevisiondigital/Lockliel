# Exact-resource containment: separate outcomes, no live executor

## Deployment retirement

Reuse the unchanged reviewed scripts/member-hosted/provider-receipts.mjs and existing exact-ID uploader/containment path. Do not add an alternate provider or guess a deploy ID. The historical course/site/deployment baseline must be complete and captured by the protected authenticated provider reader before reservation. Bind one actually reserved ID to site70b03a42-6329-476e-bf4b-2b1ce30e9567, source and deploy-preview context; independently re-read its ownership before an exact-ID cancellation/deletion. Stop on foreign/historical/ambiguous identity; contain only the independently identified new deployment. No alias repoint or site deletion.

Retirement succeeds only when independent site-scoped and global deployment reads return404, immutable surface GET/POST probes return404 without redirect, and published site/aliases/historical deployment inventory remain identical. A401/403/network error is not inaccessibility proof. Cleanup is not prevented merely because the historical baseline aged; fresh retirement observations are still required. Existing adapter tests exercise these cases with mocks only.

The adapter's current route inventory is the original three-route application. A future MyFive acceptance surface must get separately reviewed expanded route/function retirement probes before hosting. Do not claim the unchanged adapter checks unapproved additional routes. No remote request occurs in this assignment.

## Database record cleanup

New lib/acceptance-281/record-containment.mjs reconciles offline synthetic snapshots independently of deployment state. It has NO SQL, transport, credential loader or destructive executor. hostedRecordCleanup always denies execution. Inputs are explicitly synthetic, not authoritative provider receipts; caller JSON can never authorize hosted cleanup.

Required projections: exact isolated project/run, two distinct synthetic owners, complete independent before/after row inventory of id/owner/run/content-digest, settled exact creation ledger, and timestamps. No names, contacts, notes, session material or tokens. Baseline historical rows must be preserved byte-for-byte by digest; each new row must belong to the approved run+owner and exact settled creation set. Duplicates, unknown IDs, mixed runs/owners, missing/extra rows, incomplete evidence, untracked mutations and unresolved creation acknowledgments deny. At most70created IDs; the write lane owns per-owner/operation limits. No name-prefix or timestamp-range deletion. Capture scope must include all potentially affected records, not merely the rows the caller wants deleted.

prepareSyntheticRecordContainment returns immutable review IDs and a one-use local verification handle. It never returns execution permission. verifySyntheticRecordContainment requires a fresh complete post-cleanup projection equal to the original baseline, consumes its handle even on failed verification, and does not assert deployment retirement. An aged historical baseline is allowed for containment but fresh current observations are required. This in-memory handle is NOT a durable execution allowance; restart is not permission to retry.

Future database deletion must use a separately reviewed native operator/database control with independent real identity/run provenance, table allowlist, actual session and exact ownership checks, durable attempt ledger, transaction-bound row locking/version hashes and approved cleanup authority. Existing canonical MyFive APIs contain no delete endpoint; no route is fabricated here. A data-changing outcome with lost acknowledgment stops further writes; independent run-ledger reconciliation must establish all created IDs, including any commit whose acknowledgment was lost, before cleanup. No second create/delete attempt is inferred from a transport failure.

Never delete Auth accounts, course fixtures, historical relationships or unrelated data. Cleanup of relationships is not password/session revocation or deletion of a deployment. Proposed database guard remains uninstalled and must independently protect directREST/canonical bypass. Course maintenance does not supply that protection.

## Combined disposition

Track deploymentRetired and recordsReconciled separately. Final containment is complete only when BOTH applicable independent checks pass. Failure in either remains a containment failure even if the other succeeds. Preserve sanitized evidence, stop mutations, request only the exact corrective authority. Never broaden cleanup to make a report pass.
