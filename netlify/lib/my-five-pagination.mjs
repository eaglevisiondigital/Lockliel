// Cursor is nonsecret navigation state, never authorization. Owner is always session-derived.
const statuses=['all','active','praying','invited','connected','growing','paused','completed'];
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const timestamp=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const validTime=value=>{if(typeof value!=='string'||!timestamp.test(value)||!Number.isFinite(Date.parse(value)))return false;const [year,month,day]=value.slice(0,10).split('-').map(Number);const days=[31,year%4===0&&(year%100!==0||year%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];return year>0&&month>=1&&month<=12&&day>=1&&day<=days[month-1];};
const bad=()=>{throw new Error('Invalid My Five page request');};
export function parseReachPage(params,owner){
 if(!uuid.test(owner))bad();
 const names=['reachStatus','reachSearch','reachLimit','reachCursor'];
 for(const name of names)if(params.getAll(name).length>1)bad();
 const status=params.get('reachStatus')||'all',search=(params.get('reachSearch')||'').trim();
 const rawSize=params.get('reachLimit')||'25',pageSize=Number(rawSize);
 if(!statuses.includes(status)||search.length>80||! /^[\p{L}\p{N} '\-]*$/u.test(search)||!/^\d{1,2}$/.test(rawSize)||!Number.isInteger(pageSize)||pageSize<1||pageSize>50)bad();
 let cursor=null;const encoded=params.get('reachCursor');
 if(encoded){
  if(encoded.length>1000||!/^[A-Za-z0-9_-]+$/.test(encoded))bad();
  try{cursor=JSON.parse(Buffer.from(encoded,'base64url').toString('utf8'));}catch{bad();}
  if(!cursor||Object.keys(cursor).sort().join(',')!=='createdAt,id,owner,search,size,status,v'||cursor.v!==1||cursor.owner!==owner||cursor.status!==status||cursor.search!==search||cursor.size!==pageSize||!uuid.test(cursor.id)||!validTime(cursor.createdAt))bad();
 }
 return {owner,status,search,pageSize,cursor};
}
export function reachPageQuery(page){
 const params=new URLSearchParams({owner_id:`eq.${page.owner}`,select:'owner_id,id,display_name,relationship_context,status,linked_profile_id,last_shared_at,last_follow_up_at,next_follow_up_at,private_notes,created_at,updated_at',order:'created_at.desc,id.desc',limit:String(page.pageSize+1)});
 if(page.status==='active')params.set('status','in.(praying,invited,connected,growing)');else if(page.status!=='all')params.set('status',`eq.${page.status}`);
 if(page.search)params.set('display_name',`ilike.*${page.search}*`);
 if(page.cursor)params.set('or',`(created_at.lt.${page.cursor.createdAt},and(created_at.eq.${page.cursor.createdAt},id.lt.${page.cursor.id}))`);
 return params.toString();
}
// PostgreSQL char_length counts Unicode code points, not UTF-16 code units.
const withinCharacters=(value,max)=>{let count=0;for(const character of value){void character;if(++count>max)return false;}return true;};
const fields=['id','display_name','relationship_context','status','linked_profile_id','last_shared_at','last_follow_up_at','next_follow_up_at','private_notes','created_at','updated_at'];
const timeKey=value=>BigInt(Math.floor(Date.parse(value)/1000))*1000000n+BigInt((value.match(/\.(\d+)/)?.[1]||'').padEnd(6,'0'));
const before=(a,b)=>timeKey(a.created_at)<timeKey(b.created_at)||(timeKey(a.created_at)===timeKey(b.created_at)&&a.id.toLowerCase()<b.id.toLowerCase());
export function finishReachPage(rows,page){
 if(!Array.isArray(rows)||rows.length>page.pageSize+1)throw Error('Invalid My Five page response');
 const seen=new Set();let previous=page.cursor?{created_at:page.cursor.createdAt,id:page.cursor.id}:null;
 for(const row of rows){
  if(!row||Object.keys(row).some(key=>key!=='owner_id'&&!fields.includes(key))||row.owner_id!==page.owner||!uuid.test(row.id)||!validTime(row.created_at)||seen.has(row.id)||!statuses.slice(2).includes(row.status)||typeof row.display_name!=='string'||!withinCharacters(row.display_name,120)||!row.display_name.trim())throw Error('Invalid My Five page response');
  for(const field of ['last_shared_at','last_follow_up_at','next_follow_up_at','updated_at'])if(row[field]!=null&&!validTime(row[field]))throw Error('Invalid My Five page response');
  for(const [field,max] of [['relationship_context',500],['private_notes',3000]])if(row[field]!=null&&(typeof row[field]!=='string'||!withinCharacters(row[field],max)))throw Error('Invalid My Five page response');
  if(row.linked_profile_id!=null&&!uuid.test(row.linked_profile_id))throw Error('Invalid My Five page response');
  if(previous&&!before(row,previous))throw Error('Invalid My Five page ordering');
  if(page.status==='active'&&!['praying','invited','connected','growing'].includes(row.status)||!['all','active'].includes(page.status)&&row.status!==page.status)throw Error('Invalid My Five page response');
  if(page.search&&!row.display_name.toLowerCase().includes(page.search.toLowerCase()))throw Error('Invalid My Five search response');
  previous=row;seen.add(row.id);
 }
 const contacts=rows.slice(0,page.pageSize).map(row=>Object.fromEntries(fields.filter(key=>Object.hasOwn(row,key)).map(key=>[key,row[key]]))),hasMore=rows.length>page.pageSize,last=contacts.at(-1);
 const nextCursor=hasMore?Buffer.from(JSON.stringify({v:1,owner:page.owner,status:page.status,search:page.search,size:page.pageSize,createdAt:last.created_at,id:last.id})).toString('base64url'):null;
 return {contacts,page:{version:1,pageSize:page.pageSize,hasMore,nextCursor,total:null,scope:'filtered-page',completeness:'unverified'}};
}
