const keys={
  profiles:['id'],faith_profiles:['profile_id'],communication_preferences:['profile_id'],
  communication_preference_events:['id'],contact_permissions:['profile_id','other_profile_id','permission_type'],
  tags:['id'],profile_tags:['profile_id','tag_id'],course_enrollments:['id'],
  lesson_progress:['profile_id','lesson_id'],media_progress:['profile_id','asset_id'],
  reach_contacts:['id'],referral_links:['id'],referral_events:['id'],
  group_members:['group_id','profile_id'],leader_assignments:['member_id'],
  founders50_applications:['id'],founder_orientation_progress:['profile_id','step_id'],
  notifications:['id'],gifts:['id'],partner_commitments:['id'],orders:['id'],
  entitlements:['id'],privacy_requests:['id'],order_items:['id'],order_shipping_addresses:['order_id']
};

// Counts and duplicate checks detect paging drift; this is not a cross-table snapshot.
export async function exportRows(source,headers,{fetchImpl=fetch,pageSize=500,maxRows=10000,budget={bytes:0,maxBytes:4000000}}={}){
  const url=new URL(source);
  const primary=keys[url.pathname.split('/').pop()];
  if(!primary)throw new Error('Unknown export source');
  const selected=(url.searchParams.get('select')||'*').split(',');
  const added=selected.includes('*')?[]:primary.filter(key=>!selected.includes(key));
  url.searchParams.set('select',[...selected,...added].join(','));
  const order=url.searchParams.get('order');
  url.searchParams.set('order',[...(order?[order]:[]),...primary.map(key=>key+'.asc')].join(','));
  const all=[];
  const seen=new Set();
  let total;
  do{
    url.searchParams.set('offset',String(all.length));
    url.searchParams.set('limit',String(pageSize));
    const response=await fetchImpl(url.toString(),{headers:{...headers,Prefer:'count=exact'}});
    if(!response.ok)throw new Error('Export source unavailable');
    const data=await response.json();
    const match=response.headers.get('Content-Range')?.match(/^(?:(\d+)-(\d+)|(\*))\/(\d+)$/);
    if(!Array.isArray(data)||!match)throw new Error('Invalid export page');
    const count=Number(match[4]);
    if(!Number.isSafeInteger(count)||count>maxRows||(total!==undefined&&count!==total))throw new Error('Export size or count changed');
    total=count;
    if(total===0){if(data.length!==0||all.length!==0)throw new Error('Invalid empty export');return [];}
    if(Number(match[1])!==all.length||Number(match[2])!==all.length+data.length-1||!data.length||data.length>pageSize||all.length+data.length>total)throw new Error('Export range mismatch');
    for(const row of data){
      if(!row||primary.some(key=>typeof row[key]!=='string'&&typeof row[key]!=='number'))throw new Error('Missing export identity');
      const identity=JSON.stringify(primary.map(key=>row[key]));
      if(seen.has(identity))throw new Error('Duplicate export identity');
      seen.add(identity);
      const item={...row};
      for(const key of added)delete item[key];
      budget.bytes+=new TextEncoder().encode(JSON.stringify(item)).length;
      if(budget.bytes>budget.maxBytes)throw new Error('Export byte limit exceeded');
      all.push(item);
    }
  }while(all.length<total);
  return all;
}
