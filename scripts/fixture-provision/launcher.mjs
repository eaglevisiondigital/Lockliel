/** Local package verification only. No live input or execution mode installed. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const need=(v)=>{if(!v)throw new Error('LOCAL_PACKAGE_BLOCKED');};
const exact=(v,k)=>need(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===k.length&&k.every(x=>Object.hasOwn(v,x)));
const IDENTITY=Object.freeze({project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',applicationSource:'327ba098628f70aa65140862b8b14cd709bfd711'});
const ROOT=dirname(fileURLToPath(import.meta.url));
const NODE='/opt/homebrew/opt/node@24/bin/node';
const NODE_HASH='c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd';
const MODULES=['contracts.mjs','durable-ledger.mjs','protected-input.mjs','transport.mjs','workflow.mjs'];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function regular(path){const s=fs.lstatSync(path);need(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1&&s.size>0&&s.size<=131072,'SOURCE_MISMATCH');return fs.readFileSync(path);}
export function verifyLocalFixturePackage(...args){
 need(args.length===0,'SOURCE_MISMATCH');need(fs.realpathSync(process.execPath)===fs.realpathSync(NODE)&&hash(fs.readFileSync(NODE))===NODE_HASH,'SOURCE_MISMATCH');
 const source=JSON.parse(regular(join(ROOT,'source-manifest.json')).toString('utf8'));
 exact(source,['version','project','branch','applicationSource','liveExecutionEnabled','files']);
 need(source.version==='fixture-local-package-v1'&&source.project===IDENTITY.project&&source.branch===IDENTITY.branch&&source.applicationSource===IDENTITY.applicationSource&&source.liveExecutionEnabled===false,'SOURCE_MISMATCH');
 exact(source.files,MODULES);for(const name of MODULES)need(/^[a-f0-9]{64}$/.test(source.files[name])&&hash(regular(join(ROOT,name)))===source.files[name],'SOURCE_MISMATCH');
 return Object.freeze({ok:true,sourceVerified:true,files:MODULES.length,project:IDENTITY.project,applicationSource:IDENTITY.applicationSource,liveExecutionEnabled:false,inputRequests:0,networkRequests:0,readiness:'INCOMPLETE_LIVE_ACQUISITION'});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{need(process.argv.length===3&&process.argv[2]==='--offline-verify','AUTHORITY_MISSING');const result=verifyLocalFixturePackage();process.stdout.write(JSON.stringify(result)+'\n');}
 catch{process.stdout.write('{"ok":false,"category":"LOCAL_PACKAGE_BLOCKED","liveExecutionEnabled":false}\n');process.exitCode=1;}
}
