# Original 15 regression failures — disposition

Source investigated: b57946a. Original evidence: /private/tmp/lockliel-281-binding-regression.log (2,869 tests, 15 failures, 11 skips). This investigation performs no SQL replay, live input or provider action.

## Twelve missing-build failures

For every row below: actual result was ENOENT for the listed generated export; expected result is successful artifact read followed by the existing security/content/style assertions. Reproducible when `out` is absent (the reviewed invocation ran `test:unit` without its build prerequisite). These are test-environment prerequisite failures, not adapter regressions or demonstrated application security defects. The smallest correction is the authoritative application build followed by the same unchanged tests. Do not skip tests or manufacture export fixtures. Coordinator completed a clean-environment build and owns final full-suite results.

| Exact file | Exact original failing test | Missing artifact |
|---|---|---|
| tests/auth-form-static-safety.test.mjs | sign-in static form cannot submit credentials through a native GET | out/my-lockliel/sign-in.html |
| tests/auth-form-static-safety.test.mjs | sign-up static form cannot submit credentials through a native GET | out/my-lockliel/sign-up.html |
| tests/faith-boost-resource.test.mjs | export contains the opt-in page and cover, not an ungated PDF or book-page directory | out/who-god-says-you-are.html |
| tests/founders50.test.mjs | Founders 50 form fields match the Netlify detection form | out/founders-50.html |
| tests/founders50.test.mjs | Founders 50 assets and local links resolve in the static export | out/founders-50.html |
| tests/founders50.test.mjs | Homepage and Faith Boost invite visitors into the recruitment page | out/index.html |
| tests/founders50.test.mjs | The thank-you state confirms interest and explains the review | out/founders-50/thank-you.html |
| tests/getting-a-grip-invitation.test.mjs | tests/getting-a-grip-invitation.test.mjs (module-level failure before individual tests register) | out/getting-a-grip.html |
| tests/preview-isolation.test.mjs | actual export keeps form fields but cannot register production forms in a preview build | out/index.html |
| tests/rendered-html.test.mjs | Next export contains the Lockliel homepage and resolvable build assets | out/index.html |
| tests/rendered-html.test.mjs | member and public entrypoints are statically exported | out/my-lockliel/sign-in.html |
| tests/ui-components.test.mjs | production export retains responsive and reduced-motion styles | out directory |

The module-level Getting a Grip failure means final test totals can increase when its individual tests register; do not compare totals as if only pass/fail counters change.

## One stale policy assertion

`tests/my-lockliel-platform.test.mjs`: **My Five limit and system-owned fields are enforced in the database**.

Actual current API contains owner-scoped optimistic revision handling and no five-person reactivation cap; expected regex was `/Pause or complete one before reactivating another/`. Reproducible source mismatch. `git show b57946a^:netlify/functions/lockliel-connections.mjs` confirms the obsolete phrase is already absent and revision handling present before the adapters. This is a preexisting stale assertion against owner-approved expansion policy, not a newly introduced functional defect.

Correction separates historical 280 behavior from current API behavior. Every historical migration assertion remains intact: column grants, denial of linked-profile updates, advisory lock, active_count>=5 and historical error text. The current API assertion now rejects the obsolete cap and positively checks owner assignment/filter, updated_at conditional mutation, missing-version denial and response owner validation. Existing client error-feedback assertion remains. No production code or protected migration changed.

Focused regression: **228/228 PASS**, zero skips, across platform, migration-preservation and canonical session tests. This includes all 280 baseline byte comparisons and revoked/ambiguous/unavailable/expired/refreshed-session denial tests. It does not claim fresh SQL or hosted session proof.

## Two restricted-PTY failures

| Exact file/test | Actual restricted-run result | Expected | Classification/correction |
|---|---|---|---|
| tests/member-hosted-manual-handoff.test.mjs — manual handoff preserves pinned safeguards and one shared durable allowance offline | child status 1; Python `HiddenInputTests.test_synthetic_hidden_tty_no_echo` receives EOF before hidden prompt | child status 0; all 50 synthetic Python tests pass | Reproduced under execution sandbox; unchanged test passes with normally approved local PTY execution outside sandbox |
| tests/member-hosted-recovery-launcher.test.mjs — source-pinned recovery launcher proves durable single attempt and private synthetic TTY | child status 1; Python `PinAndTTYTests.test_synthetic_hidden_tty_transfer_no_echo` reaches prompt deadline | child status 0; all 32 synthetic Python tests pass | Reproduced under execution sandbox; unchanged test passes with normally approved local PTY execution outside sandbox |

Both wrappers pass unchanged in one approved offline invocation (`node --import ./tests/support/network-guard.mjs --test` with these two files). Protected helper files and pins remain untouched. This establishes an execution-boundary dependency, not a credential-handling source defect. The reviewed Python suites use synthetic values, mocked driver/provider paths, forbidden-I/O guards and test-owned temporary attempt directories; no live launcher is invoked, no actual grant consumed and no real input requested. The hidden-input checks remain mandatory and are not converted to skips. No raw sensitive diagnostic was needed.

## Preservation and limits

Only one test source file is corrected, plus this report. No protected 321 files are changed. No schema, fixture, provider, Auth, deployment or production operation occurs. Final full regression and independent security results belong to the coordinator report; these focused results do not themselves establish release readiness.
