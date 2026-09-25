"use client";
import {useEffect,useState} from "react";
import {ChevronDown,ChevronUp,ShieldCheck} from "lucide-react";

export default function FounderReviewAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [open,setOpen]=useState<string|null>(null);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/founder-reviews",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function submit(e:React.FormEvent<HTMLFormElement>,applicationId:string){
    e.preventDefault();
    setWorking(applicationId);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/admin/founder-reviews",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        applicationId,
        decision:f.get("decision"),
        rationale:f.get("rationale")
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to save review.");return;}
    setMessage("Founder review saved.");
    e.currentTarget.reset();
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading Founder reviews…</div>;

  return <section className="ml-panel ml-founder-review-admin">
    <div className="ml-system-head">
      <div><div className="ml-kicker">Human review</div><h2>Founders 50 applications</h2></div>
      <ShieldCheck size={26}/>
    </div>
    <p className="ml-privacy-note">Faith background and ministry experience are self-reported context for human review. They are not converted into an automated spiritual score.</p>
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-founder-review-list">
      {data.applications.map((app:any)=>{
        const expanded=open===app.id;
        return <article key={app.id}>
          <button className="ml-founder-review-summary" onClick={()=>setOpen(expanded?null:app.id)}>
            <div>
              <b>{app.first_name} {app.last_name}</b>
              <span>{[app.city,app.region,app.country].filter(Boolean).join(", ")} • {app.status.replaceAll("_"," ")}</span>
            </div>
            {expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
          </button>

          {expanded&&<div className="ml-founder-review-detail">
            <div className="ml-founder-review-grid">
              <ReviewField label="Why interested" value={app.why_interested}/>
              <ReviewField label="What excites them" value={app.what_excites_you}/>
              <ReviewField label="Faith stage" value={app.faith_stage}/>
              <ReviewField label="Faith background" value={app.faith_background}/>
              <ReviewField label="Ministry experience" value={app.ministry_experience}/>
              <ReviewField label="Interest path" value={app.interest_path}/>
              <ReviewField label="Church / ministry" value={app.church_affiliation}/>
              <ReviewField label="Gathering place" value={app.gathering_place}/>
              <ReviewField label="Share With Five" value={app.share_with_five}/>
              <ReviewField label="Gather weekly" value={app.gather_weekly}/>
              <ReviewField label="Training willingness" value={app.training_willingness?"Yes":"No / not answered"}/>
              <ReviewField label="Growth interests" value={(app.growth_interests||[]).join(", ")}/>
            </div>

            {app.reviews?.length>0&&<div className="ml-founder-review-history">
              <div className="ml-kicker">Review history</div>
              {app.reviews.map((review:any)=><div key={review.id}>
                <b>{review.decision.replaceAll("_"," ")}</b>
                <span>{review.rationale||"No rationale recorded."}</span>
                <small>{review.reviewer?.first_name||"Reviewer"} • {new Date(review.created_at).toLocaleString()}</small>
              </div>)}
            </div>}

            <form className="ml-founder-review-form" onSubmit={e=>submit(e,app.id)}>
              <label>Review action<select name="decision" defaultValue="note">
                <option value="note">Add review note only</option>
                <option value="needs_info">Needs more information</option>
                <option value="accept">Accept application</option>
                <option value="pause">Pause application</option>
                <option value="decline">Decline application</option>
              </select></label>
              <label>Rationale / private reviewer note<textarea name="rationale" rows={4} maxLength={5000} placeholder="Record the human review rationale or information needed."/></label>
              <button className="ml-action" disabled={working===app.id}>{working===app.id?"Saving…":"Save review"}</button>
            </form>
          </div>}
        </article>;
      })}
      {!data.applications.length&&<p className="ml-record-empty">No Founders 50 applications yet.</p>}
    </div>
  </section>;
}

function ReviewField({label,value}:{label:string;value:any}){
  return <div><span>{label}</span><b>{value||"Not answered"}</b></div>;
}
