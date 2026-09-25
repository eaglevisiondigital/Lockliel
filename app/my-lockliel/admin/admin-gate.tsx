"use client";
import {useEffect,useState} from "react";

const ADMIN_ROLES=[
  "super_admin",
  "admin",
  "discipleship_admin",
  "founders50_reviewer",
  "finance_admin",
  "content_admin",
  "fulfillment_admin"
];

export default function AdminGate({children}:{children:React.ReactNode}){
  const [allowed,setAllowed]=useState(false);

  useEffect(()=>{
    fetch("/api/lockliel-auth/session",{cache:"no-store"})
      .then(async r=>{
        if(r.status===401){
          location.replace("/my-lockliel/sign-in");
          return;
        }
        const data=await r.json().catch(()=>({}));
        const roles=Array.isArray(data.roles)?data.roles:[];
        if(!roles.some((role:string)=>ADMIN_ROLES.includes(role))){
          location.replace("/my-lockliel");
          return;
        }
        setAllowed(true);
      })
      .catch(()=>location.replace("/my-lockliel"));
  },[]);

  if(!allowed)return <div className="ml-loading">Checking Lockliel Admin access…</div>;
  return <>{children}</>;
}
