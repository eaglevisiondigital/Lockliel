# Protected exact A/B mapping contract

This directory documents an offline contract. No live mapping, raw UUID, email,
password, token, session, private record or provider receipt is stored here. Tests
construct explicitly synthetic digests in memory. The current production loader
has no reviewed approval seal and fails before accessing its fixed private path.

## Exact mapping

The owner-private artifact is `lockliel-synthetic-identity-mapping-v1` and contains
only project, branch, branch ID, issued/expires times, independently approved
nonsecret provenance, and exactly two ordered subject records A/B. Each subject
record contains `label`, `subjectSha256`, `profileSha256`, `createdAtSha256`, and
`loginSha256`. The login digest is private, never part of a public receipt.
Artifact lifetime is at most 24 hours. A later read-only native observation must
start after loading the approved artifact, complete within five minutes, match the
artifact's digest and approved provenance digest, and prove each exact subject has
one matching profile, confirmation, and no staff role. Unknown, duplicate,
reassigned, stale or ambiguous subjects deny. Digest matching is not independently
trusted hosted evidence unless the sealed native worker channel produced it.

Digest encodings are UTF-8 SHA256, lowercase hexadecimal:

- Login: `lockliel:qjks:login:` followed by the existing approved login email
  normalized with JavaScript `trim().toLowerCase()` and encoded as UTF-8. The
  operator compares the hidden identifier to this independently approved digest
  **before any password prompt or Auth request**. An unknown or wrong-user login
  must stop without submitting credentials or creating any session. Post-login
  JWT-subject checks remain required and cannot replace this pre-submit guard.
- Auth subject: `lockliel:qjks:auth:` followed by canonical lowercase UUID.
- Profile: `lockliel:qjks:profile:` followed by that profile's canonical UUID.
- Creation: `lockliel:qjks:created:` followed by the UTC timestamp formatted as
  `YYYY-MM-DDTHH:MM:SS.USZ` with exactly six fractional digits.

The full mapping digest is SHA256 of recursively key-sorted compact JSON, preserving
array order. The source-reviewed approval separately pins the exact artifact byte
SHA256, canonical mapping SHA256, independent record SHA256, approval ID and validity
window. Editing an artifact cannot issue authority. A caller-supplied approval or
JSON object cannot load a live mapping. Synthetic fixture capabilities are rejected
by every live API.

## Separately authorized future identity verification

No step below is authorized for execution by Wave 10I-M.

1. Locate an independently retained, authorized synthetic fixture-creation record
   that binds exact existing A/B Auth UUIDs to the original isolated run. Labels,
   email domains, display names, user-editable metadata, account counts and current
   existence do not establish provenance. If such a record is unavailable, stop
   for an owner-approved alternative evidence procedure. Do not invent identities,
   create accounts or reset passwords.
2. Obtain explicit approval for one exact isolated read-only native preflight and
   protected mapping preparation. Preserve J's consumed allowance. Source-pin the
   worker, fixed query, TLS/IPv6/on/5s/30s safeguards, project and branch. This is not
   permission to retrieve credentials or contact a provider under this assignment.
3. In the approved private operator process, compare the independent fixture record
   with exact qjks current Auth/profile identities, created timestamps, exact private login digest, confirmation
   state and staff-role absence. Never project email, raw UUID, JWT, session or
   password to model-visible output. Only the protected worker may handle those
   identity values. Its fixed query returns digest records privately; it does not
   trust caller-supplied role labels or user metadata.
4. Write only the digest-based nonsecret identity artifact to the exact owner-private
   directory (0700) and single-link nonsymlink file (0600). No credentials or session
   material belong in this artifact. Produce only safe approved hashes/statuses for
   independent review. No actual artifact or approval was created here.
5. Independently review and source-pin the artifact byte digest, provenance record,
   validity and exact A/B approval. A separate reviewed source change must install
   the immutable approval seal. Then the zero-argument loader may issue a private
   mapping capability. It accepts no caller path, approval or callback substitution.
6. Bind the fresh native digest comparison to the sealed Node worker channel and
   five-minute evidence registry. Bind the approved private login hashes to the
   trusted Auth observer before accepting any hidden identifier. Compare first,
   then prompt for the password only for that exact approved synthetic account.
   Never authorize a login from a caller-supplied email alone. Data comparison alone cannot become provider
   authority. Any unknown provenance, wrong user, role, timing or channel mismatch
   stops before reservation. Ordinary A/B mapping does not authorize a manager,
   verified AAL2, staff role, production account or production access.
