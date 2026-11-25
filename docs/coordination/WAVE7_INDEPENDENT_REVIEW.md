# Wave 7 independent source and privacy review

November 1, 2026. Actual reviewer: `/root/wave7_backend_security_plan`. Read-only review of `codex/wave7-read-integration` at `/Users/davesmacbookpro/.codex/worktrees/lockliel-wave7-read-integration/Lockliel`. Coordinator final application SHA was not assigned when reviewed; exact eighteen final source/test hashes below are the review identity. The independent readiness plan remains separate commit7788e44775aaadf66933cbc56adec88cf3d2f429. Reviewer edits only this root report; no staging or commit of root work.

## Outcome and corrected findings

**No remaining actionable defect found within this bounded offline source review.** This is not certification of hosted Auth, RLS, real CAPTCHA, course runtime binding or production security.

Two offline accuracy findings were reported before tests and corrected by the contract owner:

1. `{person:null}` was interpreted as a verified empty My Five list although the actual existing GET returns404 for a missing person. The final adapter keeps unsupported/null detail unavailable, and its regression asserts no ready-empty fallback. It does not claim a complete collection API exists.
2. Malformed course progress rows were silently skipped, potentially presenting zero completed lessons. Final projection requires known status, valid owner-bound lesson identity, revision and no duplicate progress IDs. Invalid/foreign/unknown rows remain unavailable, while supported not_started/in_progress/completed rows project correctly.

The coordinator independently identified the unsafe breadth of local resource paths. Final adapter and presentation guard now share exact public destination allowlist `/faith-boost` and `/getting-a-grip`; admin/course/protected/arbitrary paths fail closed. The reviewer also noted a cross-lane test mock missing the newly required expiry field; root updated the mock contract before the independent run. These are local contract/test corrections, not evidence of a production exploit or runtime change.

## Source/security conclusions

- Existing backend response envelopes remain inside the offline seam, with allowlisted minimal DTOs to modules. Raw session email/phone/roles/inviter/leader joins, person notes/history and course notes/answers do not enter member/Share projections. Private unsupported Faith/photo/banner/preferences domains remain unavailable instead of fake persisted values.
- Fixture authority is issued and tracked in an adapter-local WeakMap; fabricated, cloned and foreign-adapter tokens are denied. Actor selection is explicitly a simulation. No browser identity/grant object is a real server authorization, no competing Auth implementation or connected transport exists.
- Epoch revocation, current capability expiry and post-await checks fail closed. Controller synchronously clears old state before load, aborts previous work, fences late responses by generation, cancels old timers and clears ready data at natural expiry. Reset/dispose and A/B/anonymous/expired/staff/unknown-permission cases are covered. The expiry callback is an offline simulation, not an assertion about provider session revocation.
- Profile null/failed preference envelopes remain unknown/unavailable; current raw production GET error ambiguity is not silently fixed or certified. Profile/course/catalog revisions are fixed offline snapshot markers, not trusted connected CAS versions. Future hosted adapters need reviewed server provenance/version semantics.
- A trusted existing BFF is responsible for ownership of API envelopes that lack owner fields, such as own person/preferences. The offline fixture supplier is not proof of server ownership or effective RLS. Staff AAL/role fixture alone grants no private domain access.
- All four workspace read paths use shared exact-shape presentation validation, reject null/malformed/getter-bearing DTOs before private rendering, and render controlled unavailable states. This guard is not authentication or universal hostile-object isolation. Throwing inspection cases fail closed; proxy traps are not claimed impossible.
- My Five recipient selection, communication preferences and historical follow-up flags remain distinct from accepted current resource-share consent. Sharing stays unavailable. Draft text remains local component memory, no share-link POST/referral/event/message or delivery result exists. Identity/boundary/generation remount clears component state; ordinary navigation intentionally retains current visit drafts.
- Existing synthetic member/Faith/Share/privacy paths remain separately reachable under original local gates. New offline-local exposure requires existing member gate and rejects hosting context. Default-OFF exposure is not Auth. Existing handler/schema/global design/configuration/dependency files are outside this implementation delta.
- No fetch/HTTP/DNS/Storage/persistence/event transport is added in reviewed new read-model/shell files. The reviewed subset ran with existing outbound guard and credential-bearing environment variables scrubbed. Source scan plus guarded tests is bounded evidence, not a complete browser request trace.

## Independent verification actually performed

Exactly one final focused run used `/opt/homebrew/opt/node@24/bin/node --import ./tests/support/network-guard.mjs --test` with the five test files listed below, existing temporary dependency link and scrubbed process environment.

