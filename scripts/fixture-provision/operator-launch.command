#!/bin/zsh -f
set -eu
set +x
umask 077
ulimit -c 0
[[ "$#" -eq 0 ]] || exit 1
TASK_DIR="${0:A:h}"
RUNNER="$TASK_DIR/operator-runner.mjs"
[[ ! -L "$RUNNER" && -f "$RUNNER" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 /opt/homebrew/opt/node@24/bin/node)" == "c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd  /opt/homebrew/opt/node@24/bin/node" ]] || exit 1
EXPECTED="15f356d20331cfb0b32dd6b63ae944092b8f58d7e21fdece2241f0f353b41b2d"
ACTUAL=$(/usr/bin/shasum -a 256 "$RUNNER")
[[ "${ACTUAL%% *}" == "$EXPECTED" ]] || exit 1
exec /usr/bin/env -i /opt/homebrew/opt/node@24/bin/node --disable-proto=throw "$RUNNER" --execute-installed
