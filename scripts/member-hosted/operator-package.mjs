/** Concrete exact-source builder; no import-time execution or dependency install. */
import {mkdtemp,symlink,readFile,lstat,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),SOURCE='327ba098628f70aa65140862b8b14cd709bfd711';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const DEPENDENCIES='/Users/davesmacbookpro/Documents/ChatGPT/Lockliel/node_modules';
const TOOLCHAIN='/Users/davesmacbookpro/.npm/_npx/90d26507e643fcc0/node_modules';
const NODE='/opt/homebrew/opt/node@24/bin/node';
const need=x=>{if(!x)throw Error('Exact isolated package build denied.');};
export function createExactSourcePackageBuilder(...args){need(args.length===0);const owned=new Set();let used=false;
 return Object.freeze({async build(pin){
  need(!used&&pin?.binding.source===SOURCE&&pin.binding.site==='70b03a42-6329-476e-bf4b-2b1ce30e9567'&&pin.binding.project==='qjksggxorghaxvpyslip'&&/^[a-f0-9]{24}$/.test(pin.binding.deploy));used=true;
  const base=await mkdtemp('/private/tmp/lockliel-wave10im-package-'),source=join(base,'source');owned.add(base);
  try{
   const clean={PATH:'/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/usr/bin:/bin',HOME:'/private/tmp',LANG:'en_US.UTF-8',NEXT_TELEMETRY_DISABLED:'1'};
   await exec('/usr/bin/git',['-C',ROOT,'-c','core.hooksPath=/dev/null','worktree','add','--detach',source,SOURCE],{env:clean,timeout:15000,maxBuffer:1024*1024});
   need((await lstat(DEPENDENCIES)).isDirectory());await symlink(DEPENDENCIES,join(source,'node_modules'));
   const guard=fileURLToPath(new URL('../../tests/support/network-guard.mjs',import.meta.url));need(createHash('sha256').update(await readFile(guard)).digest('hex')==='56ac4272514134a19ecb231865447eb8e16867b0c62ea500dcecbd2a89bd7fe4');
   const env={...clean,NODE_OPTIONS:'--import='+guard,NETLIFY:'true',CONTEXT:'deploy-preview',SITE_ID:pin.binding.site,DEPLOY_ID:pin.binding.deploy,COMMIT_REF:SOURCE,LOCKLIEL_MEMBER_HOSTED_REVIEW:'isolated-read',LOCKLIEL_MEMBER_HOSTED_AUTH_REVIEW:'isolated-login',LOCKLIEL_ISOLATED_READ_DEPLOY:pin.binding.deploy,LOCKLIEL_ISOLATED_READ_SOURCE:SOURCE};
   await exec(NODE,[join(source,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd:source,env,timeout:60000,maxBuffer:4*1024*1024});
   await exec(NODE,[join(source,'scripts/isolate-preview-forms.mjs')],{cwd:source,env,timeout:10000,maxBuffer:1024*1024});
   const {buildMemberHostedPackage}=await import('./package.mjs');const spec=await buildMemberHostedPackage({sourceRoot:source,buildRoot:join(source,'out'),outputRoot:join(base,'package'),pin,toolchainRoot:TOOLCHAIN,enabled:true,authEnabled:true});
   return {directory:spec.path,expectedManifestSha256:createHash('sha256').update(await readFile(join(spec.path,'member-hosted-manifest.json'))).digest('hex')};
  }catch{throw Error('Exact isolated package build denied.');}
 },async close(){for(const base of owned){try{await exec('/usr/bin/git',['-C',ROOT,'-c','core.hooksPath=/dev/null','worktree','remove','--force',join(base,'source')],{timeout:15000,maxBuffer:1024*1024});await rm(base,{recursive:true,force:true});owned.delete(base);}catch{throw Error('Owned local package cleanup unverified.');}}}});
}
