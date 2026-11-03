#!/bin/sh
# Fixed source-pinned local operator. No credential is accepted as an argument.
set -eu
umask 077
KIT='/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10ie-qjks-recovery/kit'
fail() { /usr/bin/printf '%s\n' '{"ok":false,"errorCode":"BOOTSTRAP_INTEGRITY_FAILED","safeguardsVerified":false,"retryAllowed":false}'; exit 1; }
MODE='--execute-one-authorized-handoff'
[ "$#" -eq 0 ] || fail
cd /
# env -i prevents Python/Perl/DYLD instrumentation from reaching child tools.
check() { actual=$(/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256 "$2" 2>/dev/null) || fail; [ "$actual" = "$1  $2" ] || fail; }
check 'bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e' '/Library/Developer/CommandLineTools/usr/bin/python3'
check 'ceb426d2474cb5678c3e45f7e3b9562b5dfe1b817633129c05e0bc901df6fbc7' "$KIT/recovery_launcher.py"
check 'e9c74aa5aca6b71689a649e84d3055f1fcaf242b09c1380991d1e0b7761a5865' "$KIT/recovery-runtime-manifest.json"
check '3ad8fbfde07e8ab1ce971c5e467104c326cce29e1d051142bcf84df0879f359f' "$KIT/recovery-runtime-SHA256SUMS"
check '9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2' "$KIT/supabase_recovery.py"
check 'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba' "$KIT/database_preflight.py"
check 'ec07fb0d0c7b799bcd1307ae3097a68ededdfd1c3b8246ec450829ac99838821' "$KIT/manual_recovery_launcher.py"
check '24c9b04f1a696f6ad089614460842b20826a7f2b632f8bfe8a8589b53f1cb8b5' "$KIT/manual_database_preflight.py"
check 'e41d3b988c3f58cfd4f0feff37d831077f8adf7d6c150aeb390df5305356c5f0' "$KIT/manual-branch-identity.json"
[ ! -e '/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python39.zip' ] && [ ! -L '/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python39.zip' ] || fail
inventory=$(/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/find '/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python3.9' -type f \( -name '*.py' -o -name '*.pyc' -o -name '*.so' -o -name '*.zip' \) -print | /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/sort | /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256) || fail
[ "$inventory" = '1d15edab00ea01a97e8c4a0d0b51b218d084e95a708759deb6f0a303575ff181  -' ] || fail
/usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /usr/bin/shasum -a 256 -c "$KIT/recovery-runtime-SHA256SUMS" >/dev/null 2>&1 || fail
exec /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /Library/Developer/CommandLineTools/usr/bin/python3 -I -B -S "$KIT/manual_recovery_launcher.py" "$MODE"
