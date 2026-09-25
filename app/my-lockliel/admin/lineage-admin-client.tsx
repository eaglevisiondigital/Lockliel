"use client";
import Link from "next/link";
import {BookOpen,GitBranch,Layers3,Sprout,UserPlus,Users} from "lucide-react";
import {useEffect,useMemo,useState} from "react";

export default function LineageAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [query,setQuery]=useState("");
  const [expanded,setExpanded]=useState<Record<string,boolean>>({});

  useEffect(()=>{
    fetch("/api/lockliel/admin/lineage",{cache:"no-store"}).then(async r=>{
      const d=await r.json().catch(()=>({}));
      if(r.status===403){setHidden(true);return;}
      if(r.ok)setData(d);
    });
  },[]);

  const filteredRoots=useMemo(()=>{
    if(!data)return [];
    const q=query.trim().toLowerCase();
    if(!q)return data.tree;

    function matches(node:any):boolean{
      if([node.name,node.city,node.region,node.country]
        .filter(Boolean).join(" ").toLowerCase().includes(q))return true;
      return node.children?.some((child:any)=>matches(child));
    }

    return data.tree.filter((root:any)=>matches(root));
  },[data,query]);

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading multiplication lineage…</div>;

  const cards=[
    ["People",data.summary.people,Users],
    ["Joined by invitation",data.summary.referred,UserPlus],
    ["Lineage depth",data.summary.maxDepth,Layers3],
    ["Started discipleship",data.summary.courseStarted,Sprout],
    ["Completed foundation",data.summary.courseCompleted,BookOpen]
  ];

  return <section className="ml-lineage-admin">
    <section className="ml-lineage-stats">
      {cards.map(([label,value,Icon]:any)=><article key={label}>
        <Icon size={17}/>
        <strong>{value}</strong>
        <span>{label}</span>
      </article>)}
    </section>

    <section className="ml-panel ml-lineage-panel">
      <div className="ml-people-head">
        <div>
          <div className="ml-kicker">Multiplication lineage</div>
          <h2>Who invited whom, and are people growing?</h2>
        </div>
        <label className="ml-admin-search"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or location…"/></label>
      </div>

      <p className="ml-privacy-note">This is a ministry relationship map, not a financial downline. It preserves original invitation lineage while separately tracking discipleship movement.</p>

      <div className="ml-lineage-tree">
        {filteredRoots.map((root:any)=><LineageNode key={root.id} node={root} expanded={expanded} setExpanded={setExpanded}/>)}
        {!filteredRoots.length&&<p className="ml-privacy-note">No lineage records match this search.</p>}
      </div>
    </section>

    {data.leaders.length>0&&<section className="ml-panel ml-lineage-branches">
      <div className="ml-kicker">Growing branches</div>
      <h2>Invitation branches with the most descendants</h2>
      {data.leaders.map((person:any)=><article key={person.id}>
        <div>
          <b>{person.name}</b>
          <span>{[person.city,person.region].filter(Boolean).join(", ")||"Location not completed"}</span>
        </div>
        <div><strong>{person.directInvites}</strong><span>direct</span></div>
        <div><strong>{person.descendantCount}</strong><span>descendants</span></div>
        <div><strong>{person.activeDisciples}</strong><span>started growing</span></div>
        <Link href={"/my-lockliel/admin/person?profileId="+encodeURIComponent(person.id)}>Open record →</Link>
      </article>)}
    </section>}
  </section>;
}

function LineageNode({
  node,
  expanded,
  setExpanded
}:{
  node:any;
  expanded:Record<string,boolean>;
  setExpanded:React.Dispatch<React.SetStateAction<Record<string,boolean>>>;
}){
  const open=expanded[node.id]??node.depth<1;
  const pct=node.lessonsTotal?Math.round(node.lessonsCompleted/node.lessonsTotal*100):0;

  return <div className="ml-lineage-node" style={{marginLeft:Math.min(node.depth,6)*18}}>
    <div className="ml-lineage-row">
      <button className="ml-lineage-toggle" disabled={!node.children?.length} onClick={()=>setExpanded(v=>({...v,[node.id]:!open}))}>
        <GitBranch size={14}/>
      </button>
      <div className="ml-lineage-person">
        <b>{node.name}</b>
        <span>{[node.city,node.region].filter(Boolean).join(", ")||"Location not completed"}</span>
      </div>
      <div className="ml-lineage-metrics">
        <span>{node.directInvites} direct</span>
        <span>{node.descendantCount} descendants</span>
        <span>{node.courseStarted?pct+"% discipleship":"not started"}</span>
      </div>
      <Link href={"/my-lockliel/admin/person?profileId="+encodeURIComponent(node.id)}>View</Link>
    </div>
    {open&&node.children?.length>0&&<div>{node.children.map((child:any)=><LineageNode key={child.id} node={child} expanded={expanded} setExpanded={setExpanded}/>)}</div>}
  </div>;
}
