import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = async file => readFile(new URL(file, root), "utf8");
const withoutScripts = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
const fieldNames = html => new Set([...html.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"[^>]*>/g)].map(match => match[1]));

test("Founders 50 form fields match the Netlify detection form", async () => {
  const html = withoutScripts(await read("out/founders-50.html"));
  const form = html.match(/<form\b[^>]*name="lockliel-founders-50"[\s\S]*?<\/form>/)?.[0];
  assert.ok(form, "The application must be included in the exported page");
  const expected = ["form-name", "bot-field", "first-name", "last-name", "email", "mobile-phone", "city", "state", "church-affiliation", "gathering-place", "invite-count", "why-interested", "what-excites-you", "share-with-five", "gather-weekly", "training-willingness"].sort();
  assert.deepEqual([...fieldNames(form)].sort(), expected);
  assert.deepEqual([...fieldNames(await read("out/__founders50.html"))].sort(), expected);
  assert.match(form, /method="POST"/);
  assert.match(form, /action="\/founders-50\/thank-you"/);
  assert.match(form, /data-netlify="true"/);
  assert.match(form, /data-netlify-honeypot="bot-field"/);
  const church = form.match(/<input\b[^>]*name="church-affiliation"[^>]*>/)?.[0];
  assert.ok(church);
  assert.doesNotMatch(church, /\brequired\b/);
});

test("Founders 50 assets and local links resolve in the static export", async () => {
  const html = withoutScripts(await read("out/founders-50.html"));
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const targets = [...html.matchAll(/\bhref="#([^"]+)"/g)].map(match => match[1]);
  for (const target of targets) assert.ok(ids.has(target), `Missing anchor #${target}`);
  const images = new Set([...html.matchAll(/<img\b[^>]*\bsrc="(\/[^"?]+)"/g)].map(match => match[1]));
  assert.ok(images.size >= 4);
  for (const image of images) await access(new URL(`out${image}`, root));
  await access(new URL("out/founders-50/thank-you.html", root));
});

test("Homepage and Faith Boost invite visitors into the recruitment page", async () => {
  const html = withoutScripts(await read("out/index.html"));
  const links = [...html.matchAll(/href="\/founders-50"/g)];
  assert.ok(links.length >= 4, "Navigation, homepage, Faith Boost, and footer must lead to the page");
  assert.match(html, /What if God wants to use your living room/);
  assert.match(html, /Become a founding host/);
});

test("The thank-you state confirms interest and explains the review", async () => {
  const html = withoutScripts(await read("out/founders-50/thank-you.html"));
  assert.match(html, /Thank you for/);
  assert.match(html, /raising your hand/);
  assert.match(html, /Founder acceptance follows our team/);
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /You are (?:now )?an approved Founder/i);
});
