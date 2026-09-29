"use client";
import Link from "next/link";
import {CheckCircle2,HeartHandshake,Printer} from "lucide-react";
import {useEffect,useState} from "react";

function money(cents:number,currency:string){
  try{
    return new Intl.NumberFormat("en-US",{style:"currency",currency:currency||"USD"}).format((Number(cents)||0)/100);
  }catch{
    return "$"+((Number(cents)||0)/100).toFixed(2);
  }
}

function maskRef(value:string){
  const text=String(value||"");
  if(text.length<=8)return text;
  return "•••• "+text.slice(-8);
}

export default function GiftAcknowledgmentClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    const giftId=new URLSearchParams(location.search).get("giftId")||"";
    if(!giftId){
      setError("Choose a gift from your partnership history.");
      return;
    }

    fetch("/api/lockliel/gift-acknowledgment?giftId="+encodeURIComponent(giftId),{cache:"no-store"})
      .then(async r=>{
        if(r.status===401){
          location.assign("/my-lockliel/sign-in");
          return;
        }
        const d=await r.json().catch(()=>({}));
        if(!r.ok){
          setError(d.error||"Unable to load gift acknowledgment.");
          return;
        }
        setData(d.acknowledgment);
      })
      .catch(()=>setError("Unable to load gift acknowledgment."));
  },[]);

  if(error)return <section className="ml-card"><HeartHandshake size={21}/><h2>Gift acknowledgment</h2><p>{error}</p><Link href="/my-lockliel/partner">Return to Partnership →</Link></section>;
  if(!data)return <div className="ml-loading">Preparing gift acknowledgment…</div>;

  return <section className="ml-gift-ack">
    <section className="ml-panel ml-gift-ack-card">
      <div className="ml-gift-ack-heading">
        <div>
          <div className="ml-kicker">Lockliel gift acknowledgment</div>
          <h1>Thank you for partnering with the mission.</h1>
        </div>
        <CheckCircle2 size={34}/>
      </div>

      <div className="ml-gift-ack-amount">{money(data.amountCents,data.currency)}</div>

      <div className="ml-gift-ack-grid">
        <div><span>Partner</span><b>{data.donorName}</b></div>
        <div><span>Gift date</span><b>{new Date(data.receivedAt).toLocaleDateString()}</b></div>
        <div><span>Designation</span><b>{String(data.designation).replaceAll("_"," ")}</b></div>
        <div><span>Payment provider</span><b>{String(data.provider).replaceAll("_"," ")}</b></div>
        <div><span>Transaction reference</span><b>{maskRef(data.providerReference)}</b></div>
        <div><span>Status</span><b>{String(data.status).replaceAll("_"," ")}</b></div>
      </div>

      <div className="ml-gift-ack-note">
        <p>This acknowledgment confirms the gift recorded in My Lockliel. It does not make a statement about tax deductibility, charitable contribution eligibility, or the value of any goods or benefits received. Formal tax language should be used only after Lockliel’s applicable tax status and benefit treatment are verified.</p>
      </div>

      <div className="ml-gift-ack-actions">
        <button onClick={()=>window.print()}><Printer size={15}/> Print / Save PDF</button>
        <Link href="/my-lockliel/partner">Back to Partnership</Link>
      </div>
    </section>
  </section>;
}
