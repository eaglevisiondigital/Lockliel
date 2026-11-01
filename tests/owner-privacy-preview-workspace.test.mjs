import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const require=createRequire(import.meta.url),root=fileURLToPath(new URL('../',import.meta.url));
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{build}=require('esbuild');
const result=await build({entryPoints:[resolve(root,'components/owner-privacy-preview/owner-privacy-workspace.tsx')],bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',packages:'external',plugins:[{name:'privacy-ssr-css',setup(api){api.onLoad({filter:/\.module\.css$/},()=>({contents:'export default {}',loader:'js'}));}}],logLevel:'silent'});
const bundled={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(require,bundled,bundled.exports);
const {OwnerPrivacyWorkspace}=bundled.exports;
const context=(change={})=>({schemaVersion:'lockliel-synthetic-v1',mode:'synthetic',organizationId:'synthetic-lockliel',actorId:'synthetic-a',aal:1,sessionActive:true,grants:['member:read'],...change});
const render=(change={})=>renderToStaticMarkup(React.createElement(OwnerPrivacyWorkspace,{context:context(),boundaryKey:'privacy-visit',idPrefix:'privacy-test',...change}));
test('actual module is a labelled h2 region without a second application shell',()=>{const html=render();assert.match(html,/<section[^>]*aria-labelledby="privacy-test-title"/);assert.match(html,/<h2[^>]*id="privacy-test-title"/);for(const tag of ['main','header','nav','h1'])assert.doesNotMatch(html,new RegExp('<'+tag+'(?:\\s|>)'));});
test('all eight areas are rendered and each distinguishes live Unknown from a local sample',()=>{
 const html=render(),cards=[...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(m=>m[0]);assert.equal(cards.length,8);for(const card of cards){assert.ok(card.includes('Current live status'));assert.match(card,/<dd>Unknown<\/dd>/);}
 for(const title of ['Profile photo','Faith Banner','Prayer Board','Personal growth','Scripture Anchors','My Five relationships','Sharing consent','Communication preferences'])assert.ok(html.includes(title),title);
 assert.ok(html.includes('Current live settings: Unknown'));assert.ok(html.includes('never a verified live privacy state'));
});
test('default real-component controls have private/no-consent/no-channel choices selected',()=>{
 const html=render();assert.equal((html.match(/value="private" selected=""/g)||[]).length,2);assert.match(html,/value="not-given" selected=""/);assert.match(html,/value="not-connected" selected=""/);assert.ok(html.includes('Private starting point'));
});
test('each optional what-if control has explicit purpose and help text rather than an activation button',()=>{
 const html=render();for(const id of ['photo','faithBanner','sharing','communications']){assert.ok(html.includes(`privacy-test-${id}-`));assert.ok(html.includes(`privacy-test-${id}-help`));}
 assert.ok(html.includes('No real subscription, unsubscribe choice, email, text or in-app preference changes.'));assert.ok(html.includes('This never accepts, creates or changes consent'));
 assert.doesNotMatch(html,/>Save(?: settings)?<|>Grant|>Enable messages|>Upload|>Export|>Delete/);
});
for(const [name,ctx] of [['unknown',null],['B invalid ownership marker',context({actorId:'synthetic-c'})],['other org',context({organizationId:'synthetic-champion-life'})],['lost grant',context({grants:[]})],['inactive',context({sessionActive:false})]])test('actual '+name+' context reveals no privacy details or controls',()=>{const html=render({context:ctx});assert.ok(html.includes('Owner privacy review unavailable'));assert.doesNotMatch(html,/<article|<select|<button|<input|<textarea/);assert.ok(!html.includes('My Five relationships'));});
test('invalid host boundary never mounts private local controls',()=>{const html=render({boundaryKey:''});assert.ok(html.includes('Owner privacy review unavailable'));assert.doesNotMatch(html,/<select|<button/);});
test('separate module instances have unique IDs and no actor names in displayed content',()=>{
 const html=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(OwnerPrivacyWorkspace,{context:context(),boundaryKey:'a'}),React.createElement(OwnerPrivacyWorkspace,{context:context({actorId:'synthetic-b'}),boundaryKey:'b'})));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);assert.doesNotMatch(html,/synthetic-a|synthetic-b|ownerId/);
});
test('actual markup has honest sample controls and no native submission or destination',()=>{
 const html=render();for(const label of ['Ready sample','Loading sample','Empty sample','Unavailable sample','Reset local ideas'])assert.ok(html.includes(label));assert.doesNotMatch(html,/<form|<a(?:\s|>)|<img|href=|src=|mailto:|https?:/);
});
test('scoped source has no persistence, secret, transport, raw private-content sink or live operations',()=>{
 for(const name of ['components/owner-privacy-preview/owner-privacy-workspace.tsx','lib/owner-privacy-preview/model.ts']){const source=readFileSync(resolve(root,name),'utf8');assert.doesNotMatch(source,/fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|document\.cookie|sendBeacon|clipboard|dangerouslySetInnerHTML|access_token|SUPABASE_KEY/);assert.doesNotMatch(source,/from ['"][^'"]*(?:netlify|privacy-ops-preview|faith-journey|commerce)/);assert.doesNotMatch(source,/[\u2014]/);}
});
test('private state is keyed by host boundary and owner changes, with post-reset/retry focus restoration',()=>{
 const source=readFileSync(resolve(root,'components/owner-privacy-preview/owner-privacy-workspace.tsx'),'utf8');assert.ok(source.includes('key={boundary}'));assert.ok(source.includes('title.current?.focus()'));assert.ok(source.includes('[resetEpoch]'));assert.ok(source.includes("setScenario('ready');setResetEpoch(value=>value+1)"));
 const css=readFileSync(resolve(root,'components/owner-privacy-preview/owner-privacy.module.css'),'utf8');assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.ok(css.includes(':focus-visible'));assert.doesNotMatch(css,/url\s*\(|@import|position:absolute/);
});
