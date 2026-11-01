import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {buildSync}=require('esbuild');
const bundle=buildSync({entryPoints:[new URL('../lib/commerce-preview/index.ts',import.meta.url).pathname],bundle:true,platform:'neutral',format:'esm',write:false});
const {
 COMMERCE_SCHEMA, routeDestination, createIntent, transitionIntent, isIntent,
 ownerIntentView, financeProjection, productEntitlement, reconcileIntent, textToGiveCapability,
}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
const NO_EFFECTS=Object.freeze({save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false});
const SYNTHETIC_SCHEMA='lockliel-synthetic-v1';
const org='synthetic-lockliel';
const ctx=(change={})=>({schemaVersion:SYNTHETIC_SCHEMA,mode:'synthetic',organizationId:org,actorId:'synthetic-member-a',aal:1,sessionActive:true,grants:['commerce:intent'],...change});
const finance=(change={})=>ctx({actorId:'synthetic-finance',aal:2,grants:['commerce:finance'],...change});
const fulfillment=(change={})=>ctx({actorId:'synthetic-fulfillment',aal:2,grants:['commerce:fulfillment'],...change});
const route=(change={})=>({schemaVersion:COMMERCE_SCHEMA,mode:'synthetic',organizationId:org,destinationId:'synthetic-destination-lockliel',merchantId:'synthetic-merchant-lockliel',provider:'synthetic-fixture',currency:'XTS',merchantDecision:'fixture-reviewed',legalDecision:'fixture-reviewed',revision:0,...change});
const product=(change={})=>({schemaVersion:COMMERCE_SCHEMA,mode:'synthetic',organizationId:org,productId:'synthetic-book',revision:3,publication:'fixture-active',availability:'available',unitMinor:50,currency:'XTS',delivery:'shipping',entitlementDecision:'fixture-reviewed',shippingDecision:'fixture-reviewed',...change});
const consent=(change={})=>({mode:'synthetic',organizationId:org,actorId:'synthetic-member-a',purpose:'donation',decision:'fixture-explicit',...change});
const request=(change={})=>{const value={intentId:'synthetic-intent-a',kind:'donation',amountMinor:100,product:null,quantity:0,...change};return {consent:consent({purpose:value.kind}),...value};};
const unwrap=result=>{assert.equal(result.status,'synthetic');assert.deepEqual(result.effects,NO_EFFECTS);return result.value;};
const deny=result=>{assert.deepEqual(result,{status:'unavailable',effects:NO_EFFECTS});};
const donation=()=>unwrap(createIntent(ctx(),route(),request()));
const purchase=(p=product())=>unwrap(createIntent(ctx(),route(),request({kind:'book-purchase',product:p,quantity:2})));
const event=(kind,revision,amountMinor=0,change={})=>({eventId:`synthetic-event-${revision}`,idempotencyKey:`synthetic-key-${revision}`,expectedRevision:revision,kind,amountMinor,...change});
const apply=(state,kind,amount=0,who=finance())=>unwrap(transitionIntent(who,state,event(kind,state.revision,amount)));
const settled=(state=donation())=>apply(apply(state,'authorize',100),'settle',100);
const statement=state=>({schemaVersion:COMMERCE_SCHEMA,mode:'synthetic',organizationId:org,intentId:state.intentId,destinationId:state.destination.destinationId,currency:'XTS',settledMinor:100,refundedMinor:state.refundedMinor,expectedRevision:state.revision});

