#!/bin/zsh -f
# Disabled package verification only. No credential prompt or hosted execution.
set -eu
[[ $# == 0 ]] || exit 1
cd -- "$(/usr/bin/dirname -- "$0")"
[[ "$(/usr/bin/shasum -a 256 launcher.mjs)" == "8b3bbbc32a89dfa3ab784bbb366addedd1f245679eac64bba98793ab77447ba3  launcher.mjs" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 source-manifest.json)" == "cee869b2bdd0066341624ace2e078068527c3846d13ba8adcd9b209b63d92020  source-manifest.json" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 /opt/homebrew/opt/node@24/bin/node)" == "c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd  /opt/homebrew/opt/node@24/bin/node" ]] || exit 1
exec /usr/bin/env -i PATH=/usr/bin:/bin /opt/homebrew/opt/node@24/bin/node ./launcher.mjs --offline-verify
