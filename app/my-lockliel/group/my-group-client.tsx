"use client";

import {useEffect,useMemo,useState} from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  MapPin,
  Sparkles,
  UserPlus,
  UsersRound,
  X
} from "lucide-react";

function mondayOfCurrentWeek(){
  const d=new Date();
  const day=d.getDay();
  const diff=day===0?-6:1-day;
  d.setDate(d.getDate()+diff);
  return d.toISOString().slice(0,10);
}

export default function MyGroupClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [working,setWorking]=useState(false);

  async function load(){
    const r=await fetch("/api/lockliel/groups",{cache:"no-store"});
    if(r.status===401){
      location.assign("/my-lockliel/sign-in");
      return;
    }

    const d=await r.json();
    if(!r.ok){
      setError(d.error||"Unable to load your group.");
      return;
    }

    setData(d);
  }

  useEffect(()=>{load();},[]);

  async function requestConnection(action:"requestGroup"|"requestHosting"){
    setWorking(true);
    setMessage("");

    const r=await fetch("/api/lockliel/groups",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setMessage(d.error||"Unable to submit request.");
      return;
    }

    setMessage(action==="requestGroup"
      ?"Your group request has been sent to the Lockliel team."
      :"Your hosting-interest request has been sent to the Lockliel team."
    );
    await load();
  }

  async function cancelRequest(requestId:string){
    setWorking(true);
    setMessage("");

    const r=await fetch("/api/lockliel/groups",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"cancelRequest",requestId})
    });
    setWorking(false);

    if(r.ok){
      setMessage("Request cancelled.");
      await load();
    }
  }

  async function submitCheckin(e:React.FormEvent<HTMLFormElement>,groupId:string){
    e.preventDefault();
    setWorking(true);
    setMessage("");

    const form=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/groups",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"weeklyCheckin",
        groupId,
        weekStart:form.get("weekStart"),
        gathered:form.get("gathered")==="yes",
        attendanceCount:form.get("attendanceCount"),
        faithBoostsUsed:form.get("faithBoostsUsed"),
        peopleSharedWith:form.get("peopleSharedWith"),
        newPeopleCount:form.get("newPeopleCount"),
        nextLeaderIdentified:form.get("nextLeaderIdentified")==="yes",
        testimony:form.get("testimony"),
        needsSupport:form.get("needsSupport")
      })
    });

    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setMessage(d.error||"Unable to save weekly check-in.");
      return;
    }

    setMessage("Weekly check-in saved.");
    await load();
  }

  const defaultWeek=useMemo(()=>mondayOfCurrentWeek(),[]);

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading your group…</div>;

  const requests=data.requests||[];
  const groupRequest=requests.find((r:any)=>r.request_type==="find_local_group");
  const hostRequest=requests.find((r:any)=>r.request_type==="explore_hosting");
  const alreadyLeading=(data.groups||[]).some((g:any)=>["leader","host"].includes(g.myRole));

  if(!data.groups.length){
    return <section className="ml-group-empty">
      <section className="ml-card">
        <div className="ml-icon"><UsersRound size={21}/></div>
        <h2>You are not assigned to a group yet.</h2>
        <p>A Lockliel gathering is designed to stay relational and reproducible: connect, watch, talk, act, and multiply.</p>

        {groupRequest
          ? <div className="ml-open-request">
              <CheckCircle2 size={16}/>
              <div><b>Local group request is open</b><span>The Lockliel team can review your area and available leaders.</span></div>
              <button disabled={working} onClick={()=>cancelRequest(groupRequest.id)}><X size={13}/> Cancel</button>
            </div>
          : <button className="ml-action" disabled={working} onClick={()=>requestConnection("requestGroup")}>
              <UserPlus size={15}/> Help me find a group
            </button>}
      </section>

      <section className="ml-card">
        <div className="ml-icon"><Sparkles size={21}/></div>
        <h2>Interested in hosting?</h2>
        <p>You do not have to be a preacher. Hosts gather people, facilitate conversation, point to Scripture, encourage, pray, and help people take a next step.</p>

        {hostRequest
          ? <div className="ml-open-request">
              <CheckCircle2 size={16}/>
              <div><b>Hosting conversation requested</b><span>A Lockliel reviewer can follow up with you about next steps.</span></div>
              <button disabled={working} onClick={()=>cancelRequest(hostRequest.id)}><X size={13}/> Cancel</button>
            </div>
          : <button className="ml-action" disabled={working} onClick={()=>requestConnection("requestHosting")}>
              Explore hosting
            </button>}
      </section>

      {message&&<p className="ml-share-message">{message}</p>}
    </section>;
  }

  return <section className="ml-group-member-grid">
    {data.groups.map((g:any)=>{
      const canCheckIn=["leader","host"].includes(g.myRole);
      const latest=g.checkins?.[0];

      return <article className="ml-panel ml-member-group" key={g.id}>
        <div className="ml-group-title">
          <div className="ml-icon"><UsersRound size={20}/></div>
          <div>
            <div className="ml-kicker">{g.myRole}</div>
            <h2>{g.name}</h2>
            <span><MapPin size={12}/>{[g.city,g.region,g.country].filter(Boolean).join(", ")}</span>
          </div>
        </div>

        <div className="ml-safe-roster">
          <div className="ml-kicker">Your group</div>
          {g.members.map((m:any)=>{
            const p=m.person||{};
            return <div className="ml-roster-person" key={m.profile_id}>
              <div className="ml-avatar">{(p.first_name||"?").slice(0,1)}</div>
              <div>
                <b>{p.first_name||"Member"}{p.last_initial?" "+p.last_initial+".":""}</b>
                <span>{m.role}</span>
              </div>
            </div>;
          })}
        </div>

        {latest&&<div className="ml-latest-checkin">
          <CalendarCheck2 size={18}/>
          <div>
            <b>Latest group check-in</b>
            <span>
              Week of {new Date(latest.week_start+"T12:00:00").toLocaleDateString()}
              {" • "}{latest.attendance_count} attended
              {" • "}{latest.people_shared_with} people shared with
            </span>
          </div>
        </div>}

        {canCheckIn&&<form className="ml-group-checkin" onSubmit={e=>submitCheckin(e,g.id)}>
          <div className="ml-group-checkin-head">
            <div>
              <div className="ml-kicker">Weekly multiplication check-in</div>
              <h3>How did this week go?</h3>
            </div>
            <Sparkles size={22}/>
          </div>

          <label>Week starting<input name="weekStart" type="date" defaultValue={defaultWeek} required/></label>
          <label className="ml-check-line"><input type="checkbox" name="gathered" value="yes"/> We gathered this week.</label>

          <div className="ml-checkin-numbers">
            <label>Attendance<input name="attendanceCount" type="number" min="0" defaultValue="0"/></label>
            <label>Faith Boosts used<input name="faithBoostsUsed" type="number" min="0" max="50" defaultValue="0"/></label>
            <label>People shared with<input name="peopleSharedWith" type="number" min="0" defaultValue="0"/></label>
            <label>New people<input name="newPeopleCount" type="number" min="0" defaultValue="0"/></label>
          </div>

          <label className="ml-check-line"><input type="checkbox" name="nextLeaderIdentified" value="yes"/> We identified someone who may be ready to help lead or multiply.</label>
          <label>Testimony or win <span>Optional</span><textarea name="testimony" rows={3} placeholder="What is God doing in people?"/></label>
          <label>Where do you need support? <span>Optional</span><textarea name="needsSupport" rows={3} placeholder="Questions, resources, follow-up, prayer, or help needed."/></label>

          <button className="ml-action" disabled={working}>{working?"Saving…":"Save weekly check-in"}</button>
        </form>}

        {!alreadyLeading&&<div className="ml-host-interest">
          <div><b>Feel called to help host someday?</b><span>Start a conversation with the Lockliel team without changing your current group.</span></div>
          {hostRequest
            ? <button disabled={working} onClick={()=>cancelRequest(hostRequest.id)}>Cancel request</button>
            : <button disabled={working} onClick={()=>requestConnection("requestHosting")}>Explore hosting</button>}
        </div>}

        {message&&<p className="ml-share-message">{message}</p>}

        <p className="ml-privacy-note">Group members see a limited connection card only. Email addresses, phone numbers, and private faith responses are not shown here.</p>
      </article>;
    })}
  </section>;
}
