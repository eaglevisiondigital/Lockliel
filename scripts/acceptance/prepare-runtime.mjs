// Builds a separate, pinned, temporary acceptance artifact. Never edits live handlers.
import {readFile,writeFile,mkdir,cp,readdir,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo=resolve(import.meta.dirname,'../..');
const ref='jxtgtfffdiwzxocxoqxk',site='60579b8e-d0ca-4ac1-abe5-7128f4243e8b';
const origin='https://acceptance--lockliel-course-acceptance-jxtgtfff.netlify.app';
const output='/private/tmp/lockliel-isolated-runtime';
const config=JSON.parse(await readFile('/private/tmp/lockliel-acceptance-public.json','utf8'));
if(config.ref!==ref||!config.key.startsWith('sb_publishable_'))throw Error('Isolated public identity required');
const core=await readFile(join(repo,'netlify/lib/lockliel-core.mjs'),'utf8');
const bound=core.replace(/^export const SUPABASE_URL=.*$/m,`export const SUPABASE_URL=${JSON.stringify('https://'+ref+'.supabase.co')};`).replace(/^export const SUPABASE_KEY=.*$/m,`export const SUPABASE_KEY=${JSON.stringify(config.key)};`).replace(/^export const LOCKLIEL_APP_ORIGIN=.*$/m,`export const LOCKLIEL_APP_ORIGIN=${JSON.stringify(origin)};`).replace(/^ const secure=.*$/m,' const secure=true; // Dedicated acceptance runtime is HTTPS-only.');
if(bound===core||bound.includes('bsndfhbemstyrrglajat')||bound.includes('https://lockliel.com'))throw Error('Production core survived binding');
const guard=`
const site=${JSON.stringify(site)},origin=${JSON.stringify('https://'+ref+'.supabase.co')};
const transport=globalThis.fetch.bind(globalThis);
globalThis.fetch=(input,options)=>{
 const url=new URL(input instanceof Request?input.url:input);
 if(url.origin!==origin||url.username||url.password)throw new Error('Acceptance outbound request denied');
 return transport(input,{...options,redirect:'error'});
};
export function withProductionBackend(handler){return async(request,context)=>{
 if(context?.site?.id!==site||!['dev','deploy-preview','branch-deploy'].includes(context?.deploy?.context))return Response.json({code:'isolated_identity_required'},{status:503});
 const r=await handler(request,context);r.headers.set('X-Lockliel-Environment','isolated-course-acceptance');return r;
};}
`;
await mkdir(join(output,'functions'),{recursive:true});
// Branch-only SMTP off and email auto-confirm were explicitly authorized and verified.
await mkdir(join(output,'public'),{recursive:true});
for(const name of ['_next','my-lockliel','my-lockliel.html','404.html','favicon.ico','icon.png','icon.svg']){try{await cp(join(repo,'out',name),join(output,'public',name),{recursive:true,filter:src=>!/(?: |%20)[2-9](?:\.|$|\/)/.test(src)});}catch(e){if(e.code!=='ENOENT')throw e;}}
// Only member pages and their compiled assets are served. Public campaign forms never ship.
for(const entry of await readdir(join(output,'public'),{withFileTypes:true}))if(!['_next','my-lockliel','my-lockliel.html','404.html','favicon.ico','icon.png','icon.svg'].includes(entry.name))await rm(join(output,'public',entry.name),{recursive:true,force:true});
const handlers=['signup','login','logout','session','mfa','journey','lesson-resource','next-step','dashboard-attention','profile','admin-content','admin-person','admin','notifications'];
for(const name of handlers){
 const filename=join(repo,'netlify/functions/lockliel-'+name+'.mjs');
 await build({entryPoints:[filename],outfile:join(output,'functions/lockliel-'+name+'.mjs'),bundle:true,platform:'node',target:'node22',format:'esm',plugins:[{name:'pinned-acceptance-binding',setup(b){
 b.onLoad({filter:/[/\\]lockliel-core\.mjs$/},()=>({contents:bound,loader:'js'}));
 b.onLoad({filter:/[/\\]deployment-safety\.mjs$/},()=>({contents:guard,loader:'js'}));
 }}]});
 const code=await readFile(join(output,'functions/lockliel-'+name+'.mjs'),'utf8');
 if(/bsndfhbemstyrrglajat|sb_publishable_NSyTQx|https:\/\/lockliel\.com|@netlify\/blobs|service_role/.test(code))throw Error('Disallowed dependency in '+name);
}
await writeFile(join(output,'netlify.toml'),`[build]\npublish="public"\n[functions]\ndirectory="functions"\nnode_bundler="esbuild"\n[[headers]]\nfor="/*"\n[headers.values]\nX-Robots-Tag="noindex, nofollow, noarchive"\nX-Lockliel-Environment="isolated-course-acceptance"\nContent-Security-Policy="connect-src 'self' https://${ref}.supabase.co; form-action 'self'; frame-ancestors 'none'"\n[[redirects]]\nfrom="/"\nto="/my-lockliel/journey"\nstatus=302\n[[redirects]]\nfrom="/api/*"\nto="/404.html"\nstatus=404\n`);
const source=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const diff=execFileSync('git',['diff','--binary','HEAD'],{cwd:repo});
const functionHashes={};
for(const name of handlers)functionHashes[name]=createHash('sha256').update(await readFile(join(output,'functions/lockliel-'+name+'.mjs'))).digest('hex');
await writeFile(join(output,'identity.json'),JSON.stringify({ref,site,origin,source,workingDiffSha256:diff.length?createHash('sha256').update(diff).digest('hex'):null,handlers,functionHashes},null,2));
console.log(JSON.stringify({output,site,ref,origin,handlers:handlers.length}));
