"use client";
import Link from "next/link";import { ArrowLeft, BookOpen, HeartHandshake, ShieldCheck, Users } from "lucide-react";import { useEffect,useState } from "react";
type AdminData={roles:string[];counts:{people:number;founders:number;activeCourses:number;gifts:number};applications:any[]};
export default function AdminClient(){
 const [data,setData]=useState<AdminData|null>(null);const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/lockliel/admin/summary",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok){setError(r.status===403?"Your account does not have staff access.":d.error||"Unable to load admin.");return;}setData(d);}).catch(()=>setError("Unable to load admin."));},[]);
 if(error)return <section className="ml-panel"><h2>Admin access</h2><p>{error}</p><Link href="/my-lockliel">Return to My Lockliel →</Link></section>;
 if(!data)return <div className="ml-loading">Opening Lockliel Admin…</div>;
 const stats=[["People",data.counts.people,Users],["Founders 50",data.counts.founders,ShieldCheck],["Active courses",data.counts.activeCourses,BookOpen],["Recorded gifts",data.counts.gifts,HeartHandshake]];
 return <><section className="ml-admin-stats">{stats.map(([label,value,Icon]:any)=><article className="ml-card" key={label}><div className="ml-icon"><Icon size={20}/></div><strong>{value}</strong><span>{label}</span></article>)}</section><section className="ml-panel ml-admin-list"><div className="ml-kicker">Recent Founders 50 interest</div><h2>People raising their hand</h2>{data.applications.length?data.applications.map(a=><div className="ml-admin-row" key={a.id}><div><b>{a.first_name} {a.last_name}</b><span>{[a.city,a.region,a.country].filter(Boolean).join(", ")}</span></div><span className="ml-status">{String(a.status).replaceAll("_"," ")}</span></div>):<p>No applications yet.</p>}</section></>;
}