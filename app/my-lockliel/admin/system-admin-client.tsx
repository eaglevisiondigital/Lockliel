"use client";
import {useEffect,useState} from "react";
import {Activity,CheckCircle2,Power,ShieldCheck} from "lucide-react";

const labels:any={
  partner_checkout:["Live partnership checkout","Allows the member Partnership page to expose live checkout only when a verified provider, checkout adapter, and webhook are all ready."],
  digital_book_delivery:["Digital book delivery","Marks digital book fulfillment as operationally ready."],
  heart_book_gift_benefit:["$20 book benefit","Activates the qualifying-gift entitlement rule for A Heart for the Lost."],
  founders50_public_recruiting:["Founders 50 recruiting","Tracks whether the public Founders 50 recruiting campaign is intended to be open."],
  internal_messaging:["Internal messaging","Tracks availability of privacy-safe inviter/member messaging."]
};

export default function SystemAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/system",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function toggle(key:string,enabled:boolean){
    setWorking(key);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/system",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({key,enabled})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){
      setMessage(d.error||"Unable to change setting.");
      return;
    }
    setMessage((enabled?"Enabled: ":"Disabled: ")+(labels[key]?.[0]||key));
    await load();
  }

  async function updateProvider(
    provider:string,
    status:string,
    checkoutAdapterReady:boolean,
    webhookReady:boolean,
    verificationNote:string
  ){
    setWorking("provider:"+provider);
    setMessage("");

    const r=await fetch("/api/lockliel/admin/system",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"updateProvider",
        provider,
        status,
        checkoutAdapterReady,
        webhookReady,
        verificationNote
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);

    if(!r.ok){
      setMessage(d.error||"Unable to update provider readiness.");
      return;
    }

    setMessage("Payment provider readiness updated.");
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading system controls…</div>;

  return <section className="ml-system-admin">
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-panel">
      <div className="ml-system-head">
        <div>
          <div className="ml-kicker">Operational controls</div>
          <h2>Turn features on deliberately.</h2>
        </div>
        <ShieldCheck size={28}/>
      </div>

      <div className="ml-flag-list">
        {data.flags.map((flag:any)=>{
          const meta=labels[flag.key]||[flag.key,flag.description];
          return <div className="ml-flag-row" key={flag.key}>
            <div>
              <b>{meta[0]}</b>
              <span>{meta[1]}</span>
            </div>
            <button
              className={flag.enabled?"on":""}
              disabled={working===flag.key}
              onClick={()=>toggle(flag.key,!flag.enabled)}
              aria-pressed={flag.enabled}
            >
              <Power size={14}/>
              {flag.enabled?"On":"Off"}
            </button>
          </div>;
        })}
      </div>
    </div>

    <div className="ml-panel ml-audit-panel">
      <div className="ml-kicker">Audit history</div>
      <h2>Recent sensitive actions</h2>
      {data.audit.length
        ? data.audit.slice(0,20).map((a:any)=><div className="ml-audit-row" key={a.id}>
            <div className="ml-audit-icon"><Activity size={14}/></div>
            <div>
              <b>{a.summary||a.event_type.replaceAll("_"," ")}</b>
              <span>{a.entity_type}{a.entity_id?" • "+a.entity_id:""}</span>
            </div>
            <time>{new Date(a.created_at).toLocaleString()}</time>
          </div>)
        : <p>No audited changes yet.</p>}
    </div>

    <div className="ml-panel ml-provider-readiness">
      <div className="ml-kicker">Processor readiness</div>
      <h2>Payment connections</h2>
      <p className="ml-privacy-note">A provider is not launch-ready until the account connection, checkout adapter, and verified webhook path are all confirmed. Keep the public checkout feature flag off until all three are complete.</p>

      <div className="ml-provider-control-list">
        {data.providers.map((provider:any)=><ProviderControl
          key={provider.provider}
          provider={provider}
          working={working==="provider:"+provider.provider}
          onSave={updateProvider}
        />)}
      </div>
    </div>
  </section>;
}

function ProviderControl({
  provider,
  working,
  onSave
}:{
  provider:any;
  working:boolean;
  onSave:(provider:string,status:string,checkoutAdapterReady:boolean,webhookReady:boolean,verificationNote:string)=>void;
}){
  const [status,setStatus]=useState(provider.status);
  const [adapter,setAdapter]=useState(Boolean(provider.checkout_adapter_ready));
  const [webhook,setWebhook]=useState(Boolean(provider.webhook_ready));
  const [note,setNote]=useState(provider.verification_note||"");

  const ready=status==="active"&&adapter&&webhook;

  return <article className={ready?"ml-provider-control ready":"ml-provider-control"}>
    <div className="ml-provider-control-head">
      <div>
        <b>{provider.label}</b>
        <span>{provider.supports_recurring?"One-time + recurring":"One-time"}</span>
      </div>
      <div className={ready?"ml-provider-ready-pill ready":"ml-provider-ready-pill"}>
        {ready&&<CheckCircle2 size={13}/>}
        {ready?"Launch ready":"Not launch ready"}
      </div>
    </div>

    <div className="ml-provider-control-grid">
      <label>
        Provider status
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="not_connected">Not connected</option>
          <option value="sandbox">Sandbox</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </label>

      <label className="ml-provider-check">
        <input type="checkbox" checked={adapter} onChange={e=>setAdapter(e.target.checked)}/>
        Checkout adapter verified
      </label>

      <label className="ml-provider-check">
        <input type="checkbox" checked={webhook} onChange={e=>setWebhook(e.target.checked)}/>
        Webhook verified
      </label>
    </div>

    <label className="ml-provider-note">
      Verification note
      <input
        value={note}
        onChange={e=>setNote(e.target.value)}
        minLength={ready?20:0}
        placeholder="Sandbox test, webhook verification, merchant account notes…"
      />
      <small>{ready?"Required for launch-ready status. Include what was tested and verified.":"Document sandbox tests, webhook verification, or merchant account notes as work progresses."}</small>
    </label>

    <div className="ml-provider-control-footer">
      <small>
        {provider.last_verified_at
          ?"Last fully verified "+new Date(provider.last_verified_at).toLocaleString()
          :"Not fully verified yet"}
      </small>
      <button disabled={working||(ready&&note.trim().length<20)} onClick={()=>onSave(provider.provider,status,adapter,webhook,note)}>
        {working?"Saving…":"Save readiness"}
      </button>
    </div>
  </article>;
}
