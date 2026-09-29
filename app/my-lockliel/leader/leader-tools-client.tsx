"use client";
import Link from "next/link";
import {CheckCircle2,MapPin,MessageCircle,ShieldCheck,Users,UsersRound} from "lucide-react";
import {useEffect,useState} from "react";

export default function LeaderToolsClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/lockliel/leader",{cache:"no-store"}).then(async r=>{
      const d=await r.json().catch(()=>({}));
      if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
      if(!r.ok){setError(d.error||"Leader tools are not available.");return;}
      setData(d);
    });
  },[]);

  if(error)return <section className="ml-card"><ShieldCheck size={20}/><h2>Leader tools</h2><p>{error}</p><Link href="/my-lockliel">Return to My Lockliel →</Link></section>;
  if(!data)return <div className="ml-loading">Opening Leader Tools…</div>;

  return <section className="ml-leader-tools">
    <section className="ml-leader-tools-stats">
      <article><Users size={18}/><strong>{data.assignments.length}</strong><span>assigned people</span></article>
      <article><UsersRound size={18}/><strong>{data.groups.length}</strong><span>groups you lead</span></article>
      <article><CheckCircle2 size={18}/><strong>{data.tasks.length}</strong><span>open follow-ups</span></article>
    </section>

    <section className="ml-panel ml-leader-tools-panel">
      <div className="ml-kicker">Assigned people</div>
      <h2>People you’re helping take a next step</h2>
      <p className="ml-privacy-note">Leader Tools intentionally uses limited connection cards. Email, phone, giving history, private staff notes, and private faith responses are not exposed here.</p>

      {data.assignments.length
        ? <div className="ml-leader-people">{data.assignments.map((a:any)=>{
            const p=a.person||{};
            return <article key={a.member_id}>
              <div className="ml-avatar">{(p.first_name||"?").slice(0,1)}</div>
              <div><b>{p.first_name||"Member"}{p.last_initial?" "+p.last_initial+".":""}</b><span>{[p.city,p.region].filter(Boolean).join(", ")||"Location not completed"}</span></div>
              <span className="ml-status">{a.assignment_type.replaceAll("_"," ")}</span>
              <Link href="/my-lockliel/connections"><MessageCircle size={13}/> Message</Link>
            </article>;
          })}</div>
        : <p className="ml-record-empty">No people are currently assigned to you.</p>}
    </section>

    {data.groups.length>0&&<section className="ml-panel ml-leader-tools-panel">
      <div className="ml-kicker">Groups & gatherings</div>
      <h2>Your groups</h2>
      {data.groups.map((g:any)=><div className="ml-leader-group-row" key={g.id}>
        <div><b>{g.name}</b><span><MapPin size={11}/>{[g.city,g.region,g.country].filter(Boolean).join(", ")}</span></div>
        <Link href="/my-lockliel/group">Open group →</Link>
      </div>)}
    </section>}

    {data.tasks.length>0&&<section className="ml-panel ml-leader-tools-panel">
      <div className="ml-kicker">Your follow-up</div>
      <h2>What needs attention</h2>
      {data.tasks.map((task:any)=>{
        const p=task.person||{};
        return <div className="ml-leader-task-row" key={task.id}>
          <div><b>{task.task_type.replaceAll("_"," ")}</b><span>{task.notes||"Follow up"}{p.first_name?" • "+p.first_name+(p.last_initial?" "+p.last_initial+".":""):""}</span></div>
          <small>{task.due_at?"Due "+new Date(task.due_at).toLocaleDateString():task.status}</small>
        </div>;
      })}
    </section>}
  </section>;
}
