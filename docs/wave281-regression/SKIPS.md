# Wave 281 skipped-test disposition

Independent reviewer: regression_security. Source reviewed: b57946a. Original broader log: /private/tmp/lockliel-281-binding-regression.log (2,869 tests, 2,843 pass, 15 fail, 11 skip). All eleven have the exact reason `Explicit installed official toolchain not supplied.` The shared condition is the absence of `LOCKLIEL_MEMBER_PACKAGE_TOOLCHAIN_ROOT`.

These are **environment-dependent, intentionally gated local/offline tests**. None is established obsolete; none is inherently hosted-only. Their assertions were not removed or converted. They remain unverified in that invocation, not passes. A verified already-installed official toolchain can exercise them offline without credentials, providers or deployment. Supplying a fabricated package or bypassing toolchain integrity is not a correction.

| # | Exact test name | File | Requirement not exercised in original run |
|---|---|---|---|
| 1 | official v2 local package is read-only, closed by default and byte-manifested | tests/member-hosted-package.test.mjs:25 | Official bootstrap/package bytes, disabled read-only function, isolated routes and manifest hashes |
| 2 | official Auth package has exactly three native archives with independent byte verification | tests/member-hosted-package.test.mjs:48 | Exact read/login/logout archives, routes, rate metadata, artifact hashes and fixture/release distinction |
| 3 | offline complete lifecycle reserves exactly once and finalizes same ID, with deployment-only private config | tests/member-hosted-uploader.test.mjs | Mock lifecycle, one reservation/finalization/retirement and protected deployment-only configuration |
| 4 | known exact new-ID containment after artifact failure | tests/member-hosted-uploader.test.mjs | Exact-ID retirement after artifact rejection |
| 5 | known exact new-ID containment after finalize failure | tests/member-hosted-uploader.test.mjs | Exact-ID retirement after finalization rejection |
| 6 | known exact new-ID containment after missing-evidence failure | tests/member-hosted-uploader.test.mjs | Missing independent evidence stops acceptance and contains only new ID |
| 7 | known exact new-ID containment after cleanup failure | tests/member-hosted-uploader.test.mjs | Cleanup failure remains failure, never successful containment |
| 8 | frozen verified upload bytes survive later file mutation, and caller pin mutation cannot repoint upload | tests/member-hosted-uploader.test.mjs | Artifact and destination immutability after verification |
| 9 | a boolean or forged route object cannot bypass captured provider evidence before Auth | tests/member-hosted-uploader.test.mjs | Receipt authority cannot be substituted by caller claims |
| 10 | failure to enter protected cleanup mode is a containment failure, never unrelated deletion | tests/member-hosted-uploader.test.mjs | Failed cleanup authority denies deletion |
| 11 | provider-required unknown bytes are denied without any upload | tests/member-hosted-uploader.test.mjs | Provider-requested unknown artifact bytes denied |

The nine uploader tests share `optional` declared at line 116; four are generated from the artifact/finalize/missing-evidence/cleanup cases. All use synthetic package content, credentials and mocked provider transports. Their future passing results cannot establish actual hosted metadata, permissions, receipt authenticity, live session revocation, REST exposure or retirement.

## Independent focused execution

Independently ran the four-adapter test suites with the network guard: **82 tests, 82 passed, zero failures or skips**. This does not fill the eleven package/uploader requirements; the suites overlap neither the missing toolchain condition nor real hosted acceptance. Final broader disposition must use the coordinator's final exact-source result, not this initial log.

## Final independent disposition: all eleven executed and passed

The existing official toolchain was located through `docs/wave10-provider-security/OFFICIAL_FUNCTION_ARTIFACT.md`, not an implicit install or arbitrary executable search. Read-only package inspection confirmed `@netlify/zip-it-and-ship-it` 16.3.0 and `@netlify/serverless-functions-api` 2.24.0 at `/Users/davesmacbookpro/.npm/_npx/90d26507e643fcc0/node_modules`. Node was 24.20.0. The existing repository dependency directory supplied esbuild 0.28.0 through a test-worktree symlink; no dependencies were installed or modified. Initial package import failed because this new review worktree lacked node_modules; after supplying existing dependencies, the affected tests were rerun.

Independent command:

```sh
LOCKLIEL_MEMBER_PACKAGE_TOOLCHAIN_ROOT=/Users/davesmacbookpro/.npm/_npx/90d26507e643fcc0/node_modules node --import ./tests/support/network-guard.mjs --test tests/member-hosted-package.test.mjs tests/member-hosted-uploader.test.mjs
```

Result: **69 tests, 69 passed, zero failures/skips**. This includes all eleven formerly skipped tests; each is now **PASS in the local offline execution**, not obsolete or silently removed. No assertions or skip guards were changed. Output: `/private/tmp/lockliel-281-regression-independent-toolchain.log`. The suite's official native ZIP construction occurred only in synthetic temporary directories, removed by its existing finally cleanup. All lifecycle operations used mocks. These 69 overlap the authoritative broader suite and must not be added to its total.
