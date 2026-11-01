# W3 synthetic preview acceptance

Date: November 1, 2026.
Base/current committed HEAD: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.
Branch: `codex/lane3-member-design`.
All application changes are local and uncommitted pending coordinator review.

## Focused local checks actually run

| Check | Result | Scope |
| --- | --- | --- |
| Focused Node tests | 12 passed, 0 failed, 0 skipped | Private defaults, independent visibility, owner/connection projection, sensitive-field omission, public/invalid audience denial, synthetic fixture guard, banner allowlist, non-disclosing hidden-versus-absent banner copy, truthful signup states, degraded-state distinction and no transport/upload/persistence capability. |
| Strict TypeScript | Passed | Only the owned components/contracts and temporary CSS module declaration. No full Next type-generation claim. |
| Actual React bundle | Built successfully | esbuild browser bundle of the actual component graph, React and ReactDOM; existing local brand asset served separately. |
| Targeted ESLint | Passed, 0 errors and 0 warnings | Only owned source/tests, using --max-warnings 0. The existing local image has a narrowly documented exception because no Next route/loader is used. |
| Production/network isolation | Local controls established | Tests/type/lint run under OS network denial. Local preview server permits localhost only and uses restrictive CSP. Browser requests must still be independently checked by coordinator. |

No full repository lint cleanup, full Next production build, full course/SQL suite,
production account access or hosted Auth/Storage/member acceptance was run.

## Coordinator browser review

The coordinator reviewed the corrected actual-React bundle on November 1, 2026.
The subagent did not operate a browser. Results reported by the coordinator:

| Check | Observed result |
| --- | --- |
| Responsive layout | At 1365, 768 and 390 CSS pixel widths, scrollWidth equaled clientWidth. Scoped desktop/mobile visual review passed. |
| Private initial choices | All optional fields started private. An approved-connection preview hid photo, location and banner. |
| Explicit field visibility | Selecting location and banner sharing showed only those selected fields. A public visitor received no member card. |
| Hidden versus absent banner | Corrected non-owner copy was rechecked: both states say that no Faith Banner is shared in this preview, without revealing whether a private banner exists. |
| Reset and refresh | Reset restored private choices; refresh reset all preview choices and state. No saved-state claim was made. |
| Degraded next-step states | Unavailable retried to ready locally. Loading, empty and access-denied states remained distinct. |
| Signup truthfulness | Email-confirmed presentation explicitly required sign-in and conferred no staff role. |
| Keyboard | Tab moved focus to a select. Activating the skip link with Enter focused MAIN, id prototype-main. |
| Observed resource origins | DOM resource origins were limited to 127.0.0.1:4318. No console warnings or errors were returned. This is scoped browser evidence, not an exhaustive network capture. |

The coordinator saved synthetic screenshots in the root checkout at
`/Users/davesmacbookpro/Documents/ChatGPT/Lockliel/docs/coordination/evidence/2026-11-01-next-phase/`:
`member-preview.png`, `member-desktop.png`, `member-mobile.png` and
`member-mobile-preview.png`. Those coordinator-owned files were not copied or
modified by this lane.

Full screen-reader acceptance, automated contrast measurement and actual 200%
browser zoom were not verified. Reduced-motion CSS is implemented but no runtime
reduced-motion acceptance is claimed. Do not call these open checks passed.

The temporary review URL was `http://127.0.0.1:4318/member-experience`. After
coordinator review, only this lane's exact static server, temporary harness and
dependency symlink were retired. Product files and the worktree remain intact.

## Preservation

No shared CSS, token, primitive, navigation, layout, Auth, API, migration,
package/lockfile, workflow, Netlify or hosting manifest edits. No push, merge,
deployment, production query or setting/data mutation. No live member values,
credentials, protected resource files or external network destinations were used.
No photo upload, persistence, real email, new account, session or access grant.
The existing local mark and recorded source baseline remain intact.

## Open review gates

- Full screen-reader, measured contrast, actual 200% browser zoom/reflow and runtime reduced-motion acceptance remain unverified.
- Dave's intended recoverable visual reference for any integrated change.
- Photo/audience/content/privacy policy and approved server-side DTOs before live integration.
- A separately scoped integration/release assignment. No integration is automatic.
