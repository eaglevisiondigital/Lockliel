import {withProductionBackend} from '../lib/deployment-safety.mjs';
import {json,requireSession,sessionCookies} from '../lib/lockliel-core.mjs';
import {isContactId,ownPerson,personView} from '../lib/my-five-data.mjs';
import {activeStatuses,contactPatch} from '../lib/my-five.mjs';
export function createMyFiveHandler({sessionFor=requireSession,fetcher=globalThis.fetch,clock=()=>new Date()}={}) {
  return async request=>{
    if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
    if(request.method==='POST'&&request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request not allowed'},403);
    try {
      const session=await sessionFor(request);
      if(!session.user?.id||!session.access)return json({error:'Unauthorized'},401);
      let body={};
      if(request.method==='POST') {
        const raw=await request.text();
        if(new TextEncoder().encode(raw).length>14000)return json({error:'Your note is too large.'},413);
        try{body=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
      }
      const id=request.method==='GET'?new URL(request.url).searchParams.get('id'):body?.id;
      if(!isContactId(id))return json({error:'Choose a person from My Five.'},400);
      const {person,rows}=await ownPerson(session,id,fetcher);
      if(!person)return json({error:'Person not found'},404);
      const cookies=session.refreshed?sessionCookies(session.refreshed):[];
      if(request.method==='GET')return json({person:await personView(session,person,rows,clock())},200,cookies);
      if(typeof body.version!=='string'||body.version!==person.updated_at)return json({error:'This person changed. Reload before saving.'},409);
      if(body.action!=='note'&&(!activeStatuses.includes(person.status)||!person.followupAllowed))return json({error:'Follow-up is not available for this person.'},403);
      const patch=contactPatch(body,person,clock());
      if(!patch)return json({error:'Use a note of at most 3,000 characters or a future reminder within one year.'},400);
      const changed=await rows('reach_contacts?id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(session.user.id)+'&updated_at=eq.'+encodeURIComponent(body.version)+'&select=id',{
        method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patch)
      });
      if(changed.length!==1)return json({error:'This person changed. Reload before saving.'},409);
      return json({ok:true},200,cookies);
    } catch {return json({error:'Unable to load or save My Five. Please try again.'},503);}
  };
}
export default withProductionBackend(createMyFiveHandler());
export const config={path:'/api/lockliel/my-five',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
