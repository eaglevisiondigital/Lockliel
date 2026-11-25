// Isolated deployment configuration only. Candidate business logic is never replaced.
import {readFile,writeFile,mkdir,cp,rm,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';import assert from'node:assert/strict';import{build}from'esbuild';
const repo=resolve(import.meta.dirname,'../..'),old=process.argv[2]==='old';assert(['old','candidate'].includes(process.argv[2]));
const source=old?'/private/tmp/lockliel-rehearsal274-old-source':repo;
const output='/private/tmp/lockliel-rehearsal274-runtime-'+(old?'old':'candidate');
const cfg=JSON.parse(await readFile('/private/tmp/lockliel-rehearsal274-connection.json'));
const ref='qjksggxorghaxvpyslip',site='70b03a42-6329-476e-bf4b-2b1ce30e9567',origin='https://rehearsal--jade-unicorn-642f40.netlify.app';
assert.equal(cfg.SUPABASE_URL,'https://'+ref+'.supabase.co');assert(cfg.SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_'));
const binding={mode:'isolated-course-rehearsal',site,url:cfg.SUPABASE_URL,key:cfg.SUPABASE_PUBLISHABLE_KEY,origin};
await mkdir(output,{recursive:true});await mkdir(join(output,'public'),{recursive:true});await mkdir(join(output,'functions'),{recursive:true});
for(const name of ['_next','my-lockliel','my-lockliel.html','404.html','favicon.ico','icon.png','icon.svg']){try{await cp(join(source,'out',name),join(output,'public',name),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}}
const handlers=['login','logout','session','mfa','journey','lesson-resource','profile','admin-content','admin-person'];
for(const name of await readdir(join(output,'functions')))await rm(join(output,'functions',name));
const core=await readFile(join(source,'netlify/lib/lockliel-core.mjs'),'utf8');
const oldCore=core.replace(/^export const SUPABASE_URL=.*$/m,'import {backendConfig} from "./backend-config.mjs";\nexport const SUPABASE_URL=backendConfig.url;').replace(/^export const SUPABASE_KEY=.*$/m,'export const SUPABASE_KEY=backendConfig.key;').replace(/^export const LOCKLIEL_APP_ORIGIN=.*$/m,'export const LOCKLIEL_APP_ORIGIN=backendConfig.origin;').replace(/^ const secure=.*$/m,' const secure=true; // Pinned HTTPS-only rehearsal deployment.');
const plugin={name:'isolated-configuration',setup(b){
 b.onResolve({filter:/backend-config\.mjs$/},()=>({path:'backend-config',namespace:'binding'}));
 b.onLoad({filter:/.*/,namespace:'binding'},()=>({contents:'export const backendConfig=Object.freeze('+JSON.stringify(binding)+');',loader:'js'}));
 if(old){
  b.onLoad({filter:/[/\\]lockliel-core\.mjs$/},()=>({contents:oldCore,loader:'js',resolveDir:join(repo,'netlify/lib')}));
  b.onLoad({filter:/[/\\]deployment-safety\.mjs$/},async()=>({contents:await readFile(join(repo,'netlify/lib/deployment-safety.mjs'),'utf8'),loader:'js',resolveDir:join(repo,'netlify/lib')}));
 }
}};
const banner=`const rehearsalFetch=globalThis.fetch.bind(globalThis);globalThis.fetch=(input,options)=>{const u=new URL(input instanceof Request?input.url:input);if(u.origin!==${JSON.stringify(binding.url)}||u.username||u.password)throw Error('Isolated outbound request denied');return rehearsalFetch(input,{...options,redirect:'error'});};`;
const hashes={};
for(const name of handlers){const out=join(output,'functions/lockliel-'+name+'.mjs');await build({entryPoints:[join(source,'netlify/functions/lockliel-'+name+'.mjs')],outfile:out,bundle:true,platform:'node',target:'node22',format:'esm',plugins:[plugin],banner:{js:banner}});const code=await readFile(out,'utf8');assert(!/bsndfhbemstyrrglajat|sb_publishable_NSyTQx|https:\/\/lockliel\.com|@netlify\/blobs|service_role/.test(code),'Forbidden runtime dependency');hashes[name]=createHash('sha256').update(code).digest('hex');}
await writeFile(join(output,'netlify.toml'),`[build]\npublish="public"\n[functions]\ndirectory="functions"\nnode_bundler="esbuild"\n[[headers]]\nfor="/*"\n[headers.values]\nX-Robots-Tag="noindex, nofollow, noarchive"\nX-Lockliel-Environment="isolated-course-rehearsal"\nContent-Security-Policy="connect-src 'self' ${binding.url}; form-action 'self'; frame-ancestors 'none'"\n[[redirects]]\nfrom="/"\nto="/my-lockliel/journey"\nstatus=302\n[[redirects]]\nfrom="/api/*"\nto="/404.html"\nstatus=404\n`);
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const diff=execFileSync('git',['diff','--binary','HEAD'],{cwd:repo});
await writeFile(join(output,'identity.json'),JSON.stringify({source:old?'1599ab271e0120a5cdc4e38e225ba749dd214721':head,packagerSource:head,workingDiffSha256:diff.length?createHash('sha256').update(diff).digest('hex'):null,site,ref,origin,handlers,hashes,adaptation:old?'Backend configuration, trusted site guard, HTTPS cookie only; original course logic unchanged':'backend-config data only; exact candidate handlers/core/guard; outbound transport deny wrapper'},null,2));
console.log(JSON.stringify({output,site,ref,handlers:handlers.length}));
