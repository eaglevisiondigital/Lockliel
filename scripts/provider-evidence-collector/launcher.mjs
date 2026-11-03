/** Offline readiness launcher only. No arguments, installation, token or network. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
let result={ok:false,category:'SOURCE_MISMATCH',requestAttempted:false,inputRequested:false};
try {
 if(process.argv.length!==2||process.env.NODE_OPTIONS||process.env.NODE_PATH||process.execArgv.length)throw 0;
 const manifestPath=resolve(root,'scripts/provider-evidence-collector/source-manifest.json');
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(Object.keys(manifest).sort().join(',')!=='baselineSource,files,liveInstallation,project,schema')throw 0;
 if(manifest.baselineSource!=='4560d7b87c6815cf48888bf4976c13aa61cd2fa4')throw 0;
 const expected=['authority.mjs','transport.mjs','attempt.mjs','collector.mjs','launcher.mjs'].map(n=>'scripts/provider-evidence-collector/'+n).concat(['private-provider-projection.mjs','auth-config-schema.json','contracts.mjs','protected-input.mjs'].map(n=>'scripts/fixture-provision/'+n)).sort();
 if(Object.keys(manifest.files).sort().join(',')!==expected.join(','))throw 0;
 if(manifest.schema!=='lockliel-private-collector-source-v1'||manifest.liveInstallation!==false||manifest.project!=='qjksggxorghaxvpyslip')throw 0;
 for(const [path,hash]of Object.entries(manifest.files)) {
  if(!/^(scripts\/provider-evidence-collector\/[a-z-]+\.mjs|scripts\/fixture-provision\/(private-provider-projection\.mjs|auth-config-schema\.json|contracts\.mjs|protected-input\.mjs))$/.test(path)||!/^[a-f0-9]{64}$/.test(hash))throw 0;
  const file=resolve(root,path),stat=fs.lstatSync(file);
  if(stat.uid!==process.getuid()||(stat.mode&0o022)!==0||!stat.isFile()||stat.isSymbolicLink()||fs.realpathSync(file)!==file||createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==hash)throw 0;
 }
 if(Object.keys(manifest.files).length!==9)throw 0;
 result={...await (await import('./collector.mjs')).runCollector(),sourceVerified:true,sourceManifestSha256:createHash('sha256').update(fs.readFileSync(manifestPath)).digest('hex'),baselineSource:manifest.baselineSource};
}catch{}
process.stdout.write(JSON.stringify(result)+'\n',()=>process.exit(result.ok?0:1));
