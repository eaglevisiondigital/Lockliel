"use client";
import {useEffect,useState} from "react";
import {ArchiveRestore,FileDown,ShieldCheck,Trash2} from "lucide-react";

export default function PrivacyClient(){
  const [data,setData]=useState<any>(null);
  const [message,setMessage]=useState("");
  const [working,setWorking]=useState(false);

  async function load(){
    try{
      const r=await fetch("/api/lockliel/privacy",{cache:"no-store"});
      if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!Array.isArray(d.requests))throw new Error(d.error||"Unable to load privacy requests.");
      setData(d);
    }catch(error){
      setData(null);
      setMessage(error instanceof Error?error.message:"Unable to load privacy requests.");
    }
  }

  useEffect(()=>{load();},[]);

  async function act(body:Record<string,string>,success:string){
    setWorking(true);
    setMessage("");
    try{
      const r=await fetch("/api/lockliel/privacy",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok||d.ok!==true)throw new Error(d.error||"Request update could not be confirmed.");
      setMessage(success);
    }catch(error){
      setMessage(error instanceof Error?error.message:"Connection interrupted. Refresh request history before retrying.");
    }finally{
      await load();
      setWorking(false);
    }
  }

  async function create(requestType:string){
    await act({action:"create",requestType},"Your request has been submitted.");
  }
  async function cancel(id:string){
    await act({action:"cancel",id},"Your request has been cancelled.");
  }

  if(!data)return <div className="ml-loading" role="status">
    {message||"Loading privacy settings…"}
    {message&&<button disabled={working} onClick={()=>{setMessage("");load();}}>Retry loading</button>}
  </div>;

  const openExport=data.requests.find(
    (r:any)=>r.request_type==="data_export"&&["submitted","in_review"].includes(r.status)
  );
  const completedExport=data.requests.find(
    (r:any)=>r.request_type==="data_export"&&r.status==="completed"
  );
  const openDelete=data.requests.find(
    (r:any)=>r.request_type==="account_deletion"&&["submitted","in_review"].includes(r.status)
  );

  return <section className="ml-privacy-center">
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-privacy-actions">
      <article className="ml-panel">
        <div className="ml-icon"><FileDown size={20}/></div>
        <h2>Download my Lockliel data</h2>
        <p>Download a structured JSON copy of the member data available to you through your own account, including profile, discipleship, My Five, relationships, notifications, giving, orders and resource access.</p>

        <div className="ml-privacy-download-actions">
          {completedExport&&<a
            className="ml-action"
            href={"/api/lockliel/privacy-export?requestId="+encodeURIComponent(completedExport.id)}
          >
            <FileDown size={15}/> Download approved export
          </a>}

          {openExport
            ? <div className="ml-request-state">
                <ShieldCheck size={15}/>
                <span>Export request: {openExport.status.replaceAll("_"," ")}</span>
                {openExport.status==="submitted"&&<button onClick={()=>cancel(openExport.id)} disabled={working}>Cancel</button>}
              </div>
            : <button className="ml-privacy-secondary" onClick={()=>create("data_export")} disabled={working}>
                Request data export
              </button>}
        </div>

        <p className="ml-privacy-note">Approved exports do not include staff-only notes, security secrets, password data, authenticator secrets, or internal infrastructure logs.</p>
      </article>

      <article className="ml-panel">
        <div className="ml-icon"><Trash2 size={20}/></div>
        <h2>Request account deletion</h2>
        <p>This submits a review request. Your account is not deleted immediately, which helps prevent accidental loss and allows required ministry or transaction records to be handled appropriately.</p>

        {openDelete
          ? <div className="ml-request-state">
              <ShieldCheck size={15}/>
              <span>{openDelete.status.replaceAll("_"," ")}</span>
              {openDelete.status==="submitted"&&<button onClick={()=>cancel(openDelete.id)} disabled={working}>Cancel</button>}
            </div>
          : <button className="ml-action" onClick={()=>create("account_deletion")} disabled={working}>
              Request account deletion
            </button>}
      </article>
    </div>

    {data.requests.length>0&&<section className="ml-panel ml-privacy-history">
      <div className="ml-kicker">Request history</div>
      <h2>Your privacy requests</h2>
      {data.requests.map((r:any)=><div key={r.id}>
        <ArchiveRestore size={15}/>
        <div>
          <b>{r.request_type.replaceAll("_"," ")}</b>
          <span>{new Date(r.requested_at).toLocaleDateString()}</span>
        </div>
        <strong>{r.status.replaceAll("_"," ")}</strong>
      </div>)}
    </section>}
  </section>;
}
