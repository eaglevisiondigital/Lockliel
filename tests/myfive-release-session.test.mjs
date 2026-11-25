import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const data=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const rawCore=await readFile(new URL('../netlify/lib/lockliel-core.mjs',import.meta.url),'utf8');
const core=data(rawCore.replace("import {backendConfig} from './backend-config.mjs';","const backendConfig={url:'https://synthetic.invalid',key:'synthetic-public-placeholder',origin:'https://synthetic.invalid',mode:'local-test'};"));
const pagination=data(await readFile(new URL('../netlify/lib/my-five-pagination.mjs',import.meta.url),'utf8'));
const guard=data('export const withProductionBackend=fn=>fn;');
const rawHandler=await readFile(new URL('../netlify/functions/lockliel-connections.mjs',import.meta.url),'utf8');
const handler=(await import(data(rawHandler.replace('../lib/my-five-pagination.mjs',pagination).replace('../lib/deployment-safety.mjs',guard).replace('../lib/lockliel-core.mjs',core)))).default;
const uid='11111111-1111-4111-8111-111111111111';
async function run({cookie='lockliel_access=synthetic-access',active=false,auth=true,refresh=false,method='GET'}){
 const calls=[];const original=globalThis.fetch;
 globalThis.fetch=async(url)=>{const parsed=new URL(url);assert.equal(parsed.origin,'https://synthetic.invalid');calls.push(parsed.pathname);if(parsed.pathname==='/auth/v1/user')return Response.json(auth?{id:uid}:{},{status:auth?200:401});if(parsed.pathname==='/auth/v1/token')return Response.json(refresh?{access_token:'synthetic-new',refresh_token:'synthetic-refresh'}:{},{status:refresh?200:401});if(parsed.pathname==='/rest/v1/rpc/lockliel_current_session_active'){if(active==='error')throw Error('synthetic transport failure');if(active==='unavailable')return Response.json({}, {status:503});return Response.json(active);}throw Error('Unexpected downstream request: '+parsed.pathname);};
 try{const response=await handler(new Request('https://synthetic.invalid/api/connections?view=reach',{method,headers:{cookie},...(method==='POST'?{body:JSON.stringify({action:'addReach',name:'Synthetic'})}:{})}));return{response,calls};}finally{globalThis.fetch=original;}
}
for(const [label,active]of [['revoked',false],['ambiguous','true'],['unavailable','unavailable'],['transport failure','error']])test(`actual canonical guard denies ${label} session before relationship queries`,async()=>{const {response,calls}=await run({active});assert.equal(response.status,401);assert.deepEqual(calls,['/auth/v1/user','/rest/v1/rpc/lockliel_current_session_active']);});
test('anonymous request never reaches provider or relationship query',async()=>{const {response,calls}=await run({cookie:''});assert.equal(response.status,401);assert.deepEqual(calls,[]);});
test('expired access and rejected refresh deny relationship read',async()=>{const {response,calls}=await run({auth:false,cookie:'lockliel_access=synthetic-expired; lockliel_refresh=synthetic-refresh'});assert.equal(response.status,401);assert.deepEqual(calls,['/auth/v1/user','/auth/v1/token']);});
test('new access returned by refresh still requires active-session validation',async()=>{const {response,calls}=await run({active:false,refresh:true,cookie:'lockliel_access=synthetic-access; lockliel_refresh=synthetic-refresh'});assert.equal(response.status,401);assert.deepEqual(calls,['/auth/v1/user','/rest/v1/rpc/lockliel_current_session_active','/auth/v1/token','/auth/v1/user','/rest/v1/rpc/lockliel_current_session_active']);});
test('revoked session denies mutation before flag/read/write operations',async()=>{const {response,calls}=await run({method:'POST'});assert.equal(response.status,401);assert.equal(calls.some(p=>!p.startsWith('/auth/')&&!p.endsWith('lockliel_current_session_active')),false);});
