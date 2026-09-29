"use client";
import {useEffect,useMemo,useState} from "react";
import {BookOpen,Gift,HeartHandshake,LockKeyhole} from "lucide-react";

export default function FinanceAdminClient(){
 const [data,setData]=useState<any>(null),[error,setError]=useState(""),[message,setMessage]=useState(""),[working,setWorking]=useState(false);
 async function load(){
   const r=await fetch("/api/lockliel/admin/finance",{cache:"no-store"});
   const d=await r.json().catch(()=>({}));
   if(r.status===403){setError("hidden");return;}
   if(!r.ok){setError(d.error||"Unable to load finance administration.");return;}
   setData(d);
 }
 useEffect(()=>{load();},[]);
 async function submitGift(e:React.FormEvent<HTMLFormElement>){
   e.preventDefault();setWorking(true);setMessage("");
   const f=new FormData(e.currentTarget);
   const profileId=String(f.get("profileId")||"");
   const selected=data.people.find((p:any)=>p.profile_id===profileId);
   const r=await fetch("/api/lockliel/admin/finance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
     action:"recordGift",profileId:profileId||null,donorName:selected?.display_name||f.get("donorName"),donorEmail:selected?.email||f.get("donorEmail"),amount:f.get("amount"),designation:f.get("designation")||"general"
   })});
   const d=await r.json().catch(()=>({}));setWorking(false);
   if(!r.ok){setMessage(d.error||"Unable to record gift.");return;}
   setMessage("Gift recorded successfully.");e.currentTarget.reset();await load();
 }
 async function grant(e:React.FormEvent<HTMLFormElement>){
   e.preventDefault();setWorking(true);setMessage("");
   const f=new FormData(e.currentTarget);
   const r=await fetch("/api/lockliel/admin/finance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"grantResource",profileId:f.get("profileId"),productId:f.get("productId")})});
   const d=await r.json().catch(()=>({}));setWorking(false);
   if(!r.ok){setMessage(r.status===409?"That member already has this manual resource grant.":d.error||"Unable to grant resource.");return;}
   setMessage("Resource access granted.");e.currentTarget.reset();await load();
 }
 const recent=useMemo(()=>data?.gifts||[],[data]);
 if(error==="hidden")return null;
 if(error)return <p className="ml-auth-message error">{error}</p>;
 if(!data)return <div className="ml-loading">Loading finance tools…</div>;
 const benefit=data.benefits?.find((b:any)=>b.slug==="heart-for-the-lost-gift-20");
 return <section className="ml-finance-admin">
   <div className="ml-finance-head"><div><div className="ml-kicker">Finance & resources</div><h2>Giving, access and fulfillment foundation</h2></div><div className="ml-benefit-state"><Gift size={17}/><div><b>$20 book benefit</b><span>{benefit?benefit.status:"not configured"}</span></div></div></div>
   {benefit?.status!=="active"&&<div className="ml-admin-notice"><LockKeyhole size={17}/><span>The $20 A Heart for the Lost benefit is built but not active. No gift will automatically grant the book until that rule is intentionally activated.</span></div>}
   {message&&<p className="ml-share-message">{message}</p>}
   <div className="ml-finance-grid">
    <form className="ml-panel ml-admin-form" onSubmit={submitGift}>
      <div className="ml-icon"><HeartHandshake size={20}/></div><h3>Record a gift</h3><p>Use for an offline or manually verified gift. Live processor gifts will be recorded automatically later.</p>
      <label>Member <span>Optional</span><select name="profileId" defaultValue=""><option value="">Gift not linked to an account</option>{data.people.map((p:any)=><option key={p.profile_id} value={p.profile_id}>{p.display_name||p.email} • {p.email}</option>)}</select></label>
      <label>Donor name <span>For unlinked gifts</span><input name="donorName"/></label>
      <label>Donor email <span>For unlinked gifts</span><input name="donorEmail" type="email"/></label>
      <label>Amount<input name="amount" type="number" min="0.01" step="0.01" required placeholder="20.00"/></label>
      <label>Designation<select name="designation" defaultValue="general"><option value="general">General ministry</option><option value="technology">Technology & platform</option><option value="outreach">Outreach</option><option value="missions">Missions</option></select></label>
      <button className="ml-action" disabled={working}>Record verified gift</button>
    </form>
    <form className="ml-panel ml-admin-form" onSubmit={grant}>
      <div className="ml-icon"><BookOpen size={20}/></div><h3>Grant a resource</h3><p>Give a member access to a digital book or resource without changing their financial record.</p>
      <label>Member<select name="profileId" required defaultValue=""><option value="" disabled>Choose member</option>{data.people.map((p:any)=><option key={p.profile_id} value={p.profile_id}>{p.display_name||p.email} • {p.email}</option>)}</select></label>
      <label>Resource<select name="productId" required defaultValue=""><option value="" disabled>Choose resource</option>{data.products.filter((p:any)=>p.product_type!=="physical_book").map((p:any)=><option key={p.id} value={p.id}>{p.title} • {p.status}</option>)}</select></label>
      <button className="ml-action" disabled={working}>Grant access</button>
    </form>
   </div>
   <div className="ml-panel ml-recent-gifts"><div className="ml-kicker">Recent giving records</div><h3>Latest gifts</h3>{recent.length?recent.slice(0,8).map((g:any)=><div className="ml-gift-row" key={g.id}><div><b>{g.donor_name||data.people.find((p:any)=>p.profile_id===g.profile_id)?.display_name||"Member / donor"}</b><span>{g.provider} • {g.designation}</span></div><strong>{"$"+(Number(g.amount_cents||0)/100).toFixed(2)}</strong></div>):<p>No gifts recorded yet.</p>}</div>
 </section>;
}