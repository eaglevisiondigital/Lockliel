"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,FileDown,ShieldAlert,Trash2} from "lucide-react";

export default function PrivacyAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [notes,setNotes]=useState<Record<string,string>>({});

  const [readiness,setReadiness]=useState<Record<string,any>>({});

  async function load(){
    try{
      const r=await fetch("/api/lockliel/admin/privacy",{cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(r.status===403){setHidden(true);return;}
      if(!r.ok||!Array.isArray(d.requests))throw new Error(d.error||"Unable to load privacy requests.");
      setData(d);
    }catch(error){setMessage(error instanceof Error?error.message:"Unable to load privacy requests.");}
  }

  useEffect(()=>{load();},[]);

  async function refreshReadiness(id:string){
    setReadiness(v=>{const next={...v};delete next[id];return next;});
    const r=await fetch("/api/lockliel/admin/privacy?request_id="+encodeURIComponent(id),{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.readiness)throw new Error(d.error||"Unable to check deletion readiness.");
    setReadiness(v=>({...v,[id]:d.readiness}));
  }

  async function inspect(id:string){
    setWorking(id);
    setMessage("");
    try{await refreshReadiness(id);}
    catch(error){setMessage(error instanceof Error?error.message:"Unable to check readiness.");}
    finally{setWorking(null);}
  }

  async function act(id:string,action:string,status?:string,adminNote?:string){
    setWorking(id);
    setMessage("");
    try{
      const r=await fetch("/api/lockliel/admin/privacy",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id,action,status,adminNote})
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"Unable to update privacy request.");
      setMessage(action==="executeDeletion"?"Account deletion completed and verified.":"Privacy request updated.");
      if(action!=="reclaimDeletion")setNotes(v=>({...v,[id]:""}));
    }catch(error){
      setMessage(error instanceof Error?error.message:"Connection interrupted. Refresh readiness before retrying.");
    }finally{
      // Refresh even after errors: the server may have made partial progress.
      await load();
      if(["executeDeletion","reclaimDeletion"].includes(action)){
        try{await refreshReadiness(id);}catch{setReadiness(v=>{const next={...v};delete next[id];return next;});}
      }
      setWorking(null);
    }
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading" role="status">
    {message||"Loading privacy requests…"}
    {message&&<button onClick={()=>{setMessage("");load();}}>Retry loading</button>}
  </div>;

  const open=data.requests.filter((r:any)=>["submitted","in_review"].includes(r.status));
  const closed=data.requests.filter((r:any)=>!["submitted","in_review"].includes(r.status));

  return <section className="ml-panel ml-privacy-admin">
    <div className="ml-system-head">
      <div>
        <div className="ml-kicker">Privacy operations</div>
        <h2>Member data requests</h2>
      </div>
      <ShieldAlert size={27}/>
    </div>

    <p className="ml-privacy-note">
      Only full administrators can access this queue. Account deletion is never automatic from the member-facing request. The system verifies MFA, Auth/session removal, operational responsibilities, protected Storage ownership, and nonfinancial personal-data scrubbing before a deletion request can be completed. Financial and legally required operational records may remain under approved retention requirements.
    </p>

    {message&&<p className="ml-share-message" role="status" aria-live="polite">{message}</p>}

    <div className="ml-privacy-admin-list">
      {open.map((r:any)=>{
        const deletion=r.request_type==="account_deletion";
        const note=notes[r.id]||"";
        const state=readiness[r.id];
        const ownRequest=r.handled_by===data.currentUserId;
        const blockers=state?[
          ["staff_roles","Staff roles"],
          ["primary_groups","Primary group leadership"],
          ["active_leader_assignments","Active leader assignments"],
          ["active_leader_or_host_memberships","Group leader or host memberships"],
          ["active_founders_host_records","Active Founders hosts"],
          ["open_assigned_followups","Assigned follow-up tasks"]
        ].filter(([key])=>Number(state.responsibilities?.[key]||0)>0)
          .map(([key,label])=>label+": "+state.responsibilities[key]):[];
        if(state?.owned_storage_objects>0)blockers.push("Member-owned files: "+state.owned_storage_objects);

        return <article key={r.id} className={deletion?"ml-privacy-admin-request deletion":"ml-privacy-admin-request"}>
          <div className="ml-privacy-admin-icon">
            {r.request_type==="data_export"?<FileDown size={16}/>:<Trash2 size={16}/>}
          </div>

          <div>
            <b>{r.person?.display_name||r.person?.email||"Member"}</b>
            <span>{r.person?.email||""}</span>
            <small>{r.request_type.replaceAll("_"," ")} • {new Date(r.requested_at).toLocaleDateString()}</small>

            {deletion&&<div className="ml-privacy-deletion-checks">
              <button disabled={Boolean(working)} onClick={()=>inspect(r.id)}>Check readiness</button>
              {!state&&<p>Check readiness to see blockers and the latest processing state.</p>}
              {state&&<div role="status" aria-live="polite">
                {state.terminal?<p>This request is already {state.request_status.replaceAll("_"," ")}.</p>:<>
                  <strong>{state.execution_started?"Deletion in progress":state.blocker_count>0?"Action needed before deletion":"No operational blockers found"}</strong>
                  {blockers.length>0&&<ul>{blockers.map(item=><li key={item}>{item}</li>)}</ul>}
                  {state.self_deletion&&<p>Another administrator must process your deletion request.</p>}
                  {state.execution_started&&<ul>
                    <li>Sessions: {state.sessions_revoked?"revocation verified":"verification pending"}</li>
                    <li>Account and profile: {state.auth_removed&&state.profile_removed?"removal verified":"removal pending"}</li>
                    <li>Personal data: {state.personal_data_scrubbed?"scrubbing verified":"scrubbing pending"}</li>
                  </ul>}
                  {state.can_reclaim&&<p>The previous handler no longer has administrator access. Recover this request to continue it.</p>}
                  {!ownRequest&&!state.can_reclaim&&r.status==="in_review"&&<p>Assigned to another administrator.</p>}
                </>}
              </div>}
            </div>}

            {r.status==="in_review"&&deletion&&<>
              <div className="ml-privacy-deletion-checks">
                <strong>Verified deletion processing</strong>
                <p>
                  Lockliel will refuse deletion until staff roles, leadership or hosting responsibilities,
                  assigned follow-ups, and member-owned Storage objects are resolved. A different administrator
                  must process an administrator&apos;s own deletion request.
                </p>
                <p>
                  When the checks pass, the system suspends sign-in, revokes sessions, removes the Supabase Auth account, and verifies
                  that the member profile is gone, scrubs surviving nonfinancial CRM and Founders 50 personal
                  data, then completes the privacy record. Once processing starts, retry an interrupted request to finish it; it can no longer be declined or cancelled.
                </p>
              </div>

              <label className="ml-privacy-processing-note">
                Processing note
                <textarea
                  rows={3}
                  maxLength={5000}
                  value={note}
                  onChange={e=>setNotes(v=>({...v,[r.id]:e.target.value}))}
                  placeholder="Document the deletion processing and any financial, legal, or operational records retained under the approved retention requirements."
                />
                <span>{note.trim().length<20?"Add at least 20 characters before processing deletion.":"Processing note ready."}</span>
              </label>
            </>}
          </div>

          <div className="ml-privacy-admin-state">
            <span>{r.status.replaceAll("_"," ")}</span>

            {r.status==="submitted"&&<button
              disabled={Boolean(working)}
              onClick={()=>act(r.id,"claim")}
            >
              Claim
            </button>}

            {r.status==="in_review"&&r.request_type==="data_export"&&ownRequest&&<>
              <button
                disabled={Boolean(working)}
                onClick={()=>act(r.id,"resolve","completed")}
              >
                <CheckCircle2 size={13}/> Approve export
              </button>
              <button
                disabled={Boolean(working)}
                onClick={()=>act(r.id,"resolve","declined")}
              >
                Decline
              </button>
            </>}

            {r.status==="in_review"&&deletion&&<>
              <button
                disabled={Boolean(working)||note.trim().length<20||state?.can_execute!==true||!ownRequest}
                onClick={()=>act(r.id,"executeDeletion",undefined,note)}
              >
                <Trash2 size={13}/> {state?.execution_started?"Resume account deletion":"Process account deletion"}
              </button>
              {state?.can_reclaim&&<button disabled={Boolean(working)} onClick={()=>act(r.id,"reclaimDeletion")}>Recover request</button>}
              <button
                disabled={Boolean(working)||!ownRequest||!state||state.execution_started||state.terminal}
                onClick={()=>act(r.id,"resolve","declined",note)}
              >
                Decline
              </button>
            </>}
          </div>
        </article>;
      })}

      {!open.length&&<div className="ml-empty-ops">
        <CheckCircle2 size={22}/>
        <div>
          <b>No open privacy requests.</b>
          <span>New data export or account-deletion requests will appear here.</span>
        </div>
      </div>}
    </div>

    {closed.length>0&&<details className="ml-five-history">
      <summary>Resolved privacy requests ({closed.length})</summary>
      <div>
        {closed.slice(0,30).map((r:any)=><span key={r.id}>
          {r.request_type.replaceAll("_"," ")} • {r.status}
        </span>)}
      </div>
    </details>}
  </section>;
}
