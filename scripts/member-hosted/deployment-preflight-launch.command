#!/bin/sh
# Disabled deployment-preflight template. No grant, input or execution mode.
set -eu
umask 077
fail() { /usr/bin/printf '%s\n' '{"ok":false,"errorCode":"PREPARATION_INTEGRITY_FAILED","executionAuthorized":false}'; exit 1; }
if [ "$#" -ne 1 ] || [ "$1" != '--offline-verify' ]; then
 /usr/bin/printf '%s\n' '{"ok":false,"errorCode":"EXECUTION_NOT_AUTHORIZED","executionAuthorized":false}'
 exit 1
fi
KIT=$(CDPATH= cd -- "$(/usr/bin/dirname -- "$0")" && /bin/pwd -P) || fail
check() { actual=$(/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256 "$2" 2>/dev/null) || fail; [ "$actual" = "$1  $2" ] || fail; }
check 'bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e' '/Library/Developer/CommandLineTools/usr/bin/python3'
check '7d79a3e9864606326a5c55a1f05adef1fb04ca33bdc3889e40ad3be2238842eb' "$KIT/deployment-preflight-launcher.py"
check 'b461561ba1f7d7bf260e3a7f9ab0efd731e286a024bc0ba94f715f69b486693d' "$KIT/deployment-preflight-launcher-manifest.json"
check 'e9c74aa5aca6b71689a649e84d3055f1fcaf242b09c1380991d1e0b7761a5865' "$KIT/recovery-runtime-manifest.json"
check '3ad8fbfde07e8ab1ce971c5e467104c326cce29e1d051142bcf84df0879f359f' "$KIT/recovery-runtime-SHA256SUMS"
[ ! -e '/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python39.zip' ] && [ ! -L '/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python39.zip' ] || fail
inventory=$(/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/find '/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python3.9' -type f \( -name '*.py' -o -name '*.pyc' -o -name '*.so' -o -name '*.zip' \) -print | /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/sort | /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256) || fail
[ "$inventory" = '1d15edab00ea01a97e8c4a0d0b51b218d084e95a708759deb6f0a303575ff181  -' ] || fail
/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256 -c "$KIT/recovery-runtime-SHA256SUMS" >/dev/null 2>&1 || fail
exec /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Library/Developer/CommandLineTools/usr/bin/python3 -I -B -S "$KIT/deployment-preflight-launcher.py" --offline-verify
