import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import "../founders.css";

export const metadata: Metadata = { title: "Thank You for Raising Your Hand | Lockliel Founders 50", robots: { index: false, follow: false } };

export default function FoundersThankYou() {
  return <main className="f50-page f50-thank-you"><section className="f50-thank-you-card" aria-labelledby="founders-thank-you-title"><a className="brand" href="/" aria-label="Lockliel home"><img src="/lockliel-mark.png" alt="" width="44" height="44" /><span>Lockliel</span></a><p className="f50-eyebrow">Your interest has been received</p><h1 id="founders-thank-you-title">Thank you for<br />raising your hand.</h1><p>We're looking carefully at the first 50 people who will help us establish the foundation of Lockliel. Someone from our team will be in touch with next steps.</p><p>This confirms that your interest was submitted. Founder acceptance follows our team's review.</p><div className="f50-actions"><a className="button button-primary" href="/#faith-boost">Explore Faith Boost <ArrowUpRight size={18} aria-hidden="true" /></a><a className="f50-text-link" href="/founders-50">Return to the Founders 50</a></div></section></main>;
}
