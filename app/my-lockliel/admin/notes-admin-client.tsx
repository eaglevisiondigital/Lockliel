"use client";
import {useEffect,useMemo,useState} from "react";
import {FileLock2,StickyNote} from "lucide-react";

export default function NotesAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [message,setMessage]=useState("");
  const [working,setWorking]=useState(false);
  const [filter,setFilter]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/notes",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);
    setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/admin/notes",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        profileId:f.get("profileId"),
        visibility:f.get("visibility"),
        noteType:f.get("noteType"),
        body:f.get("body")
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to save note.");return;}
    setMessage("Private staff note saved.");
    e.currentTarget.reset();
    await load();
  }

  const visibleNotes=useMemo(()=>{
    const q=filter.trim().toLowerCase();
    if(!q)return data?.notes||[];
    return (data?.notes||[]).filter((n:any)=>{
      const p=n.person||{};
      return [p.first_name,p.last_initial,p.city,p.region,n.body,n.note_type]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  },[data,filter]);

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading private staff notes…</div>;

  const canAdmin=data.roles.some((r:string)=>["super_admin","admin"].includes(r));
  const canFinance=data.roles.some((r:string)=>["super_admin","admin","finance_admin"].includes(r));

  return <section className="ml-notes-admin">
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-finance-grid">
      <form className="ml-panel ml-admin-form" onSubmit={submit}>
        <div className="ml-icon"><FileLock2 size={19}/></div>
        <h3>Add a private staff note</h3>
        <p>These notes are never visible to the member, inviter, group roster, or ordinary connections. Visibility is enforced by role.</p>

        <label>Member<select name="profileId" required defaultValue=""><option value="" disabled>Choose member</option>{data.people.map((p:any)=><option value={p.profile_id} key={p.profile_id}>{p.first_name}{p.last_initial?" "+p.last_initial+".":""} • {[p.city,p.region].filter(Boolean).join(", ")}</option>)}</select></label>

        <label>Note type<select name="noteType" defaultValue="general">
          <option value="general">General</option>
          <option value="follow_up">Follow-up</option>
          <option value="discipleship">Discipleship</option>
          <option value="founders50">Founders 50</option>
          <option value="group">Group</option>
          {canFinance&&<option value="finance">Finance</option>}
        </select></label>

        <label>Visibility<select name="visibility" defaultValue="ministry_staff">
          <option value="ministry_staff">Ministry staff</option>
          {canAdmin&&<option value="admin_only">Admin only</option>}
          {canFinance&&<option value="finance_only">Finance only</option>}
        </select></label>

        <label>Note<textarea name="body" rows={5} maxLength={5000} required placeholder="Record only information that is necessary for appropriate ministry or operational follow-up."/></label>
        <button className="ml-action" disabled={working}>{working?"Saving…":"Save private note"}</button>
      </form>

      <section className="ml-panel ml-admin-list">
        <div className="ml-icon"><StickyNote size={19}/></div>
        <h3>Recent staff notes</h3>
        <label className="ml-admin-search"><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter notes or people…"/></label>
        <div className="ml-note-list">
          {visibleNotes.slice(0,40).map((n:any)=><article key={n.id}>
            <div>
              <b>{n.person?.first_name||"Member"}{n.person?.last_initial?" "+n.person.last_initial+".":""}</b>
              <span>{n.note_type.replaceAll("_"," ")} • {n.visibility.replaceAll("_"," ")}</span>
            </div>
            <p>{n.body}</p>
            <small>{new Date(n.created_at).toLocaleString()}{n.author?.first_name?" • "+n.author.first_name:""}</small>
          </article>)}
          {!visibleNotes.length&&<p>No staff notes match this view.</p>}
        </div>
      </section>
    </div>
  </section>;
}