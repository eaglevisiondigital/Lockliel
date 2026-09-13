import { createHash, randomBytes, randomUUID } from "node:crypto";
export const RESOURCE = "You Are Who God Says You Are";
export const COOKIE = "__Host-lockliel-book";
export const MAX_AGE = 90 * 24 * 60 * 60;
export const hash = value => createHash("sha256").update(value).digest("hex");
export const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff" };
export const json = (data, status = 200, extra = {}) => Response.json(data, { status, headers: { ...headers, ...extra } });
export const cookieHeader = token => `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; Secure; HttpOnly; SameSite=Lax`;
export function allowedOrigin(request, context = {}) {
  const origin = request.headers.get("origin");
  const valid = new Set(["https://lockliel.com", "https://www.lockliel.com", "https://lockliel.netlify.app"]);
  for (const candidate of [context.site?.url, process.env.DEPLOY_PRIME_URL]) { try { if (candidate) valid.add(new URL(candidate).origin); } catch {} }
  // Deploy preview URLs are not always included in the function runtime's environment.
  // Accept only this site's preview host, and only for a same-origin request to it.
  const target = new URL(request.url);
  if (target.protocol === "https:" && /^deploy-preview-\d+--lockliel\.netlify\.app$/.test(target.hostname)) valid.add(target.origin);
  return !!origin && valid.has(origin);
}
export function attribution(input = {}) {
  const result = {};
  for (const name of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "source", "referrer"]) {
    const value = input?.[name];
    if (typeof value === "string" && /^[a-zA-Z0-9 _.,+:/-]{1,120}$/.test(value)) result[name] = value;
  }
  return result;
}
export async function bodyJSON(request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new Error("Please submit the registration form.");
  const body = await request.text();
  if (body.length > 8192) throw new Error("This request is too large.");
  return JSON.parse(body);
}
export function validateSignup(data) {
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  if (!firstName || firstName.length > 80 || /[<>\x00-\x1f]/.test(firstName)) throw new Error("Please enter your first name.");
  if (email.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)) throw new Error("Please enter a valid email address.");
  if (phone.length > 40 || (phone && !/^[+\d ()\-.]+$/.test(phone))) throw new Error("Please check your mobile number, or leave it blank.");
  if (data.emailConsent !== true) throw new Error("Please confirm that you’d like Faith Boost resources and Lockliel updates.");
  if (data.botField) throw new Error("We couldn’t accept this registration. Please try again.");
  return { firstName, email, phone, emailConsent: true, smsConsent: false, emailVerified: false, attribution: attribution(data.attribution) };
}
export async function sessionFor(request, store) {
  const match = (request.headers.get("cookie") || "").split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE}=`));
  const token = match?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await store.get(`sessions/${hash(token)}`, { type: "json", consistency: "strong" });
  if (!session || session.expiresAt <= Date.now()) return null;
  return session;
}
export async function issueSession(store, leadKey, source) {
  const token = randomBytes(32).toString("hex");
  const session = { leadKey, attribution: source, createdAt: new Date().toISOString(), expiresAt: Date.now() + MAX_AGE * 1000 };
  const key = `sessions/${hash(token)}`;
  await store.setJSON(key, session);
  const saved = await store.get(key, { type: "json", consistency: "strong" });
  if (!saved || saved.leadKey !== leadKey) throw new Error("Access could not be confirmed");
  return token;
}
export async function saveEvent(store, event, source = {}, extra = {}) {
  const timestamp = new Date().toISOString();
  await store.setJSON(`events/${timestamp.slice(0,10)}/${randomUUID()}`, { event, timestamp, resource: RESOURCE, attribution: attribution(source), ...extra });
}
