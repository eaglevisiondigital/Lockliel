# Wave 10F final experiment preparation

**PREPARED ONLY. Do not run the provider commands until separately authorized.**

Exact site: 70b03a42-6329-476e-bf4b-2b1ce30e9567 / jade-unicorn-642f40. Local checker/tooling source: `4e5b59482e5acddce7153aee977dd60ec3970f29`. Application candidate remains unchanged at327ba098; no application deployment is included. Existing Wave 10E ID6ae8942b7f6512d039ce0da6 was deleted and must never be reused.

## Local preparation already completed

No credential or provider access occurs in this generation command. It was run against the final source to create a NEW directory:

```sh
/Library/Developer/CommandLineTools/usr/bin/python3 -B /Users/davesmacbookpro/.codex/worktrees/lockliel-wave10-hosted-composition/Lockliel/scripts/netlify-context/prepare.py --output-dir /private/tmp/lockliel-wave10f-validated-experiment
```

The generator refuses overwrite and verifies all three historical helper source seals before applying the reviewed local changes. Do not run historical templates or older preparation kits. If temporary files are gone, regenerate this exact final kit from the exact tooling source using a new directory only; reverify hashes and update commands for review before executing.

Manifest SHA256: `44f768595051db86f63071ef1b94b704e5ace139ea67a67ee613d6dd063bb625`.

Safe local integrity check, no credentials/network:

```sh
/Library/Developer/CommandLineTools/usr/bin/python3 -B - <<'CHECK'
from pathlib import Path
import hashlib, json
p = Path('/private/tmp/lockliel-wave10f-validated-experiment')
raw = (p / 'manifest.json').read_bytes()
assert hashlib.sha256(raw).hexdigest() == '44f768595051db86f63071ef1b94b704e5ace139ea67a67ee613d6dd063bb625'
for name, expected in json.loads(raw)['files'].items():
    assert hashlib.sha256((p / name).read_bytes()).hexdigest() == expected
print('Prepared kit hashes verified; this is not deployment authorization.')
CHECK
```

## Exact future commands, NOT executed

A new direct owner approval must expressly authorize one additional empty reservation, conditional same-ID empty finalization and exact-new-ID cleanup. Normal environment approval remains required. The flag below only prevents accidental execution. It does not grant consent. No secret is entered in an argument, environment variable, output or new file.

1. After that authorization only, fresh read-only preflight:

```sh
/Library/Developer/CommandLineTools/usr/bin/python3 -B /private/tmp/lockliel-wave10f-validated-experiment/preflight.py --execute-after-owner-authorization
```

It uses the existing protected Netlify CLI login, checks actual caller/Owner/all-site rights and the exact site, fresh complete deployment listing and rehearsal aliases, publication pointers and bounded credit headroom. Auto top-up must remain OFF. No billing/site setting changes or paid resource purchases are allowed. A denied/missing check stops before creation. It captures only safe metadata and static/404 response hashes, without following redirects or running scripts/Auth. No DB password or Supabase access is involved.

2. Only if preflight passes, within five minutes, execute the one bounded experiment:

```sh
/Library/Developer/CommandLineTools/usr/bin/python3 -B /private/tmp/lockliel-wave10f-validated-experiment/experiment.py --execute-after-owner-authorization
```

The exact supported sequence is fixed in the sealed script:

- Fresh site/list/alias preservation check, then exactly one POST /sites/{site_id}/deploys with draft=true only.
- Separate site-scoped GET of the actual new ID. Require two matching site/ID/context receipts, independent publication pointers and unchanged old resources. True/null/omitted response draft may pass only under the tested complete-proof criteria; false/malformed or wrong/missing context denies.
- Only after that gate passes, one PUT /sites/{site_id}/deploys/{same_new_id}, body draft=true/files={}. No asset/native-function/environment upload. Bounded polling must establish ready and unchanged context before finalization is called complete.
- Recheck no publication/alias/history change. Any error/ambiguity stops further advancement and enters only exact-new-ID containment.
- Independently reverify new ownership and nonpublication; cancel/wait if needed; DELETE only that new ID. Require site-scoped and global provider404, list absence, preserved history and immutable HTTPS404. No placeholder upload, second reservation, branch-deploy substitution, publish/restore/lock or site-setting operation.

The one-attempt journal is created exclusively and never overwritten. A failed/ambiguous reservation is never automatically retried. Limits:600 seconds normal work,20 normal API calls,40 total including reserved cleanup. Independent follow-up reads are separate. A limit never implies successful retirement. If containment is not verified, report it and stop unrelated work; do not delete another deployment or abandon the result as harmless.

3. If an actual new ID was returned, independently verify it and preservation, even if the main workflow stopped:

```sh
/Library/Developer/CommandLineTools/usr/bin/python3 -B /private/tmp/lockliel-wave10f-validated-experiment/verify.py --execute-after-owner-authorization
```

The separate process derives the ID only from this new journal, rejects historical IDs, performs GETs only, and checks both provider404s/list absence/immutable404 plus unchanged site publication and rehearsal static responses. It does not treat a generic404 body hash as immutable, cancellation/503 as deletion, or an OFF successor as containment. If no real ID exists, it refuses to proceed. A failed verification must be reported, not rewritten as success.

## Exact optional owner approval request

> Approve ONE additional secret-free Netlify experiment on site70b03a42-6329-476e-bf4b-2b1ce30e9567 using the Wave10F corrected checker at4e5b59482e5acddce7153aee977dd60ec3970f29 and the sealed validated kit. Authorize fresh Owner/site/billing/alias preflight, one empty draft reservation, conditional same-ID empty finalization, and cancel/wait/delete only the newly returned ID with independent provider/URL404 checks. Accept optional/null draft only with the tested complete independent publication and preservation proof; reject false/malformed values. Keep draft=true on both writes. Approve the stated bounded request/time limits and report actual cost uncertainty. No application, function, environment/key, hosted Auth, Supabase, production, setting change, infrastructure purchase, push/merge or replacement reservation. Stop after reporting.

**This new request is not approved by Wave10F. No commands in the future section were executed.** Real provider same-ID finalization remains unverified until a separately authorized experiment or authoritative provider confirmation supplies that evidence.
