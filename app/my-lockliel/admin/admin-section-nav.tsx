"use client";
import {useEffect,useState} from "react";

const items=[
  ["overview","Overview"],
  ["pipeline","Pipeline"],
  ["people","People"],
  ["founders","Founders"],
  ["leaders","Leaders & Groups"],
  ["discipleship","Discipleship"],
  ["resources","Resources & Giving"],
  ["access","Access & System"]
];

export default function AdminSectionNav(){
  const [active,setActive]=useState("overview");

  useEffect(()=>{
    const sections=items
      .map(([id])=>document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if(!sections.length)return;

    const observer=new IntersectionObserver(entries=>{
      const visible=entries
        .filter(e=>e.isIntersecting)
        .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0]?.target?.id)setActive(visible[0].target.id);
    },{rootMargin:"-18% 0px -70% 0px",threshold:0});

    sections.forEach(section=>observer.observe(section));
    return ()=>observer.disconnect();
  },[]);

  function go(id:string){
    document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  return <nav className="ml-admin-section-nav" aria-label="Lockliel Admin sections">
    {items.map(([id,label])=><button
      key={id}
      className={active===id?"active":""}
      onClick={()=>go(id)}
    >{label}</button>)}
  </nav>;
}
