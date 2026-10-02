import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
const root='/private/tmp/lockliel-isolated-runtime';
const id=JSON.parse(await readFile(root+'/identity.json','utf8'));
assert.equal(id.site,'60579b8e-d0ca-4ac1-abe5-7128f4243e8b');
assert.equal(id.ref,'jxtgtfffdiwzxocxoqxk');
for(const file of await readdir(root+'/functions')){
 const source=await readFile(root+'/functions/'+file,'utf8');
 assert.doesNotMatch(source,/bsndfhbemstyrrglajat|sb_publishable_NSyTQx|https:\/\/lockliel\.com|@netlify\/blobs|service_role/);
 if(file==='lockliel-login.mjs')assert.match(source,/const secure = true;/,'HTTPS acceptance cookies must always be Secure');
}
let calls=0;
globalThis.fetch=async(input,options)=>{calls++;assert.equal(new URL(input).origin,'https://'+id.ref+'.supabase.co');assert.equal(options.redirect,'error');return Response.json({error:'Synthetic unauthorized response'},{status:401});};
const {default:handler}=await import(root+'/functions/lockliel-session.mjs');
const request=new Request(id.origin+'/api/lockliel-auth/session',{headers:{cookie:'lockliel_access=synthetic', 'x-nf-site-id':id.site,'x-nf-deploy-context':'production'}});
for(const context of [{},{site:{id:'3096b319-3068-45ab-9837-ba0cce59d50f'},deploy:{context:'dev'}},{site:{id:id.site},deploy:{context:'production'}}])assert.equal((await handler(request,context)).status,503);
assert.equal(calls,0);
const r=await handler(request,{site:{id:id.site},deploy:{context:'dev'}});
assert.equal(r.headers.get('X-Lockliel-Environment'),'isolated-course-acceptance');
assert.equal(calls,1);
for(const url of ['https://bsndfhbemstyrrglajat.supabase.co/rest/v1/profiles','https://lockliel.com/api/lockliel/journey','https://api.resend.com/emails','https://example.invalid'])assert.throws(()=>fetch(url),/outbound request denied/);
console.log('PASS isolated artifact: exact site/project, production context denied, forged headers denied, production/SMTP/other outbound denied, redirects rejected, no production credential or Blobs dependency');
