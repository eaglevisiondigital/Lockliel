/** Read-only installed runtime/dependency integrity, never installs or executes. */
import {readFile,lstat,readdir,readlink,realpath} from 'node:fs/promises';
import {join,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
const need=x=>{if(!x)throw Error('Installed operator runtime integrity denied.');};
const sha=b=>createHash('sha256').update(b).digest('hex');
export const INSTALLED_ROOTS=Object.freeze(['/Users/davesmacbookpro/Documents/ChatGPT/Lockliel/node_modules','/Users/davesmacbookpro/.npm/_npx/90d26507e643fcc0/node_modules']);
async function tree(root){const entries=[];let total=0;
 async function walk(path){for(const name of (await readdir(path)).sort()){const p=join(path,name),s=await lstat(p),rel=relative(root,p);need(!rel.startsWith('..')&&!isAbsolute(rel)&&entries.length<200000);if(s.isSymbolicLink()){const target=await realpath(p),inside=relative(root,target);need(!inside.startsWith('..')&&!isAbsolute(inside));entries.push([rel,'link',await readlink(p)]);}else if(s.isDirectory())await walk(p);else{need(s.isFile()&&s.size<=256*1024*1024&&(total+=s.size)<=4*1024*1024*1024);entries.push([rel,'file',sha(await readFile(p))]);}}}
 await walk(root);return {sha256:sha(JSON.stringify(entries)),files:entries.length,bytes:total};
}
export async function inspectInstalledToolchains(...args){need(args.length===0);const roots={};for(const path of INSTALLED_ROOTS)roots[path]=await tree(path);return roots;}
export async function verifyInstalledRuntime({execution=false}={}){
 const seal=JSON.parse(await readFile(new URL('./operator-runtime-seal.json',import.meta.url),'utf8'));
 need(seal.version==='lockliel-installed-operator-runtime-v1');const node=await realpath('/opt/homebrew/opt/node@24/bin/node');need(await realpath(process.execPath)===node&&sha(await readFile(node))===seal.nodeSha256);
 const python='/Library/Developer/CommandLineTools/usr/bin/python3';const target=await realpath(python);need(target==='/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3.9'&&sha(await readFile(target))==='bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e');
 const manifestBytes=await readFile(new URL('./recovery-runtime-manifest.json',import.meta.url));need(sha(manifestBytes)==='e9c74aa5aca6b71689a649e84d3055f1fcaf242b09c1380991d1e0b7761a5865');const manifest=JSON.parse(manifestBytes);
 for(const [path,pin]of Object.entries(manifest.files)){const resolved=await realpath(path),s=await lstat(resolved);need(resolved===pin.resolved&&s.isFile()&&[0,process.getuid()].includes(s.uid)&&!(s.mode&0o022)&&sha(await readFile(resolved))===pin.sha256);}
 need(JSON.stringify(await inspectInstalledToolchains())===JSON.stringify(seal.roots));
 const forbidden=['NODE_TLS_REJECT_UNAUTHORIZED','NODE_EXTRA_CA_CERTS','SSL_CERT_FILE','SSL_CERT_DIR','SSLKEYLOGFILE','PYTHONPATH','PYTHONHOME'];const safe=forbidden.every(key=>!Object.hasOwn(process.env,key))&&!process.env.NODE_OPTIONS;
 if(execution)need(safe);return Object.freeze({verified:true,executionEnvironmentSafe:safe,dependencyTrees:2,pythonRuntimeFiles:Object.keys(manifest.files).length});
}
