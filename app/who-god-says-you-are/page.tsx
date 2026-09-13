import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, BookOpen, Download, Check } from "lucide-react";
import ResourceSignup from "@/components/resource-signup";

const url = "https://lockliel.com/who-god-says-you-are";
const title = "You Are Who God Says You Are | Free Faith Boost Resource | Lockliel";
const description = "Discover 7 biblical truths that will change the way you see yourself. Get the free Faith Boost digital book from Lockliel.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: url },
  openGraph: { type: "website", url, title, description, siteName: "Lockliel", images: [{ url: "https://lockliel.com/faith-boost-resource/cover.jpg", width: 1055, height: 1491, alt: "You Are Who God Says You Are — a free Faith Boost resource by David Fowler" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://lockliel.com/faith-boost-resource/cover.jpg"] },
};
const truths = [
  ["Loved", "Discover how to live from God’s love rather than rejection or insecurity."],
  ["Righteous", "Understand what Jesus has done and why you can approach God with confidence."],
  ["Blessed", "Discover God’s goodness and what it means to be blessed to become a blessing."],
  ["Anointed", "Recognize that God hasn’t left you powerless. His power is at work in you."],
  ["Healed", "Build your thinking and confession around what God’s Word says about healing and wholeness."],
  ["Joy-filled", "Discover joy that isn’t dependent upon circumstances."],
  ["Bold", "Become confident in what God has placed inside you and begin giving it away."],
];

export default function ResourcePage() {
  return <>
    <header className="fr-header fr-shell"><a className="fr-brand" href="/"><img src="/lockliel-mark.png" alt="" width={44} height={44}/><span>Lockliel<small>REACH. TEACH. TRAIN. DISCIPLE.</small></span></a><a className="fr-nav-link" href="/#faith-boost">Faith Boost <ArrowUpRight size={16}/></a></header>
    <main>
      <section className="fr-hero">
        <div className="fr-shell fr-hero-grid">
          <div className="fr-hero-copy"><p className="fr-eyebrow">A free Faith Boost resource</p><h1>You Are Who<br/>God Says<br/><em>You Are.</em></h1><p className="fr-subtitle">7 Biblical Truths That Will Change the Way You See Yourself</p><p className="fr-lead">Life has a way of trying to tell you who you are. Your past. Your mistakes. Your circumstances. What somebody said about you.</p><p className="fr-final-word">But none of those things get the final word.<br/><strong>God does.</strong></p><a className="fr-button fr-primary" href="#get-the-book">Get the free digital book <ArrowDown size={18}/></a><p className="fr-micro">Instant access after registration · Read online or download the PDF</p></div>
          <figure className="fr-cover"><img src="/faith-boost-resource/cover.jpg" alt="You Are Who God Says You Are, by David Fowler. The finished Faith Boost digital book cover." width={1055} height={1491} fetchPriority="high"/><figcaption><span>By David Fowler</span><span>10 pages. Seven truths.</span></figcaption></figure>
        </div>
      </section>
      <section className="fr-discover" aria-labelledby="fr-discover-title"><div className="fr-shell"><div className="fr-section-heading"><div><p className="fr-eyebrow">What does God’s Word say?</p><h2 id="fr-discover-title">See yourself<br/><em>through His Word.</em></h2></div><p>Discover seven foundational biblical truths that will help you begin seeing yourself through the lens of God’s Word and living from who He says you are.</p></div><ol className="fr-truths">{truths.map(([theme, copy], index) => <li key={theme}><span className="fr-number">0{index + 1}</span><div><h3>{theme} <span>is who you are.</span></h3><p>{copy}</p></div><Check size={19} aria-hidden="true"/></li>)}</ol></div></section>
      <section className="fr-optin" id="get-the-book" aria-labelledby="fr-optin-title"><div className="fr-shell fr-optin-grid"><div className="fr-optin-copy"><p className="fr-eyebrow">Start here. Keep growing.</p><h2 id="fr-optin-title">A stronger faith.<br/><em>A new way to see yourself.</em></h2><p>Get the book and register for Faith Boost resources, encouragement, and important Lockliel updates.</p><div className="fr-form-benefits"><p><BookOpen size={22}/><span>Read all ten pages in the digital reader.</span></p><p><Download size={22}/><span>Download the PDF and keep it with you.</span></p></div><p className="fr-follow-note">Then choose YouTube, Facebook, or Rumble and turn on notifications to keep building your faith with us daily.</p></div><ResourceSignup/></div></section>
    </main>
    <footer className="fr-footer fr-shell"><a href="/">Lockliel.com</a><p>Empowering and Mobilizing the Church Beyond the Walls.</p><a href="/#faith-boost">Watch Faith Boost <ArrowUpRight size={16}/></a></footer>
  </>;
}
