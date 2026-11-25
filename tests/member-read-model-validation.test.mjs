import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';
const result=await build({stdin:{contents:"export {createOfflineMemberAdapter} from './lib/member-read-model/offline-adapter';export {isMemberReadModel} from './lib/member-read-model/validation';",resolveDir:new URL('..',import.meta.url).pathname},bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
const {createOfflineMemberAdapter,isMemberReadModel}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const adapter=createOfflineMemberAdapter(),session=await adapter.validateSession('user-a'),model=(await adapter.readMember(session.session)).data;
test('complete actual projected DTO passes presentation guard',()=>assert.equal(isMemberReadModel(model),true));
for(const value of [null,{},[],{...model,identity:null},{...model,profile:{status:'ready'}},{...model,prayers:{status:'ready',value:'PRIVATE'}},{...model,myFive:{...model.myFive,value:[{...model.myFive.value[0],consent:'accepted'}]}},{...model,catalog:{...model.catalog,value:[{...model.catalog.value[0],href:'https://example.com'}]}},{...model,extra:'PRIVATE'}])test('malformed display DTO fails closed '+String(value?.identity?.displayName??'missing'),()=>assert.equal(isMemberReadModel(value),false));
test('accessor rejected without reading value',()=>{let called=0;const value={...model};Object.defineProperty(value,'identity',{get(){called++;return model.identity;},enumerable:true});assert.equal(isMemberReadModel(value),false);assert.equal(called,0);});

test('hostile Proxy reflection cannot throw through presentation guard',()=>{const value=new Proxy({},{ownKeys(){throw Error('PRIVATE');}});assert.equal(isMemberReadModel(value),false);});
