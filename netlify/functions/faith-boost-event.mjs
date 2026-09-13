import { getStore } from "@netlify/blobs";
import { allowedOrigin, attribution, bodyJSON, json, saveEvent, sessionFor } from "../lib/faith-boost-core.mjs";
const publicEvents = new Set(["landing_visit", "form_start"]);
const readerEvents = new Set(["read_online_click", "pdf_download_click", "reader_open", "reader_final_page", "faith_boost_click", "founders_50_click", "partnership_click", "share_completed", "share_link_copied", "social_follow_click"]);
export default async (request, context) => {
  if (request.method !== "POST" || !allowedOrigin(request, context)) return json({ ok: false }, 403);
  try {
    const data = await bodyJSON(request);
    if (!publicEvents.has(data.event) && !readerEvents.has(data.event)) return json({ ok: false }, 400);
    const store = getStore({ name: "faith-boost-resource", consistency: "strong" });
    let source = attribution(data.attribution);
    if (readerEvents.has(data.event)) { const session = await sessionFor(request, store); if (!session) return json({ ok: false }, 401); source = session.attribution; }
    const extra = ["youtube", "facebook", "rumble"].includes(data.platform) ? { platform: data.platform } : {};
    await saveEvent(store, data.event, source, extra);
    return json({ ok: true });
  } catch { return json({ ok: false }, 503); }
};
export const config = { path: "/api/faith-boost/event", rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] } };
