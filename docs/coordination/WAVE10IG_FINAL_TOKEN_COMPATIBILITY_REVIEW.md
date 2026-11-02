# Wave 10I-G final token compatibility review

November 2, 2026. **ISOLATED-ONLY RECOVERY REMAINS BLOCKED.**

No current token scope is certified to authorize the entire existing recovery flow. The proposed least-privilege scope remains project qjksggxorghaxvpyslip only, Development Branches Read, every other capability off. It is not promoted from proposal to verified authorization by matching permission names.

## 1. Token format: exact verified support and its limit

The unchanged worker9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2 checks the same grammar at hidden input and private request construction: sbp_ followed by exactly40 lowercase hexadecimal characters. Total length44, prefix case-sensitive, ASCII0-9/a-f only after sbp_. Whitespace, uppercase, added delimiters, NUL, non-ASCII and wrong lengths deny.

Fresh official [Supabase CLI source](https://github.com/supabase/cli/blob/03392adf120076480cf012b9e4d6f27a3ae3cfee/apps/cli/src/auth/access-token.ts#L6), commit03392adf120076480cf012b9e4d6f27a3ae3cfee, accepts that plain family plus separately prefixed OAuth/versioned families. The worker intentionally does not accept those other families; no unreviewed expansion is made.

Official [scoped-token documentation](https://supabase.com/docs/guides/platform/personal-access-tokens) specifies sbp_fc as the scoped prefix. It is compatible with the current plain grammar if followed by38 lowercase hex characters, giving44 total. This observation closes the earlier prefix-only ambiguity. It does not establish a complete issuer contract: the current official Studio CreateScopedAccessTokenResponse_Output public type declares token:string, with no complete length/alphabet restriction. The publicly inspected CLI consumer validator is stronger evidence than guessing, but it is not the private issuer implementation or proof every currently issued scoped token uses exactly that subset.

**Conclusion:** exact plain-PAT/scoped-prefix-compatible support is verified; support for every current issued scoped-token representation is **not fully confirmed**. No live token is needed or requested to obtain an authoritative format contract from Supabase. Do not generate a token as a format experiment, silently widen the parser, or claim all scoped tokens fail based only on the prefix.

## 2. Synthetic offline proof

691 cases passed with live sockets/DNS/native driver use blocked and hidden input supplied by a fake local TTY only:

- 608 valid scoped-prefix-shaped cases exercise every lowercase hex character at every one of the38 remaining positions.
- 64 wrong-length cases deny.
- 17 invalid-character cases deny.
- 2 other CLI token families accept in the official CLI comparison and intentionally deny in the worker.

The actual worker authorization method and both compiled input/request regexes agree for all cases. Returned synthetic buffers are wiped; captured stdout/stderr are empty. No sample token values are serialized into results. This is syntax proof, not signature, expiry, issuer, permission or resource validation. The full earlier32/46/49 offline regression result remains unchanged exact-source evidence; it was not called a new run here. Independent agent /root/wave10ig_security corroborated the official parser comparison and all12 indexed public-source hashes.

## 3. Branch permission versus resource authorization

Both [branch listing](https://supabase.com/docs/reference/api/v1-list-all-branches) and [branch configuration](https://supabase.com/docs/reference/api/v1-get-a-branch-config) declare Development Branches Read or Production Branches Read. For this scope only the former is proposed. Public OpenAPI at CLI03392adf confirms the same OR permission requirement. It does not provide an inheritance, list-filtering or parent/child resource authorization guarantee.

| Existing request | Public evidence | Isolated-only result |
|---|---|---|
| GET /v1/projects/bsndfhbemstyrrglajat/branches | Parent-project path; development-read permission listed | Not established that a qjks-only grant can call it or receives only the authorized child |
| GET /v1/branches/qjksggxorghaxvpyslip | Branch-ref path; development-read permission listed | Capability documented; exact resource authorization for this token shape not independently certified |

The Studio implementation confirms the selector stores explicit project_refs, and its branch listing uses the parent-addressed route. The token creation UI/client and generated API types are not the server authorization implementation. No authenticated request or existing account token metadata was inspected. There is therefore no observed200,403 or live resource test to report.

**Conclusion:** qjks-only Development Branches Read is the proposed minimum permission/resource pair, but is **not verified for the complete helper**. Parent access being required is also **not proven**. Do not infer authorization from the permission table, and do not broaden to production, organization-wide, Production Branches Read or Legacy credentials to resolve the uncertainty.

## 4. Narrow alternatives if the parent route requires broader access

Preferred design proposal: replace the parent listing with a provider-supported metadata-only lookup keyed solely by the exact isolated ref/branch ID. It must freshly establish branch name/id/ref/parent/nondefault identity before the secret config response is fetched, and remain authorized only for qjks. No such supported child-only metadata endpoint was verified in this review. Obtain provider confirmation before writing or inventing one.

The documented named lookup, GET /v1/projects/{parent}/branches/{name}, reduces the returned set but remains parent addressed. It is **not** an established isolated-scope fix. Likewise, fetching the secret config first and checking its ref afterward would weaken the existing identity-before-secret gate, so it is not proposed as a bypass.

A distinct fallback is a separately reviewed owner-only handoff of an already privately verified **isolated** PostgreSQL password into the existing hidden direct diagnostic, bypassing Management PAT recovery entirely. This is conditional on safe credential availability and exact branch verification; it is not permission to retrieve one now, reset a password, reuse a spent launcher or consume the current recovery grant. Prior failed password attempts are not a reason to retry automatically. It is a different controlled package, not an implemented alternative.

## 5. Exact nonsecret provider clarification request, draft only

No message was sent. Ask Supabase through an owner-authorized support channel:

1. What is the complete current scoped PAT wire grammar: prefix/version markers, exact or bounded length, character set and case? Please provide a format specification, not a real token.
2. For project-only scope project_refs=[qjksggxorghaxvpyslip] and permission branching_development_read, is GET /v1/projects/bsndfhbemstyrrglajat/branches authorized, and is its result guaranteed to exclude all other projects/branches?
3. Is GET /v1/branches/qjksggxorghaxvpyslip authorized by that isolated project scope itself, without any production-parent resource grant?
4. If the listing needs parent access, which supported metadata-only endpoint can verify the exact child branch identity using only the child resource before fetching its secret configuration?

Do not send credentials, privately signed responses or member data with these questions. No token issuance/testing is needed to ask for the contract. If the provider cannot support this boundary, keep this recovery method blocked and review a different isolated-only credential source.

## 6. Preservation and next action

Source remains9376b91 launcher/f3d1eb9 bridge; current reviewed guard, runtime manifest, source pins, private transfer and sanitized output behavior are unchanged. The sealed kit and canonical grant remain byte-identical, READY/unconsumed. Grant SHA256433a71b3b4edad86b9d3508a3c46a5516bb1cde40eb5e4de2bacc4a38a9c3e7a. No reset, re-enrollment, extra grant or reservation was created. All280 migrations and37 feature rows are preserved. No application build or unrelated tests repeated.

Only official public documentation, unauthenticated public repository metadata and source files were read. Copies reside outside any other project repository. No live token was created/retrieved/printed/used, no private token inventory, provider account/project request, PostgreSQL connection, production access/change, Auth/settings/maintenance change, migration, hosted Auth, Netlify activity, push/merge, message, payment or staff grant occurred.

Next: obtain the exact nonsecret provider format/resource contract above, then review only any necessary offline correction and explicit grant/source reconciliation. No recovery or deployment execution follows from this report. Owner token availability and actual authority remain UNVERIFIED.
