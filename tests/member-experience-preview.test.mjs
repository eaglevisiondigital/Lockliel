import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { createRequire } from "node:module";

// Transpile the pure contract in memory. No generated repository files or live transport.
const root = new URL("../", import.meta.url);
const output = await build({
  entryPoints: [fileURLToPath(new URL("components/member-experience-preview/preview-model.ts", root))],
  bundle: true, write: false, platform: "node", format: "esm", logLevel: "silent",
});
const model = await import("data:text/javascript;base64," + Buffer.from(output.outputFiles[0].contents).toString("base64"));
const member = {
  fixtureKind: "synthetic", displayName: "Jordan Example", initials: "JE", locationLabel: "Sample City",
  email: "must-not-project", phone: "must-not-project", privatePrayer: "must-not-project",
  assessment: "must-not-project", giving: "must-not-project", notes: "must-not-project",
  role: "super_admin", profileId: "must-not-project",
};
const banner = model.FAITH_BANNER_OPTIONS[0];

test("all optional presentation fields start private", () => {
  assert.deepEqual(model.PRIVATE_VISIBILITY, { photo: "private", location: "private", faithBanner: "private" });
  assert.ok(Object.isFrozen(model.PRIVATE_VISIBILITY));
});

test("owner projection can show private optional fields without mutating choices", () => {
  const card = model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "self", banner);
  assert.equal(card.locationLabel, "Sample City");
  assert.equal(card.faithBanner, banner);
  assert.equal(card.showPhotoPlaceholder, true);
  assert.equal(model.PRIVATE_VISIBILITY.location, "private");
});

test("connection projection excludes every optional field until explicitly selected", () => {
  const card = model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "approved-connection", banner);
  assert.equal(card.locationLabel, null);
  assert.equal(card.faithBanner, null);
  assert.equal(card.showPhotoPlaceholder, false);
});

test("visibility is independent for each field and does not silently broaden other fields", () => {
  const card = model.projectMemberCard(member, { ...model.PRIVATE_VISIBILITY, faithBanner: "approved-connections" }, "approved-connection", banner);
  assert.equal(card.faithBanner, banner);
  assert.equal(card.locationLabel, null);
  assert.equal(card.showPhotoPlaceholder, false);
});

test("private prayer, assessment, finance, contact, role and identity fields never project", () => {
  const choices = { photo: "approved-connections", location: "approved-connections", faithBanner: "approved-connections" };
  for (const audience of ["self", "approved-connection"]) {
    const card = model.projectMemberCard(member, choices, audience, banner);
    assert.deepEqual(Object.keys(card).sort(), ["displayName", "faithBanner", "initials", "locationLabel", "photo", "showPhotoPlaceholder"]);
    assert.ok(!JSON.stringify(card).includes("must-not-project"));
    assert.ok(!JSON.stringify(card).includes("super_admin"));
  }
});

test("public and unrecognized audiences receive no profile projection", () => {
  for (const audience of ["public", "staff", "inviter", "super_admin", "", null]) {
    assert.equal(model.projectMemberCard(member, model.PRIVATE_VISIBILITY, audience, banner), null);
  }
});

test("the design contract rejects non-synthetic fixture labels", () => {
  assert.equal(model.projectMemberCard({ ...member, fixtureKind: "live" }, model.PRIVATE_VISIBILITY, "self", banner), null);
});

test("no banner and unrecognized banner content remain absent", () => {
  for (const message of [null, "", "must-not-project"]) {
    assert.equal(model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "self", message).faithBanner, null);
  }
});

test("non-owner banner copy distinguishes unshared from owner no-selection without disclosing existence", () => {
  const hidden = model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "approved-connection", banner);
  const absent = model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "approved-connection", null);
  assert.equal(hidden.faithBanner, absent.faithBanner);
  assert.equal(model.faithBannerEmptyMessage("approved-connection"), "No Faith Banner is shared in this preview.");
  assert.equal(model.faithBannerEmptyMessage("self"), "No Faith Banner selected. You can leave this space empty.");
  assert.doesNotMatch(model.faithBannerEmptyMessage("approved-connection"), /selected|private banner exists/i);
});

