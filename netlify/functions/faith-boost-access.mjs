import { getStore } from "@netlify/blobs";
import { json, sessionFor } from "../lib/faith-boost-core.mjs";
export default async request => {
  if (request.method !== "GET") return json({ ok: false }, 405);
  try {
    const store = getStore({ name: "faith-boost-resource", consistency: "strong" });
    const session = await sessionFor(request, store);
    if (!session) return json({ ok: false }, 401);
    const lead = await store.get(session.leadKey, { type: "json", consistency: "strong" });
    if (!lead) return json({ ok: false }, 401);
    return json({ ok: true });
  } catch { return json({ ok: false }, 503); }
};
export const config = { path: "/api/faith-boost/access" };
