import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createDirectDatabaseVerifier,requireDirectDatabaseReceipt,createDatabaseGatedOperator} from '../scripts/member-hosted/database-preflight.mjs';
const now=1000000;
const receipt=()=>({ok:true,receipt:{source:'direct-libpq-same-connection-readonly-transaction',project:'qjksggxorghaxvpyslip',host:'db.qjksggxorghaxvpyslip.supabase.co',database:'postgres',startupOptionsVerified:true,tlsVerifyFull:true,hostnameVerified:true,tlsVersion:'TLSv1.2',cipher:'synthetic-cipher',transactionReadOnly:'on',lockTimeout:'5s',statementTimeout:'30s',samePhysicalConnection:true,sameTransaction:true,noReconnect:true,noDataWrites:true,rolledBack:true,backendPid:1234,transactionStartedAt:'synthetic-transaction',inspectionQueries:2,summary:{migrationCount:280,migration280Fingerprint:'a55aead9115d12881650fee9f1bede27',publicTables:57,rlsPublicTables:57,notesServiceTablePrivileges:0,notesServiceColumnPrivileges:0}}});
test('trusted direct child receipt is registered opaquely, caller JSON is denied',async()=>{
 const verifier=createDirectDatabaseVerifier({execute:async()=>receipt(),now:()=>now}),handle=await verifier.verify();assert.equal(requireDirectDatabaseReceipt(handle,{now}).project,'qjksggxorghaxvpyslip');
 for(const forged of [receipt(),receipt().receipt,structuredClone(handle),{kind:'direct-isolated-database-verification'}])assert.throws(()=>requireDirectDatabaseReceipt(forged,{now}));
});
for(const [field,value]of [['project','other'],['host','db.bsndfhbemstyrrglajat.supabase.co'],['database','other'],['transactionReadOnly','off'],['lockTimeout','0'],['statementTimeout','2min'],['tlsVerifyFull',false],['hostnameVerified',false],['samePhysicalConnection',false],['sameTransaction',false],['noReconnect',false],['rolledBack',false]])test(`bad direct evidence ${field} stops before reservation`,async()=>{
 let calls=0;const r=receipt();r.receipt[field]=value;
 const databaseVerifier=createDirectDatabaseVerifier({execute:async()=>r,now:()=>now});
 const op=createDatabaseGatedOperator({databaseVerifier,now:()=>now,request:async()=>{calls++;}});
 await assert.rejects(op.run({}),/deployment must not proceed/);assert.equal(calls,0);
});
test('driver failure suppresses reflected private errors and creates no deployment',async()=>{
 let calls=0;const databaseVerifier=createDirectDatabaseVerifier({execute:async()=>{throw Error('synthetic-secret-do-not-emit');},now:()=>now});
 const op=createDatabaseGatedOperator({databaseVerifier,now:()=>now,request:async()=>{calls++;}});
 await assert.rejects(op.run({}),e=>!e.message.includes('synthetic-secret')&&!e.cause);assert.equal(calls,0);
});
test('expired/future evidence denies and cannot be reused to claim current safeguards',async()=>{
 const v=createDirectDatabaseVerifier({execute:async()=>receipt(),now:()=>now}),handle=await v.verify();for(const time of [now-1,now+300001])assert.throws(()=>requireDirectDatabaseReceipt(handle,{now:time}));
});
test('MCP default-settings output is not direct verified connection evidence',async()=>{
 const v=createDirectDatabaseVerifier({execute:async()=>({database:'postgres',transaction_read_only:'on',lock_timeout:'5s',statement_timeout:'30s'}),now:()=>now});await assert.rejects(v.verify());
});

test('direct Python state-machine regressions run in the authoritative JS suite',()=>{
 const python=process.platform==='darwin'?'/Library/Developer/CommandLineTools/usr/bin/python3':'/usr/bin/python3';
 const script=fileURLToPath(new URL('./member_hosted_database_preflight_test.py',import.meta.url));
 const result=spawnSync(python,['-I','-B',script],{encoding:'utf8',timeout:10000,env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'}});
 assert.equal(result.status,0,'Offline Python safeguard regressions failed.');
 assert.match(result.stderr,/Ran 21 tests/);assert.match(result.stderr,/OK/);
});
