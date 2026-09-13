import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createSignup } from "../netlify/functions/faith-boost-signup.mjs";
import { COOKIE, allowedOrigin, hash, sessionFor } from "../netlify/lib/faith-boost-core.mjs";

function memoryStore() {
  const data = new Map(); let revision = 0;
  return { data,
    async get(key) { return data.get(key)?.value ?? null; },
    async getWithMetadata(key) { const item = data.get(key); return item ? { data: item.value, etag: item.etag } : null; },
    async setJSON(key, value, options = {}) { const current = data.get(key); if ((options.onlyIfNew && current) || (options.onlyIfMatch && current?.etag !== options.onlyIfMatch)) return { modified: false }; const etag = String(++revision); data.set(key, { value: structuredClone(value), etag }); return { modified: true, etag }; },
  };
}
const valid = { firstName: "QA Reader", email: "reader@example.com", phone: "", emailConsent: true, attribution: { utm_source: "facebook", utm_medium: "social", utm_campaign: "identity", utm_content: "video-1", referrer: "facebook.com" } };
const request = (data, origin = "https://lockliel.com") => new Request("https://lockliel.com/api/faith-boost/signup", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(data) });

test("same-origin Lockliel deploy previews work without runtime URL variables; lookalike and cross-origin hosts fail", () => {
  const preview = "https://deploy-preview-1--lockliel.netlify.app";
  assert.equal(allowedOrigin(new Request(`${preview}/api/faith-boost/signup`, {headers:{Origin:preview}})), true);
  for (const foreign of ["https://deploy-preview-1--unrelated.netlify.app", "https://deploy-preview-1--lockliel.netlify.app.evil.example"]) {
    assert.equal(allowedOrigin(new Request(`${foreign}/api/faith-boost/signup`, {headers:{Origin:foreign}})), false);
    assert.equal(allowedOrigin(new Request(`${preview}/api/faith-boost/signup`, {headers:{Origin:foreign}})), false);
  }
});

test("valid signup persists attribution and consent, mirrors Forms, and grants opaque cookie access", async () => {
  const store = memoryStore(); const posts = [];
  const signup = createSignup({ storeFor: () => store, post: async (url, init) => { posts.push({url,body:new URLSearchParams(init.body)}); return new Response("ok"); } });
  const response = await signup(request(valid));
  assert.equal(response.status,200); assert.deepEqual(await response.json(),{ok:true});
  const cookie = response.headers.get("set-cookie"); assert.match(cookie,/Secure; HttpOnly; SameSite=Lax/); assert(!cookie.includes(valid.email));
  const stored = await store.get(`leads/${hash(valid.email)}`); assert.equal(stored.phone,""); assert.equal(stored.smsConsent,false); assert.equal(stored.emailVerified,false); assert.deepEqual(stored.attribution,valid.attribution); assert.match(stored.signupAt,/^\d{4}-/);
  assert.equal(posts.length,1); assert.equal(posts[0].body.get("utm_content"),"video-1"); assert.equal(posts[0].body.get("email-consent"),"yes");
  assert(await sessionFor(new Request("https://lockliel.com/",{headers:{Cookie:cookie}}),store));
});
test("bad names, emails, missing consent, honeypot and foreign origins never store leads or grant access", async () => {
  const store = memoryStore(); const signup = createSignup({storeFor:()=>store,post:async()=>{throw new Error("Must not post");}});
  for (const data of [{...valid,firstName:" "},{...valid,email:"bad"},{...valid,emailConsent:false},{...valid,botField:"spam"},{...valid,phone:"invalid phone"}]) { const response=await signup(request(data));assert.equal(response.status,400);assert.equal(response.headers.get("set-cookie"),null); }
  assert.equal((await signup(request(valid,"https://unrelated.example"))).status,403);assert.equal(store.data.size,0);
});
test("repeat and simultaneous submissions keep one lead and one Forms delivery, without overwriting consent or contact details", async () => {
  const store=memoryStore();let posts=0;
  const signup=createSignup({storeFor:()=>store,post:async()=>{posts++;return new Response("ok");}});
  const responses=await Promise.all([signup(request(valid)),signup(request({...valid,email:"READER@example.com",firstName:"Different"}))]);
  assert(responses.every(r=>r.status===200));assert.equal(posts,1);
  assert.equal([...store.data.keys()].filter(k=>k.startsWith("leads/")).length,1);
  assert.equal((await store.get(`leads/${hash(valid.email)}`)).firstName,"QA Reader");
  assert.equal((await signup(request(valid))).status,200);assert.equal(posts,1);
});
test("capture fails closed when durable storage fails; a Forms outage keeps a recoverable private record", async () => {
  const failing=createSignup({storeFor:()=>({setJSON:async()=>{throw new Error("outage");}})});
  const failed=await failing(request(valid));assert.equal(failed.status,503);assert.equal(failed.headers.get("set-cookie"),null);
  const store=memoryStore();const signup=createSignup({storeFor:()=>store,post:async()=>new Response("unavailable",{status:503})});
  assert.equal((await signup(request(valid))).status,200);assert(await store.get(`leads/${hash(valid.email)}`));assert.equal((await store.get(`form-sync/${hash(valid.email)}`)).sent,false);
});
test("forged or expired access cookies do not unlock the reader", async () => {
  const store=memoryStore();const token="a".repeat(64);
  const req=new Request("https://lockliel.com/",{headers:{Cookie:`${COOKIE}=${token}`}});
  assert.equal(await sessionFor(req,store),null);
  await store.setJSON(`sessions/${hash(token)}`,{expiresAt:Date.now()-1000});assert.equal(await sessionFor(req,store),null);
});
test("export contains the opt-in page and cover, not an ungated PDF or book-page directory", async()=>{
  const landing=await readFile("out/who-god-says-you-are.html","utf8");
  assert.match(landing,/You Are Who/);assert.match(landing,/https:\/\/lockliel.com\/who-god-says-you-are/);assert.match(landing,/og:image/);
  const assets=await readdir("out/faith-boost-resource");assert.deepEqual(assets,["cover.jpg"]);
  const ready=await readFile("out/who-god-says-you-are/read.html","utf8");assert.match(ready,/noindex/);assert.doesNotMatch(ready,/We’ve also sent/);
  const reader=await readFile("resources/faith-boost-reader/index.html","utf8");assert.match(reader,/noindex,nofollow/);
  const book=await readdir("resources/faith-boost-reader/pages");assert.equal(book.length,10);
});
