"use client";
import Link from "next/link";
import {BellRing,CalendarCheck2,ChevronRight,HeartHandshake} from "lucide-react";
import {useEffect,useState} from "react";

const icons:any={
  my_five_due:HeartHandshake,
  group_checkin:CalendarCheck2,
  notifications:BellRing
};

export default function DashboardAttention(){
  const [data,setData]=useState<any>(null);

  useEffect(()=>{
    fetch("/api/lockliel/dashboard-attention",{cache:"no-store"})
      .then(async r=>{
        if(r.status===401)return;
        if(r.ok)setData(await r.json());
      })
      .catch(()=>{});
  },[]);

  if(!data?.items?.length)return null;

  return <section className="ml-attention">
    <div className="ml-attention-heading">
      <div>
        <div className="ml-kicker">Needs your attention</div>
        <h2>Simple next actions for this week.</h2>
      </div>
      <span>{data.items.length}</span>
    </div>

    <div className="ml-attention-list">
      {data.items.map((item:any)=>{
        const Icon=icons[item.key]||BellRing;
        return <Link className={"ml-attention-item "+item.priority} href={item.href} key={item.key}>
          <div className="ml-attention-icon"><Icon size={17}/></div>
          <div>
            <b>{item.title}</b>
            <span>{item.detail}</span>
          </div>
          <ChevronRight size={16}/>
        </Link>;
      })}
    </div>
  </section>;
}