**109 tests passed, zero failures, cancellations or skips.** Includes67 read-model/controller/presentation-validation tests,28 UI tests and14 cross-lane tests; these are subsets of the coordinator full suite and must not be added as unique tests. Log is private temporary `/private/tmp/lockliel-wave7-independent-focused.txt`; no credentials or real member values appear in it.

This reviewer did not run another full suite/build/SQL replay, browser acceptance, live API/provider call, login/challenge, email or production operation. Coordinator owns final build/type/lint/Netlify/full-suite/accessibility/browser verification and preservation manifests. Actual200%zoom and spoken screen reader are not certified by source/SSR review. Prior OS reduced-motion evidence is retained separately, not rerun here.

## Remaining hosted prerequisites

Current isolated alias/artifact/function/backend binding, safe qjks/site reuse, exact-source deployment and protected synthetic-session approval remain required before connected acceptance. New private Faith/photo schema/Storage/retention/export/delete and scoped consent policy remain proposals. Account origin, real CAPTCHA, independent PDF-byte recovery, operator/final-write PITR, duration/content and explicit production release gates remain unresolved. No new permission follows from this report.

No production/isolated data, Auth/CAPTCHA/SMTP/settings/maintenance/roles/content/Storage changes, migration, push/merge/deploy, email/SMS/payment/upload, infrastructure purchase or other-repository action occurred in this review.

## Exact reviewed files

| File | SHA-256 |
|---|---|
| `lib/member-read-model/contracts.ts` | `31aca9872c2a33bdbc567f2859906a57958070eedce04763605907288d383523` |
| `lib/member-read-model/offline-adapter.ts` | `8d343665695e5fc0a0430992d1284bc670040b58a86546d9d50baa108354bcb5` |
| `lib/member-read-model/controller.ts` | `1d60f2ecf21b352e4c6adbc3b0c9f6b2636b842b29f022fd43b58589191dc613` |
| `lib/member-read-model/validation.ts` | `531fa7f7e763ae81223ab3b83c54f37502fdf6ff3ecbcc152dcaf7a896db0c81` |
| `app/my-lockliel/review/page.tsx` | `42b334d64e5ed003fd71d96dad126a7f48364055ecd106c19f8dbb9e62a0e580` |
| `lib/member-review/review-policy.ts` | `1bd1c812e247d145bed23992f87846f38c5f9bc27f5774762c95497ecd0f2a6d` |
| `components/member-review/member-review-shell.tsx` | `63e3fdec1424a096ab512410d11d6fd5cff28f7d00073f01dbba99e850afd10e` |
| `components/member-review/member-review.module.css` | `b586c52a3977463ebeaa99a82beafd0f03700c4cf86d922cc9eeafec0e0aeeb8` |
| `components/member-review/offline-member-read-shell.tsx` | `d2c512486815d855606d0bd594db9f6a64fe58f34785aae77977ddd27e7f1631` |
| `components/member-experience-preview/member-experience-workspace.tsx` | `05891965b64e686c28035897071c56075c7182d93cee89d89a49fc3889b7a6de` |
| `components/faith-journey-preview/faith-journey-workspace.tsx` | `bddb957df42e6327b651173a5019ccae31e20d372aaf67aacadda01f6bf00694` |
| `components/share-review/share-review-workspace.tsx` | `89288f9773c6b8cf9eb8c6c56d843fc75b72da7fc5179cb2b31a449d0cd5aacc` |
| `components/owner-privacy-preview/owner-privacy-workspace.tsx` | `5d713261418cd7d00ab6cfebd8be74cfbe7584421cbe8bf946fb8d6c55f445e7` |
| `tests/member-read-model.test.mjs` | `b29758e04cc995e691445f6bae3b1f322e3c9d288db7af8ccab3046948109483` |
| `tests/member-read-model-controller.test.mjs` | `b35f7277f476e5e57b600e420241b204142345e322f21795585cbf64365e8c99` |
| `tests/member-read-model-validation.test.mjs` | `bc3d048389ba4cf9a73482475f5872a41618784acdedb9057d4be8fba37b262f` |
| `tests/wave7-member-ui.test.mjs` | `d3109a51fce833e93b87ba88b1eb4dc0f1b7daf15a8876f37aa5792a80c1cef8` |
| `tests/wave7-cross-lane.test.mjs` | `2d60b515e5c1b320ed5ee38d8f1d11afa66f9d093ceb54896382b948a337e597` |

Focused log SHA-256: `fff4a059d303e6e7213f17aa84da4c4d34d8b6f0312df489525e092d53629f2b`.
