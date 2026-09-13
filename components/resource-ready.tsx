"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Download } from "lucide-react";
import { resourceEvent } from "@/lib/resource-events";
const reader = "/who-god-says-you-are/reader/";
export default function ResourceReady() {
  const [state, setState] = useState<"checking" | "ready" | "error">("checking");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/faith-boost/access", { cache: "no-store", signal: controller.signal }).then(async response => { if (response.status === 401) { window.location.replace("/who-god-says-you-are#get-the-book"); return; } if (!response.ok) throw new Error(); const body = await response.json(); if (body.ok) setState("ready"); else throw new Error(); }).catch(error => { if (error.name !== "AbortError") setState("error"); });
    return () => controller.abort();
  }, []);
  if (state !== "ready") return <main className="fr-shell fr-access-state"><a className="fr-nav-link" href="/">Lockliel</a><h1>{state === "error" ? "Let’s reconnect." : "Opening your book…"}</h1>{state === "error" && <><p>We couldn’t check your book access. Please try again.</p><button className="fr-button fr-primary" onClick={() => window.location.reload()}>Try again</button><a className="fr-nav-link" href="/who-god-says-you-are">Back to the free book</a></>}<noscript><p>Please enable JavaScript to check your registration and open the reader.</p></noscript></main>;
  return <>
    <header className="fr-header fr-shell"><a className="fr-brand" href="/"><img src="/lockliel-mark.png" alt="" width={44} height={44}/><span>Lockliel<small>REACH. TEACH. TRAIN. DISCIPLE.</small></span></a><a className="fr-nav-link" href="/#faith-boost">Faith Boost <ArrowUpRight size={16}/></a></header>
    <main className="fr-shell fr-ready"><div className="fr-ready-grid"><div><p className="fr-eyebrow">You’re in. Let’s grow.</p><h1>Your book<br/><em>is ready.</em></h1><p className="fr-subtitle">Start discovering who God says you are.</p><div className="fr-ready-actions"><a className="fr-button fr-primary" href={reader} onClick={() => resourceEvent("read_online_click")}><BookOpen size={20}/> Read the digital book</a><a className="fr-button fr-outline" href={`${reader}You_Are_Who_God_Says_You_Are_Lockliel.pdf`} download onClick={() => resourceEvent("pdf_download_click")}><Download size={20}/> Download the PDF</a></div><p className="fr-micro">Keep the PDF or bookmark this page to return to your book.</p></div><img className="fr-ready-cover" src="/faith-boost-resource/cover.jpg" alt="You Are Who God Says You Are book cover" width={1055} height={1491}/></div>
    <section className="fr-stay-connected" aria-labelledby="fr-follow-title"><p className="fr-eyebrow">Your next step</p><h2 id="fr-follow-title">Keep your faith <em>growing daily.</em></h2><p>Follow Lockliel on your favorite platform and turn on notifications to join Faith Boost when we go live.</p><p className="fr-schedule">Every day · 7 PM Central Time</p><div className="fr-social-buttons">{[{name:"YouTube",label:"Subscribe on YouTube",url:"https://www.youtube.com/@Lockliel"},{name:"Facebook",label:"Follow on Facebook",url:"https://www.facebook.com/lockliel"},{name:"Rumble",label:"Follow on Rumble",url:"https://rumble.com/user/lockliel"}].map(social => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" onClick={() => resourceEvent("social_follow_click",{platform:social.name.toLowerCase()})}><span>{social.name}</span><strong>{social.label} <ArrowUpRight size={18}/></strong></a>)}</div><p className="fr-micro">Choose the platform you enjoy most. Turn on its notifications after following.</p></section></main>
    <footer className="fr-footer fr-shell"><a href="/">Lockliel.com</a><p>Reach. Teach. Train. Disciple.</p></footer>
  </>;
}
