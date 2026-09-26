import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=fs.readFileSync('supabase/functions/process-account-deletion/index.ts','utf8');
const compiled=ts.transpileModule(source.replace(/^import .*\n/m,''),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}
}).outputText;
const actor='11111111-1111-4111-8111-111111111111';
const target='22222222-2222-4222-8222-222222222222';
const requestId='33333333-3333-4333-8333-333333333333';
const session='44444444-4444-4444-8444-444444444444';
const ready={target_profile_id:target,request_status:'in_review',handled_by:actor,
  auth_user_exists:true,profile_exists:true,session_count:2,owned_storage_objects:0,blocker_count:0,responsibilities:{}};
const receipt={lead_contacts_deleted:1,founders50_applications_anonymized:1,founders50_review_rationales_cleared:1};

async function execute(options={}){
  const calls=[];
  let handler;
  let stateCalls=0;
  const admin={
    rpc:async(name,args)=>{
      calls.push({name,args});
      if(name==='lockliel_account_deletion_state'){
        stateCalls++;
        if(stateCalls===1)return {data:options.before||{...ready,auth_user_exists:!options.retry,profile_exists:!options.retry,session_count:options.retry?0:2}};
        return {data:Object.hasOwn(options,'after')?options.after:{...ready,auth_user_exists:false,profile_exists:false,session_count:0}};
      }
      if(name==='lockliel_prepare_account_deletion'){
        if(args.revoke_sessions_input){
          return options.revokeError?{error:{message:'fixture'}}:{data:options.revoked||{...ready,auth_user_exists:!options.retry,session_count:0}};
        }
        return options.prepareError?{error:{message:'fixture'}}:{data:{...ready,auth_user_exists:!options.retry}};
      }
      if(name==='lockliel_scrub_deleted_nonfinancial_records')return options.scrubError?{error:{message:'fixture'}}:{data:Object.hasOwn(options,'scrub')?options.scrub:receipt};
      throw new Error('Unexpected RPC '+name);
    },
    auth:{admin:{
      updateUserById:async(id,attributes)=>{calls.push({name:'suspend',id,attributes});return {error:options.suspendError?{}:null};},
      deleteUser:async(id)=>{calls.push({name:'delete',id});return {error:options.deleteError?{}:null};}
    }}
  };
  const reply=(data)=>new Response(JSON.stringify(data));
  vm.runInNewContext(compiled,{
    Deno:{env:{get:(name)=>({SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'test-public',SUPABASE_SERVICE_ROLE_KEY:'test-service'})[name]},serve:fn=>{handler=fn;}},
    createClient:()=>admin,Response,Request,atob,
    fetch:async(url)=>{
      const path=new URL(url).pathname;
      if(path==='/auth/v1/user')return reply({id:actor});
      if(path.endsWith('/lockliel_current_session_active'))return reply(options.inactive?false:true);
      if(path.endsWith('/staff_roles'))return reply([{role:options.role||'admin'}]);
      if(path.endsWith('/privacy_requests'))return reply([{id:requestId,request_type:'account_deletion',status:'in_review',handled_by:actor}]);
      throw new Error('Unexpected fetch '+path);
    }
  });
  const token='test.'+Buffer.from(JSON.stringify({aal:options.aal||'aal2',session_id:session})).toString('base64url')+'.test';
  const response=await handler(new Request('https://test.invalid/functions/v1/process-account-deletion',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId})
  }));
  return {status:response.status,body:await response.json(),calls};
}

test('deletion worker suspends sign-in and verifies revocation before deleting Auth',async()=>{
  const r=await execute();
  assert.equal(r.status,200);
  assert.equal(r.body.sessionsRevoked,true);
  assert.deepEqual(r.calls.map(c=>c.name),[
    'lockliel_account_deletion_state','lockliel_prepare_account_deletion','suspend',
    'lockliel_prepare_account_deletion','delete','lockliel_account_deletion_state','lockliel_scrub_deleted_nonfinancial_records'
  ]);
  assert.equal(r.calls[1].args.revoke_sessions_input,false);
  assert.equal(r.calls[3].args.revoke_sessions_input,true);
  assert.equal(r.calls[3].args.actor_session_id_input,session);
  assert.equal(r.calls[2].id,target);
  assert.equal(r.calls[2].attributes.ban_duration,'876000h');
});

for(const options of [{prepareError:true},{suspendError:true},{revokeError:true},{revoked:{...ready,session_count:1}},{revoked:{...ready,session_count:'0'}}]){
  test('deletion worker stops before Auth removal on preparation failure '+JSON.stringify(options),async()=>{
    const r=await execute(options);
    assert.equal(r.status,409);
    assert.ok(!r.calls.some(c=>c.name==='delete'||c.name==='lockliel_scrub_deleted_nonfinancial_records'));
  });
}
for(const after of [null,{}, {...ready,auth_user_exists:false,profile_exists:false,session_count:0,owned_storage_objects:1},{...ready,auth_user_exists:false,session_count:0}]){
  test('deletion worker rejects incomplete post-deletion evidence '+JSON.stringify(after),async()=>{
    const r=await execute({after});
    assert.equal(r.status,500);
    assert.ok(!r.calls.some(c=>c.name==='lockliel_scrub_deleted_nonfinancial_records'));
  });
}
test('retry after Auth deletion skips Auth mutations and resumes scrubbing',async()=>{
  const r=await execute({retry:true});
  assert.equal(r.status,200);
  assert.ok(!r.calls.some(c=>['suspend','delete'].includes(c.name)));
  assert.ok(r.calls.some(c=>c.name==='lockliel_scrub_deleted_nonfinancial_records'));
});
test('failed Auth deletion remains suspended for safe retry',async()=>{
  const r=await execute({deleteError:true});
  assert.equal(r.status,409);
  assert.match(r.body.error,/Sign-in remains suspended/);
  assert.ok(!r.calls.some(c=>c.name==='lockliel_scrub_deleted_nonfinancial_records'));
});
for(const options of [{scrubError:true},{scrub:null},{scrub:{...receipt,lead_contacts_deleted:-1}}]){
  test('unverified scrubbing cannot report completion '+JSON.stringify(options),async()=>{
    const r=await execute(options);
    assert.equal(r.status,500);
    assert.equal(r.body.ok,undefined);
  });
}
for(const options of [{inactive:true},{aal:'aal1'},{role:'group_leader'}]){
  test('worker rejects unauthorized caller before service operations '+JSON.stringify(options),async()=>{
    const r=await execute(options);
    assert.ok([401,403].includes(r.status));
    assert.equal(r.calls.length,0);
  });
}
