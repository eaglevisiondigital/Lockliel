"use client";
import {useEffect,useMemo,useState} from "react";
import {Check,Heart,MessageCircle,Send,Share2,UserPlus,Users} from "lucide-react";

type Card={
  profile_id:string;
  first_name?:string;
  last_initial?:string;
  city?:string;
  region?:string;
  country?:string;
};

type Message={
  id:number;
  sender_id:string;
  body:string;
  created_at:string;
};

type Conversation={
  id:string;
  type:string;
  other:Card|null;
  messages:Message[];
};

type ReachContact={
  id:string;
  display_name:string;
  relationship_context?:string|null;
  status:string;
  last_shared_at?:string|null;
  last_follow_up_at?:string|null;
  next_follow_up_at?:string|null;
  private_notes?:string|null;
};

export default function ConnectionsClient(){
  const [data,setData]=useState<{
    conversations:Conversation[];
    tasks:any[];
    reachContacts:ReachContact[];
    messagingEnabled?:boolean;
    leaderAssignment?:any;
    leaderRequest?:any;
  }|null>(null);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [drafts,setDrafts]=useState<Record<string,string>>({});
  const [working,setWorking]=useState(false);

  async function load(){
    const r=await fetch("/api/lockliel/connections",{cache:"no-store"});
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    const d=await r.json();
    if(!r.ok){setError(d.error||"Unable to load connections.");return;}
    setData(d);
  }

  useEffect(()=>{load();},[]);

  async function send(id:string){
    if(data?.messagingEnabled===false)return;
    const body=(drafts[id]||"").trim();
    if(!body)return;
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"sendMessage",conversationId:id,body})
    });
    if(r.ok){
      setDrafts(v=>({...v,[id]:""}));
      await load();
    }
  }

  async function requestLeader(){
    setWorking(true);
    setMessage("");
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"requestLeader"})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){
      setMessage(d.error||"Unable to submit leader request.");
      return;
    }
    setMessage("Your leader request has been sent to the Lockliel team.");
    await load();
  }

  async function cancelLeaderRequest(){
    if(!data?.leaderRequest?.id)return;
    setWorking(true);
    setMessage("");
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"cancelLeaderRequest",requestId:data.leaderRequest.id})
    });
    setWorking(false);
    if(r.ok){
      setMessage("Leader request cancelled.");
      await load();
    }
  }

  async function complete(taskId:string){
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"completeTask",taskId})
    });
    if(r.ok)await load();
  }

  async function addPerson(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"addReachContact",
        displayName:f.get("displayName"),
        relationshipContext:f.get("relationshipContext"),
        nextFollowUpAt:f.get("nextFollowUpAt"),
        privateNotes:f.get("privateNotes")
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to add person.");return;}
    setMessage("Added to My Five.");
    e.currentTarget.reset();
    await load();
  }

  async function updateReach(id:string,status:string){
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"updateReachContact",id,status})
    });
    if(r.ok)await load();
  }

  async function markActivity(id:string,activity:"shared"|"followed_up"){
    const r=await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"markReachActivity",id,activity})
    });
    if(r.ok){
      setMessage(activity==="shared"?"Share activity recorded. Follow up personally.":"Follow-up recorded. We’ll keep this person on your radar.");
      await load();
    }
  }

  const leaderConversation=useMemo(()=>data?.conversations.find(c=>c.type==="leader_followup"&&c.other)||null,[data]);
  const people=useMemo(()=>data?.conversations.filter(c=>c.type!=="leader_followup"&&c.other)||[],[data]);
  const activeFive=useMemo(
    ()=>data?.reachContacts.filter(c=>["praying","invited","connected","growing"].includes(c.status))||[],
    [data]
  );
  const history=useMemo(
    ()=>data?.reachContacts.filter(c=>["paused","completed"].includes(c.status))||[],
    [data]
  );

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading your connections…</div>;

  return <>
    <section className="ml-connection-summary">
      <article className="ml-card"><div className="ml-icon"><Heart size={20}/></div><strong>{activeFive.length}</strong><span>in My Five</span></article>
      <article className="ml-card"><div className="ml-icon"><Users size={20}/></div><strong>{people.length}</strong><span>Lockliel connections</span></article>
      <article className="ml-card"><div className="ml-icon"><Check size={20}/></div><strong>{data.tasks.length}</strong><span>follow-ups to do</span></article>
    </section>

    <section className="ml-panel ml-my-five">
      <div className="ml-my-five-head">
        <div><div className="ml-kicker">My Five</div><h2>Who are you intentionally reaching?</h2><p>Keep five people in front of you. Pray. Share. Follow up. Help them take a next step.</p></div>
        <span>{activeFive.length}/5 active</span>
      </div>

      <div className="ml-five-grid">
        {activeFive.map(person=><article className="ml-five-person" key={person.id}>
          <div className="ml-five-person-top">
            <div className="ml-avatar">{person.display_name.slice(0,1).toUpperCase()}</div>
            <div><h3>{person.display_name}</h3><span>{person.relationship_context||"Someone I’m intentionally reaching"}</span></div>
          </div>
          <div className="ml-five-status">
            <select value={person.status} onChange={e=>updateReach(person.id,e.target.value)}>
              <option value="praying">Praying</option>
              <option value="invited">Invited / shared</option>
              <option value="connected">Connected</option>
              <option value="growing">Growing</option>
              <option value="completed">Completed / multiplying</option>
              <option value="paused">Pause</option>
            </select>
          </div>
          <div className="ml-five-actions">
            <button onClick={()=>markActivity(person.id,"shared")}><Share2 size={14}/> I shared</button>
            <button onClick={()=>markActivity(person.id,"followed_up")}><MessageCircle size={14}/> Followed up</button>
          </div>
          <div className="ml-five-dates">
            {person.last_shared_at&&<span>Shared {new Date(person.last_shared_at).toLocaleDateString()}</span>}
            {person.last_follow_up_at&&<span>Followed up {new Date(person.last_follow_up_at).toLocaleDateString()}</span>}
            {person.next_follow_up_at&&<span>Next follow-up {new Date(person.next_follow_up_at).toLocaleDateString()}</span>}
          </div>
        </article>)}

        {activeFive.length<5&&<form className="ml-five-add" onSubmit={addPerson}>
          <div className="ml-icon"><UserPlus size={19}/></div>
          <h3>Add someone to My Five</h3>
          <label>Name<input name="displayName" required placeholder="First name or a name you recognize"/></label>
          <label>How you know them <span>Optional</span><input name="relationshipContext" placeholder="Friend, coworker, neighbor…"/></label>
          <label>Next follow-up <span>Optional</span><input name="nextFollowUpAt" type="datetime-local"/></label>
          <label>Private note <span>Optional</span><textarea name="privateNotes" rows={2} placeholder="Only you can see this note."/></label>
          <button className="ml-action" disabled={working}>{working?"Adding…":"Add to My Five"}</button>
        </form>}
      </div>

      <p className="ml-privacy-note">My Five names and private notes are visible only to you. They are not exposed to leaders, administrators, or other members.</p>
      {message&&<p className="ml-share-message">{message}</p>}

      {history.length>0&&<details className="ml-five-history">
        <summary>View completed / paused people ({history.length})</summary>
        <div>{history.map(person=><span key={person.id}>{person.display_name} • {person.status}</span>)}</div>
      </details>}
    </section>

    {!data.leaderAssignment&&<section className="ml-panel ml-assigned-leader">
      <div className="ml-kicker">Lockliel leader / mentor</div>
      <div className="ml-assigned-leader-head">
        <div className="ml-avatar">L</div>
        <div>
          <h2>Would a leader connection help?</h2>
          <span>Optional ministry support</span>
        </div>
      </div>
      <p>A Lockliel leader or mentor can help you take a next step, answer questions, and stay connected. This does not replace your local church or pastor.</p>
      {data.leaderRequest
        ? <div className="ml-open-request">
            <Check size={15}/>
            <div><b>Leader request is open</b><span>The Lockliel team can review your location and available approved leaders.</span></div>
            <button disabled={working} onClick={cancelLeaderRequest}>Cancel</button>
          </div>
        : <button className="ml-action" disabled={working} onClick={requestLeader}>Request a leader connection</button>}
    </section>}

    {data.leaderAssignment&&<section className="ml-panel ml-assigned-leader">
      <div className="ml-kicker">My assigned Lockliel leader</div>
      <div className="ml-assigned-leader-head">
        <div className="ml-avatar">{(data.leaderAssignment.person?.first_name||"L").slice(0,1)}</div>
        <div>
          <h2>{data.leaderAssignment.person?.first_name||"Lockliel leader"}{data.leaderAssignment.person?.last_initial?" "+data.leaderAssignment.person.last_initial+".":""}</h2>
          <span>{data.leaderAssignment.assignment_type.replaceAll("_"," ")}{data.leaderAssignment.person?.city?" • "+[data.leaderAssignment.person.city,data.leaderAssignment.person.region].filter(Boolean).join(", "):""}</span>
        </div>
      </div>
      <p>Your original inviter remains part of your Lockliel story. This leader is the person currently assigned to help you grow and take your next step.</p>
      {leaderConversation&&<>
        <div className="ml-message-thread">
          {leaderConversation.messages.length
            ? leaderConversation.messages.slice(-6).map(m=><p key={m.id}>{m.body}<small>{new Date(m.created_at).toLocaleString()}</small></p>)
            : <p className="ml-empty-message">You can message your assigned leader here without exposing private contact information.</p>}
        </div>
        <div className="ml-message-compose">
          <input disabled={data.messagingEnabled===false} value={drafts[leaderConversation.id]||""} onChange={e=>setDrafts(v=>({...v,[leaderConversation.id]:e.target.value}))} placeholder={data.messagingEnabled===false?"Messaging temporarily unavailable":"Message my leader…"}/>
          <button disabled={data.messagingEnabled===false} onClick={()=>send(leaderConversation.id)} aria-label="Send message to leader"><Send size={17}/></button>
        </div>
      </>}
    </section>}

    {data.tasks.length>0&&<section className="ml-panel ml-followups">
      <div className="ml-kicker">Follow up</div>
      <h2>People worth checking on</h2>
      {data.tasks.map(t=><div className="ml-followup-row" key={t.id}>
        <div><b>{t.notes||"Follow up"}</b><span>{t.due_at?"Due "+new Date(t.due_at).toLocaleDateString():""}</span></div>
        <button onClick={()=>complete(t.id)}><Check size={15}/> Done</button>
      </div>)}
    </section>}

    <h2 className="ml-section-title">People who joined through your connections</h2>
    {people.length===0
      ? <section className="ml-card"><div className="ml-icon"><MessageCircle size={20}/></div><h2>Your Lockliel connections will appear here.</h2><p>When someone joins through your personal Lockliel invitation, you can follow up inside Lockliel without needing their private email or phone number.</p></section>
      : <section className="ml-conversation-grid">
          {people.map(c=><article className="ml-panel ml-conversation" key={c.id}>
            <div className="ml-conversation-person">
              <div className="ml-avatar">{(c.other?.first_name||"?").slice(0,1)}</div>
              <div><h3>{c.other?.first_name}{c.other?.last_initial?" "+c.other.last_initial+".":""}</h3><span>{[c.other?.city,c.other?.region].filter(Boolean).join(", ")}</span></div>
            </div>
            <div className="ml-message-thread">
              {c.messages.length
                ? c.messages.slice(-6).map(m=><p key={m.id}>{m.body}<small>{new Date(m.created_at).toLocaleString()}</small></p>)
                : <p className="ml-empty-message">Send a welcome message when you're ready.</p>}
            </div>
            <div className="ml-message-compose">
              <input disabled={data.messagingEnabled===false} value={drafts[c.id]||""} onChange={e=>setDrafts(v=>({...v,[c.id]:e.target.value}))} placeholder={data.messagingEnabled===false?"Messaging temporarily unavailable":"Write a message…"}/>
              <button disabled={data.messagingEnabled===false} onClick={()=>send(c.id)} aria-label="Send message"><Send size={17}/></button>
            </div>
          </article>)}
        </section>}
  </>;
}