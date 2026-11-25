// Offline command planning only. No fetch, credentials, sessions, persistence or live authority.
import {parseReachPage} from '../../netlify/lib/my-five-pagination.mjs';
const owners=Object.freeze({A:'10000000-0000-4000-8000-000000000001',B:'10000000-0000-4000-8000-000000000002'});
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const exact=(value,keys)=>value&&Object.getPrototypeOf(value)===Object.prototype&&Object.keys(value).sort().join(',')===[...keys].sort().join(',');
const deny=()=>{throw Error('SYNTHETIC_PLAN_DENIED');};
const time=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
export function createSyntheticAcceptancePlan(){
 const created=new Map(),pending=new Map(),seenIds=new Set(),ownerAdds={A:0,B:0};let requests=0,adds=0,stopped=false;
 function prepare(label,method,path,query='',body=null){
  if(stopped||!Object.hasOwn(owners,label)||requests>=260||pending.size>=4)deny();
  const owner=owners[label],params=new URLSearchParams(query);let kind='read',id=null,status=null;
  if([...params.keys()].some((key,index,keys)=>keys.indexOf(key)!==index))deny();
  if(path==='/api/lockliel/connections'&&method==='GET'){
   if(body!==null||params.get('view')!=='reach'||[...params.keys()].some(k=>!['view','reachStatus','reachSearch','reachLimit','reachCursor'].includes(k)))deny();
   parseReachPage(params,owner);
  }else if(path==='/api/lockliel/connections'&&method==='POST'&&query===''){
   if(exact(body,['action','displayName'])&&body.action==='addReachContact'){
    if(typeof body.displayName!=='string'||!/^Synthetic adult [AB] [0-9]{1,3}$/.test(body.displayName)||!body.displayName.startsWith(`Synthetic adult ${label} `)||adds>=70||ownerAdds[label]>=(label==='A'?64:6))deny();
    kind='add';
   }else if(exact(body,['action','id','status'])&&body.action==='updateReachContact'&&['praying','paused'].includes(body.status)){
    kind='status';id=body.id;status=body.status;
   }else deny();
  }else if(path==='/api/lockliel/my-five'&&method==='GET'){
   if(body!==null||[...params.keys()].join(',')!=='id')deny();id=params.get('id');
  }else if(path==='/api/lockliel/my-five'&&method==='POST'&&query===''){
   if(!exact(body,['action','id','version','note'])||body.action!=='note'||body.note!=='Synthetic private note'||!time(body.version))deny();
   kind='note';id=body.id;
  }else deny();
  if(id!==null&&(typeof id!=='string'||!uuid.test(id)||created.get(id)!==owner))deny();
  const ticket=Object.freeze({});pending.set(ticket,{owner,kind,id,status});requests++;if(kind==='add'){adds++;ownerAdds[label]++;}
  return Object.freeze({ticket,command:Object.freeze({method,path,query,body:body===null?null:Object.freeze({...body}),syntheticOnly:true,liveEligible:false})});
 }
 function reconcile(ticket,receipt){
  const op=pending.get(ticket);if(stopped||!op)deny();pending.delete(ticket);
  const fail=()=>{stopped=true;pending.clear();deny();};
  // These are mock canonical handler acknowledgments, never independent provider receipts.
  if(op.kind==='add'||op.kind==='status'){
   if(!exact(receipt,['ok','reachContact'])||receipt.ok!==true)fail();const row=receipt.reachContact;
   if(!exact(row,['id','owner_id','status'])||typeof row.id!=='string'||!uuid.test(row.id)||row.owner_id!==op.owner||row.status!==(op.kind==='add'?'praying':op.status))fail();
   if(op.kind==='add'){if(seenIds.has(row.id))fail();seenIds.add(row.id);created.set(row.id,op.owner);}else if(row.id!==op.id)fail();
  }else if(!exact(receipt,['ok'])||receipt.ok!==true)fail();
  return Object.freeze({reconciled:true,syntheticOnly:true,liveEligible:false});
 }
 function interrupt(){stopped=true;pending.clear();}
 function evidence(){return Object.freeze({syntheticOnly:true,liveEligible:false,stopped,requests,attemptedAdds:adds,pending:pending.size,cleanupSupported:false,cleanupRequestReserve:40,created:Object.freeze([...created].map(([id,owner])=>Object.freeze({id,owner}))) });}
 return Object.freeze({prepare,reconcile,interrupt,evidence});
}
