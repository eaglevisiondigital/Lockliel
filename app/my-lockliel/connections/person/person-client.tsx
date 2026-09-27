'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
type Person={id:string;name:string;status:string;stage:string;note:string;version:string;nextFollowUp:string|null;followupAllowed:boolean;latestPreparedResource:string|null;historyLimited?:boolean;engagement:string|null;nextAction:{type:string;label:string;description:string;urgent:boolean};timeline:{id:string;at:string;label:string;resource?:string}[]};
export default function PersonClient(){
  const [person,setPerson]=useState<Person|null>(null),[note,setNote]=useState(''),[date,setDate]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[working,setWorking]=useState(false),[prayed,setPrayed]=useState(false);
  async function load(id:string){
    const response=await fetch('/api/lockliel/my-five?id='+encodeURIComponent(id),{cache:'no-store'});
    if(response.status===401){location.assign('/my-lockliel/sign-in');return;}
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Unable to load this person.');
    setPerson(data.person);setNote(data.person.note);setError('');
  }
  useEffect(()=>{const id=new URLSearchParams(location.search).get('id')||'';Promise.resolve().then(()=>load(id)).catch(error=>setError(error.message));},[]);
  async function save(action:string,fields:Record<string,unknown>={}){
    if(!person||working)return;
    setWorking(true);setMessage('');setError('');
    try{
      const response=await fetch('/api/lockliel/my-five',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:person.id,version:person.version,action,...fields})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to save.');
      await load(person.id);setMessage(action==='note'?'Private note saved.':action==='schedule'?'Reminder updated.':'Follow-up recorded.');
    }catch(error){setError(error instanceof Error?error.message:'Unable to save.');}finally{setWorking(false);}
  }
  function schedule(days:number){const at=new Date();at.setDate(at.getDate()+days);void save('schedule',{at:at.toISOString()});}
  if(!person)return <section className="ml-panel"><p role={error?'alert':'status'}>{error||'Loading your private My Five person…'}</p><button onClick={()=>location.reload()}>Try again</button></section>;
  const active=['praying','invited','connected','growing'].includes(person.status),canFollow=active&&person.followupAllowed;
  const share='/my-lockliel/share?person='+encodeURIComponent(person.id);
  return <>
    <section className="ml-panel">
      <div className="ml-kicker">My Five · {person.stage}</div><h1 style={{fontSize:'clamp(32px,5vw,52px)',overflowWrap:'anywhere'}}>{person.name}</h1>
      <h2>{prayed&&canFollow?'Consider a personal encouragement':person.nextAction.label}</h2><p>{prayed&&canFollow?'You can add a private note or choose something helpful to share.':person.nextAction.description}</p>
      {person.engagement&&<p>{person.engagement}</p>}
      {!person.followupAllowed&&<p>Follow-up permission is not active. You can keep your own notes and pray privately.</p>}
      <div className="ml-share-actions"><button onClick={()=>{setPrayed(true);setMessage('Take a quiet moment to pray. You may save a private note below; no prayer event is tracked.');}}>Pray</button><a href="#private-note">Add Note</a>{canFollow&&<><Link href={share}>Share Resource</Link><Link href={share+'&kind=invitation'}>Send Invitation</Link><a href="#follow-up">Follow Up</a></>}<a href="#history">View History</a></div>
      {person.timeline[0]&&<p>Latest recorded action: {person.timeline[0].label}{person.timeline[0].resource?' · '+person.timeline[0].resource:''}.</p>}
      {person.latestPreparedResource&&<p>Recent resource link prepared: {person.latestPreparedResource}. Preparing a link does not confirm it was sent.</p>}
    </section>
    <section id="private-note" className="ml-panel" style={{marginTop:20}}><h2>Your private note</h2><p>Only you can see this note. Updating it replaces the current note.</p>
      <label htmlFor="person-note">Note ({note.length}/3,000)</label><textarea id="person-note" value={note} onChange={event=>setNote(event.target.value)} maxLength={3000} rows={6} style={{display:'block',width:'100%',margin:'12px 0',padding:12}}/>
      <button className="ml-action" disabled={working} onClick={()=>save('note',{note})}>Save private note</button>
    </section>
    {canFollow&&<section id="follow-up" className="ml-panel" style={{marginTop:20}}><h2>Your follow-up reminder</h2><p>{person.nextFollowUp?((person.nextAction.urgent?'Due: ':'Planned: ')+new Date(person.nextFollowUp).toLocaleString()):'No reminder scheduled.'} This reminds you to act. It sends no message.</p>
      <div className="ml-share-actions"><button disabled={working} onClick={()=>schedule(1)}>Tomorrow</button><button disabled={working} onClick={()=>schedule(3)}>In 3 days</button><button disabled={working} onClick={()=>schedule(7)}>Next week</button></div>
      <form onSubmit={event=>{event.preventDefault();if(date&&!Number.isNaN(Date.parse(date)))void save('schedule',{at:new Date(date).toISOString()});}} style={{marginTop:16}}><label htmlFor="reminder-date">Custom date</label> <input id="reminder-date" type="datetime-local" required value={date} onChange={event=>setDate(event.target.value)} style={{maxWidth:'100%'}}/> <button className="ml-action" disabled={working}>Save reminder</button></form>
      <div className="ml-share-actions" style={{marginTop:16}}><button disabled={working} onClick={()=>save('followed_up')}>I followed up</button>{person.nextFollowUp&&<button disabled={working} onClick={()=>save('schedule',{at:null})}>Clear reminder</button>}</div>
    </section>}
    {message&&<p className="ml-share-message" role="status">{message}</p>}{error&&<p className="ml-auth-message error" role="alert">{error} <button onClick={()=>load(person.id).catch(error=>setError(error.message))}>Reload person</button></p>}
    <section id="history" className="ml-panel" style={{marginTop:20}}><h2>Your private history</h2><p>This shows contact creation, your latest confirmed share and follow-up, and up to 50 recent link preparations. Earlier note and status revisions were not recorded.</p>{person.historyLimited&&<p>Older link history may be omitted from this recent view.</p>}<ol style={{paddingLeft:22}}>{person.timeline.map(event=><li key={event.id} style={{marginBottom:16}}><strong>{event.label}</strong>{event.resource&&<> · {event.resource}</>}<br/><time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time></li>)}</ol></section>
  </>;
}
