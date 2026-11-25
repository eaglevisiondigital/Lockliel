/** Fixed bootstrap; source hashes are regenerated only after local review. */
import fs from 'node:fs';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const PIN={manifest:'cee869b2bdd0066341624ace2e078068527c3846d13ba8adcd9b209b63d92020',launcher:'8b3bbbc32a89dfa3ab784bbb366addedd1f245679eac64bba98793ab77447ba3'};
function verify(name,digest){const path=fileURLToPath(new URL(name,import.meta.url)),s=fs.lstatSync(path);if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1||s.uid!==process.getuid()||(s.mode&0o022)||s.size>131072||createHash('sha256').update(fs.readFileSync(path)).digest('hex')!==digest)throw Error('SOURCE_MISMATCH');}
try{
 if(process.argv.length!==3||!['--offline-check','--execute-installed'].includes(process.argv[2]))throw Error('AUTHORITY_MISSING');
 verify('./source-manifest.json',PIN.manifest);verify('./launcher.mjs',PIN.launcher);const {verifyLocalFixturePackage}=await import('./launcher.mjs');verifyLocalFixturePackage();
 const {createFixtureOperator}=await import('./operator.mjs');const operator=createFixtureOperator();const result=process.argv[2]==='--offline-check'?operator.prepare():await operator.execute();process.stdout.write(JSON.stringify(result)+'\n');process.exit(result.ok===false?1:0);
}catch{process.stdout.write('{"ok":false,"category":"FIXTURE_OPERATOR_BLOCKED","retryAllowed":false}\n');process.exit(1);}
