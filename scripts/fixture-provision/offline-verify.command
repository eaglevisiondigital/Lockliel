#!/bin/zsh -f
# Disabled package verification only. No credential prompt or hosted execution.
set -eu
[[ $# == 0 ]] || exit 1
cd -- "$(/usr/bin/dirname -- "$0")"
[[ "$(/usr/bin/shasum -a 256 launcher.mjs)" == "ba3937287b77b56d5de539f961d4b81302304b43985c1ab9cbe8c270e90144fc  launcher.mjs" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 source-manifest.json)" == "d388d6bcfeeee7dcbaee3d7834bbdbab7cba88a4f4908cb15c0406e2563fd714  source-manifest.json" ]] || exit 1
[[ "$(/usr/bin/shasum -a 256 /opt/homebrew/opt/node@24/bin/node)" == "c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd  /opt/homebrew/opt/node@24/bin/node" ]] || exit 1
exec /usr/bin/env -i PATH=/usr/bin:/bin /opt/homebrew/opt/node@24/bin/node ./launcher.mjs --offline-verify
