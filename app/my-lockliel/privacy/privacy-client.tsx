"use client";
import {useEffect,useState} from "react";
import {ArchiveRestore,FileDown,ShieldCheck,Trash2} from "lucide-react";

export default function PrivacyClient(){
  const [data,setData]=useState<any>(null);
  const [message,setMessage]=useState("");
  const [working,setWorking]=useState(false);

  async function load(){
    const r=await fetch("/api/lockliel/privacy",{cache:"no-store"});
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    const d=await r.json().catch(()=>({}));
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function create(requestType:string){
    setWorking(true);setMessage("");
    const r=await fetch("/api/lockliel/privacy",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"create",requestType})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to submit request.");return;}
    setMessage("Your request has been submitted.");
    await load();
  }

  async function cancel(id:string){
    setWorking(true);
    const r=await fetch("/api/lockliel/privacy",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"cancel",id})
    });
    setWorking(false);
    if(r.ok)await load();
  }

  if(!data)return <div className="ml-loading">Loading privacy settings…</div>;

  const openExport=data.requests.find((r:any)=>r.request_type==="data_export"&&["submitted","in_review"].includes(r.status));
  const openDelete=data.requests.find((r:any)=>r.request_type==="account_deletion"&&["submitted","in_review"].includes(r.status));

  return <section className="ml-privacy-center">
    {message&&<p className="ml-share-message">{message}</p>}
    <div className="ml-privacy-actions">
      <article className="ml-panel">
        <div className="ml-icon"><FileDown size={20}/></div>
        <h2>Request a copy of my data</h2>
        <p>Ask the Lockliel team for an export of the personal information connected to your account.</p>
        {openExport
          ? <div className="ml-request-state"><ShieldCheck size={15}/><span>{openExport.status.replaceAll("_"," ")}</span>{openExport.status==="submitted"&&<button onClick={()=>cancel(openExport.id)} disabled={working}>Cancel</button>}</div>
          : <button className="ml-action" onClick={()=>create("data_export")} disabled={working}>Request data export</button>}
      </article>

      <article className="ml-panel">
        <div className="ml-icon"><Trash2 size={20}/></div>
        <h2>Request account deletion</h2>
        <p>This submits a review request. Your account is not deleted immediately, which helps prevent accidental loss and allows required ministry or transaction records to be handled appropriately.</p>
        {openDelete
          ? <div className="ml-request-state"><ShieldCheck size={15}/><span>{openDelete.status.replaceAll("_"," ")}</span>{openDelete.status==="submitted"&&<button onClick={()=>cancel(openDelete.id)} disabled={working}>Cancel</button>}</div>
          : <button className="ml-action" onClick={()=>create("account_deletion")} disabled={working}>Request account deletion</button>}
      </article>
    </div>

    {data.requests.length>0&&<section className="ml-panel ml-privacy-history">
      <div className="ml-kicker">Request history</div>
      <h2>Your privacy requests</h2>
      {data.requests.map((r:any)=><div key={r.id}>
        <ArchiveRestore size={15}/>
        <div><b>{r.request_type.replaceAll("_"," ")}</b><span>{new Date(r.requested_at).toLocaleDateString()}</span></div>
        <strong>{r.status.replaceAll("_"," ")}</strong>
      </div>)}
    </section>}
  </section>;
}
