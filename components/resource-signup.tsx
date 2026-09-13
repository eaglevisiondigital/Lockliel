"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getResourceAttribution, resourceEvent } from "@/lib/resource-events";

export default function ResourceSignup() {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const started = useRef(false);
  useEffect(() => { getResourceAttribution(); resourceEvent("landing_visit"); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!String(data.get("first-name") || "").trim()) { setError("Please enter your first name."); setStatus("error"); form.querySelector<HTMLInputElement>("#resource-first-name")?.focus(); return; }
    if (!form.reportValidity()) return;
    if (data.get("email-consent") !== "yes") { setError("Please confirm that you’d like to receive Faith Boost resources and Lockliel updates."); setStatus("error"); return; }
    busy.current = true; setStatus("sending"); setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/faith-boost/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: data.get("first-name"), email: data.get("email"), phone: data.get("phone"), emailConsent: true, botField: data.get("bot-field"), attribution: getResourceAttribution() }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "We couldn’t confirm your registration. Please try again.");
      window.location.assign("/who-god-says-you-are/read");
    } catch (problem) { setStatus("error"); setError(problem instanceof Error && problem.name !== "AbortError" ? problem.message : "Your connection took too long. Your details are still here; please try again."); }
    finally { window.clearTimeout(timeout); busy.current = false; }
  }
  return <form className="fr-form" onSubmit={submit} onFocus={() => { if (!started.current) { started.current = true; resourceEvent("form_start"); } }} aria-labelledby="fr-form-title" aria-busy={status === "sending"}>
    <p className="fr-eyebrow">Your free digital book</p><h3 id="fr-form-title">Let’s get it to you.</h3><p className="fr-form-intro">Your book opens immediately after registration.</p>
    <p className="fr-honeypot" aria-hidden="true"><label>Leave empty<input name="bot-field" autoComplete="off" tabIndex={-1}/></label></p>
    <div className="fr-field"><label htmlFor="resource-first-name">First name</label><input id="resource-first-name" name="first-name" autoComplete="given-name" maxLength={80} required/></div>
    <div className="fr-field"><label htmlFor="resource-email">Email address</label><input id="resource-email" name="email" type="email" autoComplete="email" maxLength={254} required/></div>
    <div className="fr-field"><label htmlFor="resource-phone">Mobile phone <span>Optional</span></label><input id="resource-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} aria-describedby="fr-phone-help"/><p id="fr-phone-help">Optional — for future reminder options. Adding a number does not subscribe you to texts.</p></div>
    <div className="fr-consent"><Checkbox id="resource-email-consent" name="email-consent" value="yes" required/><label htmlFor="resource-email-consent">Yes, send me Faith Boost resources, encouragement, and important Lockliel updates by email. I can unsubscribe at any time.</label></div>
    {status === "error" && <p className="fr-error" role="alert">{error}</p>}
    <button className="fr-button fr-primary fr-submit" disabled={status === "sending"} type="submit">{status === "sending" ? <><LoaderCircle className="fr-spinner" size={20}/> Getting your book…</> : <>Get the free digital book <ArrowUpRight size={20}/></>}</button>
    <p className="fr-form-note">No spam. Just faith-building resources and Lockliel updates. We keep your contact details private and use source information to understand how people find this resource.</p>
    <noscript><p className="fr-error">Please enable JavaScript to register, or contact <a href="mailto:info@lockliel.com">info@lockliel.com</a> for help.</p></noscript>
  </form>;
}