test("request, confirmation and session states make distinct truthful claims", () => {
  assert.match(model.signupPresentation("request-received").description, /not a confirmed account or a signed-in session/);
  assert.match(model.signupPresentation("confirmation-needed").description, /does not prove the message arrived/);
  assert.match(model.signupPresentation("confirmation-needed").description, /not signed in/);
  assert.match(model.signupPresentation("confirmed").description, /Sign in to start a session/);
  assert.match(model.signupPresentation("confirmed").description, /does not grant a staff or leadership role/);
  assert.match(model.signupPresentation("signed-in").description, /No new role or course access is granted/);
});

test("denied and unavailable responses never become empty-account or fabricated-progress claims", () => {
  assert.match(model.VIEW_STATES.error.description, /not an empty account/);
  assert.match(model.VIEW_STATES.denied.description, /does not grant access/);
  assert.match(model.VIEW_STATES.empty.description, /without inventing course access or progress/);
});

test("owned visual source has no live transport, file upload or browser persistence capability", async () => {
  const folder = "components/member-experience-preview/";
  const names = (await readdir(new URL(folder, root))).filter(name => /\.(?:ts|tsx|css)$/.test(name));
  const sources = await Promise.all(names.map(name => readFile(new URL(folder + name, root), "utf8")));
  for (const source of sources) {
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\s*[.(]/);
    assert.doesNotMatch(source, /type=["']file["']|https?:\/\//);
    assert.doesNotMatch(source, /[\u2014]/);
  }
});

// Wave 2 exercises actual server-rendered React semantics without opening a browser.
const reactSource = await build({
  stdin: {
    contents: `import React from "react"; import {renderToStaticMarkup} from "react-dom/server";
      import * as components from "./components/member-experience-preview/member-components.tsx";
      import Preview from "./components/member-experience-preview/member-experience-preview.tsx";
      import {MemberExperienceWorkspace} from "./components/member-experience-preview/member-experience-workspace.tsx";
      import * as contract from "./components/member-experience-preview/member-display-contract.ts";
      export {React, renderToStaticMarkup, components, Preview, MemberExperienceWorkspace, contract};`,
    resolveDir: fileURLToPath(root), loader: "js",
  },
  bundle: true, write: false, platform: "node", format: "cjs", jsx: "automatic", logLevel: "silent",
  external: ["react", "react-dom/server", "react/jsx-runtime"],
  plugins: [{ name: "synthetic-css-module", setup(builder) {
    builder.onLoad({ filter: /\.module\.css$/ }, () => ({
      contents: "export default new Proxy({}, {get: (_, key) => String(key)});", loader: "js",
    }));
  } }],
});
const syntheticModule = { exports: {} };
// The executable text is built solely from owned local source, never member input.
new Function("require", "module", "exports", reactSource.outputFiles[0].text)(
  createRequire(new URL("../package.json", import.meta.url)), syntheticModule, syntheticModule.exports,
);
const { React, renderToStaticMarkup, components, Preview, MemberExperienceWorkspace, contract } = syntheticModule.exports;
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));

test("photo removal, restoration and failure reset photo visibility to private", () => {
  for (const state of ["initials", "removed", "unavailable"]) {
    assert.deepEqual(model.changePhotoPreview(state), { photoState: state, visibility: "private" });
  }
  assert.deepEqual(model.changePhotoPreview("forged-state"), { photoState: "removed", visibility: "private" });
});

test("private photo lifecycle never reveals removed or unavailable state to a connection", () => {
  const results = ["initials", "removed", "unavailable"].map(state =>
    model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "approved-connection", banner, state).photo,
  );
  assert.deepEqual(results[0], results[1]);
  assert.deepEqual(results[1], results[2]);
  assert.deepEqual(results[0], { kind: "not-shared", label: "No photo shared in this preview" });
});

test("explicitly shared initials do not expose missing-photo reasons", () => {
  const choices = { ...model.PRIVATE_VISIBILITY, photo: "approved-connections" };
  assert.equal(model.projectMemberCard(member, choices, "approved-connection", banner, "initials").photo.kind, "initials");
  for (const state of ["removed", "unavailable"]) {
    const card = model.projectMemberCard(member, choices, "approved-connection", banner, state);
    assert.equal(card.showPhotoPlaceholder, false);
    assert.deepEqual(card.photo, { kind: "not-shared", label: "No photo shared in this preview" });
  }
});

