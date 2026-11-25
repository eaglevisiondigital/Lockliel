# Wave 10I-L verifier evidence matrix

This maps the unchanged `verifyProviderBinding` fields. It is a plan and local contract review, not live acceptance. Application327/uploader518/J remain separate identities. No field is set true merely because a fixture passed.

| Required field | Independent observation required | Current evidence |
| --- | --- | --- |
| local verifiedLocal, fixture=false, enabled, authEnabled, releaseEligible | Clean exact application327, approved builder, actual reserved ID and independently checked artifact manifest | Existing builder tests; no current reserved ID/package |
| provider source/site/id/context/draft/published/state | Scoped authenticated provider GET, exact account/site, deploy-preview, unpublished, ready | G is historical empty-deploy evidence only |
| files/functions/hashes and private configuration | Actual per-byte upload and same-ID configuration acknowledgments plus independent reader | Existing H fixtures, no live application ACK |
| routesVerified, routes, directFunctionBlocked, otherApiBlocked | Exactly GET member-read, POST login, POST logout; all direct-function and foreign API routes denied | Local source/tests only |
| sameOriginPostOnly | Correct same-origin POST accepted; GET/foreign origin/query credentials rejected | Local source/tests, future hosted observation |
| secureHttpOnlyHostOnlyCookies | Actual response attributes and absence of Domain | Local source/tests, future hosted observation |
| csrfDenied | Invalid origin/fetch metadata and malformed submission denied | Local source/tests, future hosted observation |
| redirectDenied | No arbitrary external redirect or token-bearing URL | Local source/tests, future hosted observation |
| expiryDenied | Expired synthetic session denied without exposing tokens | Local source/tests, future hosted observation |
| activeSessionDenied | Existing active-session RPC and caller context checked; revoked/inactive session denied | Native catalog proof plus future caller test |
| localLogoutVerified | Each newly created synthetic session locally logged out, other session unaffected | Future isolated acceptance, not SQL preflight |
| crossAccountIsolation | Separate A/B cookies and owner-bound REST/RPC reads, no cross-account data | Exact private A/B binding missing; future hosted acceptance |
| mfaUnavailableDenied | Existing runtime refuses unavailable required MFA rather than escalating | Future permitted negative observation |
| aal1PrivilegedDenied | AAL1 cannot access privileged route or manufacture a staff grant | Future permitted negative observation |
| aal2AuthorizedOnly | Exact source/three-route inventory, no privileged surface, direct/other route blocks, forged-role/AAL1 denial and no AAL-to-staff authority | Eight strict evidence fields default false; no positive manager inference |
| defaultOffDenied | Existing default-OFF composition denies absent opt-in | Local tests, retain exact-source evidence |
| foreignProjectDenied | Source/binding rejects production and siblings | Local negative tests, future isolated negative check only |
| missingKeyDenied | Protected function fails closed without approved key | Local tests; no key supplied now |
| noBrowserTokens | Actual cookies/HTML/JS responses contain no browser-accessible session token | Future protected browser/HTTP observation |
| maintenancePreserved | Actual read-only status remains paused=true/schemaReady=true/278-v1 | Local frozen fixture; live J is historical |
| authAcceptance source/identity/observedAt | Trusted isolated observer, exact source/site/deploy/project/manifest and actual acquisition time | Not implemented as a live observer in this package |
| database source/project/ledger/readiness | Source-pinned native worker on exact qjks direct IPv6, verify-full, on/5s/30s same transaction | Rich native inventory tested offline; no new managed connection |
| baseline versionsSha256, migration280StatementsArrayTextMd5, migration280SourceSha256 | Exact observed280 ledger entries versus sealed catalog/source | Local source seals and fixed-query tests; fresh hosted proof required |
| currentSessionCatalogVerified, requiredColumnGrantsVerified | Three exact RPC definitions/owners/ACL/search_path; eleven effective projection grants | Disposable SQL and offline tests pass |
| callerRestVerified | Actual authenticated caller-scoped A/B REST/RPC behavior after login | Explicitly false before hosted acceptance |
| rlsAll, notesServiceTablePrivileges=0, notesServiceColumnPrivileges=0 | RLS57/57 and actual table plus column ACL, separate from defaults | Disposable SQL fixture passes; no hosted freshness claim |
| keyProvenance | Protected owner/project attestation for qjks, no value recorded | Not supplied or verified now |
| provider/database/Auth freshness | Acquisition times within300,000ms, wall plus monotonic continuity, exact run/deploy/manifest, no replay |59 offline timeline/AAL tests plus independent attacks |

Positive verified AAL2 privileged acceptance and staff-role authorization are **NOT TESTED** and are not manufactured from the member-only scope. The documented legacy `aal2AuthorizedOnly` meaning can be satisfied by exact negative/non-escalation evidence; positive manager testing is not silently added as a prerequisite. A data-only matrix cannot supply provider authority.

## Timing budget and containment

One illustrative offline budget is native20s, provider15s, reserve10s, clean-source build50s, upload30s, polling10s, route/rate observations15s, clean rate window61s, A/B20s and final verification10s:241s. This is a bounded plan, not measured hosted throughput or a guarantee. Actual Node build timing from the ordinary validation is separate from the future exact-ID package build. Evidence registry fixtures exercise200s plus60s within the window and expiry past300s. All observations retain their original acquisition start, never the completion time as a replacement.

A fresh preflight must abort before reservation on missing provenance/authority/billing/key evidence. After a proven new-ID reservation, expiry, provider timeout, stale proof or acceptance failure must use the unchanged exact-ID containment path. Cleanup has separate call/time authority. Retain actual reserved ID independently even if evidence binding expires during build. Ambiguous reservation ownership never authorizes deletion of an assumed ID. Failure of independent provider404/list absence/immutable URL and route404 verification is a containment failure, not success. No automatic repeat or second reservation.
