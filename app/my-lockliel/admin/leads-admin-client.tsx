"use client";
import {useEffect,useMemo,useState} from "react";
import {BookOpen,Clock3,Filter,Radio,Search,UserCheck,UserPlus,UsersRound} from "lucide-react";

const statusLabels:any={
  new:"New",
  contacted:"Contacted",
  nurture:"Nurture",
  converted:"Converted",
  closed:"Closed"
};

const sourceLabels:any={
  faith_boost:"Faith Boost",
  book_interest:"Book interest",
  founders50:"Founders 50",
  website_interest:"Website interest"
};

export default function LeadsAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("open");
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/leads",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function claim(leadId:string){
    setWorking(leadId);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/leads",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"claim",leadId})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to claim lead.");return;}
    setMessage("Lead claimed for follow-up.");
    await load();
  }

  async function updateLead(
    leadId:string,
    status:string,
    nextFollowUpAt:string,
    adminNotes:string
  ){
    setWorking(leadId);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/leads",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"update",
        leadId,
        status,
        nextFollowUpAt,
        adminNotes,
        keepAssignment:true
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to update lead.");return;}
    setMessage("Lead updated.");
    await load();
  }

  const leads=useMemo(()=>{
    const all=data?.leads||[];
    const q=query.trim().toLowerCase();

    return all.filter((lead:any)=>{
      const matchesStatus=
        statusFilter==="all" ||
        (statusFilter==="open" && !["converted","closed"].includes(lead.status)) ||
        lead.status===statusFilter;

      if(!matchesStatus)return false;
      if(!q)return true;

      const sourceText=(lead.sources||[])
        .map((s:any)=>[s.source_type,s.campaign].filter(Boolean).join(" "))
        .join(" ");

      const haystack=[
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.phone,
        sourceText,
        lead.admin_notes
      ].filter(Boolean).join(" ").toLowerCase();

      return haystack.includes(q);
    });
  },[data,query,statusFilter]);

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading lead pipeline…</div>;

  const summaryCards=[
    ["New",data.summary.new,UserPlus],
    ["Due",data.summary.due,Clock3],
    ["Contacted",data.summary.contacted,Radio],
    ["Nurture",data.summary.nurture,UsersRound],
    ["Converted",data.summary.converted,UserCheck]
  ];

  return <section className="ml-leads-admin">
    {message&&<p className="ml-share-message">{message}</p>}

    <section className="ml-lead-stats">
      {summaryCards.map(([label,value,Icon]:any)=><article key={label}>
        <Icon size={17}/>
        <strong>{value}</strong>
        <span>{label}</span>
      </article>)}
    </section>

    <section className="ml-panel ml-lead-panel">
      <div className="ml-people-head">
        <div>
          <div className="ml-kicker">Pre-account CRM</div>
          <h2>From interest to relationship.</h2>
        </div>
        <div className="ml-lead-filters">
          <label className="ml-admin-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, email, source…"/></label>
          <label className="ml-lead-status-filter"><Filter size={14}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="open">Open pipeline</option>
            <option value="all">All leads</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="nurture">Nurture</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select></label>
        </div>
      </div>

      <div className="ml-lead-list">
        {leads.map((lead:any)=><LeadRow
          key={lead.id}
          lead={lead}
          working={working===lead.id}
          currentUserId={data.currentUserId}
          onClaim={()=>claim(lead.id)}
          onUpdate={updateLead}
        />)}
        {!leads.length&&<p className="ml-privacy-note">No leads match this view.</p>}
      </div>
    </section>
  </section>;
}

function LeadRow({
  lead,
  working,
  currentUserId,
  onClaim,
  onUpdate
}:{
  lead:any;
  working:boolean;
  currentUserId:string;
  onClaim:()=>void;
  onUpdate:(leadId:string,status:string,nextFollowUpAt:string,adminNotes:string)=>void;
}){
  const [status,setStatus]=useState(lead.status);
  const [next,setNext]=useState(
    lead.next_follow_up_at
      ? new Date(lead.next_follow_up_at).toISOString().slice(0,16)
      : ""
  );
  const [notes,setNotes]=useState(lead.admin_notes||"");
  const sources=lead.sources||[];
  const due=lead.next_follow_up_at &&
    new Date(lead.next_follow_up_at).getTime()<=Date.now() &&
    !["converted","closed"].includes(lead.status);

  return <article className={"ml-lead-row "+(due?"due":"")}>
    <div className="ml-lead-person">
      <div className="ml-avatar">{(lead.first_name||lead.email||"?").slice(0,1).toUpperCase()}</div>
      <div>
        <b>{[lead.first_name,lead.last_name].filter(Boolean).join(" ")||lead.email}</b>
        <span>{lead.email}{lead.phone?" • "+lead.phone:""}</span>
        <div className="ml-lead-sources">
          {sources.map((source:any)=><span key={source.id}>
            {source.source_type==="faith_boost"?<Radio size={10}/>:source.source_type==="book_interest"?<BookOpen size={10}/>:<UserPlus size={10}/>}
            {sourceLabels[source.source_type]||source.source_type.replaceAll("_"," ")}
            {source.campaign&&source.campaign!==source.source_type?" • "+source.campaign:""}
          </span>)}
        </div>
      </div>
    </div>

    <div className="ml-lead-account-state">
      {lead.linked_profile_id
        ? <><UserCheck size={15}/><div><b>My Lockliel linked</b><span>Converted member</span></div></>
        : <><UserPlus size={15}/><div><b>Pre-account lead</b><span>{lead.assigned_to?(lead.assigned_to===currentUserId?"Assigned to you":"Assigned"):"Unassigned"}</span></div></>}
    </div>

    <div className="ml-lead-controls">
      <select value={status} onChange={e=>setStatus(e.target.value)} disabled={working||Boolean(lead.linked_profile_id)}>
        {Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{String(label)}</option>)}
      </select>
      <input type="datetime-local" value={next} onChange={e=>setNext(e.target.value)} disabled={working||Boolean(lead.linked_profile_id)} aria-label="Next follow-up"/>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} maxLength={5000} placeholder="Admin follow-up note…" disabled={working}/>
      <div className="ml-lead-actions">
        {!lead.assigned_to&&!lead.linked_profile_id&&<button disabled={working} onClick={onClaim}>Claim</button>}
        {!lead.linked_profile_id&&<button disabled={working} onClick={()=>onUpdate(lead.id,status,next,notes)}>Save</button>}
      </div>
    </div>
  </article>;
}
