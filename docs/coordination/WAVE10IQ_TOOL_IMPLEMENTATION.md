# Wave 10I-Q fixture-tool implementation

Local implementation and synthetic offline validation only, November 3, 2026. No hosted identity was created, queried, altered or authenticated. No credential was requested from the owner. The existing 40-file operator, consumed J diagnostic, application candidate, deployment reservation and migration files were not changed by this lane.

## Implemented

New files under `scripts/fixture-provision` implement exact isolated contracts, durable offline attempt/step consumption, protected local input, a fixed Auth Admin HTTP request implementation, a closed synthetic transport capability, the two-member workflow, private in-memory provenance drafts, and source-hash-verified offline installation inspection. No dependency was added.

The fixed provider destination is HTTPS port 443, `qjksggxorghaxvpyslip.supabase.co`, POST `/auth/v1/admin/users`. Payload is limited to the generated `fixture.invalid` synthetic alias, hidden password, `email_confirm=true`, and a neutral synthetic full name. There is no supplied referral, campaign, inviter, group, phone, contact, staff, manager, MFA, payment or entitlement field. There is no GET roster, invitation, update, delete, reset, session, retry, alternate host or redirect implementation. Two serial creation operations maximum are represented in the workflow. Real HTTP code has certificate verification, explicit hostname, no reused agent, 64 KiB response bound and absolute 10-second deadline. The tests exercise that same envelope with an internally constructed synthetic event source. They never open a socket.

