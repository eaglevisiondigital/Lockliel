"use client";
import {useEffect,useMemo,useState} from "react";
import {CalendarCheck2,MapPin,Sparkles,UsersRound} from "lucide-react";

function mondayOfCurrentWeek(){
  const d=new Date();
  const day=d.getDay();
  const diff=(day===0?-6:1-day);
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
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    const d=await r.json();
    if(!r.ok){setError(d.error||"Unable to load your group.");return;}
    setData(d);
  }

  useEffect(()=>{load();},[]);

  async function submitCheckin(e:React.FormEvent<HTMLFormElement>,groupId:string){
    e.preventDefault();
    setWorking(true);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/groups",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"weeklyCheckin",
        groupId,
        weekStart:f.get("weekStart"),
        gathered:f.get("gathered")==="yes",
        attendanceCount:f.get("attendanceCount"),
        faithBoostsUsed:f.get("faithBoostsUsed"),
        peopleSharedWith:f.get("peopleSharedWith"),
        newPeopleCount:f.get("newPeopleCount"),
        nextLeaderIdentified:f.get("nextLeaderIdentified")==="yes",
        testimony:f.get("testimony"),
        needsSupport:f.get("needsSupport")
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to save weekly check-in.");return;}
    setMessage("Weekly check-in saved.");
    await load();
  }

  const defaultWeek=useMemo(()=>mondayOfCurrentWeek(),[]);

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading your group…</div>;
  if(!data.groups.length)return <section className="ml-card"><div className="ml-icon"><UsersRound size={21}/></div><h2>You are not assigned to a group yet.</h2><p>If you requested a local group, the Lockliel team can connect you when an appropriate gathering is available in your area.</p></section>;

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
              <div><b>{p.first_name||"Member"}{p.last_initial?" "+p.last_initial+".":""}</b><span>{m.role}</span></div>
            </div>;
          })}
        </div>

        {latest&&<div className="ml-latest-checkin">
          <CalendarCheck2 size={18}/>
          <div><b>Latest group check-in</b><span>Week of {new Date(latest.week_start+"T12:00:00").toLocaleDateString()} • {latest.attendance_count} attended • {latest.people_shared_with} people shared with</span></div>
        </div>}

        {canCheckIn&&<form className="ml-group-checkin" onSubmit={e=>submitCheckin(e,g.id)}>
          <div className="ml-group-checkin-head">
            <div><div className="ml-kicker">Weekly multiplication check-in</div><h3>How did this week go?</h3></div>
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

        {message&&<p className="ml-share-message">{message}</p>}
        <p className="ml-privacy-note">Group members see a limited connection card only. Email addresses, phone numbers, and private faith responses are not shown here.</p>
      </article>;
    })}
  </section>;
}