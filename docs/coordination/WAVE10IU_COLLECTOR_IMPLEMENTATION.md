# Wave 10I-U local private collector implementation

Local implementation only. **PRIVATE COLLECTOR STILL BLOCKED.** No authenticated provider operation, credential input, attempt consumption, installation or hosted operation was performed. This document does not grant authority to enter a token.

## Concrete code delivered

Seven new files under `scripts/provider-evidence-collector/` implement fixed transport, source verification, a durable consumption primitive and the ordered private pipeline. No existing fixture/deployment operator file was edited. The existing 238-field filter, seven-hook checklist and protected input implementation are reused unchanged.

`collector.mjs` orchestrates independently loaded opaque authority, exact isolated scope and five-minute proof verification, durable consumption before hidden input, a second same-proof/monotonic freshness check, an entered-credential binding gate, one fixed request and final owned-buffer disposal. The public function accepts no enabling flags, callbacks, identity claims or URLs.

`authority.mjs` intentionally has no capability mint. `loadInstalledAuthority()` stops before any input, marker or network. The separately named entered-credential binding adapter also explicitly remains unavailable. Possession of a token, an operator label, token prefix, locally asserted permissions or a digest cannot establish its exact isolated-only authority. Even if a future adapter establishes an operator's permission, it must privately establish that the entered credential is the authorized credential without revealing or logging a token-derived fingerprint. That missing provider/custody proof has not been fabricated.

`transport.mjs` uses native HTTPS only, fixed host `api.supabase.com`, fixed port 443 and fixed GET `/v1/projects/qjksggxorghaxvpyslip/config/auth`. TLS certificate/hostname verification, SNI, minimum TLS 1.2 and a private nonpersistent agent are fixed. There are no URL arguments, proxy fallback, redirects, retries, alternate destinations, pagination or body uploads. An inaccessible single-use authority capability is required before credential inspection/request. The reviewed code enforces a 15-second total deadline and 65,536-byte response cap before concatenation, strict UTF-8, status 200, JSON content type, identity encoding, nonduplicate relevant headers, exact content length and complete response. Error bodies and exception messages are never returned. Abort/close/error/timeout all fail with fixed classifications.

Raw body bytes remain within the private transport and go directly to the unchanged `projectPrivateAuthConfigJson`. Only the seven hook states and fixed request/transport metadata leave it. Unknown/missing/extra fields, future hooks, invalid types and duplicate JSON keys fail. The filter still does not manufacture provider identity, operator authority, parent linkage, Auth version or creation permission. A successful TLS-bound fixed-path request could establish its transport destination only after the absent authority prerequisites are resolved.

Owned input and response buffers are overwritten. Immutable JavaScript and native HTTP-header copies cannot be guaranteed physically zeroized. The isolated process must exit after one result; `launcher.mjs` exits after writing the sanitized receipt. Neither results nor raw response material is written to a credential file. The prototype's actual blocked execution requested no credentials.

## Durable attempt boundary

`attempt.mjs` receives only an opaque authority handle. It cannot mint, reset or delete a grant. A future independently sealed installation must supply its owner-private root and independently anchored nonsecret grant hash. The primitive verifies root owner/mode/symlink and descriptor identity, reads the no-follow read-only grant file and its expected hash, exclusively creates `CONSUMED`, fsyncs the marker and parent, and stores only a fixed nonsecret observation. A partial marker or duplicate process restart fails closed. Any failed consumption is conservatively reported as UNVERIFIED_OR_SPENT with attemptConsumed=null, never as a reusable allowance. Caller-supplied root/hash assertions are not authority.

This is not an installed live grant. No new real allowance was created. Local filesystem enforcement does not defeat an owner deliberately deleting or replacing its state; an independent external grant anchor and controlled installation remain necessary. J remains consumed and the application reservation remains unused.

## Source verification

`readiness.command` is a fixed offline readiness entry. Before executing Node it verifies the exact launcher, source manifest and installed Node binary hashes, rejects launcher/manifest symlinks and runs with a cleared environment. The launcher rejects arguments and injected Node options, verifies the exact nine-file allowlist, source hashes, ownership, no group/other writes and no symlinks before importing the collector. It reports local source integrity only, never provider authenticity.

The reviewed command itself must be verified against its committed source before any future installation. Hash checks are integrity evidence, not an authority source, and cannot defend against a malicious owner simultaneously replacing all trusted source and verification commands.

Current local pins:

- Source manifest: `198578421c5eb2895d8395c3cb963b3f62cee37b9e97d24f2a0d7d2ac226f12c`
- Node launcher: `b3db74a7014c81e09c6952f327fdb49ccfa51bb7a68962a6d98d30a5e9b235b3`
- Readiness command: `8668e165a961adb61149c92ab5fb00cc359ffc542341ac892ccff05981b95be8`
- Node binary: `c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd`
- Runtime: `/opt/homebrew/Cellar/node@24/24.20.0/bin/node`
- Preserved filter baseline: `4560d7b87c6815cf48888bf4976c13aa61cd2fa4`

Actual source-pinned readiness returned `sourceVerified=true`, `AUTHORITY_UNAVAILABLE`, `inputRequested=false`, `requestAttempted=false`, `attemptConsumed=false`. This was a local no-network check, not an authenticated provider attempt.

## Offline validation

59 synthetic cases passed against the actual transport/pipeline source loaded into isolated VM modules. Only native HTTPS/authority/input dependencies are replaced inside the test VM; no production test switch, injectable callback or fixture-to-live capability exists. The default repository test wrapper runs the same 59-case suite in a separate process with the existing outbound-network guard enabled. Its outer test counts as one repository test, not 59 additional top-level tests.

Coverage includes fixed TLS/request options, all redirect variants, provider rejection and secret-bearing errors, unauthorized TLS/wrong host, malformed content/UTF-8/header/length, response limits, interruption, deadlines/clock reversal, response projection, missing/future hooks, exact operator/project/scope evidence, entered-credential binding unavailable, durable restart/partial-marker rejection, no duplicate request, consumed-before-input ordering and disposal. Independent review is recorded separately; this report does not substitute self-review for it.

Initial defects found during review were corrected locally: disposing a passed buffer even on denied authority, anchoring launcher bytes before execution, rejecting duplicate/content-length ambiguity, handling immediate response errors, preserving the explicit missing entered-credential binding gate, and checking monotonic elapsed time against wall-clock freshness. No live read was used to find or validate these corrections.

## Remaining supported action

No launch or token-entry instruction is executable. The smallest supported alternative is an owner-controlled private provider verification of the existing credential's exact isolated scope, operator role and identity, followed by a separately reviewed custody/credential-binding mechanism if the provider can support it. A nonsecret Dashboard observation may establish narrower facts but must not be relabeled as an independently authenticated API receipt or proof of the actual entered token. If those facts cannot be established without broader permissions or credential exposure, the automated collector remains blocked.

This operation alone cannot establish branch-parent linkage, Auth service binary version, native trigger/bootstrap effects or different fixture-admin-key provenance. Account creation remains disabled. No production, Supabase, Netlify, database, migration, maintenance, Git push/merge, payment, messaging or content action occurred in this lane.