The official [Supabase JavaScript createUser reference](https://supabase.com/docs/reference/javascript/auth-admin-createuser) and [Auth Admin source](https://raw.githubusercontent.com/supabase/auth-js/master/src/GoTrueAdminApi.ts) support the server-only creation operation and endpoint shape. The [official Flutter reference](https://supabase.com/docs/reference/dart/auth-admin-createuser) states that createUser does not send a confirmation email. These public contracts do not certify this isolated environment's current hooks, trigger graph, outbound effects or private key authority. Auto-confirming a synthetic non-deliverable alias is not evidence of mailbox verification and requires explicit future owner approval.

The hidden-input component accepts only fixed prompt kinds through the local TTY, disables echo before displaying the prompt, restores terminal state on success/interruption/error, imposes a 60-second input deadline, and clears owned buffers. Actual disposable PTY tests used synthetic markers only. They found and corrected a stdin lifetime issue and the prompt/raw-mode ordering race. JavaScript, JSON and Node HTTPS create immutable runtime copies that cannot be guaranteed physically zeroized. The final protected process must be short-lived and exit after use; do not describe this code as guaranteed secure erasure of all runtime memory. No inputs are written to arguments, environment, files, evidence or output by the code.

## Durable state and partial failure

The implemented filesystem primitive is explicitly offline-only and confined to newly created `/private/tmp/lockliel-fixture-provision-offline-*` directories. It uses owner-only directories, exclusive 0400 files, no-follow reads, single-link checks, external grant-content anchors, atomic consumption and directory/file fsync. It consumes before synthetic input and claims each operation before dispatch. Restarted, concurrent, repeated, expired, reordered and interrupted attempts fail closed. Terminal outcomes cannot continue; PASS cannot precede every required step. There is no API to reset consumption.

A timeout or unknown result is AMBIGUOUS, never permission to retry. A completed A followed by failure of B is partial and retains the original state. No deletion or rollback of hosted identities is implemented. The mock result reports simulated creations separately from hosted users, which remain zero. A future live attempt would need a dedicated fixed owner-private ledger and independently sealed grant, rather than reusing these offline temporary roots or the consumed J allowance. Filesystem permissions and anchors protect against accidental replay/substitution; they cannot prevent the same owner deliberately deleting an entire ledger. An externally retained generation/grant anchor and exact approved installation are therefore required.

## Independent identity contract

Provider projections retain only exact subject/profile/creation/login digests, label and actual creation time. Arbitrary provider fields, raw bodies, secrets and native errors are neither output nor hashed into evidence. Metadata accessors/proxies are rejected. The pre/post contract requires the exact isolated project/branch/branch ID; fresh five-minute timestamps; direct IPv6, TLS hostname verification and actual same-transaction on/5s/30s safeguards; 280 migrations; paused=true; schemaReady=true; protocol=278-v1; zero collision/unexpected writes; reviewed trigger hash; unchanged old-record fingerprint; and independently matching A/B tuples with one profile, confirmation, zero staff roles, factors, sessions, enrollment, progress, notes or unexpected claims. Every four-digest field must be distinct across A and B.

The native inventory component in `scripts/fixture-native` is authored and tested separately by the coordinator. Its raw receipt is data, not authority. The JS validator deliberately cannot turn caller booleans or synthetic receipts into a trusted native or provider capability. A successful offline workflow creates only an in-memory `lockliel-fixture-provenance-draft-v1` record, status `UNVERIFIED_OFFLINE_ONLY`, with original event projections, observation digests, new generation and missing independent approval. It is not the existing approved mapping schema and cannot activate the 40-file operator. No private permanent registry was installed or written.

## Source-pinned preparation versus activation

`offline-verify.command` pins the Node executable, verifier and manifest before invoking Node with a cleared environment. The verifier imports built-ins only before checking the five module hashes. It reports package integrity, no input and no network. Its manifest covers the JS fixture package only, not the separately reviewed native module, a whole installation or live operator authority. Source and manifest verification are required but not provider evidence.

`createReviewedFixtureTransport()` takes no options and fails with AUTHORITY_MISSING before input, credentials, network or filesystem credential access. The live installation seal remains null. Test factories produce private WeakMap-branded synthetic-only handles. An application object, callback, timestamp, JSON receipt or locally generated identity cannot manufacture live authority.

## Exact remaining implementation and review requirements

This is **SYNTHETIC FIXTURE TOOL INCOMPLETE**, not ready to ask for account creation solely by approving a document. The remaining tasks are concrete:

1. Implement and independently review the protected source-pinned private worker composition joining hidden input, the fixed HTTPS creation request, the coordinator's native pre/post query adapter, a fixed owner-private grant and authenticated opaque receipt acquisition. The current live factory is disabled and this private composition is not implemented.
2. Bind fresh child-only project/branch/operator authority and exact permissible hook/trigger configuration. No parent-project read, broad Management token or fabricated authority is an acceptable substitute. Unknown side effects must prevent both creations.
3. Verify real provider response compatibility without weakening identity evidence. Current response validation deliberately requires explicit ordinary-role metadata, empty factors, explicit false anonymous status and six-digit UTC creation timestamps. Compatibility with actual current create responses is unverified; missing fields fail closed. Later native verification must independently corroborate all role/factor/identity facts.
4. Complete the permanent private registry writer, append-only event/externally retained head seal and custodian approval, then derive the existing 24-hour mapping only after independent actual creation verification. Do not make an offline draft an approved record.
5. Freeze the complete combined source/dependency/query hashes and obtain separate exact live authority for at most two serial creations plus two new read-only direct checks. Do not reuse J or a deployment grant.

Future installation must leave all existing 40 source files and 16 Auth flags unchanged. Only a separately reviewed approved private mapping could later satisfy their existing input contract. Ordinary member creation does not establish manager AAL2, staff authorization, member session acceptance or a production-release gate. No Netlify resource or retirement operation belongs in fixture provisioning; mandatory exact-ID retirement remains required in its separate deployment assignment.

## Retention and eventual cleanup

Default proposed outcome is retained, unused new fixtures for isolated testing. Any partial or ambiguous result stops. Reconciliation would require a new exact read-only authorization before any retry proposal. Eventual deletion needs a separate exact-new-subject provenance, cascade and protected-old-row review plus owner authorization. Existing learner/manager identities and their progress are explicitly excluded. There is no automatic cleanup/deletion path in the tool.

## Validation evidence

The implementation lane passed 60 workflow/HTTP-envelope tests and two actual synthetic PTY tests. The independent security agent owns its separate attacker tests and review result; those counts are recorded in the consolidated report. The package's offline hash verifier passes with zero input requests and zero network requests. Full application checks and unchanged-source/migration verification are coordinated separately. No local or hosted SQL execution was performed by this lane.
