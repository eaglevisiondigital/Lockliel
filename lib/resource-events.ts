type Attribution = Record<string, string>;
const key = "lockliel-faith-boost-attribution";
let memory: Attribution | undefined;
const clean = (value: string | null) => value && /^[a-zA-Z0-9 _.,+:/-]{1,120}$/.test(value) ? value : "";
export function getResourceAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  if (memory) return memory;
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {};
  for (const name of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "source"]) { const value = clean(params.get(name)); if (value) current[name] = value; }
  if (Object.keys(current).length) { memory = current; }
  else { try { memory = JSON.parse(sessionStorage.getItem(key) || "{}"); } catch { memory = {}; } }
  if (!memory) memory = {};
  if (!memory.referrer) { try { memory.referrer = document.referrer ? new URL(document.referrer).hostname : "direct"; } catch { memory.referrer = "direct"; } }
  try { sessionStorage.setItem(key, JSON.stringify(memory)); } catch { /* Registration does not depend on browser storage. */ }
  return memory;
}
export function resourceEvent(event: string, detail: Record<string, string> = {}) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  void fetch("/api/faith-boost/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, attribution: getResourceAttribution(), ...detail }), keepalive: true }).catch(() => {});
}
