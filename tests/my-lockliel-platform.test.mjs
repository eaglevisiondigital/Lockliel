import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookie,
  json,
  parseCookies
} from "../netlify/lib/lockliel-core.mjs";

test("Lockliel auth cookies are HttpOnly and SameSite Lax",()=>{
  const value=cookie("lockliel_test","abc",3600);
  assert.match(value,/HttpOnly/);
  assert.match(value,/SameSite=Lax/);
  assert.match(value,/Path=\//);
});

test("Lockliel auth cookie names are isolated",()=>{
  assert.equal(ACCESS_COOKIE,"lockliel_access");
  assert.equal(REFRESH_COOKIE,"lockliel_refresh");
});

test("Lockliel API JSON responses disable caching",async()=>{
  const response=json({ok:true});
  assert.equal(response.headers.get("cache-control"),"no-store");
  assert.deepEqual(await response.json(),{ok:true});
});

test("cookie parser handles multiple Lockliel cookies",()=>{
  const request=new Request("https://lockliel.com/",{
    headers:{cookie:"lockliel_access=one; lockliel_refresh=two"}
  });
  const parsed=parseCookies(request);
  assert.equal(parsed.lockliel_access,"one");
  assert.equal(parsed.lockliel_refresh,"two");
});

test("My Lockliel is explicitly excluded from search indexing",()=>{
  const source=fs.readFileSync("app/my-lockliel/layout.tsx","utf8");
  assert.match(source,/index:\s*false/);
  assert.match(source,/follow:\s*false/);
  assert.match(source,/noarchive:\s*true/);
});

test("branded referral links route through the server tracker",()=>{
  const source=fs.readFileSync("netlify.toml","utf8");
  assert.match(source,/from = "\/r\/\*"/);
  assert.match(source,/lockliel-referral-redirect/);
});

test("partnership checkout requires both feature flag and active provider",()=>{
  const source=fs.readFileSync("netlify/functions/lockliel-partner.mjs","utf8");
  assert.match(source,/flagMap\.partner_checkout/);
  assert.match(source,/providers\.some\(p=>p\.status==="active"\)/);
});

test("signup confirmation returns to My Lockliel",()=>{
  const source=fs.readFileSync("netlify/functions/lockliel-signup.mjs","utf8");
  assert.match(source,/my-lockliel\/sign-in\?confirmed=1/);
  assert.match(source,/redirect_to=/);
});

test("private resource delivery checks member entitlement",()=>{
  const source=fs.readFileSync("netlify/functions/lockliel-resources.mjs","utf8");
  assert.match(source,/entitlements/);
  assert.match(source,/profile_id=eq/);
  assert.match(source,/storage\/v1\/object\/authenticated\/member-resources/);
});

test("lesson progress records covered media intervals",()=>{
  const source=fs.readFileSync("app/my-lockliel/journey/lesson/youtube-progress-player.tsx","utf8");
  assert.match(source,/coveredIntervals/);
  assert.match(source,/delta>0&&delta<15/);
  assert.match(source,/percentWatched/);
});


test("group leaders receive Leader Tools instead of broad Admin access",()=>{
  const source=fs.readFileSync("app/my-lockliel/dashboard-client.tsx","utf8");
  assert.match(source,/adminCapableRoles/);
  assert.match(source,/hasLeaderTools/);
  assert.match(source,/title:"Leader Tools"/);
  assert.match(source,/href:"\/my-lockliel\/leader"/);
});

test("Admin shell requires allowed role plus MFA security gate",()=>{
  const source=fs.readFileSync("app/my-lockliel/admin/admin-gate.tsx","utf8");
  const staffGate=fs.readFileSync("app/my-lockliel/staff-security-gate.tsx","utf8");
  assert.match(source,/ADMIN_ROLES/);
  assert.match(source,/discipleship_admin/);
  assert.match(source,/finance_admin/);
  assert.match(source,/StaffSecurityGate/);
  assert.match(staffGate,/hasVerifiedTotp/);
  assert.match(staffGate,/aal2/);
  assert.match(staffGate,/my-lockliel\/security/);
});


test("fulfillment staff stay out of broad Admin and use scoped tools",()=>{
  const dashboard=fs.readFileSync("app/my-lockliel/dashboard-client.tsx","utf8");
  const gate=fs.readFileSync("app/my-lockliel/admin/admin-gate.tsx","utf8");
  assert.match(dashboard,/fulfillment_admin/);
  assert.match(dashboard,/my-lockliel\/fulfillment/);
  assert.equal(gate.includes("fulfillment_admin"),false);
});


test("MFA server wrapper keeps factor verification behind HttpOnly session",()=>{
  const source=fs.readFileSync("netlify/functions/lockliel-mfa.mjs","utf8");
  assert.match(source,/requireSession/);
  assert.match(source,/\/auth\/v1/);
  assert.match(source,/challenge_id/);
  assert.match(source,/sessionCookies/);
  assert.match(source,/factor_type:"totp"/);
});

test("password login routes enrolled MFA accounts to challenge",()=>{
  const login=fs.readFileSync("netlify/functions/lockliel-login.mjs","utf8");
  const form=fs.readFileSync("app/my-lockliel/auth-form.tsx","utf8");
  assert.match(login,/requiresMfa/);
  assert.match(login,/hasVerifiedTotp/);
  assert.match(form,/my-lockliel\/security\?challenge=1/);
});
