"use client";
import {useEffect,useState} from "react";

export default function StaffSecurityGate({
  children,
  allowedRoles,
  returnTo
}:{
  children:React.ReactNode;
  allowedRoles:string[];
  returnTo:string;
}){
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

        if(!roles.some((role:string)=>allowedRoles.includes(role))){
          location.replace("/my-lockliel");
          return;
        }

        const mfa=data.mfa||{};
        if(!mfa.hasVerifiedTotp||mfa.aal!=="aal2"){
          location.replace(
            "/my-lockliel/security?required=staff&next="+encodeURIComponent(returnTo)
          );
          return;
        }

        setAllowed(true);
      })
      .catch(()=>location.replace("/my-lockliel"));
  },[allowedRoles,returnTo]);

  if(!allowed){
    return <div className="ml-loading">Checking secure staff access…</div>;
  }

  return <>{children}</>;
}