test("owner photo descriptions are truthful without creating an image or upload", () => {
  assert.equal(model.photoPresentation("removed", "private", "self").label, "No photo placeholder selected");
  assert.equal(model.photoPresentation("unavailable", "private", "self").label, "Photo placeholder unavailable");
});

test("reusable native controls connect visible labels and both help descriptions", () => {
  const html = render(components.PreviewSelect, {
    id: "test-audience", label: "Preview audience", description: "Nothing is shared.",
    "aria-describedby": "group-help", value: "self", onChange() {},
    children: React.createElement("option", { value: "self" }, "Only me"),
  });
  assert.match(html, /<label[^>]*for="test-audience"/);
  assert.match(html, /aria-describedby="group-help test-audience-help"/);
  assert.match(html, /id="test-audience-help">Nothing is shared/);
});

test("actual member card exposes a labelled image role and hides decorative glyph text", () => {
  const card = model.projectMemberCard(member, model.PRIVATE_VISIBILITY, "self", banner);
  const html = render(components.MemberCard, { card, audience: "self" });
  assert.match(html, /role="img" aria-label="Synthetic photo placeholder, initials only"/);
  assert.match(html, /aria-hidden="true">JE/);
});

test("actual next-step section has a heading name and truthful busy state", () => {
  const html = render(components.NextStepCard, { id: "test-next", state: "loading", onTryAgain() {}, onPreviewAction() {} });
  assert.match(html, /aria-labelledby="test-next-heading"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /<h2 id="test-next-heading">Loading your next step/);
  const ready = render(components.NextStepCard, { id: "test-next", state: "ready", onTryAgain() {}, onPreviewAction() {} });
  assert.match(ready, /aria-busy="false"/);
});

test("initial actual React markup has unique IDs, labels and valid description targets", () => {
  const html = render(Preview, {});
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, "duplicate IDs would break labels or focus targets");
  const selects = [...html.matchAll(/<select\b[^>]*>/g)].map(match => match[0]);
  assert.ok(selects.length >= 8);
  for (const tag of selects) {
    const id = tag.match(/\sid="([^"]+)"/)?.[1];
    assert.ok(id);
    assert.ok(html.includes(`for="${id}"`));
    const references = tag.match(/aria-describedby="([^"]+)"/)?.[1].split(" ") || [];
    assert.ok(references.length > 0, `${id} is missing programmatic help`);
    for (const reference of references) assert.ok(ids.includes(reference), `missing description ${reference}`);
  }
  assert.match(html, /id="prototype-notice" role="status" aria-live="polite" aria-atomic="true"/);
  assert.doesNotMatch(html, /type="file"/);
  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(match => match[0]);
  assert.ok(buttons.length > 0);
  for (const button of buttons) assert.match(button, /type="button"/);

});

// Numeric color checks supplement, rather than replace, rendered visual review.
function rgb(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map(c => c + c).join("") : value;
  return [0, 2, 4].map(index => Number.parseInt(full.slice(index, index + 2), 16));
}
function luminance(color) {
  return rgb(color).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}
function contrast(foreground, background) {
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}
const css = await readFile(new URL("components/member-experience-preview/member-experience-preview.module.css", root), "utf8");
const colorPairs = [
  ["main text", "#f7f9ff", "#07101f", 4.5],
  ["prototype notice", "#bdc8da", "#101e35", 4.5],
  ["panel secondary text", "#aebbd0", "#15233c", 4.5],
  ["panel eyebrow", "#a9c1ff", "#15233c", 4.5],
  ["native control text", "#eef3ff", "#091426", 4.5],
  ["primary button", "#0b2d68", "#fff", 4.5],
  ["photo initials", "#c8d9ff", "#1a2e50", 4.5],
  ["unshared placeholder", "#aebbd0", "#142137", 4.5],
  ["signup status glyph", "#c8f2dc", "#183a2e", 4.5],
  ["native control boundary", "#657b9d", "#091426", 3],
  ["focus outline", "#b8ceff", "#15233c", 3],
];

test("contrast math uses known reference values without rounding thresholds", () => {
  assert.equal(contrast("#000", "#fff"), 21);
  assert.equal(contrast("#fff", "#fff"), 1);
});

function colorOccursInCSS(color) {
  const compact = css.toLowerCase().replace(/\s/g, "");
  return compact.includes(color) || compact.includes(`rgba(${rgb(color).join(",")},`);
}

