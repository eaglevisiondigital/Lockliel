# Wave 10I-F controlled recovery execution preparation

Prepared only, November2,2026. No launcher activated, token requested or live call performed.

## Exact artifacts

- Source commit `f3d1eb9e6b66937276a37f5b57534b638e08e386` on `codex/wave10-hosted-composition`.
- Bridge `scripts/member-hosted/supabase_recovery.py`, SHA256 `9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2`.
- Guard `scripts/member-hosted/database_preflight.py`, SHA256 `c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba`.
- Project `qjksggxorghaxvpyslip`; branch `course-cutover-rehearsal-274`; branchID `7091bfd6-83ce-4c11-ac30-8ce85e09be2d`.
- Direct host `db.qjksggxorghaxvpyslip.supabase.co:5432`, database/user `postgres`.
- Official CA SHA256 `700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7`, temporary local public certificate outside Git.

## Later operator requirements

The existing10I-E conditional recovery authorization remains available for a later execution step. This preparation is not execution permission under10I-F and does not consume either allowance.

1. Review a thin exclusive local launcher that pins both source files and compiles exactly the verified bridge bytes. Use CLT Python with `-I -B`, a clean nonsecret environment, no telemetry/debugger/tracing/audit instrumentation or subprocess credential handoff. Do not use the `/usr/bin/python3` Xcode shim.
2. Enforce one diagnostic across process restarts by atomically claiming an owner-only nonsecret attempt marker before any hidden input. No automatic retry or replacement launcher. A missing/ambiguous claim or concurrent process stops. Do not reuse any consumed10I-C/10I-A marker.
3. Validate the current public certificate and network prerequisites without secret access, under the later execution scope. The launcher should expose only fixed safe metadata and never dump raw worker exceptions/locals or native stderr.
4. Invoke the reviewed `run_once(ca)` internal worker in that same process. It privately prompts the owner for an already-authorized Supabase read token through hidden local TTY. The current implementation supports classic PAT format only; absent authorization or another format requires review. Never paste a token in ChatGPT, use argv/env/files, retrieve it through an ordinary connector or substitute a Netlify token. Do not create/rotate credentials under this proposal.
5. The worker verifies fresh exact nonsecret branch identity, privately fetches only the exact child config and performs at most one direct TLS/IPv6 guarded database check. Fixed API destinations only. Parent listing metadata is permitted solely to establish this child; no production credentials or SQL.
6. Consume only a fixed sanitized result. Require actual on/5s/30s, TLS, exact database identity,280/security baseline, rollback and close. Failure stops; no fallback, reset, replay, setting change or deployment.
7. Terminate the short-lived process immediately after the sanitized result. Owned mutable buffers are wiped, but complete forensic zeroization of immutable/native memory is not promised. No interactive debugger/process memory inspection while private values exist.

## Explicit limits

No live entrypoint exists in the current command-line script. Do not activate it merely by importing it in a general tool/repl that records locals. Execution-launcher review, atomic allowance binding and privately available read-authorized operator input are real prerequisites, not mock evidence. No live API format, current db_pass, network/TLS/authentication or actual safeguard result is certified by the offline tests.

No deployment reservation, protected deployment key, hosted member login, migration, production access, maintenance toggle, push/merge, reset or role/content/payment/message action follows from a passing recovery result. The deployment allowance remains unused and separate.
