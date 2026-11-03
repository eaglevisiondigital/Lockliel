#!/bin/sh
# Preparation-only source-pinned native worker. No active execution grant.
set -eu
umask 077
fail() { /usr/bin/printf '%s\n' '{"ok":false,"errorCode":"SOURCE_MISMATCH","executionAuthorized":false}'; exit 1; }
[ "$#" -eq 1 ] && [ "$1" = '--offline-verify' ] || fail
KIT=$(CDPATH= cd -- "$(/usr/bin/dirname -- "$0")" && /bin/pwd -P) || fail
check() { actual=$(/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256 "$2" 2>/dev/null) || fail; [ "$actual" = "$1  $2" ] || fail; }
check 'bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e' '/Library/Developer/CommandLineTools/usr/bin/python3'
check 'b74803b27723a667f42de110478d4f76cc0734aae8991c9f9e41ad15ea2b6ad3' "$KIT/deployment_native_worker.py"
check '3f026b414ea49a182d0ecf50e23bad9998e9b277df0111bddac47e84617cf90c' "$KIT/deployment-native-worker-manifest.json"
exec /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Library/Developer/CommandLineTools/usr/bin/python3 -I -B -S "$KIT/deployment_native_worker.py" --offline-verify
