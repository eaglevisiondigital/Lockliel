import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {guidedAsset,safeSharePath,shareLanes} from '../netlify/lib/share-guidance.mjs';
import {matchesShareSelection} from '../lib/share-selection.mjs';
import redirectGuarded,{createReferralRedirectHandler} from '../netlify/functions/lockliel-referral-redirect.mjs';
import signupGuarded,{createSignupHandler} from '../netlify/functions/lockliel-signup.mjs';
import shareGuarded,{createShareLinkHandler} from '../netlify/functions/lockliel-share-link.mjs';
const definition=JSON.parse(readFileSync(new URL('../content/share-library/getting-a-grip.json',import.meta.url)));
const {asset}=definition;
const html=readFileSync(new URL('../out/getting-a-grip.html',import.meta.url),'utf8');
const uid='10000000-0000-4000-8000-000000000001',person='20000000-0000-4000-8000-000000000001';
test('approved canonical manifest is exact and pending release',()=>{
 assert.equal(definition.release_status,'APPROVED FOR FUTURE RELEASE / NOT YET ACTIVE IN PRODUCTION');
 assert.deepEqual(asset,{slug:'getting-a-grip-on-the-basics',title:'Getting a Grip on the Basics',asset_type:'course',category:'biblical-foundations',destination_path:'/getting-a-grip',language_code:'en',translation_key:'getting-a-grip-on-the-basics',featured:true,sort_order:10,description:'A simple, Scripture-based 13-lesson course designed to help you build a strong biblical foundation and take practical next steps in your walk with God.',share_text:'I thought of you and wanted to send you this. Getting a Grip on the Basics is a 13-lesson Lockliel course that walks through foundational biblical truths one step at a time. I’d love for you to check it out.'});
 assert.equal(safeSharePath(asset.destination_path),asset.destination_path);
});
test('static invitation renders approved content and exact account links',()=>{
 assert(html.includes(asset.title));assert(html.includes(asset.description));
 assert.match(html,/<a[^>]*href="\/my-lockliel\/sign-up"[^>]*>Start Getting a Grip<\/a>/);
 assert.match(html,/<a[^>]*href="\/my-lockliel\/sign-in"[^>]*>Already have an account\? Sign in<\/a>/);
 assert.match(html,/Continue through My Lockliel/);
});
test('invitation has no private resources, identity, forms or unsupported copy',()=>{
 assert.doesNotMatch(html,/<form\b|<iframe\b|<video\b|storage\/v1|lesson-assets|\.pdf\b|private_notes|linked_profile_id|access_token|recipient_name|original_inviter|\bfree\b|—/i);
});
test('existing three relevant lanes and invitation filter include course without new taxonomy',()=>{
 const guided=guidedAsset(asset);assert.equal(shareLanes.length,10);assert.deepEqual(guided.lanes,['new-faith','bible','discipleship']);
 for(const lane of guided.lanes)assert(matchesShareSelection(guided,lane,'invitation'));
 assert.equal(matchesShareSelection(guided,'healing','invitation'),false);
 assert.equal(matchesShareSelection({...guided,asset_type:'book'},'','invitation'),false);
 assert(matchesShareSelection(guided));
});
for(const scoped of [false,true])test(`Getting a Grip ${scoped?'My Five':'generic'} preparation preserves privacy and is not sending`,async()=>{
 const calls=[];
 const handler=createShareLinkHandler({sessionFor:async()=>({user:{id:uid},access:'synthetic'}),fetcher:async(url,options={})=>{
  const uri=new URL(url),table=uri.pathname.split('/').at(-1);calls.push({uri,table,options});
  if(table==='reach_contacts'){assert.equal(uri.searchParams.get('owner_id'),'eq.'+uid);return Response.json([{id:person,display_name:'Synthetic recipient',status:'praying',linked_profile_id:null}]);}
  if(table==='share_assets'){assert.equal(uri.searchParams.get('status'),'eq.active');return Response.json([{...asset,id:'asset'}]);}
  if(table==='referral_links')return Response.json(options.method==='POST'?[{id:'link'}]:[]);
  if(table==='referral_events')return Response.json([]);
  throw Error('Unexpected read');
 }});
 const response=await handler(new Request('https://example.invalid/api/lockliel/share-link',{method:'POST',body:JSON.stringify({slug:asset.slug,channel:'copy',reachContactId:scoped?person:null})}));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.shareText,asset.share_text);assert.match(data.url,/^https:\/\/example.invalid\/r\/[a-z0-9]{10}$/);
 assert(!data.url.includes(person));assert(!data.url.includes('Synthetic'));
 const writes=calls.filter(c=>c.options.method==='POST');assert.deepEqual(writes.map(c=>c.table),['referral_links','referral_events']);
 const link=JSON.parse(writes[0].options.body);assert.equal(link.destination_path,'/getting-a-grip');assert.equal(link.reach_contact_id,scoped?person:null);assert.equal(link.owner_id,uid);
 assert.equal(JSON.parse(writes[1].options.body).event_type,'share_initiated');assert(!calls.some(c=>c.options.method==='PATCH'));
});
test('whole-site HttpOnly referral cookie survives invitation to plain signup link',async()=>{
 const redirect=createReferralRedirectHandler({fetcher:async(url,options)=>{assert.equal(JSON.parse(options.body).code,'grip123456');return Response.json({destination:'/getting-a-grip'});}});
 const response=await redirect(new Request('https://example.invalid/r/grip123456?code=grip123456'));
 assert.equal(response.headers.get('location'),'/getting-a-grip?ref=grip123456');
 const ref=response.headers.getSetCookie().find(c=>c.startsWith('lockliel_ref='));assert.match(ref,/Path=\//);assert.match(ref,/HttpOnly/);assert.match(ref,/SameSite=Lax/);
 let payload;
 const signup=createSignupHandler({fetcher:async(url,options)=>{payload=JSON.parse(options.body);return Response.json({user:{id:'synthetic'}});}});
 const result=await signup(new Request('https://example.invalid/api/lockliel-auth/signup',{method:'POST',headers:{Cookie:ref.split(';')[0]},body:JSON.stringify({firstName:'Synthetic',lastName:'Member',email:'synthetic@example.invalid',password:'synthetic-only-password',referralCode:'',original_inviter_id:'forged'})}));
 assert.equal(result.status,200);assert.equal(payload.data.referral_code,'grip123456');assert(!('original_inviter_id' in payload.data));assert.equal((await result.json()).needsConfirmation,true);
});
test('invalid referral falls back and malformed signup never calls auth',async()=>{
 const fetcher=()=>{throw Error('Must not fetch');};
 assert.equal((await createReferralRedirectHandler({fetcher})(new Request('https://example.invalid/?code=bad'))).headers.get('location'),'/my-lockliel/sign-up');
 assert.equal((await createSignupHandler({fetcher})(new Request('https://example.invalid/',{method:'POST',body:'{}'}))).status,400);
});
test('all relevant default handlers fail closed in preview and unknown contexts',async()=>{
 for(const handler of [redirectGuarded,signupGuarded,shareGuarded])for(const context of [undefined,{deploy:{context:'deploy-preview'}}]){
  const response=await handler(new Request('https://example.invalid/',{method:'POST',body:'{}'}),context);assert.equal(response.status,503);assert.equal((await response.json()).code,'production_backend_disabled');
 }
});