test('destination readiness uses an explicit independent organization registry',()=>{
 const champion=route({organizationId:'synthetic-champion-life',destinationId:'synthetic-destination-champion',merchantId:'synthetic-merchant-champion'});
 const sowgo=route({organizationId:'synthetic-sowgo',destinationId:'synthetic-destination-sowgo',merchantId:'synthetic-merchant-sowgo'});
 assert.equal(unwrap(routeDestination(ctx(),org,[route(),champion,sowgo])).merchantId,'synthetic-merchant-lockliel');
 assert.equal(unwrap(routeDestination(ctx({organizationId:'synthetic-champion-life'}),'synthetic-champion-life',[route(),champion,sowgo])).merchantId,'synthetic-merchant-champion');
});
test('destination selection denies cross organization, missing and duplicate routing',()=>{
 deny(routeDestination(ctx(),'synthetic-sowgo',[route()]));deny(routeDestination(ctx(),org,[]));deny(routeDestination(ctx(),org,[route(),route()]));
});
test('organizations cannot silently share merchant accounts',()=>{
 const other=route({organizationId:'synthetic-sowgo',destinationId:'synthetic-destination-sowgo'});
 deny(routeDestination(ctx(),org,[route(),other]));
});
for(const [field,value] of [['provider','unknown'],['currency','USD'],['legalDecision','unknown'],['merchantDecision','unknown'],['schemaVersion','v2'],['revision',-1]]){
 test(`unknown or actual ${field} cannot become fixture ready`,()=>deny(createIntent(ctx(),route({[field]:value}),request())));
}
test('live metadata, credentials and destination URLs are rejected rather than returned',()=>{
 for(const extra of [{url:'https://example.invalid'}, {apiKey:'synthetic-not-a-credential'}, {payerEmail:'synthetic-address'}]) deny(routeDestination(ctx(),org,[route(extra)]));
 deny(createIntent(ctx(),route(),request({contact:'synthetic-contact'})));
});
test('request quantities and integer minor units are bounded without float conversion',()=>{
 for(const amountMinor of [0,-1,1.1,NaN,Infinity,1_000_000_001,Number.MAX_SAFE_INTEGER]) deny(createIntent(ctx(),route(),request({amountMinor})));
 assert.equal(donation().amountMinor,100);
});
test('origin metadata, application state and tags are never grants',()=>{
 deny(createIntent(ctx({grants:[],campaign:'synthetic-campaign'}),route(),request()));
 deny(createIntent(ctx({grants:[]}),route(),request()));
});
test('missing, expired or malformed synthetic identity fails closed',()=>{
 for(const identity of [null,{},ctx({sessionActive:false}),ctx({mode:'live'}),ctx({aal:3}),ctx({actorId:'real-id'})]) deny(createIntent(identity,route(),request()));
});
test('created and authorized are distinct from settlement and ledger amounts',()=>{
 const created=donation(),authorized=apply(created,'authorize',100);
 assert.equal(created.status,'created');assert.equal(authorized.status,'authorized');
 assert.equal(unwrap(financeProjection(finance(),authorized)).settledMinor,0);
 assert.equal(settled().status,'settled');
});
test('settlement needs authorization and the exact immutable amount',()=>{
 deny(transitionIntent(finance(),donation(),event('settle',0,100)));
 deny(transitionIntent(finance(),donation(),event('authorize',0,99)));
 const authorized=apply(donation(),'authorize',100);
 deny(transitionIntent(finance(),authorized,event('settle',1,99)));
});
test('finance transitions require current same-organization explicit AAL2 grant',()=>{
 for(const who of [ctx(),finance({aal:1}),finance({sessionActive:false}),finance({organizationId:'synthetic-sowgo'}),fulfillment()]) deny(transitionIntent(who,donation(),event('authorize',0,100)));
});
test('stale revisions cannot advance a current state',()=>{
 const current=apply(donation(),'authorize',100);
 deny(transitionIntent(finance(),current,event('settle',0,100,{eventId:'synthetic-other',idempotencyKey:'synthetic-other-key'})));
});
test('identical lost acknowledgement retry returns current snapshot without duplicate event',()=>{
 const created=donation(),authorize=event('authorize',0,100);
 const current=unwrap(transitionIntent(finance(),created,authorize));
 assert.deepEqual(unwrap(transitionIntent(finance(),current,authorize)),current);
 assert.equal(current.events.length,1);assert.equal(created.events.length,0);
});
test('idempotency collision with changed payload or event identity is denied',()=>{
 const authorize=event('authorize',0,100),current=unwrap(transitionIntent(finance(),donation(),authorize));
 for(const change of [{amountMinor:99},{kind:'settle'},{eventId:'synthetic-other'},{idempotencyKey:'synthetic-other-key'},{expectedRevision:1}]) deny(transitionIntent(finance(),current,{...authorize,...change}));
});
test('retry authorization is checked again after session or grant revocation',()=>{
 const authorize=event('authorize',0,100),current=unwrap(transitionIntent(finance(),donation(),authorize));
 deny(transitionIntent(finance({grants:[]}),current,authorize));
 deny(transitionIntent(finance({aal:1}),current,authorize));
});
test('owner can cancel only own created intent, not another or authorized payment',()=>{
 const original=donation();assert.equal(apply(original,'cancel',0,ctx()).status,'cancelled');
 deny(transitionIntent(ctx({actorId:'synthetic-member-b'}),original,event('cancel',0)));
 deny(transitionIntent(ctx(),apply(original,'authorize',100),event('cancel',1)));
});
test('failure is terminal and cannot be revived by settlement or authorization',()=>{
 const failed=apply(donation(),'fail');assert.equal(failed.status,'failed');
 deny(transitionIntent(finance(),failed,event('authorize',1,100)));deny(transitionIntent(finance(),failed,event('settle',1,100)));
});
test('direct snapshot status/refund/history tampering is rejected',()=>{
 const original=donation();assert.equal(isIntent(original),true);
 for(const change of [{status:'settled'},{revision:1},{refundedMinor:1},{fulfillment:'fulfilled'},{events:[event('settle',0,100)]}]) assert.equal(isIntent({...original,...change}),false);
 const current=settled();assert.equal(isIntent({...current,events:[...current.events,current.events[0]]}),false);
});
test('private owner view excludes destination, identity, event history and finance payload',()=>{
 const result=unwrap(ownerIntentView(ctx(),settled()));
 assert.deepEqual(Object.keys(result).sort(),['schemaVersion','mode','intentId','kind','status','amountMinor','refundedMinor','currency','fulfillment'].sort());
 deny(ownerIntentView(ctx({actorId:'synthetic-member-b'}),settled()));deny(ownerIntentView(finance(),settled()));
});
test('ledger projection needs explicit finance AAL2 and remains a projection only',()=>{
 deny(financeProjection(ctx(),settled()));deny(financeProjection(finance({aal:1}),settled()));deny(financeProjection(fulfillment(),settled()));
 const result=unwrap(financeProjection(finance(),settled()));assert.equal(result.netMinor,100);assert.equal(result.kind,'donation');assert.equal(Object.hasOwn(result,'ownerId'),false);
});
test('book quantity totals and published/available/reviewed policy are required',()=>{
 for(const change of [{availability:'unavailable'},{publication:'inactive'},{shippingDecision:'unknown'},{entitlementDecision:'unknown'},{organizationId:'synthetic-sowgo'},{currency:'USD'}]) deny(createIntent(ctx(),route(),request({kind:'book-purchase',product:product(change),quantity:2})));
 for(const quantity of [0,1.5,11]) deny(createIntent(ctx(),route(),request({kind:'book-purchase',product:product(),quantity})));
 deny(createIntent(ctx(),route(),request({kind:'book-purchase',product:product(),quantity:1})));
 assert.equal(purchase().kind,'book-purchase');
});
test('donation cannot smuggle product benefit or implied complimentary book',()=>{
 deny(createIntent(ctx(),route(),request({product:product()})));
 deny(productEntitlement(ctx(),settled(),product()));
});
test('product right requires same owner, exact product revision and settled purchase',()=>{
 const p=product(),created=purchase(p);deny(productEntitlement(ctx(),created,p));
 const paid=settled(created);assert.equal(unwrap(productEntitlement(ctx(),paid,p)).entitlement,'fixture-eligible');
 deny(productEntitlement(ctx({actorId:'synthetic-member-b'}),paid,p));deny(productEntitlement(ctx(),paid,product({revision:4})));deny(productEntitlement(ctx(),paid,product({unitMinor:40})));deny(productEntitlement(ctx(),paid,product({delivery:'digital',shippingDecision:'not-applicable'})));deny(productEntitlement(ctx(),paid,product({organizationId:'synthetic-sowgo'})));
});
test('fulfillment requires paid purchase and distinct AAL2 fulfillment permission',()=>{
 deny(transitionIntent(fulfillment(),purchase(),event('processing',0)));
 deny(transitionIntent(fulfillment(),settled(),event('processing',2)));
 deny(transitionIntent(finance(),settled(purchase()),event('processing',2)));
 deny(transitionIntent(fulfillment({aal:1}),settled(purchase()),event('processing',2)));
});
test('shipping stages cannot skip packing, shipment or delivery',()=>{
 let state=settled(purchase());deny(transitionIntent(fulfillment(),state,event('shipped',2)));
 for(const stage of ['processing','packed','shipped','delivered','fulfilled']) state=apply(state,stage,0,fulfillment());
 assert.equal(state.fulfillment,'fulfilled');assert.equal(state.status,'settled');
 deny(transitionIntent(fulfillment(),state,event('fulfilled',state.revision)));
});
test('digital fulfillment cannot invent a shipping event',()=>{
 let state=settled(purchase(product({delivery:'digital',shippingDecision:'not-applicable'})));
 state=apply(state,'processing',0,fulfillment());deny(transitionIntent(fulfillment(),state,event('shipped',state.revision)));
 state=apply(state,'fulfilled',0,fulfillment());assert.equal(state.fulfillment,'fulfilled');
});
test('refunds require settlement, positive bounded amount and cumulative balance',()=>{
 deny(transitionIntent(finance(),donation(),event('refund',0,10)));
 let state=settled(purchase());deny(transitionIntent(finance(),state,event('refund',2,0)));
 state=apply(state,'refund',30);assert.equal(state.status,'partially-refunded');assert.equal(unwrap(financeProjection(finance(),state)).netMinor,70);
 deny(transitionIntent(finance(),state,event('refund',3,71)));
 state=apply(state,'refund',70);assert.equal(state.status,'refunded');assert.equal(unwrap(financeProjection(finance(),state)).netMinor,0);
 deny(transitionIntent(finance(),state,event('refund',4,1)));
});
test('partial or full refund removes fixture entitlement and stops new fulfillment',()=>{
 const state=apply(settled(purchase()),'refund',10);
 deny(productEntitlement(ctx(),state,product()));deny(transitionIntent(fulfillment(),state,event('processing',3)));
});
test('refund does not erase already recorded fulfillment history',()=>{
 const state=apply(apply(settled(purchase()),'processing',0,fulfillment()),'refund',100);
 assert.equal(state.fulfillment,'processing');assert.equal(state.events.length,4);
});
test('reconciliation distinguishes matched, mismatch, wrong organization and stale snapshot',()=>{
 const state=apply(settled(),'refund',20);
 assert.equal(unwrap(reconcileIntent(finance(),state,statement(state))).reconciliation,'matched');
 assert.equal(unwrap(reconcileIntent(finance(),state,{...statement(state),settledMinor:99})).reconciliation,'mismatch');
 for(const change of [{organizationId:'synthetic-sowgo'},{destinationId:'synthetic-other'},{expectedRevision:2},{currency:'USD'},{bankAccount:'synthetic-not-a-bank'}]) deny(reconcileIntent(finance(),state,{...statement(state),...change}));
 deny(reconcileIntent(fulfillment(),state,statement(state)));
});
test('returned state and nested routes do not retain mutable input aliases',()=>{
 const input=route(),state=unwrap(createIntent(ctx(),input,request()));input.merchantId='synthetic-other';assert.equal(state.destination.merchantId,'synthetic-merchant-lockliel');
 const e=event('authorize',0,100),next=unwrap(transitionIntent(finance(),state,e));e.amountMinor=1;assert.equal(next.events[0].amountMinor,100);
});
test('future Text-to-Give is unavailable and never reuses another merchant',()=>{
 const capability=textToGiveCapability();assert.equal(capability.readiness,'unavailable');assert.deepEqual(capability.effects,NO_EFFECTS);assert.ok(capability.requirements.includes('independent-merchant-routing'));assert.equal(Object.hasOwn(capability,'merchantId'),false);
});
test('module has no transport, persistence, provider secret or operational adapter',()=>{
 const source=fs.readFileSync(new URL('../lib/commerce-preview/index.ts',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|process\.env)\b/);
 assert.doesNotMatch(source,/https?:\/\/|SUPABASE|STRIPE|PAYPAL|document\.cookie/);
});

