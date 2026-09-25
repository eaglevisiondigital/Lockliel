"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,FileDown,ShieldAlert,Trash2} from "lucide-react";

export default function PrivacyAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/privacy",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function act(id:string,action:string,status?:string){
    setWorking(id);setMessage("");
    const r=await fetch("/api/lockliel/admin/privacy",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id,action,status})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to update privacy request.");return;}
    setMessage("Privacy request updated.");
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading privacy requests…</div>;

  const open=data.requests.filter((r:any)=>["submitted","in_review"].includes(r.status));
  const closed=data.requests.filter((r:any)=>!["submitted","in_review"].includes(r.status));

  return <section className="ml-panel ml-privacy-admin">
    <div className="ml-system-head">
      <div><div className="ml-kicker">Privacy operations</div><h2>Member data requests</h2></div>
      <ShieldAlert size={27}/>
    </div>
    <p className="ml-privacy-note">Only full administrators can access this queue. Account deletion is never automatic from the member-facing request.</p>
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-privacy-admin-list">
      {open.map((r:any)=><article key={r.id}>
        <div className="ml-privacy-admin-icon">{r.request_type==="data_export"?<FileDown size={16}/>:<Trash2 size={16}/>}</div>
        <div>
          <b>{r.person?.display_name||r.person?.email||"Member"}</b>
          <span>{r.person?.email||""}</span>
          <small>{r.request_type.replaceAll("_"," ")} • {new Date(r.requested_at).toLocaleDateString()}</small>
        </div>
        <div className="ml-privacy-admin-state">
          <span>{r.status.replaceAll("_"," ")}</span>
          {r.status==="submitted"&&<button disabled={working===r.id} onClick={()=>act(r.id,"claim")}>Claim</button>}
          {r.status==="in_review"&&<>
            <button disabled={working===r.id} onClick={()=>act(r.id,"resolve","completed")}><CheckCircle2 size={13}/> Complete</button>
            <button disabled={working===r.id} onClick={()=>act(r.id,"resolve","declined")}>Decline</button>
          </>}
        </div>
      </article>)}

      {!open.length&&<div className="ml-empty-ops"><CheckCircle2 size={22}/><div><b>No open privacy requests.</b><span>New data export or account-deletion requests will appear here.</span></div></div>}
    </div>

    {closed.length>0&&<details className="ml-five-history">
      <summary>Resolved privacy requests ({closed.length})</summary>
      <div>{closed.slice(0,30).map((r:any)=><span key={r.id}>{r.request_type.replaceAll("_"," ")} • {r.status}</span>)}</div>
    </details>}
  </section>;
}
