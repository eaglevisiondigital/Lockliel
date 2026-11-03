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
EXPECTED="2619d693441ee74d5123656534929b28da1b103d78d6952624bd13795cea2e02"
ACTUAL=$(/usr/bin/shasum -a 256 "$RUNNER")
[[ "${ACTUAL%% *}" == "$EXPECTED" ]] || exit 1
exec /usr/bin/env -i /opt/homebrew/opt/node@24/bin/node --disable-proto=throw "$RUNNER" --execute-installed
