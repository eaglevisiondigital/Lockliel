/** Private fixed-destination transport. No caller URL, redirect, retry, proxy,
 * logger, TLS override or injected callback. Production authority has no mint.
 * Tests substitute native modules only in an isolated VM, never this API. */
import https from 'node:https';
import tls from 'node:tls';
import {takeVerifiedAuthority} from './authority.mjs';
import {projectPrivateAuthConfigJson} from '../fixture-provision/private-provider-projection.mjs';
const HOST='api.supabase.com', PROJECT='qjksggxorghaxvpyslip';
const PATH='/v1/projects/'+PROJECT+'/config/auth';
const MAX=65536, DEADLINE=15000;
const fail=category=>Object.freeze({schema:'lockliel-provider-collector-v1',ok:false,category,project:PROJECT,operation:'GET_AUTH_CONFIG',rawResponseRetained:false,activationAllowed:false});
export async function performFixedRead(authority, credential) {
 // Must precede credential inspection or any I/O. Never exposes its exception.
 try { takeVerifiedAuthority(authority); } catch { if(Buffer.isBuffer(credential))credential.fill(0);return fail('AUTHORITY_UNAVAILABLE'); }
 if (!Buffer.isBuffer(credential) || credential.length<1 || credential.length>8192 || !credential.every(x=>x>=33&&x<=126)) {
  if(Buffer.isBuffer(credential)) credential.fill(0);
  return fail('PRIVATE_INPUT_INVALID');
 }
 return new Promise(resolve=>{
  const started=Date.now();let req,res,timer,done=false,size=0;const chunks=[];
  function finish(result) {
   if(done)return;done=true;clearTimeout(timer);
   credential.fill(0);for(const chunk of chunks)chunk.fill(0);chunks.length=0;
   // HTTP header strings/runtime copies cannot be physically zeroized. Caller
   // must terminate the private process; no persistent agent/session is reused.
   try{res?.destroy();req?.destroy();}catch{}
   resolve(result);
  }
  const failed=()=>finish(fail('TRANSPORT_FAILED'));
  try {
   timer=setTimeout(()=>finish(fail('DEADLINE_EXCEEDED')),DEADLINE);
   req=https.request({protocol:'https:',hostname:HOST,port:443,path:PATH,method:'GET',servername:HOST,
    rejectUnauthorized:true,minVersion:'TLSv1.2',checkServerIdentity:tls.checkServerIdentity,
    agent:false,headers:{Authorization:'Bearer '+credential.toString('ascii'),Accept:'application/json','Accept-Encoding':'identity'}},response=>{
     res=response;res.once('error',failed);
     if(done){res.destroy();return;}
     if(res.statusCode>=300&&res.statusCode<400){finish(fail('REDIRECT_REJECTED'));return;}
     if(res.statusCode!==200){finish(fail('PROVIDER_REJECTED'));return;}
     if(!res.socket?.encrypted||res.socket.authorized!==true||res.socket.servername!==HOST){finish(fail('TLS_UNVERIFIED'));return;}
     const headers=res.headers;const rawHeaders=res.rawHeaders;
     if(!Array.isArray(rawHeaders)||rawHeaders.length%2){finish(fail('RESPONSE_REJECTED'));return;}
     const seen=new Set();for(let i=0;i<rawHeaders.length;i+=2){const key=String(rawHeaders[i]).toLowerCase();if(['content-type','content-length','content-encoding','location'].includes(key)){if(seen.has(key)){finish(fail('RESPONSE_REJECTED'));return;}seen.add(key);}}
     if(headers['content-encoding']&&headers['content-encoding']!=='identity'){finish(fail('RESPONSE_REJECTED'));return;}
     if(typeof headers['content-type']!=='string'||!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(headers['content-type'])){finish(fail('RESPONSE_REJECTED'));return;}
     if(headers['content-length']!==undefined&&(!/^[0-9]+$/.test(headers['content-length'])||Number(headers['content-length'])>MAX)){finish(fail('RESPONSE_TOO_LARGE'));return;}
     res.on('data',chunk=>{
      if(done){if(Buffer.isBuffer(chunk))chunk.fill(0);return;}
      if(!Buffer.isBuffer(chunk)){finish(fail('RESPONSE_REJECTED'));return;}
      size+=chunk.length;if(size>MAX){chunk.fill(0);finish(fail('RESPONSE_TOO_LARGE'));return;}
      chunks.push(chunk);
     });
     res.once('close',()=>{if(!done)finish(fail('INTERRUPTED'));});
     res.once('aborted',()=>finish(fail('INTERRUPTED')));
     res.once('end',()=>{
      if(done)return;
      if(headers['content-length']!==undefined&&Number(headers['content-length'])!==size){finish(fail('RESPONSE_REJECTED'));return;}
      if(res.complete!==true){finish(fail('INTERRUPTED'));return;}
      const now=Date.now();if(now<started||now-started>=DEADLINE){finish(fail('DEADLINE_EXCEEDED'));return;}
      let joined;
      try {
       joined=Buffer.concat(chunks);const raw=new TextDecoder('utf-8',{fatal:true}).decode(joined);
       const projected=projectPrivateAuthConfigJson(raw,now);
       if(!projected.ok){finish(fail('RESPONSE_REJECTED'));return;}
       const receipt=Object.freeze({schema:'lockliel-provider-collector-v1',ok:true,category:'AUTH_CONFIG_FILTERED',project:PROJECT,operation:'GET_AUTH_CONFIG',observedAt:now,startedAt:started,providerTransport:'TLS_VERIFIED_SUPABASE_API',requestBinding:'FIXED_ISOLATED_PATH',hooks:projected.hooks,operatorIdentity:'UNKNOWN',credentialProvenance:'UNKNOWN',independentAuthorityVerified:false,rawResponseRetained:false,activationAllowed:false});
       finish(receipt);
      }catch{finish(fail('RESPONSE_REJECTED'));}finally{joined?.fill(0);}
     });
    });
   req.once('error',failed);req.end();
  } catch { failed(); }
 });
}