test("eleven reviewed CSS color pairs meet their text or control threshold", () => {
  for (const [label, foreground, background, threshold] of colorPairs) {
    assert.ok(colorOccursInCSS(foreground), `${label} foreground is not from the actual stylesheet`);
    assert.ok(colorOccursInCSS(background), `${label} background is not from the actual stylesheet`);
    const ratio = contrast(foreground, background);
    assert.ok(ratio >= threshold, `${label}: ${ratio} is below ${threshold}`);
  }
});

test("banner text clears a conservative upper bound for its actual gradient", () => {
  assert.match(css, /rgba\(77,120,255,\.18\)/);
  // Upper-channel bound: 18% blue over the existing #14243f base, rounded brighter.
  const brighterBound = "#1f3462";
  assert.ok(contrast("#bdc8da", brighterBound) >= 4.5);
  assert.ok(contrast("#f7f9ff", brighterBound) >= 4.5);
});


const displayModel = {
  member: { displayName: "Outside Fixture", initials: "OF", locationLabel: "Sample City", faithBanner: model.FAITH_BANNER_OPTIONS[1],
    email: "must-not-project", privatePrayer: "must-not-project", giving: "must-not-project", role: "super_admin", photoUrl: "must-not-project" },
  nextStep: { status: "ready", title: "A supplied heading", description: "A supplied description", actionLabel: "Review supplied step",
    grade: "must-not-project", privateReason: "must-not-project", href: "must-not-project" },
  accessToken: "must-not-project",
};
const identity = { status: "synthetic-owner", boundaryKey: "member-review-a" };
const workspaceProps = { identity, displayModel, resetKey: "revision-a" };

test("external display contract rebuilds a strict member/next-step allowlist", () => {
  const safe = contract.normalizeMemberWorkspaceDisplay(displayModel);
  assert.deepEqual(Object.keys(safe).sort(), ["member", "nextStep"]);
  assert.deepEqual(Object.keys(safe.member).sort(), ["displayName", "faithBanner", "initials", "locationLabel"]);
  assert.deepEqual(Object.keys(safe.nextStep).sort(), ["actionLabel", "description", "status", "title"]);
  assert.doesNotMatch(JSON.stringify(safe), /must-not-project|super_admin/);
});

test("minimal valid member model keeps optional private fields absent", () => {
  const safe = contract.normalizeMemberWorkspaceDisplay({ member: { displayName: "Minimal Example" }, nextStep: { status: "loading" } });
  assert.deepEqual(safe.member, { displayName: "Minimal Example", faithBanner: null });
  const html = render(MemberExperienceWorkspace, { ...workspaceProps, displayModel: safe });
  assert.match(html, /value="private" selected/);
  assert.doesNotMatch(html, /Photo placeholder, initials only/);
});

test("malformed, overlong and unknown display inputs fail closed", () => {
  for (const input of [null, [], {}, { ...displayModel, member: { displayName: "" } },
    { ...displayModel, member: { displayName: "X".repeat(81) } },
    { ...displayModel, nextStep: { status: "unexpected" } },
    { ...displayModel, nextStep: { status: "ready", title: "Title", description: "", actionLabel: "Go" } }]) {
    assert.equal(contract.normalizeMemberWorkspaceDisplay(input), null);
    const html = render(MemberExperienceWorkspace, { ...workspaceProps, displayModel: input });
    assert.match(html, /Member information unavailable/);
    assert.doesNotMatch(html, /Outside Fixture|must-not-project|<button|<select/);
  }
});

test("unknown review identity does not even inspect the supplied member model", () => {
  const inaccessible = new Proxy({}, { get() { throw Error("model must not be inspected"); } });
  for (const identityInput of [{ status: "unknown" }, undefined, { status: "synthetic-owner", boundaryKey: "" },
    { status: "synthetic-owner", boundaryKey: "contains spaces" }, { status: "staff", boundaryKey: "member-review-a" }]) {
    const html = render(MemberExperienceWorkspace, { ...workspaceProps, identity: identityInput, displayModel: inaccessible });
    assert.match(html, /Member review unavailable/);
    assert.doesNotMatch(html, /<button|<select|Outside Fixture/);
  }
});

