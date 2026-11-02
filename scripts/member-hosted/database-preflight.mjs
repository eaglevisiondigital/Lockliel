// Narrow Wave10I-A addition. Original reviewed uploader/receipt bytes unchanged.
// No I/O or connection on import. No ambient credential, pool, retry or TLS fallback.
import {fileURLToPath} from 'node:url';
import {createDeploymentOperator,disposeCredential} from './uploader.mjs';
const handles=new WeakMap();
const project='qjksggxorghaxvpyslip';
const deny=()=>{throw Error('Direct isolated database safeguard verification failed.');};
const need=x=>{if(!x)deny();};
export const DIRECT_PREFLIGHT_ENTRY=fileURLToPath(new URL('./database_preflight.py',import.meta.url));
export function createDirectDatabaseVerifier({execute,now=Date.now}={}){
  need(typeof execute==='function'&&typeof now==='function');
  return Object.freeze({async verify(){
    let value;try{value=await execute();}catch{deny();}
    const r=value?.ok===true?value.receipt:null;
    need(r?.source==='direct-libpq-same-connection-readonly-transaction'&&r.project===project&&r.host===`db.${project}.supabase.co`&&r.database==='postgres');
    need(r.startupOptionsVerified===true&&r.tlsVerifyFull===true&&r.hostnameVerified===true&&['TLSv1.2','TLSv1.3'].includes(r.tlsVersion)&&typeof r.cipher==='string'&&r.cipher.length>0);
    need(r.transactionReadOnly==='on'&&r.lockTimeout==='5s'&&r.statementTimeout==='30s'&&r.samePhysicalConnection===true&&r.sameTransaction===true&&r.noReconnect===true&&r.noDataWrites===true&&r.rolledBack===true);
    need(Number.isSafeInteger(r.backendPid)&&r.backendPid>0&&typeof r.transactionStartedAt==='string'&&r.inspectionQueries===2);
    const s=r.summary;need(s?.migrationCount===280&&s.migration280Fingerprint==='a55aead9115d12881650fee9f1bede27'&&s.publicTables===57&&s.rlsPublicTables===57&&s.notesServiceTablePrivileges===0&&s.notesServiceColumnPrivileges===0);
    const handle=Object.freeze({kind:'direct-isolated-database-verification'});
    handles.set(handle,{project,observedAt:now()});return handle;
  }});
}
export function requireDirectDatabaseReceipt(handle,{now=Date.now()}={}){
  const r=handles.get(handle);need(r&&r.project===project&&Number.isSafeInteger(r.observedAt)&&r.observedAt<=now&&now-r.observedAt<=300000);
  return Object.freeze({...r});
}
/** The trusted execute callback must invoke ONLY the reviewed direct libpq helper,
 * privately capture its JSON stdout, and never print native stderr/credentials.
 * It may not turn an MCP result, arbitrary JSON or an application echo into proof.
 * No secret-bearing arguments, environment variables or files are accepted here.
 * A failed gate runs before the existing one-shot operator is constructed/run.
 */
export function createDatabaseGatedOperator({databaseVerifier,now=Date.now,...options}={}){
  need(typeof databaseVerifier?.verify==='function'&&typeof now==='function');let used=false;
  return Object.freeze({async run(input){
    need(!used);used=true;
    try{
      const receipt=await databaseVerifier.verify();requireDirectDatabaseReceipt(receipt,{now:now()});
      const authorize=options.authorize;need(typeof authorize==='function');
      const operator=createDeploymentOperator({...options,now,authorize:async operation=>{
        if(!['cleanup','begin-containment'].includes(operation.phase))requireDirectDatabaseReceipt(receipt,{now:now()});
        return authorize(operation);
      }});
      return await operator.run(input);
    }catch{
      disposeCredential(input?.key);
      throw Error('Direct isolated preflight denied; deployment must not proceed.');
    }
  }});
}
