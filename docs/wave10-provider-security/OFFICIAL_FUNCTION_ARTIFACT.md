# Official function ZIP and runtime provenance

November 1, 2026. Read-only dependency/docs investigation by `/root/wave10_provider_security`; no install, package mutation, API upload or application implementation.

The root project does not resolve `@netlify/zip-it-and-ship-it`, `@netlify/serverless-functions-api`, `@netlify/functions` or `netlify-cli` through its local dependency tree. Existing npx cache **does** contain usable official tooling:

- `/Users/davesmacbookpro/.npm/_npx/90d26507e643fcc0/node_modules/@netlify/zip-it-and-ship-it`, version **16.3.0**, main `dist/main.js`, Node >=22.12.0.
- Its sibling `@netlify/serverless-functions-api`, version **2.24.0**.
- Other retained CLI caches also contain these versions. No cache was modified or pruned.

Node24 satisfies these engines. The artifact builder should accept the explicitly reviewed absolute tool path, verify package identity/version/hash as part of its tool provenance, and call the official `zipFunction` or `zipFunctions` API. Do not invoke npx implicitly, install packages, use whichever global CLI happens to resolve, or silently use the older retained14.1.13 bundler.

Read local `dist/zip.d.ts`: `zipFunction(relativeSrcPath,destFolder,{archiveFormat,basePath,config,featureFlags,repositoryRoot,...})` returns function archive metadata. `zipFunctions(input,destFolder,{...,manifest,parallelLimit,...})` can write its official manifest. Use exact inspected types, no guessed option spelling. The output metadata includes buildData/runtimeAPIVersion, bootstrapVersion, routes, invocation mode and runtime. Include those in an independent artifact review.

## A plain default-export ZIP is insufficient

The current [official source](https://github.com/netlify/build/blob/main/packages/zip-it-and-ship-it/src/runtimes/node/utils/zip.ts) requires an entry point for runtime API2, includes the official bootstrap and emits metadata. The [entry-point source](https://github.com/netlify/build/blob/main/packages/zip-it-and-ship-it/src/runtimes/node/utils/entry_file.ts) constructs `___netlify-entry-point.mjs` with the official bootstrap's `getLambdaHandler` around the user module. Local16.3.0 code independently agrees. `___netlify-bootstrap.mjs` comes from the reviewed official serverless-functions-api dependency; `___netlify-metadata.json` records bootstrap identity. A ZIP of only a compiled default-export module has not met this runtime contract.

Modern [Functions API](https://docs.netlify.com/build/functions/api/) receives Request/Context and returns Response. That authoring interface does not imply an arbitrary uploaded ZIP runs without its provider adapter. Do not create a bespoke Lambda adapter that manufactures trusted site/deploy/context from request headers. Run the official artifact's exported handler under synthetic platform conditions for local compatibility where supported, without confusing that with a hosted invocation or independently verified provider identity.

Keep source-tree commit, compiled user handler SHA256, official ZIP SHA256, per-entry ZIP hashes, static SHA1/SHA256 and provider reported digests separate. Verify the exact archive entry set and reject extra functions/transports or a hand-written replacement bootstrap. No hosted acceptance follows from a correct local archive alone.

This finding was sent to the coordinator before implementation freeze; this reviewer did not implement the builder or adapter.