test("headless workspace renders external display text without adding an application shell", () => {
  const html = render(MemberExperienceWorkspace, workspaceProps);
  assert.match(html, /Outside Fixture/);
  assert.match(html, /A supplied heading/);
  assert.match(html, /A supplied description/);
  assert.doesNotMatch(html, /<header|<main|<nav|<footer|must-not-project|super_admin/);
});

test("external plain text is React-escaped, never interpreted as HTML", () => {
  const unsafe = { ...displayModel, member: { displayName: "<img src=x>" },
    nextStep: { status: "ready", title: "<script>bad</script>", description: "Plain text", actionLabel: "Review" } };
  const html = render(MemberExperienceWorkspace, { ...workspaceProps, displayModel: unsafe });
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>bad|<img src=x/);
});

test("workspace emits no action during render and disables host actions without callbacks", () => {
  let calls = 0;
  render(MemberExperienceWorkspace, { ...workspaceProps, onIntent() { calls++; } });
  assert.equal(calls, 0);
  const html = render(MemberExperienceWorkspace, workspaceProps);
  assert.match(html, /disabled="">Review supplied step/);
  assert.match(html, /disabled="">Review profile and privacy/);
});

test("callback intents contain only allowlisted kind and synthetic boundary metadata", () => {
  const seen = [];
  for (const kind of ["member:continue", "member:review-profile", "member:retry"]) {
    assert.equal(contract.emitMemberIntent({ ...identity, privatePrayer: "must-not-project" }, kind, intent => seen.push(intent)), true);
  }
  for (const intent of seen) {
    assert.deepEqual(Object.keys(intent).sort(), ["boundaryKey", "kind"]);
    assert.equal(intent.boundaryKey, "member-review-a");
    assert.ok(Object.isFrozen(intent));
    assert.doesNotMatch(JSON.stringify(intent), /must-not-project/);
  }
});

test("invalid identity, invented intents and missing/failing callbacks produce no success claim", () => {
  let calls = 0;
  assert.equal(contract.emitMemberIntent({ status: "unknown" }, "member:continue", () => calls++), false);
  assert.equal(contract.emitMemberIntent(identity, "grant-role", () => calls++), false);
  assert.equal(contract.emitMemberIntent(identity, "member:continue"), false);
  assert.equal(contract.emitMemberIntent(identity, "member:continue", () => { throw Error("host unavailable"); }), false);
  assert.equal(calls, 0);
});

test("multiple workspaces generate distinct default IDs and accept explicit host prefixes", () => {
  const multiple = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(MemberExperienceWorkspace, workspaceProps),
    React.createElement(MemberExperienceWorkspace, { ...workspaceProps, identity: { status: "synthetic-owner", boundaryKey: "member-review-b" } }),
  ));
  const ids = [...multiple.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  const prefixed = render(MemberExperienceWorkspace, { ...workspaceProps, idPrefix: "host-member" });
  assert.match(prefixed, /id="host-member-profile"/);
  assert.match(prefixed, /id="host-member-photo-state"/);
});

test("all next-step availability states remain distinct with external models", () => {
  for (const status of ["loading", "empty", "denied", "error"]) {
    const html = render(MemberExperienceWorkspace, { ...workspaceProps, displayModel: { ...displayModel, nextStep: { status } } });
    assert.doesNotMatch(html, /A supplied heading|must-not-project/);
    assert.match(html, new RegExp(`aria-busy="${status === "loading"}"`));
  }
  const omittedReset = render(MemberExperienceWorkspace, { ...workspaceProps, resetKey: undefined });
  assert.match(omittedReset, /Member information unavailable/);
});


test("runtime object coercion cannot turn private objects into valid state or intent metadata", () => {
  const forgedState = { toString() { return "error"; }, privatePrayer: "must-not-project" };
  assert.equal(contract.normalizeMemberWorkspaceDisplay({ ...displayModel, nextStep: { status: forgedState } }), null);
  let calls = 0;
  const forgedKind = { toString() { return "member:continue"; }, privatePrayer: "must-not-project" };
  assert.equal(contract.emitMemberIntent(identity, forgedKind, () => calls++), false);
  assert.equal(calls, 0);
  const malformedHandler = render(MemberExperienceWorkspace, { ...workspaceProps, onIntent: "not-a-function" });
  assert.match(malformedHandler, /disabled="">Review supplied step/);
  assert.match(malformedHandler, /disabled="">Review profile and privacy/);
});
