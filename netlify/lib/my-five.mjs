// Private deterministic guidance only. No stage is an authorization decision.
export const activeStatuses=['praying','invited','connected','growing'];
export const personPath=id=>'/my-lockliel/connections/person?id='+encodeURIComponent(id);
export function personStage(person) {
  return ({praying:'Praying',invited:person.last_shared_at?'Shared':'Invited',connected:'Connecting',growing:'Growing',paused:'Paused',completed:'Completed'})[person.status]||'Unknown';
}
export function personAction(person,now=new Date()) {
  const href=personPath(person.id);
  const action=(type,label,description,urgent=false)=>({type,label,description,href,urgent});
  if(!activeStatuses.includes(person.status))return action('review','Review this person','This person is not in your active five.');
  if(person.followupAllowed===false)return action('pray','Pray privately','Keep your reflection private. Follow-up permission is not active.');
  if(person.next_follow_up_at) {
    if(Date.parse(person.next_follow_up_at)<=Number(now))return action('follow_up','Follow up','Your planned reminder is ready. Reach out thoughtfully.',true);
    return action('pray','Pray privately','Your next follow-up is scheduled. There is no need to rush.');
  }
  if(person.last_shared_at && (!person.last_follow_up_at||Date.parse(person.last_shared_at)>Date.parse(person.last_follow_up_at)))return action('follow_up','Follow up after sharing','Ask whether the resource was helpful, without pressure.',true);
  if(person.status==='praying'&&!person.last_shared_at)return action('pray','Pray','Take a moment to pray, then consider a personal encouragement.');
  if(person.status==='growing')return action('encourage','Continue encouraging','Choose a resource or invitation that supports their next step.');
  return action('share','Share something helpful','Choose a resource that fits what they have shared with you.');
}
export function nextPersonAction(people,now=new Date()) {
  // Only actionable reminders compete at dashboard priority six. Person pages
  // retain prayer/share suggestions without displacing community indefinitely.
  return people.filter(person=>person.id&&person.display_name&&person.followupAllowed!==false&&activeStatuses.includes(person.status))
    .map(person=>({person,action:personAction(person,now)})).filter(item=>item.action.urgent)
    .sort((a,b)=>String(a.person.next_follow_up_at||a.person.last_shared_at).localeCompare(String(b.person.next_follow_up_at||b.person.last_shared_at))||a.person.id.localeCompare(b.person.id))[0]||null;
}
export function personTimeline(person,preparations=[]) {
  const items=[{id:'added',at:person.created_at,label:'Added to your My Five'},
    ...(person.last_shared_at?[{id:'shared',at:person.last_shared_at,label:'You confirmed a share'}]:[]),
    ...(person.last_follow_up_at?[{id:'followed',at:person.last_follow_up_at,label:'You recorded a follow-up'}]:[]),
    ...preparations.map(event=>({id:"preparation-"+String(event.id),at:event.occurred_at,label:'Link prepared',resource:event.title||'Resource'}))];
  return items.filter(item=>Number.isFinite(Date.parse(item.at))).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||a.id.localeCompare(b.id)).slice(0,53);
}
export function contactPatch(body,person,now=new Date()) {
  if(!body||typeof body!=='object')return null;
  if(body.action==='note')return typeof body.note==='string'&&body.note.length<=3000?{private_notes:body.note.trim()||null}:null;
  if(body.action==='schedule') {
    if(body.at===null)return {next_follow_up_at:null};
    if(typeof body.at!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(body.at))return null;
    const time=Date.parse(body.at);
    return Number.isFinite(time)&&time>Number(now)&&time<=Number(now)+366*86400000?{next_follow_up_at:new Date(time).toISOString()}:null;
  }
  if(body.action==='followed_up')return {last_follow_up_at:now.toISOString(),next_follow_up_at:null};
  if(body.action==='shared')return {last_shared_at:now.toISOString(),...(person.status==='praying'?{status:'invited'}:{})};
  return null;
}
