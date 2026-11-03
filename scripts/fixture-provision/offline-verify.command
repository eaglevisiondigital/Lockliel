#!/bin/zsh -f
# Disabled package verification only. No credential prompt or hosted execution.
set -eu
[[ $# == 0 ]] || exit 1
cd -- "$(/usr/bin/dirname -- "$0")"
[[ "$(/usr/bin/shasum -a 256 launcher.mjs)" == "2a3abc15d0907a044500e95b05617a25da6782cf79130458d1ba351e10d2edee  launcher.mjs" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 source-manifest.json)" == "9a7d50d496b4eb1b222e85f2df0a79f1f3178842e60bd50cde2692bec1aaa329  source-manifest.json" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 /opt/homebrew/opt/node@24/bin/node)" == "c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd  /opt/homebrew/opt/node@24/bin/node" ]] || exit 1
exec /usr/bin/env -i PATH=/usr/bin:/bin /opt/homebrew/opt/node@24/bin/node ./launcher.mjs --offline-verify
