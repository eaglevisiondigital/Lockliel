# Local isolated member-read package builder

Wave 10, November 1, 2026. This builder performs only local file reads, compilation, official ZIP construction and private temporary-file writes. It has no installer, provider client, uploader, deploy command, credential input or Git mutation. Existing production and course packages are not reused or modified.

## API and explicit inputs

Import `buildMemberHostedPackage` from `scripts/member-hosted/package.mjs` and call:

```js
const {manifest, path} = await buildMemberHostedPackage({
  sourceRoot,      // exact repository worktree root
  buildRoot,       // separately validated ON static export
  outputRoot,      // new private temporary directory outside Git
  pin,             // validateHostedPin exact schema below
  toolchainRoot,   // explicitly supplied installed node_modules directory
  localFixture: false,
  enabled: false,
});
```

Both booleans default false. `enabled` must be the boolean true to produce an active read artifact. This is an artifact option, never deployment or Auth lifecycle authority. No build value, key or other configuration is inferred from ambient provider environment variables. A separate caller is responsible for obtaining reviewed source/build pins and separately authorized hosted operations.

The exact pin contains `version=lockliel-member-hosted-v1`, binding project `qjksggxorghaxvpyslip`, site `70b03a42-6329-476e-bf4b-2b1ce30e9567`, a 24-lowercase-hex deploy ID, a 40-lowercase-hex source SHA, immutable origin `https://<deploy>--jade-unicorn-642f40.netlify.app`, context `deploy-preview`, schema280, protocol278-v1 and paused=true. Wrong project/site/origin/schema/protocol/maintenance values are rejected before an output directory is created. These fields are prerequisites, not evidence that the current provider resource already matches them.

Normal release packaging requires clean source and HEAD equal to the exact pin source. Every compiled on-disk input is independently checked against its committed Git object. Explicit `localFixture:true` permits dirty/fake-pin local experiments, accurately records actual HEAD/tree/dirty state, and remains ineligible for hosted binding certification. The coordinator's independent verifier must preserve that distinction.

## Official runtime and dependency boundary

The only generated function imports `createHostedMemberRead` from the reviewed runtime and exports a default Request/Context handler plus `config={path:'/api/lockliel/member-read',method:'GET'}`. It reads the private publishable-key variable only through the runtime's `Netlify.env.get` reader after runtime gates. No actual key value is present in the source entry, build inputs or manifest.

A virtual backend-config replacement fixes the isolated project/origin and leaves the old backend key undefined. It does not edit the repository's original config. Tree shaking removes unused Auth functionality; the compiled artifact is rejected if it contains production project, actual key/JWT-like literals, Auth password/logout paths or service-role code. The runtime's standalone GET-only transport confines provider requests; no signup, login, logout, refresh, recovery, MFA, email, payment, SMS or member-write handler is packaged.

The installed official `@netlify/zip-it-and-ship-it`16.3.0 and `@netlify/serverless-functions-api`2.24.0 are required. No software is installed. Official `zipFunctions` uses `nodeBundler:'none'` because the reviewed function is already compiled. Optional instrumentation-loader insertion is disabled. No handwritten Lambda adapter is generated.

The official ZIP must contain exactly:

- `___netlify-entry-point.mjs`
- `___netlify-bootstrap.mjs`
- `___netlify-metadata.json`
- `lockliel-member-read.mjs`

Runtime API version must be2, bootstrap version2.24.0, and the sole route must be the exact member-read GET path. The archived user module must hash identically to the separately retained compiled MJS. The archived bootstrap must hash identically to the actual installed official bootstrap file. The builder removes only its own generated intermediate official manifest because that file contains machine-specific absolute paths; sanitized official runtime metadata is retained under `artifacts`.

## Static and routing surface

Only the validated `my-lockliel/review.html`, its optional route RSC files and literal-referenced local JS/CSS/font/image dependencies are copied. The export must contain the server-read marker and exact four public binding values, and contain no credential-bearing form. Other public pages, root forms, account pages, arbitrary assets, old edge files, old config and unrelated route chunks are not copied. Asset traversal, symlinks, forbidden environment literals and external executable/font dependencies are rejected.

`public/_headers` supplies no-store/CDN no-store, noindex, referrer/nosniff/frame protections and a restrictive CSP. Inline Next scripts are permitted only by their exact SHA256 CSP hashes. Connections remain same-origin, forms/frames/workers are disabled, and scripts cannot use inline attributes. These are static headers; the runtime separately supplies function-response headers.

Both `netlify.toml` and actual uploaded `public/_redirects` contain only the root-to-review redirect, review HTML rewrite and unknown API/direct-function404 rules. `_redirects` is essential when a later uploader uses only the public file digest map. [Netlify's request-chain documentation](https://docs.netlify.com/resources/troubleshooting/request-chain/) places custom-path functions before redirect processing; unmatched requests continue to redirects. The official custom path disables the direct-function alias. Actual hosted custom-route/GET/unknown-route/alias behavior remains a separate acceptance gate, not a result of these local tests.

## Exact manifests and byte domains

`member-hosted-manifest.json` records the exact pin, real Git HEAD/tree/dirty status, compiled-input hashes, localFixture/enabled markers, all package file names and SHA256/SHA1/size values, official function route/runtime metadata and installed toolchain versions/code hashes. It contains no absolute machine paths or credentials. The manifest itself is excluded from its inventory and must be independently sealed by SHA256 before review.

Keep distinct:

- Git source-tree identity and individual source bytes.
- Compiled `artifacts/lockliel-member-read.mjs` bytes.
- Official ZIP archive bytes and individual bootstrap/entry/user-module bytes.
- Uploaded `public` static bytes, including routing/header files.
- Provider-reported digest byte domains, which are not assumed identical without evidence.

A matching URL or self-reported JSON response is not attestation. The separate verifier requires an independently approved manifest digest and authenticated provider/database/key-provenance evidence. No provider attestation or actual hosted Auth/read acceptance is produced by this builder.

## Validation and limitations

Twelve focused package tests passed with zero skips using the explicitly supplied installed toolchain. They cover safe paths, exact static dependency selection, OFF/mismatched builds, forms/key/production literals, external executables, traversal/symlinks, tampered dependencies, security headers, confined routing, wrong project/site/pins, dirty/mismatched release source and a real official-v2 local ZIP with every file hash recomputed. Without the explicit nonsecret `LOCKLIEL_MEMBER_PACKAGE_TOOLCHAIN_ROOT` test variable, only the official-toolchain integration test is skipped rather than installing software or discovering unrelated tooling. Scoped ESLint passes with zero warnings.

The actual coordinator-provided hosted-mode export was also successfully packaged as a clearly marked local fixture with synthetic source/deploy pins and no key. It is browser-harness material, not an approved hosted artifact. Full regression, browser behavior, current-source accessibility, final clean-source build and provider reconciliation are reported by the coordinator.

Auth lifecycle is excluded following the recorded automatic approval-review rejection of credential-entry controls. Do not work around that hold by activating old sign-in pages, creating cookies, opening a synthetic hosted session or packaging Auth handlers. A later owner authorization must name the exact new source/artifact/target/deployment and the synthetic existing-session or Auth lifecycle acceptance required.

No migration files, database, maintenance, settings, accounts, production, course source/PR4, published site, role, content, messages, payments or infrastructure were changed by this lane. No stage, commit, push, merge or deploy was performed.
