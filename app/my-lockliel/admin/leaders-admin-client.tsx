"use client";
import {useEffect,useMemo,useState} from "react";
import {MapPin,ShieldCheck,UserCheck,UserRoundPlus} from "lucide-react";

const types:any={
  mentor:"Mentor",
  group_leader:"Group leader",
  founders_coach:"Founders coach",
  discipleship_leader:"Discipleship leader",
  regional_leader:"Regional leader"
};

export default function LeadersAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/leaders",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function approve(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const profileId=String(f.get("profileId")||"");
    const person=data.people.find((p:any)=>p.profile_id===profileId);
    const r=await fetch("/api/lockliel/admin/leaders",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"approveLeader",
        profileId,
        leaderType:f.get("leaderType"),
        city:f.get("city")||person?.city,
        region:f.get("region")||person?.region,
        country:f.get("country")||person?.country,
        capacity:f.get("capacity")
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to approve leader.");return;}
    setMessage("Leader profile approved.");
    e.currentTarget.reset();
    await load();
  }

  async function assign(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/admin/leaders",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"assignLeader",
        memberId:f.get("memberId"),
        leaderId:f.get("leaderId"),
        assignmentType:f.get("assignmentType")
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to assign leader.");return;}
    setMessage("Leader assigned and private connection opened.");
    e.currentTarget.reset();
    await load();
  }

  async function end(memberId:string){
    setWorking(true);
    const r=await fetch("/api/lockliel/admin/leaders",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"endAssignment",memberId})
    });
    setWorking(false);
    if(r.ok)await load();
  }

  const peopleMap=useMemo(
    ()=>Object.fromEntries((data?.people||[]).map((p:any)=>[p.profile_id,p])),
    [data]
  );

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading leader connections…</div>;

  const activeLeaders=data.leaders.filter((l:any)=>l.active);
  const activeAssignments=data.assignments.filter((a:any)=>a.status==="active");

  return <section className="ml-leaders-admin">
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-leader-stats">
      <article><ShieldCheck size={18}/><strong>{activeLeaders.length}</strong><span>approved leaders</span></article>
      <article><UserCheck size={18}/><strong>{activeAssignments.length}</strong><span>active assignments</span></article>
    </div>

    <div className="ml-finance-grid">
      <form className="ml-panel ml-admin-form" onSubmit={approve}>
        <div className="ml-icon"><UserRoundPlus size={19}/></div>
        <h3>Approve a leader</h3>
        <p>Leadership designation controls ministry relationships. It does not grant admin access.</p>
        <label>Person<select name="profileId" required defaultValue=""><option value="" disabled>Choose member</option>{data.people.map((p:any)=><option value={p.profile_id} key={p.profile_id}>{p.first_name}{p.last_initial?" "+p.last_initial+".":""} • {[p.city,p.region].filter(Boolean).join(", ")}</option>)}</select></label>
        <label>Leader type<select name="leaderType" defaultValue="mentor">{Object.entries(types).map(([key,label])=><option key={key} value={key}>{String(label)}</option>)}</select></label>
        <div className="ml-auth-row"><label>City<input name="city" placeholder="Use member city if blank"/></label><label>State / region<input name="region"/></label></div>
        <label>Country<input name="country"/></label>
        <label>Connection capacity <span>Optional</span><input name="capacity" type="number" min="1" placeholder="25"/></label>
        <button className="ml-action" disabled={working}>Approve leader</button>
      </form>

      <form className="ml-panel ml-admin-form" onSubmit={assign}>
        <div className="ml-icon"><UserCheck size={19}/></div>
        <h3>Assign a leader</h3>
        <p>The original inviter stays preserved. This assigns the person responsible for current ministry follow-up.</p>
        <label>Member<select name="memberId" required defaultValue=""><option value="" disabled>Choose member</option>{data.people.map((p:any)=><option value={p.profile_id} key={p.profile_id}>{p.first_name}{p.last_initial?" "+p.last_initial+".":""} • {[p.city,p.region].filter(Boolean).join(", ")}</option>)}</select></label>
        <label>Approved leader<select name="leaderId" required defaultValue=""><option value="" disabled>Choose leader</option>{activeLeaders.map((l:any)=>{const p=peopleMap[l.profile_id]||{};const assigned=activeAssignments.filter((a:any)=>a.leader_id===l.profile_id).length;return <option value={l.profile_id} key={l.profile_id}>{p.first_name||"Leader"}{p.last_initial?" "+p.last_initial+".":""} • {types[l.leader_type]} • {assigned}{l.capacity?"/"+l.capacity:""} assigned</option>})}</select></label>
        <label>Assignment type<select name="assignmentType" defaultValue="mentor">{Object.entries(types).map(([key,label])=><option key={key} value={key}>{String(label)}</option>)}</select></label>
        <button className="ml-action" disabled={working||!activeLeaders.length}>Assign leader</button>
      </form>
    </div>

    <section className="ml-panel ml-admin-list">
      <div className="ml-kicker">Active leader connections</div>
      <h3>Who is helping whom?</h3>
      {activeAssignments.length?activeAssignments.map((a:any)=>{
        const member=peopleMap[a.member_id]||{};
        const leader=peopleMap[a.leader_id]||{};
        return <div className="ml-leader-assignment" key={a.member_id}>
          <div>
            <b>{member.first_name||"Member"}{member.last_initial?" "+member.last_initial+".":""}</b>
            <span><MapPin size={11}/>{[member.city,member.region].filter(Boolean).join(", ")||"Location pending"}</span>
          </div>
          <div className="ml-leader-arrow">→</div>
          <div><b>{leader.first_name||"Leader"}{leader.last_initial?" "+leader.last_initial+".":""}</b><span>{types[a.assignment_type]||a.assignment_type}</span></div>
          <button disabled={working} onClick={()=>end(a.member_id)}>End assignment</button>
        </div>;
      }):<p>No leader assignments yet.</p>}
    </section>
  </section>;
}