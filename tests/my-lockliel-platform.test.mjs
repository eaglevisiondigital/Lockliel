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

test("partnership checkout requires feature flag plus fully verified provider path",()=>{
  const source=fs.readFileSync("netlify/functions/lockliel-partner.mjs","utf8");
  assert.match(source,/flagMap\.partner_checkout/);
  assert.match(source,/checkout_adapter_ready===true/);
  assert.match(source,/webhook_ready===true/);
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


test("staff MFA flow supports recovery codes without storing plaintext codes",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-mfa.mjs","utf8");
  const ui=fs.readFileSync("app/my-lockliel/security/security-client.tsx","utf8");
  assert.match(api,/factors\/recovery-codes\/verify/);
  assert.match(api,/generateRecoveryCodes/);
  assert.match(api,/regenerateRecoveryCodes/);
  assert.match(ui,/newRecoveryCodes/);
  assert.match(ui,/shown only now/i);
});

test("privileged workspaces route through MFA security gate",()=>{
  const admin=fs.readFileSync("app/my-lockliel/admin/admin-gate.tsx","utf8");
  const fulfillment=fs.readFileSync("app/my-lockliel/fulfillment/page.tsx","utf8");
  const gate=fs.readFileSync("app/my-lockliel/staff-security-gate.tsx","utf8");
  assert.match(admin,/StaffSecurityGate/);
  assert.match(fulfillment,/StaffSecurityGate/);
  assert.match(gate,/aal2/);
  assert.match(gate,/hasVerifiedTotp/);
});


test("every Lockliel Admin API requires MFA",()=>{
  const adminFiles=fs.readdirSync("netlify/functions")
    .filter(name=>name.startsWith("lockliel-admin")&&name.endsWith(".mjs"));
  assert.ok(adminFiles.length>=10);
  for(const name of adminFiles){
    const source=fs.readFileSync("netlify/functions/"+name,"utf8");
    assert.match(source,/mfa_required/,name+" must return an MFA-required response");
    assert.match(source,/sessionAal/,name+" must check the session assurance level");
  }
});

test("the entire Admin route tree is behind the staff security gate",()=>{
  const layout=fs.readFileSync("app/my-lockliel/admin/layout.tsx","utf8");
  const gate=fs.readFileSync("app/my-lockliel/staff-security-gate.tsx","utf8");
  assert.match(layout,/AdminGate/);
  assert.match(gate,/mfa\.hasVerifiedTotp/);
  assert.match(gate,/mfa\.aal!==["']aal2["']/);
  assert.match(gate,/my-lockliel\/security/);
});

test("password sign in routes enrolled MFA users through challenge",()=>{
  const login=fs.readFileSync("netlify/functions/lockliel-login.mjs","utf8");
  const form=fs.readFileSync("app/my-lockliel/auth-form.tsx","utf8");
  assert.match(login,/requiresMfa/);
  assert.match(login,/hasVerifiedTotp/);
  assert.match(form,/requiresMfa/);
  assert.match(form,/my-lockliel\/security\?challenge=1/);
});

test("MFA verification replaces HttpOnly session cookies with aal2 tokens",()=>{
  const mfa=fs.readFileSync("netlify/functions/lockliel-mfa.mjs","utf8");
  assert.match(mfa,/\/factors\/.*\/challenge/);
  assert.match(mfa,/\/factors\/.*\/verify/);
  assert.match(mfa,/sessionCookies\(verified\.data\)/);
});


test("privacy export requires a completed member-owned request",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-privacy-export.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/privacy/privacy-client.tsx","utf8");
  assert.match(endpoint,/requestId/);
  assert.match(endpoint,/request_type=eq\.data_export/);
  assert.match(endpoint,/status=eq\.completed/);
  assert.match(client,/completedExport/);
  assert.match(client,/privacy-export\?requestId=/);
});


test("member connection requests remain human-reviewed",()=>{
  const groupsApi=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");
  const connectionsApi=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const leaderAdmin=fs.readFileSync("app/my-lockliel/admin/leaders-admin-client.tsx","utf8");
  assert.match(groupsApi,/find_local_group/);
  assert.match(groupsApi,/explore_hosting/);
  assert.match(connectionsApi,/connect_with_leader/);
  assert.match(leaderAdmin,/Suggestions prioritize location and available capacity only/i);
  assert.match(leaderAdmin,/assignRequest/);
});

test("privacy center offers approved export without staff notes or secrets",()=>{
  const exportApi=fs.readFileSync("netlify/functions/lockliel-privacy-export.mjs","utf8");
  const privacyUi=fs.readFileSync("app/my-lockliel/privacy/privacy-client.tsx","utf8");
  assert.match(exportApi,/Private staff-only notes are not part/);
  assert.match(exportApi,/Security secrets/);
  assert.match(exportApi,/status=eq\.completed/);
  assert.match(privacyUi,/privacy-export/);
  assert.match(privacyUi,/Download approved export/);
});


test("partnership checkout requires verified adapter and webhook",()=>{
  const partner=fs.readFileSync("netlify/functions/lockliel-partner.mjs","utf8");
  const readiness=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");
  assert.match(partner,/checkout_adapter_ready===true/);
  assert.match(partner,/webhook_ready===true/);
  assert.match(partner,/flagMap\.partner_checkout/);
  assert.match(readiness,/checkout_adapter_ready===true/);
  assert.match(readiness,/webhook_ready===true/);
});

test("member partnership page does not expose provider diagnostics",()=>{
  const client=fs.readFileSync("app/my-lockliel/partner/partner-client.tsx","utf8");
  assert.doesNotMatch(client,/Payment gateway readiness/);
  assert.doesNotMatch(client,/data\.providers\.map/);
});


test("dashboard surfaces overdue My Five and host follow-through",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-dashboard-attention.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/dashboard-attention.tsx","utf8");
  assert.match(endpoint,/next_follow_up_at/);
  assert.match(endpoint,/group_weekly_checkins/);
  assert.match(endpoint,/my_five_due/);
  assert.match(endpoint,/group_checkin/);
  assert.match(client,/Needs your attention/);
  assert.match(client,/Simple next actions for this week/);
});
