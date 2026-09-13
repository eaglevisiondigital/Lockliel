import { getStore } from "@netlify/blobs";
import { RESOURCE, allowedOrigin, bodyJSON, cookieHeader, hash, issueSession, json, saveEvent, validateSignup } from "../lib/faith-boost-core.mjs";

export function createSignup({ storeFor = () => getStore({ name: "faith-boost-resource", consistency: "strong" }), post = fetch } = {}) {
  return async (request, context = {}) => {
    if (request.method !== "POST") return json({ ok: false }, 405, { Allow: "POST" });
    if (!allowedOrigin(request, context)) return json({ ok: false, message: "Please register through the Lockliel website." }, 403);
    let lead;
    try { lead = validateSignup(await bodyJSON(request)); }
    catch (error) { return json({ ok: false, message: error instanceof SyntaxError ? "Please check your registration and try again." : error.message }, 400); }
    try {
      const store = storeFor();
      const leadKey = `leads/${hash(lead.email)}`;
      const record = { ...lead, resource: RESOURCE, signupAt: new Date().toISOString(), consentVersion: "faith-boost-email-v1", consentText: "Yes, send me Faith Boost resources, encouragement, and important Lockliel updates by email. I can unsubscribe at any time." };
      const { modified } = await store.setJSON(leadKey, record, { onlyIfNew: true });
      // Acknowledgment and access require a real, durable record, including on duplicate requests.
      const saved = await store.get(leadKey, { type: "json", consistency: "strong" });
      if (!saved || saved.email !== lead.email) throw new Error("Lead storage not confirmed");
      const mirrorKey = `form-sync/${hash(lead.email)}`;
      const sync = await store.getWithMetadata(mirrorKey, { type: "json", consistency: "strong" });
      const canRetry = !sync || (!sync.data.sent && (!sync.data.pending || Date.now() - sync.data.startedAt > 60000));
      const claimed = canRetry && (await store.setJSON(mirrorKey, { sent: false, pending: true, startedAt: Date.now() }, sync ? { onlyIfMatch: sync.etag } : { onlyIfNew: true })).modified;
      if (claimed) {
        // Keep Netlify Forms as the familiar contact inbox, with a durable private backup above.
        const fields = new URLSearchParams({ "form-name": "lockliel-faith-boost-book", "first-name": saved.firstName, email: saved.email, phone: saved.phone, resource: RESOURCE, "signup-at": saved.signupAt, "email-consent": "yes", "sms-consent": "no", "email-verified": "no", ...saved.attribution });
        try {
          const response = await post("https://lockliel.com/__faith-boost-book.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: fields.toString(), signal: AbortSignal.timeout(10000) });
          if (!response.ok) throw new Error("Forms sync rejected");
          await store.setJSON(mirrorKey, { sent: true, at: new Date().toISOString() });
        } catch { await store.setJSON(mirrorKey, { sent: false, at: new Date().toISOString() }); }
      }
      const token = await issueSession(store, leadKey, lead.attribution);
      // The conversion is emitted by the server, after persistence. This is a valid signup,
      // not a claim that mailbox ownership or a social follow has been verified.
      try { await saveEvent(store, modified ? "optin_success" : "repeat_access", lead.attribution); } catch { /* An analytics outage must not lose the signup. */ }
      return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(token) });
    } catch { return json({ ok: false, message: "We couldn’t confirm your registration. Your details are still in the form. Please try again, or contact info@lockliel.com." }, 503); }
  };
}
export default createSignup();
export const config = { path: "/api/faith-boost/signup", rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] } };
