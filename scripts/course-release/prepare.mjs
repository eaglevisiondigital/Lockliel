// New five-stage package. No historical release-runner import or live transport.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,lstatSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
export const repo=resolve(import.meta.dirname,'../..');
export const manifest=JSON.parse(readFileSync(join(repo,'supabase/verification/course-release-279/manifest.json')));
export const hashes={...JSON.parse(readFileSync(join(repo,manifest.historical_manifest))),...Object.fromEntries(manifest.migrations.map(m=>[m.filename,m.sha256]))};
export const digest=b=>createHash('sha256').update(b).digest('hex');
export const config='project_id = "lockliel-course-release"\n[db.migrations]\nenabled = true\n[db.seed]\nenabled = false\n';
const regular=p=>assert(lstatSync(p).isFile()&&!lstatSync(p).isSymbolicLink(),'Expected regular file: '+p);
const directory=p=>assert(lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink(),'Expected directory: '+p);
export function verifySource({git=true}={}){
 const files=readdirSync(join(repo,'supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 assert.equal(files.length,279);assert.deepEqual(files,Object.keys(hashes).sort());
 for(const f of files){const path=join(repo,'supabase/migrations',f);regular(path);assert.equal(digest(readFileSync(path)),hashes[f],'Migration bytes: '+f);
 if(git)assert.equal(digest(execFileSync('git',['show',manifest.source_commit+':supabase/migrations/'+f],{cwd:repo})),hashes[f],'Source commit mismatch');}
 return files;
}
export function prepare(root){
 root=resolve(root);assert(root!==repo&&!root.startsWith(repo+sep),'Use a new directory outside repository');
 const files=verifySource();mkdirSync(root,{mode:0o700});
 for(const n of [275,276,277,278,279]){const d=join(root,String(n),'supabase');mkdirSync(join(d,'migrations'),{recursive:true,mode:0o700});writeFileSync(join(d,'config.toml'),config);
 for(const f of files.slice(0,n))copyFileSync(join(repo,'supabase/migrations',f),join(d,'migrations',f));}
 writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');verifyPrepared(root);return root;
}
export function verifyPrepared(root){
 const files=verifySource({git:false});directory(root);assert.deepEqual(readdirSync(root).sort(),['275','276','277','278','279','manifest.json']);regular(join(root,'manifest.json'));assert.deepEqual(JSON.parse(readFileSync(join(root,'manifest.json'))),manifest);
 for(const n of [275,276,277,278,279]){const stage=join(root,String(n)),d=join(stage,'supabase');directory(stage);assert.deepEqual(readdirSync(stage),['supabase']);directory(d);
 const entries=readdirSync(d).sort();assert.deepEqual(entries,entries.includes('.temp')?['.temp','config.toml','migrations']:['config.toml','migrations']);
 if(entries.includes('.temp')){const c=join(d,'.temp');directory(c);assert.deepEqual(readdirSync(c),['cli-latest']);regular(join(c,'cli-latest'));}
 regular(join(d,'config.toml'));assert.equal(readFileSync(join(d,'config.toml'),'utf8'),config);directory(join(d,'migrations'));assert.deepEqual(readdirSync(join(d,'migrations')).sort(),files.slice(0,n));
 for(const f of files.slice(0,n)){const p=join(d,'migrations',f);regular(p);assert.equal(digest(readFileSync(p)),hashes[f]);}}
 return true;
}
export function verifyBinary(binary){regular(binary);assert.equal(digest(readFileSync(binary)),manifest.cli_sha256);return true;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);console.log(prepare(process.argv[2]));}