test('transition output does not share nested route or prior event objects with input',()=>{
 const original=apply(donation(),'authorize',100),next=apply(original,'settle',100);
 original.destination.merchantId='synthetic-other';original.events[0].amountMinor=1;
 assert.equal(next.destination.merchantId,'synthetic-merchant-lockliel');assert.equal(next.events[0].amountMinor,100);assert.equal(isIntent(next),true);
});
test('authorization never accepts an unbounded event payload or nonzero fulfillment amount',()=>{
 deny(transitionIntent(finance(),donation(),event('authorize',0,100,{providerToken:'synthetic-not-a-token'})));
 deny(transitionIntent(finance(),donation(),event('authorize',0,100,{expectedRevision:-1})));
 deny(transitionIntent(fulfillment(),settled(purchase()),event('processing',2,1)));
});

test('intent creation needs explicit same-owner same-organization purpose-bound fixture consent',()=>{
 for(const change of [{decision:'unknown'},{decision:'denied'},{actorId:'synthetic-member-b'},{organizationId:'synthetic-sowgo'},{purpose:'book-purchase'},{mode:'live'},{extra:'synthetic-field'}]) deny(createIntent(ctx(),route(),request({consent:consent(change)})));
 deny(createIntent(ctx(),route(),request({consent:null})));
 const {consent:omitted,...withoutConsent}=request();assert.equal(omitted.decision,'fixture-explicit');deny(createIntent(ctx(),route(),withoutConsent));
});
