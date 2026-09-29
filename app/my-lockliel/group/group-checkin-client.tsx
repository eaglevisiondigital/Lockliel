"use client";
import {useEffect,useMemo,useState} from "react";
import {CalendarCheck2,CheckCircle2,UsersRound} from "lucide-react";

function mondayISO(){
  const d=new Date();
  const day=d.getDay();
  const diff=(day===0?-6:1-day);
  d.setDate(d.getDate()+diff);
  return d.toISOString().slice(0,10);
}

export default function GroupCheckinClient(){
  const [data,setData]=useState<any>(null);
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);

  async function load(){
    const r=await fetch("/api/lockliel/group-checkin",{cache:"no-store"});
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    const d=await r.json().catch(()=>({}));
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/group-checkin",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        groupId:f.get("groupId"),
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
    setSaving(false);
    if(!r.ok){setMessage(d.error||"Unable to save weekly check-in.");return;}
    setMessage("Weekly check-in saved.");
    await load();
  }

  const latest=useMemo(()=>{
    const out:any={};
    for(const c of data?.checkins||[])if(!out[c.group_id])out[c.group_id]=c;
    return out;
  },[data]);

  if(!data)return <div className="ml-loading">Loading leader check-in…</div>;
  if(!data.groups.length)return null;

  return <section className="ml-leader-checkins">
    <div className="ml-section-title">Leader weekly check-in</div>
    <div className="ml-finance-grid">
      <form className="ml-panel ml-admin-form" onSubmit={submit}>
        <div className="ml-icon"><CalendarCheck2 size={20}/></div>
        <h3>How did this week go?</h3>
        <p>Keep this simple. The goal is to understand what is helping people grow, reach others, and multiply.</p>
        <label>Group<select name="groupId" required defaultValue=""><option value="" disabled>Choose group</option>{data.groups.map((g:any)=><option value={g.id} key={g.id}>{g.name}</option>)}</select></label>
        <label>Week beginning<input name="weekStart" type="date" defaultValue={mondayISO()} required/></label>
        <label className="ml-check-line"><input type="checkbox" name="gathered" value="yes"/> We gathered this week.</label>
        <div className="ml-auth-row">
          <label>Attendance<input name="attendanceCount" type="number" min="0" defaultValue="0"/></label>
          <label>Faith Boosts used<input name="faithBoostsUsed" type="number" min="0" max="50" defaultValue="0"/></label>
        </div>
        <div className="ml-auth-row">
          <label>People personally shared with<input name="peopleSharedWith" type="number" min="0" defaultValue="0"/></label>
          <label>New people connected<input name="newPeopleCount" type="number" min="0" defaultValue="0"/></label>
        </div>
        <label className="ml-check-line"><input type="checkbox" name="nextLeaderIdentified" value="yes"/> I see someone who could grow into leadership.</label>
        <label>Testimony or win <span>Optional</span><textarea name="testimony" rows={3} placeholder="What is God doing in people?"/></label>
        <label>What support do you need? <span>Optional</span><textarea name="needsSupport" rows={3} placeholder="Questions, resources, training, or help needed"/></label>
        {message&&<p className="ml-share-message">{message}</p>}
        <button className="ml-action" disabled={saving}>{saving?"Saving…":"Save weekly check-in"}</button>
      </form>

      <section className="ml-panel ml-admin-list">
        <div className="ml-icon"><UsersRound size={20}/></div>
        <h3>Recent group pulse</h3>
        {data.groups.map((g:any)=>{
          const c=latest[g.id];
          return <div className="ml-group-pulse" key={g.id}>
            <div><b>{g.name}</b><span>{[g.city,g.region].filter(Boolean).join(", ")}</span></div>
            {c?<div className="ml-pulse-stats"><span><b>{c.attendance_count}</b> attendance</span><span><b>{c.people_shared_with}</b> shared with</span><span><b>{c.new_people_count}</b> new</span>{c.next_leader_identified&&<span className="ml-leader-found"><CheckCircle2 size={11}/> leader emerging</span>}</div>:<small>No check-in yet</small>}
          </div>;
        })}
      </section>
    </div>
  </section>;
}