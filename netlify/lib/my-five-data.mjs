import {memberRows} from './member-journey-data.mjs';
import {personAction,personStage,personTimeline} from './my-five.mjs';
export const isContactId=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export async function followupAllowed(rows,uid,person) {
  if(!person.linked_profile_id)return true;
  const permissions=await rows('contact_permissions?profile_id=eq.'+encodeURIComponent(person.linked_profile_id)+'&other_profile_id=eq.'+encodeURIComponent(uid)+'&permission_type=eq.inviter_followup&revoked_at=is.null&select=id&limit=1');
  return permissions.length>0;
}
export async function ownPerson(session,id,fetcher=globalThis.fetch) {
  const rows=memberRows(session.access,fetcher);
  const people=await rows('reach_contacts?id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(session.user.id)+'&select=id,display_name,status,linked_profile_id,private_notes,last_shared_at,last_follow_up_at,next_follow_up_at,created_at,updated_at&limit=1');
  const person=people[0];
  if(person)person.followupAllowed=await followupAllowed(rows,session.user.id,person);
  return {person,rows};
}
export async function personView(session,person,rows,now=new Date()) {
  const links=await rows('referral_links?owner_id=eq.'+encodeURIComponent(session.user.id)+'&reach_contact_id=eq.'+encodeURIComponent(person.id)+'&select=id,content_id&order=created_at.desc&limit=100');
  let preparations=[],engagement=null;
  if(links.length) {
    const linkFilter='referral_link_id='+encodeURIComponent('in.('+links.map(link=>link.id).join(',')+')');
    const events=await rows('referral_events?'+linkFilter+'&member_id=eq.'+encodeURIComponent(session.user.id)+'&event_type=eq.share_initiated&select=id,referral_link_id,occurred_at&order=occurred_at.desc&limit=50');
    const contentIds=[...new Set(links.map(link=>link.content_id).filter(Boolean))];
    const assets=contentIds.length?await rows('share_assets?id='+encodeURIComponent('in.('+contentIds.join(',')+')')+'&select=id,title'):[];
    preparations=events.map(event=>({...event,title:assets.find(asset=>asset.id===links.find(link=>link.id===event.referral_link_id)?.content_id)?.title}));
    if(person.linked_profile_id&&person.followupAllowed) {
      const evidence=await rows('referral_events?'+linkFilter+'&member_id=eq.'+encodeURIComponent(person.linked_profile_id)+'&event_type=in.(signup,course_started)&select=event_type&limit=1');
      if(evidence.length)engagement='Engaged with your invitation';
    }
  }
  return {id:person.id,name:person.display_name,status:person.status,stage:personStage(person),note:person.private_notes||'',version:person.updated_at,
    nextAction:personAction(person,now),followupAllowed:person.followupAllowed,nextFollowUp:person.next_follow_up_at,
    latestPreparedResource:preparations[0]?.title||null,historyLimited:links.length===100||preparations.length===50,engagement,timeline:personTimeline(person,preparations)};
}
