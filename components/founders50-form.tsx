"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "American Samoa", "Guam", "Northern Mariana Islands", "Puerto Rico", "U.S. Virgin Islands"];
const places = ["Home", "Coffee shop", "Workplace / office", "Community space", "Restaurant", "Other"];
const inviteCounts = ["2 - 3", "4 - 5", "6 - 10", "11+", "Not sure yet"];
const willingness = ["Yes", "I'd like to learn more"];

function FormSelect({ name, label, placeholder, options }: { name: string; label: string; placeholder: string; options: string[] }) {
  return <div className="f50-field"><label htmlFor={name}>{label}</label><Select name={name} required><SelectTrigger className="f50-select-trigger" id={name}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent className="f50-select-menu" position="popper">{options.map(value => <SelectItem className="f50-select-option" value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select></div>;
}

function CommitmentChoice({ name, question }: { name: string; question: string }) {
  return <div className="f50-commitment-choice"><span id={`${name}-label`}>{question}</span><RadioGroup name={name} required aria-labelledby={`${name}-label`} className="f50-radio-options">{willingness.map((value, i) => <label key={value} htmlFor={`${name}-${i}`}><RadioGroupItem value={value} id={`${name}-${i}`} /><span>{value}</span></label>)}</RadioGroup></div>;
}

export default function Founders50Form() {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const required = ["first-name", "last-name", "email", "mobile-phone", "city", "state", "gathering-place", "invite-count", "why-interested", "what-excites-you", "share-with-five", "gather-weekly", "training-willingness"];
    const missing = required.find(name => !String(data.get(name) ?? "").trim());
    if (missing) {
      setError("Please complete each required field so we can get to know you.");
      setStatus("error");
      const field = form.querySelector<HTMLElement>(`#${missing}`) ?? form.querySelector<HTMLElement>(`[aria-labelledby="${missing}-label"] [role="radio"]`) ?? form.querySelector<HTMLElement>(`[name="${missing}"]`);
      field?.focus();
      return;
    }
    if (!form.reportValidity()) return;
    submitting.current = true;
    setStatus("sending");
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const body = new URLSearchParams();
      data.forEach((value, key) => body.append(key, String(value)));
      const response = await fetch("/__founders50.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Submission was not accepted");
      window.location.assign("/founders-50/thank-you");
    } catch {
      setStatus("error");
      setError("We couldn't confirm your submission. Your answers are still here. Please try again, or contact info@lockliel.com for help.");
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
    }
  }

  return (
    <form className="f50-form" name="lockliel-founders-50" method="POST" action="/founders-50/thank-you" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={handleSubmit} noValidate aria-labelledby="f50-form-title" aria-busy={status === "sending"}>
      <input type="hidden" name="form-name" value="lockliel-founders-50" />
      <p className="f50-honeypot" aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <div className="f50-form-heading"><p className="f50-eyebrow">The Founders 50</p><h3 id="f50-form-title">Express your interest.</h3><p>Every field is required except your church or ministry affiliation.</p></div>
      <noscript><p className="f50-form-error">Please enable JavaScript to complete this form, or contact info@lockliel.com to express your interest.</p></noscript>
      <fieldset><legend><span>01</span> You and your community</legend><div className="f50-form-grid">
        <div className="f50-field"><label htmlFor="first-name">First name</label><input id="first-name" name="first-name" autoComplete="given-name" maxLength={80} required /></div>
        <div className="f50-field"><label htmlFor="last-name">Last name</label><input id="last-name" name="last-name" autoComplete="family-name" maxLength={80} required /></div>
        <div className="f50-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
        <div className="f50-field"><label htmlFor="mobile-phone">Mobile phone</label><input id="mobile-phone" name="mobile-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} required /></div>
        <div className="f50-field"><label htmlFor="city">City</label><input id="city" name="city" autoComplete="address-level2" maxLength={100} required /></div>
        <FormSelect name="state" label="State / territory" placeholder="Choose your state" options={states} />
      </div></fieldset>
      <fieldset><legend><span>02</span> Where you could begin</legend><div className="f50-form-grid">
        <div className="f50-field f50-full-field"><label htmlFor="church-affiliation">Current church / ministry <span>Optional</span></label><input id="church-affiliation" name="church-affiliation" maxLength={160} /></div>
        <FormSelect name="gathering-place" label="Where could you gather people?" placeholder="Choose a place" options={places} />
        <FormSelect name="invite-count" label="How many could you initially invite?" placeholder="Choose an estimate" options={inviteCounts} />
        <div className="f50-field f50-full-field"><label htmlFor="why-interested">Why are you interested in becoming one of the Founders 50?</label><textarea id="why-interested" name="why-interested" rows={3} maxLength={2000} required /></div>
        <div className="f50-field f50-full-field"><label htmlFor="what-excites-you">What excites you most about reaching and discipling people?</label><textarea id="what-excites-you" name="what-excites-you" rows={3} maxLength={2000} required /></div>
      </div></fieldset>
      <fieldset><legend><span>03</span> Let's build it together</legend>
        <CommitmentChoice name="share-with-five" question="Would you personally share Faith Boost with at least five people each week?" />
        <CommitmentChoice name="gather-weekly" question="Would you be willing to gather a few people approximately once per week?" />
        <div className="f50-training-choice"><Checkbox name="training-willingness" value="Yes" id="training-willingness" required /><label htmlFor="training-willingness">Yes, I'm willing to participate in training and help us learn what works as we build Lockliel.</label></div>
      </fieldset>
      <p className="f50-form-privacy">We'll use these details to follow up with you about the Founders 50.</p>
      {status === "error" && <p className="f50-form-error" role="alert">{error}</p>}
      <button className="button button-primary f50-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? <><LoaderCircle className="f50-spinner" size={18} aria-hidden="true" /> Sending your interest…</> : <>I'm ready to help build something that multiplies <ArrowUpRight size={18} aria-hidden="true" /></>}</button>
      <p className="f50-form-note">Submitting expresses your interest. The team will follow up about next steps and Founder acceptance.</p>
    </form>
  );
}
