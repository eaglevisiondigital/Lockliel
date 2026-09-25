"use client";
import {useEffect,useState} from "react";
import {
  CalendarHeart,
  CheckCircle2,
  Gift,
  HeartHandshake,
  LockKeyhole,
  Sparkles
} from "lucide-react";

function money(cents:number){
  return "$"+(Number(cents||0)/100).toFixed(2);
}

export default function PartnerClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/lockliel/partner",{cache:"no-store"}).then(async r=>{
      if(r.status===401){
        location.assign("/my-lockliel/sign-in");
        return;
      }
      const d=await r.json().catch(()=>({}));
      if(!r.ok){
        setError(d.error||"Unable to load partnership.");
        return;
      }
      setData(d);
    });
  },[]);

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading partnership…</div>;

  const monthly=data.commitments.find(
    (c:any)=>c.cadence==="monthly"&&c.status==="active"
  );
  const monthlyLabel=monthly?money(monthly.amount_cents):"Not active";
  const recentGifts=(data.gifts||[]).slice(0,8);
  const activeBenefit=(data.benefits||[]).find(
    (b:any)=>b.slug==="heart-for-the-lost-gift-20"
  );

  return <>
    <section className="ml-partner-stats">
      <article className="ml-card">
        <div className="ml-icon"><HeartHandshake size={20}/></div>
        <strong>{money(data.totalGiven)}</strong>
        <span>recorded giving</span>
      </article>
      <article className="ml-card">
        <div className="ml-icon"><CalendarHeart size={20}/></div>
        <strong>{monthlyLabel}</strong>
        <span>monthly partnership</span>
      </article>
    </section>

    {!data.checkoutReady
      ? <section className="ml-panel ml-payment-pending">
          <div className="ml-icon"><LockKeyhole size={20}/></div>
          <div>
            <div className="ml-kicker">Secure giving</div>
            <h2>Online partnership is being prepared.</h2>
            <p>Lockliel will not collect payment details here until the ministry payment account, secure checkout adapter, and verified webhook processing are all live and tested.</p>
          </div>
        </section>
      : <section className="ml-panel ml-partner-live">
          <div className="ml-icon"><CheckCircle2 size={20}/></div>
          <div>
            <div className="ml-kicker">Secure giving ready</div>
            <h2>Choose how you want to partner.</h2>
            <p>One-time and monthly partnership will use Lockliel’s verified payment connection. No raw card information is stored in My Lockliel.</p>
          </div>
          <div className="ml-giving-coming">
            <Sparkles size={17}/>
            <span>Secure checkout is connected. Giving options will be released through the verified Lockliel checkout flow.</span>
          </div>
        </section>}

    {activeBenefit&&<section className="ml-panel ml-partner-benefit">
      <Gift size={22}/>
      <div>
        <div className="ml-kicker">Partner resource</div>
        <h2>{activeBenefit.title}</h2>
        <p>Qualifying partnership gifts can unlock the related digital resource after the payment is successfully verified.</p>
      </div>
    </section>}

    {recentGifts.length>0&&<section className="ml-panel ml-giving-history">
      <div className="ml-kicker">Your giving history</div>
      <h2>Recent recorded gifts</h2>
      {recentGifts.map((gift:any)=><div key={gift.id}>
        <div><b>{money(gift.amount_cents)}</b><span>{gift.designation||"general"}</span></div>
        <small>{gift.status} • {new Date(gift.received_at||gift.created_at).toLocaleDateString()}</small>
      </div>)}
    </section>}

    <p className="ml-privacy-note" style={{marginTop:16}}>
      Giving and partnership information is available only to you and specifically authorized finance staff. Inviters, group leaders, and ordinary ministry connections cannot see your giving history.
    </p>
  </>;
}