"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,ClipboardCheck,Hand,UsersRound} from "lucide-react";

export default function TasksAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/tasks",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function act(action:"claim"|"complete",taskId:string){
    setWorking(taskId);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/tasks",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action,taskId})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to update task.");return;}
    setMessage(action==="claim"?"Task claimed.":"Task completed.");
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading follow-up queue…</div>;

  return <section className="ml-panel ml-task-admin">
    <div className="ml-system-head">
      <div><div className="ml-kicker">Follow-up operations</div><h2>Nothing important gets lost.</h2></div>
      <ClipboardCheck size={27}/>
    </div>
    <p className="ml-privacy-note">This queue collects ministry follow-up, group support requests, and leadership signals. Staff see only the information permitted by their role.</p>
    {message&&<p className="ml-share-message">{message}</p>}

    {data.tasks.length
      ? <div className="ml-task-list">{data.tasks.map((t:any)=>{
          const subject=t.subject||{};
          const mine=t.assigned_to===data.currentUserId;
          return <article className="ml-task-row" key={t.id}>
            <div className="ml-task-icon"><UsersRound size={16}/></div>
            <div className="ml-task-copy">
              <b>{t.task_type.replaceAll("_"," ")}</b>
              <span>{t.notes||"Follow up"}</span>
              <small>
                {subject.first_name?subject.first_name+(subject.last_initial?" "+subject.last_initial+".":""):"Member"}
                {subject.city?" • "+[subject.city,subject.region].filter(Boolean).join(", "):""}
                {t.due_at?" • Due "+new Date(t.due_at).toLocaleDateString():""}
              </small>
            </div>
            <div className="ml-task-owner">
              <span>{t.assignee?("Claimed by "+t.assignee.first_name):"Unassigned"}</span>
              {!t.assigned_to&&<button disabled={working===t.id} onClick={()=>act("claim",t.id)}><Hand size={13}/> Claim</button>}
              {(mine||!t.assigned_to)&&<button disabled={working===t.id} onClick={()=>act("complete",t.id)}><CheckCircle2 size={13}/> Complete</button>}
            </div>
          </article>;
        })}</div>
      : <div className="ml-empty-ops"><CheckCircle2 size={25}/><div><b>Follow-up queue is clear.</b><span>New support requests and operational follow-ups will appear here automatically.</span></div></div>}
  </section>;
}