"use client";
import {useEffect,useMemo,useState} from "react";
import {ShieldCheck,UserCog,UserMinus,UserPlus} from "lucide-react";

const labels:any={
  super_admin:"Super admin",
  admin:"Administrator",
  discipleship_admin:"Discipleship admin",
  founders50_reviewer:"Founders 50 reviewer",
  group_leader:"Group leader",
  finance_admin:"Finance admin",
  content_admin:"Content admin",
  fulfillment_admin:"Fulfillment admin"
};

export default function RolesAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/roles",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function change(action:string,profileId:string,role:string){
    setWorking(true);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/roles",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action,profileId,role})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to update staff role.");return;}
    setMessage(action==="grant"?"Role granted.":"Role removed.");
    await load();
  }

  const staffByPerson=useMemo(()=>{
    const out:any={};
    for(const item of data?.staff||[]){
      if(!out[item.profile_id])out[item.profile_id]=[];
      out[item.profile_id].push(item.role);
    }
    return out;
  },[data]);

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading staff roles…</div>;

  return <section className="ml-panel ml-roles-admin">
    <div className="ml-system-head">
      <div><div className="ml-kicker">Staff access</div><h2>Delegate without sharing master access.</h2></div>
      <ShieldCheck size={28}/>
    </div>
    <p className="ml-privacy-note">Roles control permissions. Tags and Founders 50 status never grant administrative access. Lockliel currently has {data.superAdminCount} super administrator{data.superAdminCount===1?"":"s"}, and the database will not allow the final super administrator to be removed.</p>
    {message&&<p className="ml-share-message">{message}</p>}
    <div className="ml-role-list">
      {data.people.map((p:any)=>{
        const roles=staffByPerson[p.profile_id]||[];
        return <div className="ml-role-person" key={p.profile_id}>
          <div className="ml-person-main">
            <div className="ml-avatar"><UserCog size={16}/></div>
            <div><b>{p.display_name||p.email}</b><small>{p.email}</small></div>
          </div>
          <div className="ml-role-chips">
            {roles.map((role:string)=>{
              const protectedSelf=role==="super_admin"&&p.profile_id===data.currentProfileId;
              return <button
                key={role}
                disabled={working||protectedSelf}
                onClick={()=>change("remove",p.profile_id,role)}
                title={protectedSelf?"Your own super admin role is protected":"Remove role"}
              ><UserMinus size={12}/>{labels[role]||role}{protectedSelf?" • protected":""}</button>;
            })}
            {!roles.length&&<small>No staff roles</small>}
          </div>
          <label className="ml-role-add"><UserPlus size={14}/><select defaultValue="" disabled={working} onChange={e=>{if(e.target.value){change("grant",p.profile_id,e.target.value);e.currentTarget.value="";}}}><option value="">Grant role…</option>{data.allowedRoles.filter((r:string)=>!roles.includes(r)).map((r:string)=><option value={r} key={r}>{labels[r]||r}</option>)}</select></label>
        </div>;
      })}
    </div>
  </section>;
}