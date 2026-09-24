"use client";
import {useEffect,useState} from "react";
import {Activity,CheckCircle2,Power,ShieldCheck} from "lucide-react";

const labels:any={
 partner_checkout:["Live partnership checkout","Allows the member Partnership page to expose live checkout only when an approved provider is also active."],
 digital_book_delivery:["Digital book delivery","Marks digital book fulfillment as operationally ready."],
 heart_book_gift_benefit:["$20 book benefit","Activates the qualifying-gift entitlement rule for A Heart for the Lost."],
 founders50_public_recruiting:["Founders 50 recruiting","Tracks whether the public Founders 50 recruiting campaign is intended to be open."],
 internal_messaging:["Internal messaging","Tracks availability of privacy-safe inviter/member messaging."]
};
export default function SystemAdminClient(){
 const [data,setData]=useState<any>(null),[hidden,setHidden]=useState(false),[working,setWorking]=useState<string|null>(null),[message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/lockliel/admin/system",{cache:"no-store"});const d=await r.json().catch(()=>({}));if(r.status===403){setHidden(true);return;}if(r.ok)setData(d);}
 useEffect(()=>{load();},[]);
 async function toggle(key:string,enabled:boolean){setWorking(key);setMessage("");const r=await fetch("/api/lockliel/admin/system",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,enabled})});const d=await r.json().catch(()=>({}));setWorking(null);if(!r.ok){setMessage(d.error||"Unable to change setting.");return;}setMessage((enabled?"Enabled: ":"Disabled: ")+(labels[key]?.[0]||key));await load();}
 if(hidden)return null;if(!data)return <div className="ml-loading">Loading system controls…</div>;
 return <section className="ml-system-admin">
   {message&&<p className="ml-share-message">{message}</p>}
   <div className="ml-panel"><div className="ml-system-head"><div><div className="ml-kicker">Operational controls</div><h2>Turn features on deliberately.</h2></div><ShieldCheck size={28}/></div>
   <div className="ml-flag-list">{data.flags.map((f:any)=>{const meta=labels[f.key]||[f.key,f.description];return <div className="ml-flag-row" key={f.key}><div><b>{meta[0]}</b><span>{meta[1]}</span></div><button className={f.enabled?"on":""} disabled={working===f.key} onClick={()=>toggle(f.key,!f.enabled)} aria-pressed={f.enabled}><Power size={14}/>{f.enabled?"On":"Off"}</button></div>})}</div></div>
   <div className="ml-panel ml-audit-panel"><div className="ml-kicker">Audit history</div><h2>Recent sensitive actions</h2>{data.audit.length?data.audit.slice(0,20).map((a:any)=><div className="ml-audit-row" key={a.id}><div className="ml-audit-icon"><Activity size={14}/></div><div><b>{a.summary||a.event_type.replaceAll("_"," ")}</b><span>{a.entity_type}{a.entity_id?" • "+a.entity_id:""}</span></div><time>{new Date(a.created_at).toLocaleString()}</time></div>):<p>No audited changes yet.</p>}</div>
   <div className="ml-panel ml-provider-readiness"><div className="ml-kicker">Processor readiness</div><h2>Payment connections</h2>{data.providers.map((p:any)=><div className="ml-provider-row" key={p.provider}><div><b>{p.label}</b><span>{p.supports_recurring?"One-time + recurring":"One-time"}</span></div><span className={p.status==="active"?"ready":""}>{p.status==="active"?<CheckCircle2 size={14}/>:null}{p.status.replaceAll("_"," ")}</span></div>)}</div>
 </section>;
}