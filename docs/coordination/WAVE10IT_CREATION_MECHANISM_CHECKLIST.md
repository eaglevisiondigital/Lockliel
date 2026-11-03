# Wave 10I-T creation mechanism evidence checklist

Local contract correction only, November 3, 2026. No current hosted hook, branch, operator, database or credential fact is established by these synthetic tests. Provisioning remains disabled; the existing deployment operator and all migrations are unchanged.

## Versioned correction

`lockliel-fixture-provider-evidence-v2` replaces the incomplete four-hook v1 receipt. Every one of the seven documented hook states must be present. Old v1, omitted/null/ambiguous states, configured hooks and additional unknown fields fail before fixture creation. A reviewed provider-version result and independently pinned collector/receipt remain necessary. The new literal `providerIdentity=supabase-management-api` is only a checked label; it does not authenticate a response. The installation seal pins reviewed bytes and collector identity; validators cannot mint execution authority from caller JSON.

States remain distinct:

- **configured:** positively observed enabled hook or existing mechanism. Effects need review; configured Auth hooks are not allowed by this bounded creation gate.
- **disabled:** provider explicitly reports false for a documented hook. Null or omission is never false.
- **absent:** a separate complete catalog or provider-contract/version review establishes no applicable mechanism. An absent hook is still rejected by this gate; unsupported schema must be resolved separately.
- **unknown:** missing, null, unavailable, stale, ambiguous or unreviewed evidence. Always blocks activation.

## Auth hooks

| Mechanism | Potential scope/effects | Required fixture gate | Current hosted evidence |
|---|---|---|---|
| Before user created | Reject or alter creation; invoke arbitrary SQL or HTTP implementation | Explicitly disabled | UNKNOWN |
| After user created | Additional writes, notifications, enrollment or external side effects after creation | Explicitly disabled | UNKNOWN |
| Custom access token | Additional/custom claims and authorization behavior during later token issuance | Explicitly disabled; no token acceptance inferred from creation | UNKNOWN |
| Password verification attempt | Auth decisions or external behavior during later password authentication | Explicitly disabled | UNKNOWN |
| MFA verification attempt | Privileged authentication decisions or external behavior | Explicitly disabled; no MFA acceptance inferred | UNKNOWN |
| Send email | External delivery or alternative email workflow | Explicitly disabled; no email authorized | UNKNOWN |
| Send SMS | External delivery or alternative SMS workflow | Explicitly disabled; no SMS authorized | UNKNOWN |

The provider contract documents nullable enabled booleans with separate URI/secret fields. URI text is not function code/version proof and may contain credentials. Neither raw URI/secret nor a hash of arbitrary secret-bearing responses belongs in evidence. [Official Auth configuration contract](https://supabase.com/docs/reference/api/v1-get-auth-service-config). Independent review confirmed the seven current fields in the public provider OpenAPI; no project configuration was read.

## Native creation mechanisms and fixed scope

| Mechanism | Existing implementation evidence | Required fresh proof and stop rule |
|---|---|---|
| Relevant database triggers | Existing `fixture_inventory.py` fingerprints noninternal triggers in auth/public/app_private/lockliel_cutover; public/app_private/lockliel_cutover function bodies, owners, ACLs and config are included | Reviewed exact graph hash must match fresh native inventory before and after. Unknown or altered trigger/dependency denies |
| Profile/bootstrap functions | Seven owned application rows per new user: profiles, member_journey, profile_tags, referral_links, communication_preferences, profile_connection_cards, profile_finance_cards | Exactly one of each per subject, with exact reviewed defaults; only those fourteen application rows plus the separately approved Auth user/identity internals. No duplicate or unrelated writes |
| Member-role defaults | Provider user requires role authenticated; native check requires ordinary Auth role/audience/app metadata and zero staff_roles | Ordinary membership only. Signup source tag and referral record confer no staff, manager, leader or Founder authority |
| Automatic enrollment | Native postcheck requires zero course_enrollments, lesson/media progress and private notes for each new subject | Explicit reviewed absence; any enrollment/progress/note side effect denies |
| Associated custom claims | Provider projection allows only email provider/providers app metadata; native check enforces exact ordinary app metadata and unexpectedClaimCount=0 | No extra or privileged claims. Member login, manager MFA and staff authorization remain separate acceptance gates |
| Existing financial or other member links | Collision inventory checks synthetic login digests across Auth/profiles/lead contacts/Founder applications/gifts/commitments/orders/checkouts and exact protected-state fingerprints | Any collision or unrelated state change denies. No production or real-member substitution |
| Consent and notifications | Bootstrap communication preferences require all opt-ins false; all other application tables, including notifications/messages, remain protected by before/after state comparison | No invitation, email/SMS, notification, payment, content activation or external call is authorized |

Here, absent automatic enrollment/custom claims means absent from the exact approved synthetic create/confirmation path. It does not claim the database has no enrollment triggers globally; other workflows, including faith-profile updates, have separate behavior and are not authorized.

The `authBinaryEvidence=provider-version-reviewed` value remains a reviewed receipt declaration, not a reported live Auth version or independent proof of provider authority.

The new `creationMechanisms` record binds these reviewed effect labels to the existing `triggerGraphSha256` approval. It also requires a separate nonsecret `dependencyReview` digest, reviewed status and zero unresolved dependencies. These are evidence requirements, not assertions of current hosted safety. The collector/independent operator must establish the underlying facts before a seal can be issued.

### Transitive and managed dependency limitation

The existing graph does not fingerprint function bodies in every namespace. In particular, an auth-namespace or extension helper called by a trigger is not proved safe merely because the trigger definition is hashed. Static function text also does not by itself prove the target/effects of dynamic SQL or an HTTP callback. The dependency review must enumerate the relevant transitive bootstrap path, rule out unresolved/external calls and pin reviewed identities where supported. If it cannot, mark UNKNOWN and keep creation blocked. No native query expansion is implemented here.

Provider-managed Auth auditing/internal hooks are separate from application bootstrap. Hook booleans alone cannot prove their exact writes or messaging behavior. The current provider version and reviewed administrative-create behavior must establish compatibility; unavailable implementation/version evidence remains UNKNOWN. No guessed defaults or caller booleans replace fresh native inspection and independent provider proof.

## Validation and authority limits

The corrected validator checks exact isolated project/branch/branch ID, provider label, collector source, receipt digest, five-minute freshness, observation after approval, all seven disabled hooks, reviewed version, exact graph-bound creation mechanisms, dependency review and the existing independent seal digest. It still never makes a provider or SQL call. The installed authority loader remains disabled, durable one-attempt controls unchanged, and no new seal or credential is created.

Focused synthetic regression covers legacy four-hook denial; all seven configured/absent/unknown/null/missing cases; wrong project/provider/source/scope; stale/future evidence; unknown transitive dependencies; changed graph; role/enrollment/custom-claim effects; unknown fields; accessor/proxy rejection; seal mismatch and no authority minting. Native read-only transaction, collision, exact defaults and protected-state checks remain in the unchanged native worker. No SQL was run for this task.

J allowance remains CONSUMED. Application deployment reservation remains UNUSED.
