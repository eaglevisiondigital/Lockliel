#!/bin/sh
# Offline verification only. No installation, grant creation or execution switch.
set -eu
umask 077
fail() { /usr/bin/printf '%s\n' '{"ok":false,"errorCode":"OPERATOR_PREPARATION_DENIED"}'; exit 1; }
[ "$#" -eq 1 ] && [ "$1" = '--offline-verify' ] || fail
KIT=$(CDPATH= cd -- "$(/usr/bin/dirname -- "$0")" && /bin/pwd -P) || fail
check() { actual=$(/usr/bin/env -i PATH=/usr/bin:/bin /usr/bin/shasum -a 256 "$2" 2>/dev/null) || fail; [ "$actual" = "$1  $2" ] || fail; }
check 'c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd' '/opt/homebrew/opt/node@24/bin/node'
check 'b58bb57de86b9c221ac4edb8225e1e1e4d320041b786468eab2e3d589982fd7f' "$KIT/operator-source-seal.mjs"
check 'fb4c02ac5dc193dc5d55150a7c121f8d9a40fc78b09d5bf93bf509845fa24445' "$KIT/operator-binding.mjs"
cd "$KIT"
exec /usr/bin/env -i PATH=/usr/bin:/bin LANG=C LC_ALL=C /opt/homebrew/opt/node@24/bin/node --input-type=module -e 'import {readFile,lstat} from "node:fs/promises"; import {createHash} from "node:crypto"; import {SOURCE_SEALS} from "./operator-source-seal.mjs"; try { for(const [name,hash] of Object.entries(SOURCE_SEALS)){const path=new URL("../../"+name,import.meta.url),stat=await lstat(path);if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==process.getuid()||(stat.mode&0o022)||createHash("sha256").update(await readFile(path)).digest("hex")!==hash)throw Error("DENIED");} const {createBoundIsolatedOperator}=await import("./operator-binding.mjs"); const r=await createBoundIsolatedOperator().prepare(); console.log(JSON.stringify({ok:true,localBindingsVerified:r.localBindingsVerified,liveExecutionAuthorized:false,runtimeVerified:r.runtime.verified,identityState:r.identities.state,operatorState:r.operator.state,credentialsRequested:false,connectionsOpened:0,reservations:0})); } catch { console.log(JSON.stringify({ok:false,errorCode:"OPERATOR_PREPARATION_DENIED"})); process.exitCode=1; }'
