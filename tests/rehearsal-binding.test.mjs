import test from 'node:test';
import assert from 'node:assert/strict';
import {withConfiguredBackend,withProductionBackend} from '../netlify/lib/deployment-safety.mjs';
import {connectionURL} from '../scripts/course-release/runner.mjs';
const binding={mode:'isolated-course-rehearsal',site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',url:'https://qjksggxorghaxvpyslip.supabase.co',origin:'https://rehearsal--jade-unicorn-642f40.netlify.app',key:'sb_publishable_synthetic'};
const context={site:{id:binding.site},deploy:{context:'branch-deploy'}};
test('isolated binding requires exact trusted site, context and backend without weakening ordinary previews',async()=>{
 let calls=0;const handler=()=>{calls++;return Response.json({ok:true});};
 const req=new Request(binding.origin,{headers:{'X-Netlify-Context':'production','X-Netlify-Site-Id':binding.site}});
 for(const c of [undefined,{}, {site:{id:'other'},deploy:{context:'branch-deploy'}},...['production','deploy-preview','dev'].map(v=>({site:context.site,deploy:{context:v}}))])assert.equal((await withConfiguredBackend(handler,binding)(req,c)).status,503);
 for(const bad of [{url:'https://bsndfhbemstyrrglajat.supabase.co'},{site:'other'},{origin:'https://lockliel.com'},{key:'secret'},{mode:'unknown'}])assert.equal((await withConfiguredBackend(handler,{...binding,...bad})(req,context)).status,503);
 assert.equal((await withProductionBackend(handler)(req,context)).status,503);assert.equal(calls,0);
 assert.equal((await withConfiguredBackend(handler,binding)(req,context)).status,200);assert.equal(calls,1);
});
test('staged rehearsal accepts only its exact direct branch endpoint with verify-full safeguards',()=>{
 const c={host:'db.qjksggxorghaxvpyslip.supabase.co',ca:'/synthetic/ca.pem'};
 const url=new URL(connectionURL(c,true));assert.equal(url.hostname,c.host);assert.equal(url.searchParams.get('sslmode'),'verify-full');assert.match(url.searchParams.get('options'),/default_transaction_read_only=on/);
 for(const host of ['aws-0-us-east-1.pooler.supabase.com','db.jxtgtfffdiwzxocxoqxk.supabase.co','db.other.supabase.co'])assert.throws(()=>connectionURL({...c,host},true),/Direct endpoint only/);
});
