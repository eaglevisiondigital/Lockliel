// Mock-only composition. No hosted factory, transport or authority is enabled.
import {createConnectionsHandler} from '../../netlify/functions/lockliel-connections.mjs';
import {createMyFiveHandler} from '../../netlify/functions/lockliel-my-five.mjs';
import {parseReachPage} from '../../netlify/lib/my-five-pagination.mjs';
const PROJECT='qjksggxorghaxvpyslip';
const UUID=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const exact=(o,keys)=>o&&Object.getPrototypeOf(o)===Object.prototype&&Object.keys(o).sort().join(',')===[...keys].sort().join(',');
const response=(code,status=403)=>new Response(JSON.stringify({error:code,syntheticOnly:true,hostedReady:false}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export function createHosted281ApiComposition(){throw Error('281_HOSTED_BINDING_NOT_AUTHORIZED');}
export function createOffline281ApiComposition({sessionFor,fetcher,participants,recordOwners=[],project=PROJECT,origin='https://acceptance.invalid'}={}) {
 if(project!==PROJECT||origin!=='https://acceptance.invalid'||typeof sessionFor!=='function'||typeof fetcher!=='function'||!Array.isArray(participants)||participants.length!==2||new Set(participants).size!==2||participants.some(x=>!UUID.test(x)))throw Error('281_OFFLINE_BINDING_INVALID');
 const owners=new Map();
 for(const row of recordOwners){if(!exact(row,['id','owner'])||!UUID.test(row.id)||!participants.includes(row.owner)||owners.has(row.id))throw Error('281_OFFLINE_BINDING_INVALID');owners.set(row.id,row.owner);}
 const members=new Set(participants);let calls=0;
 // Canonical modules retain their immutable backend binding. Never forward that
 // hostname or configured key to the mock transport. No global fetch fallback.
 if(fetcher===globalThis.fetch||sessionFor.name==='requireSession')throw Error('281_NATIVE_TRANSPORT_DENIED');
 const mockTransport=async(url,init={})=>{
  const parsed=new URL(url);
  if(!['/rest/v1/feature_flags','/rest/v1/reach_contacts','/rest/v1/contact_permissions','/rest/v1/referral_links','/rest/v1/referral_events','/rest/v1/share_assets'].includes(parsed.pathname))throw Error('281_TRANSPORT_PATH_DENIED');
  const headers=new Headers(init.headers);headers.set('apikey','synthetic-offline-only');headers.set('Authorization','Bearer synthetic-offline-only');
  return fetcher('https://provider.invalid'+parsed.pathname+parsed.search,{...init,headers});
 };
 async function dispatch(request){
  try {
   const url=new URL(request.url),path=url.pathname,method=request.method;
   if(url.origin!==origin||url.hash||!['GET','POST'].includes(method)||!['/api/lockliel/connections','/api/lockliel/my-five'].includes(path)||request.headers.has('authorization'))return response('281_ROUTE_DENIED');
   if(method==='POST'&&(request.headers.get('origin')!==origin||request.headers.get('content-type')!=='application/json'))return response('281_REQUEST_DENIED');
   const keys=[...url.searchParams.keys()];if(new Set(keys).size!==keys.length)return response('281_QUERY_DENIED');
   let body=null,id=null;
   if(method==='POST'){
    if(url.search)return response('281_QUERY_DENIED');
    const raw=await request.clone().text();if(Buffer.byteLength(raw)>14000)return response('281_BODY_DENIED');body=JSON.parse(raw);
    if(path.endsWith('/connections')){
     if(body?.action==='addReachContact') {if(!exact(body,['action','displayName'])||typeof body.displayName!=='string'||!/^Synthetic adult [AB] [0-9]{1,3}$/.test(body.displayName))return response('281_ACTION_DENIED');}
     else if(body?.action==='updateReachContact'){if(!exact(body,['action','id','status'])||!['praying','paused'].includes(body.status))return response('281_ACTION_DENIED');id=body.id;}
     else return response('281_ACTION_DENIED');
    }else {if(!exact(body,['action','id','version','note'])||body.action!=='note'||body.note!=='Synthetic private note'||typeof body.version!=='string'||!Number.isFinite(Date.parse(body.version)))return response('281_ACTION_DENIED');id=body.id;}
   }else if(path.endsWith('/connections')){
    if(url.searchParams.get('view')!=='reach'||keys.some(k=>!['view','reachStatus','reachSearch','reachLimit','reachCursor'].includes(k)))return response('281_QUERY_DENIED');
   }else {if(keys.join(',')!=='id')return response('281_QUERY_DENIED');id=url.searchParams.get('id');}
   // This is a mock of canonical requireSession, NOT a receipt or identity authority.
   // Hosted wiring must use actual requireSession (auth user + active-session RPC).
   const session=await sessionFor(request);
   if(!session?.user||!members.has(session.user.id)||typeof session.access!=='string'||!session.access||session.user.role!=='authenticated'||session.syntheticVerified!==true||session.active!==true||!Number.isFinite(session.expiresAt)||session.expiresAt<=Date.now())return response('281_SESSION_DENIED',401);
   if(id!==null&&(!UUID.test(id)||owners.get(id)!==session.user.id))return response('281_OWNER_DENIED');
   if(body?.action==='addReachContact'&&!body.displayName.startsWith(`Synthetic adult ${participants.indexOf(session.user.id)===0?'A':'B'} `))return response('281_OWNER_DENIED');
   if(method==='GET'&&path.endsWith('/connections'))parseReachPage(url.searchParams,session.user.id);
   const sessionOnce=async()=>session;
   const handler=path.endsWith('/connections')?createConnectionsHandler({sessionFor:sessionOnce,fetcher:mockTransport}):createMyFiveHandler({sessionFor:sessionOnce,fetcher:mockTransport});
   calls++;const result=await handler(request);
   // Record only correctly acknowledged newly created synthetic rows; ambiguity stops caller.
   if(body?.action==='addReachContact'&&result.ok){const ack=await result.clone().json(),row=ack.reachContact;if(!UUID.test(row?.id)||row.owner_id!==session.user.id||owners.has(row.id))return response('281_ACK_AMBIGUOUS',502);owners.set(row.id,row.owner_id);}
   return result;
  }catch{return response('281_OFFLINE_DISPATCH_FAILED',503);}
 }
 return Object.freeze({dispatch,evidence:()=>Object.freeze({syntheticOnly:true,hostedReady:false,liveAuthorized:false,calls,project})});
}
