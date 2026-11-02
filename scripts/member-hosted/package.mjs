/** Local artifact construction only. This module has no uploader or provider client. */
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,lstat,realpath,readdir,rm,mkdtemp,copyFile} from 'node:fs/promises';
import {resolve,relative,dirname,join,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {build,version as esbuildVersion} from 'esbuild';
import {validateHostedPin,HOSTED_READ_PATH,HOSTED_LOGIN_PATH,HOSTED_LOGOUT_PATH} from '../../netlify/member-hosted/binding.mjs';

const exec=promisify(execFile);
export const PACKAGE_VERSION='lockliel-member-package-v1';
export const AUTH_PACKAGE_VERSION='lockliel-member-auth-package-v1';
export const FUNCTION_NAME='lockliel-member-read';
const HTML='my-lockliel/review.html';
const digest=(data,algorithm='sha256')=>createHash(algorithm).update(data).digest('hex');
const denied=/bsndfhbemstyrrglajat|sb_secret_[A-Za-z0-9_-]{8,}|sb_publishable_[A-Za-z0-9_-]{12,}|(?:eyJ[A-Za-z0-9_-]{12,}\.){2}[A-Za-z0-9_-]{8,}/;
const safeAssetExtension=/\.(?:js|css|woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico)$/i;
const isWithin=(root,path)=>path===root||(!relative(root,path).startsWith('..')&&!isAbsolute(relative(root,path)));
function fail(){throw new Error('Invalid isolated member package input.');}
export function safePackagePath(value){
 if(typeof value!=='string'||!value||isAbsolute(value)||value.includes('\\')||/[\x00-\x20\x7f%?#]/.test(value)||value.split('/').some(part=>!part||part==='.'||part==='..'))return false;
 return /^[A-Za-z0-9_./@+-]+$/.test(value);
}
async function regular(root,path){
 if(!safePackagePath(path))fail();
 const target=resolve(root,path);if(!isWithin(root,target))fail();
 let current=root;
 for(const part of path.split('/')){current=join(current,part);const stat=await lstat(current);if(stat.isSymbolicLink())fail();}
 const stat=await lstat(target);if(!stat.isFile()||stat.size>25*1024*1024)fail();
 return target;
}
async function git(sourceRoot,args){return (await exec('/usr/bin/git',['-C',sourceRoot,...args],{maxBuffer:4*1024*1024})).stdout.trim();}
async function sourceIdentity(sourceRoot,pin,localFixture){
 const root=await realpath(sourceRoot),top=await realpath(await git(root,['rev-parse','--show-toplevel']));if(root!==top)fail();
 const head=await git(root,['rev-parse','HEAD']),tree=await git(root,['rev-parse','HEAD^{tree}']);
 const status=await git(root,['status','--porcelain','--untracked-files=all']);
 const dirty=status.split('\n').some(line=>line&&line!=='?? node_modules');
 if(!localFixture&&(dirty||head!==pin.binding.source))throw new Error('Release package requires exact committed clean source.');
 return {head,tree,dirty};
}
function collectReferences(text){
 const found=new Set();
 // HTML, CSS and webpack literal assets. Never interpret code, fetch a URL or follow an external origin.
 for(const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^\s"')]+)|["'](\/?_next\/static\/[^"'\s<>]+)["']/gi)){
  const raw=(match[1]||match[2]||match[3]).replaceAll('&amp;','&');
  if(/^(?:https?:)?\/\//i.test(raw)){
   if(/\.(?:js|css|woff2?|ttf|otf)(?:[?#]|$)/i.test(raw))throw new Error('External executable or font asset is not allowed.');
   continue;
  }
  if(raw.startsWith('data:')||raw.startsWith('#'))continue;
  const clean=raw.split(/[?#]/)[0];
  if(!safeAssetExtension.test(clean))continue;
  if(clean.includes('%')||clean.includes('\\'))fail();
  found.add(clean);
 }
 return found;
}
function formAttributes(tag){
 const attributes={};
 const content=tag.replace(/^<\w+|\/?\s*>$/g,'');
 const pattern=/\s+([A-Za-z][A-Za-z0-9_:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
 let cursor=0;
 for(const match of content.matchAll(pattern)){
  if(content.slice(cursor,match.index).trim())fail();
  const key=match[1].toLowerCase();if(Object.hasOwn(attributes,key))fail();
  attributes[key]=match[2]??match[3]??null;cursor=match.index+match[0].length;
 }
 if(content.slice(cursor).trim())fail();
 return attributes;
}
function checkedAuthForms(html){
 const forms=[...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(match=>match[0]);
 if(forms.length!==2||(html.match(/<form\b/gi)||[]).length!==2||(html.match(/<\/form>/gi)||[]).length!==2||(html.match(/<input\b/gi)||[]).length!==2||/type=["']file["']/i.test(html))fail();
 for(const [index,path] of [HOSTED_LOGIN_PATH,HOSTED_LOGOUT_PATH].entries()){
  const form=forms[index],opening=form.match(/^<form\b[^>]*>/i)[0],attrs=formAttributes(opening);
  if(attrs.method!=='post'||attrs.action!==path||attrs['aria-busy']!=='true'||Object.keys(attrs).some(key=>!['class','method','action','autocomplete','aria-describedby','aria-busy'].includes(key)))fail();
  const inputs=[...form.matchAll(/<input\b[^>]*>/gi)].map(match=>formAttributes(match[0]));
  if(inputs.length!==(index===0?2:0))fail();
  for(const [i,field]of inputs.entries())if(field.name!==['email','password'][i]||field.type!==['email','password'][i]||!Object.hasOwn(field,'disabled')||!Object.hasOwn(field,'required')||field.autocomplete!=='off'||field.maxlength!==['254','128'][i]||Object.keys(field).some(key=>!['name','type','autocomplete','maxlength','required','disabled'].includes(key)))fail();
  const buttons=[...form.matchAll(/<button\b[^>]*>/gi)].map(match=>formAttributes(match[0]));
  if(buttons.length!==1||buttons[0].type!=='submit'||!Object.hasOwn(buttons[0],'disabled')||Object.keys(buttons[0]).some(key=>!['type','disabled'].includes(key)))fail();
 }
}
export async function planMemberStaticFiles(buildRoot,pinValue,{authEnabled=false}={}){
 const pin=validateHostedPin(pinValue);if(!pin||typeof authEnabled!=='boolean')fail();
 const root=await realpath(buildRoot),html=await readFile(await regular(root,HTML),'utf8');
 if(!html.includes('ISOLATED SERVER READ REVIEW')||!html.includes(pin.binding.source)||!html.includes(pin.binding.deploy)||!html.includes(pin.binding.project)||!html.includes(pin.binding.site)||(!authEnabled&&/<form\b|type=["'](?:password|file)["']/i.test(html))||denied.test(html))throw new Error('Static export does not match the isolated server-read build.');
 if(authEnabled)checkedAuthForms(html);
 const selected=new Set([HTML]),queue=[HTML];
 const routeFiles=['my-lockliel/review.txt'];
 try{for(const name of await readdir(join(root,'my-lockliel/review'))){if(/^__next\.[A-Za-z0-9_.-]+\.txt$/.test(name))routeFiles.push('my-lockliel/review/'+name);}}catch(error){if(error.code!=='ENOENT')throw error;}
 for(const path of routeFiles){try{await regular(root,path);selected.add(path);queue.push(path);}catch(error){if(error.code!=='ENOENT')throw error;}}
 while(queue.length){
  const path=queue.shift(),bytes=await readFile(await regular(root,path));
  if(!/\.(?:html|txt|js|css)$/.test(path))continue;
  const text=bytes.toString('utf8');if(denied.test(text))throw new Error('Forbidden environment or credential literal in selected static assets.');
  for(const ref of collectReferences(text)){
   const name=ref.startsWith('/')?ref.slice(1):ref.startsWith('_next/')?ref:relative(root,resolve(dirname(join(root,path)),ref));
   if(!safePackagePath(name)||!safeAssetExtension.test(name)||(!name.startsWith('_next/static/')&&!/^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:png|jpe?g|webp|avif|svg|ico)$/i.test(name)))fail();
   await regular(root,name);
   if(!selected.has(name)){selected.add(name);queue.push(name);}
  }
 }
 return [...selected].sort();
}
export function memberPackageHeaders(html,{authEnabled=false}={}){
 if(typeof authEnabled!=='boolean')fail();
 const hashes=[];
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc\s*=/i.test(match[1]))hashes.push("'sha256-"+createHash('sha256').update(match[2]).digest('base64')+"'");
 const csp="default-src 'none'; script-src 'self' "+[...new Set(hashes)].join(' ')+"; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action "+(authEnabled?"'self'":"'none'")+"; frame-ancestors 'none'; worker-src 'none'";
 return `/*\n  Cache-Control: private, no-store\n  CDN-Cache-Control: no-store\n  Netlify-CDN-Cache-Control: no-store\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  X-Robots-Tag: noindex, nofollow\n  Content-Security-Policy: ${csp}\n`;
}
export const memberPackageRedirects=()=>'/ /my-lockliel/review 302\n/my-lockliel/review /my-lockliel/review.html 200\n/api/* /404.html 404\n/.netlify/functions/* /404.html 404\n';
export const memberPackageConfig=()=>`[build]\npublish = "public"\nfunctions = "functions"\n\n[[redirects]]\nfrom = "/"\nto = "/my-lockliel/review"\nstatus = 302\n\n[[redirects]]\nfrom = "/my-lockliel/review"\nto = "/my-lockliel/review.html"\nstatus = 200\n\n[[redirects]]\nfrom = "/api/*"\nto = "/404.html"\nstatus = 404\n\n[[redirects]]\nfrom = "/.netlify/functions/*"\nto = "/404.html"\nstatus = 404\n`;
async function toolchain(toolchainRoot){
 if(typeof toolchainRoot!=='string'||!isAbsolute(toolchainRoot))throw new Error('Explicit installed official toolchain is required.');
 const root=await realpath(toolchainRoot),zisiRoot=join(root,'@netlify/zip-it-and-ship-it'),apiRoot=join(root,'@netlify/serverless-functions-api');
 const zisiPackage=JSON.parse(await readFile(join(zisiRoot,'package.json'),'utf8')),apiPackage=JSON.parse(await readFile(join(apiRoot,'package.json'),'utf8'));
 if(zisiPackage.name!=='@netlify/zip-it-and-ship-it'||zisiPackage.version!=='16.3.0'||apiPackage.name!=='@netlify/serverless-functions-api'||apiPackage.version!=='2.24.0')throw new Error('Reviewed official toolchain versions are required.');
 const zisiPath=join(zisiRoot,'dist/main.js'),apiPath=join(apiRoot,'dist/index.js');
 const zisi=await import(pathToFileURL(zisiPath).href),api=await import(pathToFileURL(apiPath).href);
 return {zipFunctions:zisi.zipFunctions,descriptor:{zisi:zisiPackage.version,bootstrap:apiPackage.version,bootstrapSha256:digest(await readFile(api.getPath())),zisiEntrySha256:digest(await readFile(zisiPath)),bootstrapEntrySha256:digest(await readFile(apiPath)),esbuild:esbuildVersion}};
}
async function newOutput(outputRoot,sourceRoot){
 if(typeof outputRoot!=='string'||!isAbsolute(outputRoot))fail();
 const parent=await realpath(dirname(outputRoot)),target=join(parent,outputRoot.split('/').at(-1));
 const temporary=[await realpath('/private/tmp'),await realpath(tmpdir())];
 if(!temporary.some(root=>isWithin(root,parent))||isWithin(sourceRoot,target))throw new Error('Output must be a new private temporary directory outside the source repository.');
 try{await lstat(target);throw new Error('Package output already exists.');}catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(target,{mode:0o700});return target;
}
async function allFiles(root,prefix=''){
 const files=[];for(const name of (await readdir(join(root,prefix))).sort()){const path=prefix?prefix+'/'+name:name,stat=await lstat(join(root,path));if(stat.isSymbolicLink())fail();if(stat.isDirectory())files.push(...await allFiles(root,path));else if(stat.isFile())files.push(path);else fail();}return files;
}
/** No network, install, credential input, environment mutation, deploy or Git mutation. */
export async function buildMemberHostedPackage({sourceRoot,buildRoot,outputRoot,pin:pinValue,toolchainRoot,localFixture=false,enabled=false,authEnabled=false}={}){
 const pin=validateHostedPin(pinValue);if(!pin||typeof localFixture!=='boolean'||typeof enabled!=='boolean'||typeof authEnabled!=='boolean'||authEnabled&&!enabled)fail();
 const root=await realpath(sourceRoot),identity=await sourceIdentity(root,pin,localFixture);
 const staticRoot=await realpath(buildRoot),staticFiles=await planMemberStaticFiles(staticRoot,pin,{authEnabled}),official=await toolchain(toolchainRoot);
 const output=await newOutput(outputRoot,root),scratch=await mkdtemp(join(tmpdir(),'lockliel-member-package-build-'));
 try{
  for(const path of staticFiles){const destination=join(output,'public',path);await mkdir(dirname(destination),{recursive:true});await copyFile(await regular(staticRoot,path),destination);}
  const html=await readFile(join(output,'public',HTML),'utf8');
  await writeFile(join(output,'public/_headers'),memberPackageHeaders(html,{authEnabled}),{mode:0o600});
  await writeFile(join(output,'public/_redirects'),memberPackageRedirects(),{mode:0o600});
  await writeFile(join(output,'public/404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Unavailable</title><h1>This isolated route is unavailable.</h1></html>\n',{mode:0o600});
  await writeFile(join(output,'netlify.toml'),memberPackageConfig(),{mode:0o600});
  const runtimePath=await regular(root,'netlify/member-hosted/runtime.mjs');
  const definitions=[{name:FUNCTION_NAME,factory:'createHostedMemberRead',path:HOSTED_READ_PATH,method:'GET'},...(authEnabled?[{name:'lockliel-login',factory:'createHostedLogin',path:HOSTED_LOGIN_PATH,method:'POST'},{name:'lockliel-logout',factory:'createHostedLogout',path:HOSTED_LOGOUT_PATH,method:'POST'}]:[])];
  const sourceInputs={},compiledHashes={};
  await mkdir(join(output,'artifacts'));
  for(const definition of definitions){
   const sourcefile=`member-hosted-entry-${definition.name}.mjs`;
   const entry=`import {${definition.factory}} from ${JSON.stringify(runtimePath)};\nconst pin=${JSON.stringify(pin)};\nconst handler=${definition.factory}({pin,runtimeSource:${JSON.stringify(pin.binding.source)},enabled:${enabled===true},${definition.method==='POST'?'authEnabled:true,':''}keyReader:name=>globalThis.Netlify?.env?.get(name),fetchImpl:(...args)=>globalThis.fetch(...args)});\nexport default handler;\nexport const config={path:${JSON.stringify(definition.path)},method:${JSON.stringify(definition.method)}${definition.method==='POST'?',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:["ip"]}':''}};\n`;
   const compiled=await build({stdin:{contents:entry,resolveDir:root,sourcefile,loader:'js'},bundle:true,write:false,format:'esm',platform:'node',target:'node24',treeShaking:true,metafile:true,logLevel:'silent',plugins:[{name:'isolated-config-only',setup(api){api.onResolve({filter:/backend-config\.mjs$/},()=>({path:'isolated-backend-config',namespace:'member-isolated'}));api.onLoad({filter:/.*/,namespace:'member-isolated'},()=>({contents:`export const backendConfig=Object.freeze({mode:'isolated-member-read',url:'https://qjksggxorghaxvpyslip.supabase.co',key:undefined,origin:${JSON.stringify(pin.origin)}});`,loader:'js'}));}}]});
   const code=compiled.outputFiles[0].text;
   if(denied.test(code)||/service_role/.test(code)||definition.method==='GET'&&/\/auth\/v1\/token|\/auth\/v1\/logout|\/api\/lockliel-auth\//.test(code))throw new Error('Forbidden Auth, credential or production code in compiled member artifact.');
   for(const name of Object.keys(compiled.metafile.inputs)){
    if(name.startsWith('member-isolated:')||name===sourcefile)continue;
    const absolute=resolve(root,name);if(!isWithin(root,absolute))fail();const path=relative(root,absolute);sourceInputs[path]=digest(await readFile(await regular(root,path)));
    if(!localFixture){const committed=await git(root,['rev-parse',`HEAD:${path}`]);const current=await git(root,['hash-object','--',path]);if(committed!==current)throw new Error('Compiled input differs from the committed source.');}
   }
   compiledHashes[definition.name]=digest(Buffer.from(code));
   await writeFile(join(output,`artifacts/${definition.name}.mjs`),code,{mode:0o600});
   await writeFile(join(scratch,`${definition.name}.mjs`),code,{mode:0o600});
  }
  const results=await official.zipFunctions(scratch,join(output,'functions'),{archiveFormat:'zip',basePath:scratch,repositoryRoot:scratch,config:{'*':{nodeBundler:'none',nodeVersion:'24.x',nodeSourcemap:false}},configFileDirectories:[],featureFlags:{zisi_add_instrumentation_loader:false},parallelLimit:1});
  if(results.length!==definitions.length)throw new Error('Exact official function inventory is required.');
  await rm(join(output,'functions/manifest.json'),{force:true});
  const functions=[];
  for(const definition of definitions){
   const result=results.find(item=>item.name===definition.name);
   if(!result||result.runtimeAPIVersion!==2||result.bootstrapVersion!=='2.24.0'||result.routes?.length!==1||result.routes[0].pattern!==definition.path||result.routes[0].literal!==definition.path||JSON.stringify(result.routes[0].methods)!==JSON.stringify([definition.method]))throw new Error('Official v2 runtime metadata does not match the reviewed route.');
   const zipPath=join(output,`functions/${definition.name}.zip`);
   if(resolve(result.path)!==zipPath)fail();
   const listing=(await exec('/usr/bin/unzip',['-Z1',zipPath],{maxBuffer:2*1024*1024})).stdout.trim().split('\n').sort();
   const expectedZipEntries=['___netlify-bootstrap.mjs','___netlify-entry-point.mjs','___netlify-metadata.json',`${definition.name}.mjs`].sort();
   if(listing.some(name=>!safePackagePath(name))||JSON.stringify(listing)!==JSON.stringify(expectedZipEntries))throw new Error('Unexpected official ZIP entry.');
   const metadata=JSON.parse((await exec('/usr/bin/unzip',['-p',zipPath,'___netlify-metadata.json'],{maxBuffer:1024*1024})).stdout);
   if(metadata.bootstrap_version!=='2.24.0'||metadata.version!==1)fail();
   const readZipEntry=async name=>(await exec('/usr/bin/unzip',['-p',zipPath,name],{maxBuffer:4*1024*1024,encoding:'buffer'})).stdout;
   if(digest(await readZipEntry(`${definition.name}.mjs`))!==compiledHashes[definition.name]||digest(await readZipEntry('___netlify-bootstrap.mjs'))!==official.descriptor.bootstrapSha256)throw new Error('Official archive does not preserve the exact compiled and bootstrap bytes.');
   const functionMetadata={name:definition.name,runtime:result.runtime,runtimeAPIVersion:result.runtimeAPIVersion,bootstrapVersion:result.bootstrapVersion,runtimeVersion:result.runtimeVersion,routes:result.routes,zipEntries:listing};
   await writeFile(join(output,authEnabled?`artifacts/official-${definition.name}-metadata.json`:'artifacts/official-function-metadata.json'),JSON.stringify(functionMetadata,null,2)+'\n',{mode:0o600});
   functions.push({name:definition.name,path:`functions/${definition.name}.zip`,compiled:`artifacts/${definition.name}.mjs`,runtimeAPIVersion:2,bootstrapVersion:result.bootstrapVersion,routes:result.routes});
  }
  const files={};for(const path of await allFiles(output)){const bytes=await readFile(join(output,path));files[path]={sha256:digest(bytes),sha1:digest(bytes,'sha1'),size:bytes.length};}
  const manifest={version:authEnabled?AUTH_PACKAGE_VERSION:PACKAGE_VERSION,pin,localFixture,enabled,...(authEnabled?{authEnabled:true}:{}),source:{...identity,inputs:sourceInputs},files,...(authEnabled?{functions}:{function:functions[0]}),toolchain:official.descriptor,byteDomains:{source:'Git HEAD tree plus explicitly hashed compiled input bytes',compiled:authEnabled?'artifacts/{function-name}.mjs SHA256':'artifacts/lockliel-member-read.mjs SHA256',archive:authEnabled?'functions/{function-name}.zip SHA256':'functions/lockliel-member-read.zip SHA256',static:'public/ file SHA256 and SHA1',provider:'UNVERIFIED: provider digests may use a different byte domain'},hostedAcceptance:'NOT EXECUTED',releaseEligible:!localFixture&&enabled};
  await writeFile(join(output,'member-hosted-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
  return {manifest,path:output};
 }catch(error){await rm(output,{recursive:true,force:true});throw error;}
 finally{await rm(scratch,{recursive:true,force:true});}
}
