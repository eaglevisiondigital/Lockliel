"use client";
import Link from "next/link";
import {Bell,CheckCheck} from "lucide-react";
import {useEffect,useState} from "react";

export default function NotificationsClient({compact=false}:{compact?:boolean}){
  const [data,setData]=useState<any>(null);

  async function load(){
    const r=await fetch("/api/lockliel/notifications",{cache:"no-store"});
    if(r.ok)setData(await r.json());
  }
  useEffect(()=>{load();},[]);

  async function mark(id:string,href?:string){
    await fetch("/api/lockliel/notifications",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id})
    });
    if(href)location.assign(href);
    else await load();
  }

  async function markAll(){
    await fetch("/api/lockliel/notifications",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"markAllRead"})
    });
    await load();
  }

  if(!data)return null;
  const visible=compact?data.notifications.slice(0,4):data.notifications;

  return <section className={compact?"ml-notifications compact":"ml-notifications"}>
    <div className="ml-notification-head">
      <div><Bell size={17}/><b>Notifications</b>{data.unread>0&&<span>{data.unread}</span>}</div>
      {data.unread>0&&<button onClick={markAll}><CheckCheck size={13}/> Mark all read</button>}
    </div>
    {visible.length
      ? <div className="ml-notification-list">{visible.map((n:any)=><button className={n.read_at?"read":""} key={n.id} onClick={()=>mark(n.id,n.href)}>
          <div><b>{n.title}</b><span>{n.body}</span><small>{new Date(n.created_at).toLocaleString()}</small></div>
        </button>)}</div>
      : <p className="ml-privacy-note">No notifications yet.</p>}
    {compact&&data.notifications.length>4&&<Link href="/my-lockliel/notifications">View all notifications →</Link>}
  </section>;
}