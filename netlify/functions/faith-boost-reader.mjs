import { getStore } from "@netlify/blobs";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { headers, sessionFor } from "../lib/faith-boost-core.mjs";
const prefix = "/who-god-says-you-are/reader/";
const types = { "index.html": "text/html; charset=utf-8", "reader.css": "text/css; charset=utf-8", "reader.js": "text/javascript; charset=utf-8", "lockliel-mark.png": "image/png", "You_Are_Who_God_Says_You_Are_Lockliel.pdf": "application/pdf" };
export default async request => {
  if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers });
  const path = new URL(request.url).pathname;
  try {
    const session = await sessionFor(request, getStore({ name: "faith-boost-resource", consistency: "strong" }));
    if (!session) return new Response(null, { status: 303, headers: { ...headers, Location: "/who-god-says-you-are#get-the-book" } });
    if (path === prefix.slice(0,-1)) return new Response(null, { status: 308, headers: { ...headers, Location: prefix } });
    const name = path.startsWith(prefix) ? path.slice(prefix.length) || "index.html" : "";
    const isPage = /^pages\/page-(0[1-9]|10)\.jpg$/.test(name);
    if (!types[name] && !isPage) return new Response("Not found", { status: 404, headers });
    const file = join(process.cwd(), "resources/faith-boost-reader", name);
    const size = (await stat(file)).size;
    const extra = { "Content-Type": types[name] || "image/jpeg", "Content-Length": String(size), "Referrer-Policy": "strict-origin-when-cross-origin" };
    if (name.endsWith(".pdf")) extra["Content-Disposition"] = 'attachment; filename="You_Are_Who_God_Says_You_Are_Lockliel.pdf"';
    if (name === "index.html") extra["Content-Security-Policy"] = "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; object-src 'none'";
    return new Response(request.method === "HEAD" ? null : Readable.toWeb(createReadStream(file)), { headers: { ...headers, ...extra } });
  } catch { return new Response("The reader is temporarily unavailable. Please reload this page in a moment.", { status: 503, headers }); }
};
export const config = { path: ["/who-god-says-you-are/reader", "/who-god-says-you-are/reader/*"] };
