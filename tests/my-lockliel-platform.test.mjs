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

test("partnership checkout uses sanitized verified checkout state",()=>{
  const source=fs.readFileSync("netlify/functions/lockliel-partner.mjs","utf8");
  const migration=fs.readFileSync("supabase/migrations/20260925131510_lockliel_harden_release_control_surface.sql","utf8");

  assert.match(source,/partner_checkout_state\?select=checkout_ready,supports_one_time,supports_recurring/);
  assert.match(source,/checkoutReady:Boolean\(checkoutState\?\.checkout_ready\)/);
  assert.doesNotMatch(source,/payment_provider_connections/);
  assert.match(migration,/p\.status='active'/);
  assert.match(migration,/p\.checkout_adapter_ready=true/);
  assert.match(migration,/p\.webhook_ready=true/);
  assert.match(migration,/flag_enabled and selected_provider is not null/);
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
  assert.match(leaderAdmin,/location, language, and available capacity as practical signals only/i);
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
  const migration=fs.readFileSync("supabase/migrations/20260925131510_lockliel_harden_release_control_surface.sql","utf8");

  assert.match(partner,/partner_checkout_state/);
  assert.match(partner,/checkoutReady:Boolean\(checkoutState\?\.checkout_ready\)/);
  assert.doesNotMatch(partner,/payment_provider_connections/);
  assert.doesNotMatch(partner,/webhook_ready/);
  assert.doesNotMatch(partner,/verification_note/);
  assert.match(readiness,/checkout_adapter_ready===true/);
  assert.match(readiness,/webhook_ready===true/);
  assert.match(migration,/p\.checkout_adapter_ready=true/);
  assert.match(migration,/p\.webhook_ready=true/);
  assert.match(migration,/f\.key='partner_checkout'/);
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


test("new-member onboarding flows profile to faith journey to course without trapping established members",()=>{
  const profile=fs.readFileSync("app/my-lockliel/profile/profile-form.tsx","utf8");
  const faith=fs.readFileSync("app/my-lockliel/faith-profile/faith-profile-form.tsx","utf8");
  assert.match(profile,/onboarding_status===\"active\"\?\"\/my-lockliel\":\"\/my-lockliel\/faith-profile\"/);
  assert.match(faith,/router\.push\(existing\?\"\/my-lockliel\":\"\/my-lockliel\/journey\"\)/);
});


test("digital book download requires release flag and active product",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-resources.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/resources/resources-client.tsx","utf8");
  assert.match(endpoint,/digital_book_delivery/);
  assert.match(endpoint,/product\.status!==["']active["']/);
  assert.match(endpoint,/Digital book delivery is not live yet/);
  assert.match(client,/deliveryAvailable/);
  assert.match(client,/Not released yet/);
});


test("gift acknowledgment avoids unverified tax claims",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-gift-acknowledgment.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/partner/acknowledgment/gift-acknowledgment-client.tsx","utf8");
  assert.match(api,/status=in\.\(succeeded,paid,completed\)/);
  assert.match(client,/does not make a statement about tax deductibility/i);
  assert.doesNotMatch(client,/tax-deductible contribution/i);
});


test("account deletion completion requires documented processing",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-admin-privacy.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/privacy-admin-client.tsx","utf8");
  assert.match(api,/request_type==="account_deletion"/);
  assert.match(api,/adminNote\.length<20/);
  assert.match(client,/Mark processed/);
  assert.match(client,/Processing note/);
  assert.match(client,/note\.trim\(\)\.length<20/);
});


test("global readiness captures locale and falls back to English",()=>{
  const profile=fs.readFileSync("app/my-lockliel/profile/profile-form.tsx","utf8");
  const share=fs.readFileSync("netlify/functions/lockliel-share-library.mjs","utf8");
  assert.match(profile,/navigator\.language/);
  assert.match(profile,/resolvedOptions\(\)\.timeZone/);
  assert.match(share,/preferred==="en"\?"en":preferred\+",en"/);
  assert.match(share,/preferredVariant/);
  assert.match(share,/language_code/);
});

test("leader matching uses language only as a human-reviewed signal",()=>{
  const leaders=fs.readFileSync("app/my-lockliel/admin/leaders-admin-client.tsx","utf8");
  const groups=fs.readFileSync("app/my-lockliel/admin/groups-admin-client.tsx","utf8");
  assert.match(leaders,/language_code/);
  assert.match(leaders,/A Lockliel reviewer makes the final assignment/);
  assert.match(groups,/suggestedGroups/);
  assert.match(groups,/language_code/);
});


test("faith profile remains editable after onboarding",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-faith-profile.mjs","utf8");
  const form=fs.readFileSync("app/my-lockliel/faith-profile/faith-profile-form.tsx","utf8");
  const profilePage=fs.readFileSync("app/my-lockliel/profile/page.tsx","utf8");
  assert.match(api,/request\.method===\"GET\"/);
  assert.match(form,/setExisting\(true\)/);
  assert.match(form,/Save changes/);
  assert.match(profilePage,/Faith & connection preferences/);
});


test("Founders 50 review history stays human-reviewed and MFA-gated",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-admin-founder-reviews.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/founder-review-admin-client.tsx","utf8");
  assert.match(endpoint,/mfa_required/);
  assert.match(endpoint,/founders50_reviews/);
  assert.match(endpoint,/decision/);
  assert.match(endpoint,/rationale/);
  assert.match(client,/Human review/);
  assert.match(client,/not converted into an automated spiritual score/i);
});


test("My Five detail edits remain owner-scoped and private",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/connections/connections-client.tsx","utf8");
  assert.match(api,/b\.action==="updateReachDetails"/);
  assert.match(api,/reach_contacts\?id=eq\..*owner_id=eq\./s);
  assert.match(api,/private_notes:privateNotes/);
  assert.match(client,/Edit details & follow-up/);
  assert.match(client,/Only you can see this note/);
});


test("My Five share attribution stays private and preserves inviter lineage",()=>{
  const shareApi=fs.readFileSync("netlify/functions/lockliel-share-link.mjs","utf8");
  const shareUi=fs.readFileSync("app/my-lockliel/share/share-client.tsx","utf8");
  const migration=fs.readFileSync("supabase/migrations/20260925045124_lockliel_my_five_share_attribution.sql","utf8");
  assert.match(shareApi,/reach_contact_id/);
  assert.match(shareApi,/owner_id=eq\./);
  assert.match(shareApi,/share-center-my-five/);
  assert.match(shareUi,/selectedReachId/);
  assert.match(shareUi,/Their name is never placed in the public link/);
  assert.match(shareUi,/markSelectedShared/);
  assert.match(migration,/foreign key \(reach_contact_id, owner_id\)/);
  assert.match(migration,/original_inviter_id/);
  assert.match(migration,/linked_profile_id = new\.id/);
  assert.match(migration,/when status in \('praying','invited'\) then 'connected'/);
});

test("share analytics aggregate person-specific links by resource",()=>{
  const stats=fs.readFileSync("netlify/functions/lockliel-share-stats.mjs","utf8");
  assert.match(stats,/groupedLinks/);
  assert.match(stats,/const key=link\.content_id\|\|/);
  assert.match(stats,/linkCount:group\.length/);
});


test("localized Journey preserves canonical progress identity",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-journey.mjs","utf8");
  assert.match(endpoint,/preferredLocale/);
  assert.match(endpoint,/translation_key/);
  assert.match(endpoint,/canonical_course_id/);
  assert.match(endpoint,/canonical_lesson_id/);
  assert.match(endpoint,/content_lesson_id/);
  assert.match(endpoint,/lesson_id=.*inFilter\(sourceLessonIds\)/s);
});

test("localized Resources preserve the entitled product identity",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-resources.mjs","utf8");
  assert.match(endpoint,/preferredLocale/);
  assert.match(endpoint,/localizedProduct/);
  assert.match(endpoint,/canonical_product_id/);
  assert.match(endpoint,/content_product_id/);
  assert.match(endpoint,/translation_key=eq/);
  assert.match(endpoint,/entitlements\?profile_id=eq/);
});


test("auth session handoff is throttled and logout is POST-only",()=>{
  const accept=fs.readFileSync("netlify/functions/lockliel-accept-session.mjs","utf8");
  const logout=fs.readFileSync("netlify/functions/lockliel-logout.mjs","utf8");
  assert.match(accept,/rateLimit/);
  assert.match(logout,/request\.method!==["']POST["']/);
  assert.match(logout,/rateLimit/);
});

test("profile edits preserve an existing locale preference",()=>{
  const profile=fs.readFileSync("app/my-lockliel/profile/profile-form.tsx","utf8");
  assert.match(profile,/profile\?\.locale\|\|/);
  assert.match(profile,/navigator\.language/);
});


test("members control inviter and leader messaging without changing relationship identity",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/connections/connections-client.tsx","utf8");
  const migration=fs.readFileSync("supabase/migrations/20260925045653_lockliel_member_contact_consent_controls.sql","utf8");
  assert.match(api,/setContactPermission/);
  assert.match(api,/revoked_at:allow\?null/);
  assert.match(client,/My original inviter/);
  assert.match(client,/selfRole==="invitee"/);
  assert.match(client,/selfRole==="inviter"/);
  assert.match(client,/Pause messages/);
  assert.match(migration,/grant update \(revoked_at\)/);
  assert.match(migration,/contact_permissions_self_update/);
  assert.match(migration,/left_at = coalesce/);
  assert.match(migration,/set left_at=null/);
  assert.match(migration,/revoke execute on function app_private\.sync_contact_permission_conversation_state/);
});


test("contact consent cannot revive stale inviter or leader relationships",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const migration=fs.readFileSync("supabase/migrations/20260925110224_lockliel_contact_consent_relationship_guard.sql","utf8");
  assert.match(api,/original_inviter_id=eq\./);
  assert.match(api,/leader_assignments\?member_id=eq\./);
  assert.match(api,/status=eq\.active/);
  assert.match(migration,/p\.original_inviter_id = other_profile_id/);
  assert.match(migration,/la\.status = 'active'/);
  assert.match(migration,/Contact relationship is no longer active/);
});


test("inviter and leader consent changes are audited without private contact data",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925110334_lockliel_audit_contact_consent_changes.sql","utf8");
  assert.match(migration,/contact_permission_restored/);
  assert.match(migration,/contact_permission_revoked/);
  assert.match(migration,/permission_type/);
  assert.match(migration,/'allowed'/);
  assert.doesNotMatch(migration,/email/i);
  assert.doesNotMatch(migration,/phone/i);
  assert.doesNotMatch(migration,/message body/i);
  assert.match(migration,/revoke execute on function app_private\.audit_contact_permission_change/);
});


test("approved privacy export includes member consent history",()=>{
  const endpoint=fs.readFileSync("netlify/functions/lockliel-privacy-export.mjs","utf8");
  assert.match(endpoint,/communication_preference_events\?profile_id=eq/);
  assert.match(endpoint,/communication_consent_history:preferenceEvents/);
  assert.match(endpoint,/contact_permissions\?profile_id=eq/);
  assert.match(endpoint,/contact_permissions:contactPermissions/);
  assert.match(endpoint,/Private staff-only notes are not part/);
  assert.match(endpoint,/Security secrets/);
});


test("launch readiness excludes tentative book benefit from required score",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/readiness-admin-client.tsx","utf8");
  assert.match(api,/key:"book_benefit"[\s\S]*required:false/);
  assert.match(api,/const requiredChecks=checks\.filter\(c=>c\.required!==false\)/);
  assert.match(api,/blockerCount:blockers\.length/);
  assert.match(client,/required launch checks ready/);
  assert.match(client,/Optional/);
});


test("digital book readiness requires file, active product, and release flag",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");
  assert.match(api,/digitalBook\?\.storage_path/);
  assert.match(api,/digitalBook\?\.status==="active"/);
  assert.match(api,/flagMap\.digital_book_delivery/);
  assert.match(api,/member delivery switch/);
});


test("digital product release changes are audited and admin shows all release gates",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925110808_lockliel_audit_product_release_changes.sql","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/products-admin-client.tsx","utf8");
  assert.match(migration,/product_release_changed/);
  assert.match(migration,/storage_path_changed/);
  assert.match(migration,/price_cents_from/);
  assert.match(migration,/revoke execute on function app_private\.audit_product_release_change/);
  assert.match(client,/Protected PDF uploaded/);
  assert.match(client,/Digital product active/);
  assert.match(client,/Member delivery enabled/);
  assert.match(client,/Only broader system administrators control the final platform delivery switch/);
});


test("group leave or change requests are reviewed and preserve membership history",()=>{
  const memberApi=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");
  const adminApi=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");
  const memberUi=fs.readFileSync("app/my-lockliel/group/my-group-client.tsx","utf8");
  const adminUi=fs.readFileSync("app/my-lockliel/admin/groups-admin-client.tsx","utf8");
  const migration=fs.readFileSync("supabase/migrations/20260925111018_lockliel_reviewed_group_transitions.sql","utf8");
  const transition=fs.readFileSync("supabase/migrations/20260925124550_lockliel_atomic_group_transition_resolution.sql","utf8");
  const notifyMigration=fs.readFileSync("supabase/migrations/20260925111300_lockliel_group_transition_notifications.sql","utf8");

  assert.match(migration,/leave_or_change_group/);
  assert.match(migration,/add column if not exists left_at timestamptz/);
  assert.match(migration,/group_membership_changed/);
  assert.match(memberApi,/requestGroupChange/);
  assert.match(memberApi,/requestedGroupId:groupId/);
  assert.match(memberUi,/Need to leave or change groups/);
  assert.match(adminApi,/rest\/v1\/rpc\/lockliel_resolve_group_transition/);
  assert.match(transition,/Reassign group leadership before moving or ending this leader\/host membership/);
  assert.match(transition,/set status='inactive',[\s\S]*left_at=now_at/);
  assert.match(adminUi,/End membership/);
  assert.match(adminUi,/Transfer/);
  assert.match(notifyMigration,/Your Lockliel group connection is active/);
  assert.match(notifyMigration,/You are no longer assigned to/);
});


test("same active leader updates preserve a member's paused messaging consent",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925111422_lockliel_preserve_member_leader_message_consent.sql","utf8");
  assert.match(migration,/activate_permission boolean := false/);
  assert.match(migration,/if tg_op='INSERT' then/);
  assert.match(migration,/old\.status<>'active'/);
  assert.match(migration,/old\.leader_id is distinct from new\.leader_id/);
  assert.match(migration,/and cp\.revoked_at is null/);
  assert.match(migration,/if permission_open then/);
  assert.match(migration,/revoke execute on function app_private\.sync_leader_assignment_relationship/);
});


test("My Five limit and system fields are enforced in the database",()=>{
  const integrity=fs.readFileSync("supabase/migrations/20260925111601_lockliel_enforce_my_five_integrity.sql","utf8");
  const timestamps=fs.readFileSync("supabase/migrations/20260925111717_lockliel_system_owned_reach_contact_timestamps.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");

  assert.match(integrity,/revoke insert, update on table public\.reach_contacts from authenticated/);
  assert.match(integrity,/grant insert \(/);
  const reachUpdateGrant=integrity.match(/grant update \(([\s\S]*?)\) on table public\.reach_contacts to authenticated;/)?.[1]||"";
  assert.doesNotMatch(reachUpdateGrant,/owner_id/);
  assert.doesNotMatch(reachUpdateGrant,/linked_profile_id/);
  assert.match(integrity,/pg_advisory_xact_lock/);
  assert.match(integrity,/active_count>=5/);
  assert.match(integrity,/no more than five active people/);

  assert.match(timestamps,/revoke update \(updated_at\)/);
  assert.match(timestamps,/new\.updated_at:=now\(\)/);
  assert.doesNotMatch(api,/status,updated_at:new Date/);
});


test("members can only change notification read state",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925111920_lockliel_protect_system_notifications.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-notifications.mjs","utf8");
  assert.match(migration,/revoke insert, update, delete, truncate/);
  assert.match(migration,/grant update \(read_at\)/);
  assert.match(api,/body:JSON\.stringify\(\{read_at:new Date\(\)\.toISOString\(\)\}\)/);
});


test("My Five limit and system-owned fields are enforced in the database",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925111601_lockliel_enforce_my_five_integrity.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/connections/connections-client.tsx","utf8");

  assert.match(migration,/revoke insert, update on table public\.reach_contacts from authenticated/);
  assert.match(migration,/grant insert \([\s\S]*owner_id[\s\S]*display_name[\s\S]*private_notes[\s\S]*\) on table public\.reach_contacts to authenticated/);
  assert.match(migration,/grant update \([\s\S]*display_name[\s\S]*status[\s\S]*private_notes[\s\S]*updated_at[\s\S]*\) on table public\.reach_contacts to authenticated/);
  assert.doesNotMatch(migration,/grant update \([\s\S]*linked_profile_id/);
  assert.match(migration,/pg_advisory_xact_lock/);
  assert.match(migration,/active_count>=5/);
  assert.match(migration,/My Five can contain no more than five active people/);
  assert.match(api,/Pause or complete one before reactivating another/);
  assert.match(client,/Unable to update My Five/);
});


test("repeat shares preserve My Five progress and paused inviter contact closes only the welcome task",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const consentMigration=fs.readFileSync("supabase/migrations/20260925112829_lockliel_close_inviter_task_on_consent_revoke.sql","utf8");

  assert.match(api,/current\.status==="praying"\?\{status:"invited"\}:\{\}/);
  assert.match(api,/last_shared_at:now\.toISOString\(\)/);
  assert.match(consentMigration,/task_type='welcome_invited_person'/);
  assert.match(consentMigration,/subject_profile_id=new\.profile_id/);
  assert.match(consentMigration,/assigned_to=new\.other_profile_id/);
  assert.match(consentMigration,/status in \('open','in_progress'\)/);
});

test("reach counts recalculate from My Five plus unique referral signups without double incrementing",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113053_lockliel_authoritative_reach_count_sync.sql","utf8");

  assert.match(migration,/recalculate_member_reach_count/);
  assert.match(migration,/count\(distinct re\.member_id\)/);
  assert.match(migration,/not exists\([\s\S]*linked_profile_id=re\.member_id/);
  assert.match(migration,/sync_referral_signup_reach_count_trigger/);
  assert.match(migration,/perform app_private\.recalculate_member_reach_count\(inviter\)/);
  assert.match(migration,/set active_connections_count=active_connections_count\+1,[\s\S]*updated_at=now\(\)/);
  assert.doesNotMatch(migration,/reach_one_count=reach_one_count\+1/);
});


test("active connection counts are derived from contact permissions without manual signup increments",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113218_lockliel_authoritative_connection_count_sync.sql","utf8");
  assert.match(migration,/insert into public\.contact_permissions/);
  assert.match(migration,/perform app_private\.recalculate_member_reach_count\(inviter\)/);
  assert.doesNotMatch(migration,/active_connections_count=active_connections_count\+1/);
  assert.doesNotMatch(migration,/reach_one_count=reach_one_count\+1/);
});


test("lesson journey sync is idempotent after completion",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113326_lockliel_idempotent_lesson_journey_sync.sql","utf8");
  assert.match(migration,/if tg_op='UPDATE' and old\.status is not distinct from new\.status then/);
  assert.match(migration,/where not exists\([\s\S]*You completed your foundational journey/);
  assert.match(migration,/completed_at=coalesce\(completed_at,now\(\)\)/);
});

test("group membership dates stay consistent on leave and reactivation",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113405_lockliel_consistent_group_membership_dates.sql","utf8");
  const assignment=fs.readFileSync("supabase/migrations/20260925124731_lockliel_atomic_group_assignment.sql","utf8");
  const transition=fs.readFileSync("supabase/migrations/20260925124550_lockliel_atomic_group_transition_resolution.sql","utf8");
  assert.match(migration,/if new\.status='active' then[\s\S]*new\.left_at:=null/);
  assert.match(migration,/old\.status='active'[\s\S]*new\.left_at:=now\(\)/);
  assert.match(assignment,/status='active',[\s\S]*left_at=null/);
  assert.match(transition,/status='inactive',[\s\S]*left_at=now_at/);
});


test("referral analytics allow owner shares but block direct anonymous and destructive writes",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113543_lockliel_harden_referral_analytics_writes.sql","utf8");
  const shareApi=fs.readFileSync("netlify/functions/lockliel-share-link.mjs","utf8");
  const redirectApi=fs.readFileSync("netlify/functions/lockliel-referral-redirect.mjs","utf8");

  assert.match(migration,/drop policy if exists anon_visit_insert/);
  assert.match(migration,/revoke all privileges on table public\.referral_events from anon/);
  assert.match(migration,/grant insert \([\s\S]*referral_link_id[\s\S]*event_type[\s\S]*member_id[\s\S]*metadata[\s\S]*\) on table public\.referral_events to authenticated/);
  assert.match(migration,/grant insert \([\s\S]*owner_id[\s\S]*code[\s\S]*reach_contact_id[\s\S]*\) on table public\.referral_links to authenticated/);
  assert.doesNotMatch(migration,/grant update on table public\.referral_links to authenticated/);
  assert.match(shareApi,/event_type:"share_initiated"/);
  assert.match(redirectApi,/functions\/v1\/track-referral/);
});


test("referral tracker requires a valid visitor token and deduplicates visits",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113704_lockliel_dedupe_referral_visits.sql","utf8");
  const edge=fs.readFileSync("supabase/functions/track-referral/index.ts","utf8");
  const redirect=fs.readFileSync("netlify/functions/lockliel-referral-redirect.mjs","utf8");
  const shareUi=fs.readFileSync("app/my-lockliel/share/share-client.tsx","utf8");

  assert.match(migration,/create unique index referral_events_unique_visitor_visit_uidx/);
  assert.match(migration,/event_type='visit'/);
  assert.match(edge,/Invalid visitor/);
  assert.match(edge,/visitor_key:visitorKey/);
  assert.match(redirect,/visitorPattern/);
  assert.match(redirect,/crypto\.randomUUID\(\)/);
  assert.match(redirect,/rateLimit/);
  assert.match(shareUi,/Unique visits/);
});


test("Lockliel cannot remove the final super administrator",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925113917_lockliel_protect_last_super_admin.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-roles.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/roles-admin-client.tsx","utf8");

  assert.match(migration,/A super administrator cannot remove their own super administrator role/);
  assert.match(migration,/Lockliel must retain at least one super administrator/);
  assert.match(migration,/before delete on public\.staff_roles/);
  assert.match(api,/superAdminCount/);
  assert.match(api,/currentProfileId:s\.user\.id/);
  assert.match(client,/protectedSelf/);
  assert.match(client,/final super administrator to be removed/);
});


test("release flags automatically fail closed when dependencies become unready",()=>{
  const payment=fs.readFileSync("supabase/migrations/20260925114051_lockliel_auto_disable_unready_release_flags.sql","utf8");
  const book=fs.readFileSync("supabase/migrations/20260925114131_lockliel_refine_book_benefit_release_sync.sql","utf8");

  assert.match(payment,/where key='partner_checkout'[\s\S]*enabled=true/);
  assert.match(payment,/status='active'[\s\S]*checkout_adapter_ready=true[\s\S]*webhook_ready=true/);
  assert.match(payment,/new\.key='digital_book_delivery'[\s\S]*new\.enabled=false/);
  assert.match(book,/digital_ready boolean/);
  assert.match(book,/heart_ready boolean/);
  assert.match(book,/key='digital_book_delivery'/);
  assert.match(book,/key='heart_book_gift_benefit'/);
});

test("fully verified payment providers require documented verification",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925114227_lockliel_document_payment_provider_verification.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-system.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/system-admin-client.tsx","utf8");

  assert.match(migration,/verification note of at least 20 characters/);
  assert.match(migration,/new\.last_verified_at:=now\(\)/);
  assert.match(migration,/new\.last_verified_at:=null/);
  assert.match(api,/verificationNote\.length<20/);
  assert.doesNotMatch(api,/last_verified_at:/);
  assert.match(client,/Required for launch-ready status/);
  assert.match(client,/note\.trim\(\)\.length<20/);
});


test("fulfillment staff update orders only through fulfillment events",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925114433_lockliel_separate_finance_and_fulfillment_order_updates.sql","utf8");
  const ordersApi=fs.readFileSync("netlify/functions/lockliel-admin-orders.mjs","utf8");

  assert.match(migration,/orders_finance_update/);
  assert.match(migration,/finance_admin/);
  assert.doesNotMatch(migration,/fulfillment_admin/);
  assert.match(ordersApi,/order_fulfillment_events/);
  assert.doesNotMatch(ordersApi,/rest\/v1\/orders\?.*method:"PATCH"/s);
});


test("connection request details are immutable after submission",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925115135_lockliel_immutable_connection_request_details.sql","utf8");
  const connections=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");
  const groups=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");
  const adminGroups=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");

  assert.match(migration,/grant insert \([\s\S]*requester_id[\s\S]*request_type[\s\S]*message[\s\S]*\) on table public\.connection_requests to authenticated/);
  assert.match(migration,/grant update \([\s\S]*status[\s\S]*\) on table public\.connection_requests to authenticated/);
  assert.match(migration,/status = 'open'/);
  assert.match(migration,/normalize_connection_request_resolution/);
  assert.doesNotMatch(connections,/status:"closed",resolved_at/);
  assert.doesNotMatch(groups,/status:"closed",resolved_at/);
  assert.doesNotMatch(adminGroups,/status:"resolved",resolved_at/);
});


test("lesson and media progress writes stay inside the member's enrolled course",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925115405_lockliel_enrollment_scoped_progress_writes.sql","utf8");

  assert.match(migration,/join public\.course_enrollments ce/);
  assert.match(migration,/ce\.profile_id=\(select auth\.uid\(\)\)/);
  assert.match(migration,/ce\.status in \('active','completed'\)/);
  assert.match(migration,/content_course\.translation_key=enrolled_course\.translation_key/);
  assert.match(migration,/Lesson progress identity cannot be changed/);
  assert.match(migration,/Media progress identity cannot be changed/);
});


test("lesson completion validates localized media and every worksheet field",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925115537_lockliel_localized_lesson_completion_integrity.sql","utf8");

  assert.match(migration,/resolve_content_lesson_for_profile/);
  assert.match(migration,/preferred_locale/);
  assert.match(migration,/content_lesson_id/);
  assert.match(migration,/mp\.percent_watched>=95/);
  assert.match(migration,/new\.worksheet_answers->>\(q->>'number'\)/);
  assert.match(migration,/every worksheet or notes field has an answer/);
  assert.match(migration,/new\.completed_at:=now\(\)/);
});


test("progress timestamps and status ranges are database-controlled",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925115701_lockliel_normalize_progress_state.sql","utf8");

  assert.match(migration,/status in \('not_started','in_progress','completed'\)/);
  assert.match(migration,/worksheet_status in \('not_started','in_progress','completed','not_required'\)/);
  assert.match(migration,/last_position_seconds>=0/);
  assert.match(migration,/watched_seconds>=0/);
  assert.match(migration,/Completed lessons cannot be moved back/);
  assert.match(migration,/new\.last_activity_at:=now\(\)/);
  assert.match(migration,/new\.percent_watched:=greatest/);
  assert.match(migration,/new\.completed_at:=null/);
});


test("system-owned records do not expose dormant member write paths",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925115908_lockliel_reduce_dormant_data_api_writes.sql","utf8");

  assert.match(migration,/drop policy if exists communication_preferences_self_insert/);
  assert.match(migration,/revoke insert, delete on table public\.communication_preferences from authenticated/);
  assert.match(migration,/revoke insert, update, delete on table public\.course_enrollments from authenticated/);
  assert.match(migration,/revoke insert, update, delete on table public\.checkout_sessions from authenticated/);
  assert.match(migration,/revoke insert, update, delete on table public\.payment_events from authenticated/);
  assert.match(migration,/revoke insert, update, delete on table public\.partner_commitments from authenticated/);
  assert.match(migration,/revoke insert, delete on table public\.contact_permissions from authenticated/);
  assert.match(migration,/revoke insert, delete on table public\.orders from authenticated/);
});


test("member journey state is system-derived and read-only to members",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120028_lockliel_system_owned_member_journey.sql","utf8");
  const session=fs.readFileSync("netlify/functions/lockliel-session.mjs","utf8");

  assert.match(migration,/drop policy if exists member_journey_self_update/);
  assert.match(migration,/revoke insert, update, delete on table public\.member_journey from authenticated/);
  assert.match(migration,/grant select on table public\.member_journey to authenticated/);
  assert.match(session,/rest\/v1\/member_journey\?profile_id=eq/);
  assert.doesNotMatch(session,/member_journey.*method:"PATCH"/s);
});


test("profile onboarding status is derived from completed required fields",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120141_lockliel_system_owned_profile_onboarding.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-profile.mjs","utf8");

  assert.match(migration,/revoke update \([\s\S]*onboarding_status[\s\S]*updated_at[\s\S]*\) on table public\.profiles from authenticated/);
  assert.match(migration,/onboarding_status in \('new','active'\)/);
  assert.match(migration,/new\.onboarding_status:='active'/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.doesNotMatch(api,/onboarding_status:/);
  assert.doesNotMatch(api,/updated_at:new Date/);
});


test("faith profile inputs are constrained and system fields stay private",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120317_lockliel_harden_private_faith_profile.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-faith-profile.mjs","utf8");

  assert.match(migration,/faith_stage in \(/);
  assert.match(migration,/preferred_connection in \('either','local','online','not-now'\)/);
  assert.match(migration,/growth_interests <@ array/);
  assert.match(migration,/Faith profile identity cannot be changed/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.doesNotMatch(api,/notes:\{\}/);
  assert.doesNotMatch(api,/updated_at:new Date/);
  assert.match(api,/allowedFaithStages/);
  assert.match(api,/allowedInterests/);
});


test("internal messaging release flag is enforced by RLS",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120440_lockliel_enforce_messaging_release_flag.sql","utf8");

  assert.match(migration,/grant insert \([\s\S]*conversation_id[\s\S]*sender_id[\s\S]*body[\s\S]*\) on table public\.messages to authenticated/);
  assert.match(migration,/sender_id = \(select auth\.uid\(\)\)/);
  assert.match(migration,/app_private\.is_conversation_member\(conversation_id\)/);
  assert.match(migration,/f\.key='internal_messaging'/);
  assert.match(migration,/f\.enabled=true/);
});


test("weekly group check-ins preserve identity and database timestamps",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120612_lockliel_harden_weekly_group_checkins.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");

  assert.match(migration,/extract\(isodow from week_start\)=1/);
  assert.match(migration,/Weekly check-in identity and week cannot be changed/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.match(migration,/char_length\(testimony\)<=5000/);
  assert.match(migration,/char_length\(needs_support\)<=5000/);
  assert.doesNotMatch(api,/updated_at:new Date\(\)\.toISOString\(\)/);
});


test("weekly group check-ins allow current leaders to correct reports without changing identity",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120822_lockliel_harden_group_weekly_checkins.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");

  assert.match(migration,/app_private\.is_group_leader\(group_id\)/);
  assert.match(migration,/grant update \([\s\S]*gathered[\s\S]*needs_support[\s\S]*\) on table public\.group_weekly_checkins to authenticated/);
  const weeklyUpdateGrant=migration.match(/grant update \(([\s\S]*?)\) on table public\.group_weekly_checkins to authenticated;/)?.[1]||"";
  assert.doesNotMatch(weeklyUpdateGrant,/group_id/);
  assert.doesNotMatch(weeklyUpdateGrant,/submitted_by/);
  assert.doesNotMatch(weeklyUpdateGrant,/week_start/);
  assert.match(migration,/Weekly check-in identity cannot be changed/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.match(api,/on_conflict=group_id,week_start/);
});


test("Founders 50 applications are immutable and active-host approval is review-gated",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925120958_lockliel_immutable_founders50_review_workflow.sql","utf8");
  const summaryApi=fs.readFileSync("netlify/functions/lockliel-admin.mjs","utf8");
  const summaryUi=fs.readFileSync("app/my-lockliel/admin/admin-client.tsx","utf8");
  const reviewApi=fs.readFileSync("netlify/functions/lockliel-admin-founder-reviews.mjs","utf8");
  const orientationUi=fs.readFileSync("app/my-lockliel/admin/founder-orientation-admin-client.tsx","utf8");

  assert.match(migration,/revoke insert, update, delete on table public\.founders50_applications from authenticated/);
  assert.match(migration,/decision in \([\s\S]*'activate_host'/);
  assert.match(migration,/decision='note'[\s\S]*char_length\(trim\(coalesce\(rationale,''\)\)\)>=20/);
  assert.match(migration,/current_status<>'orientation'/);
  assert.match(migration,/complete_count<required_count/);
  assert.match(migration,/set status='active_host'/);
  assert.doesNotMatch(summaryApi,/updateFounderStatus/);
  assert.doesNotMatch(summaryUi,/founderStatuses/);
  assert.match(summaryUi,/href="#founders"/);
  assert.match(reviewApi,/activate_host/);
  assert.match(reviewApi,/rationale\.length<20/);
  assert.match(orientationUi,/decision:"activate_host"/);
  assert.match(orientationUi,/Approve active host/);
});


test("connection request status and resolution timestamps stay consistent",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925121239_lockliel_normalize_connection_request_status.sql","utf8");
  assert.match(migration,/status in \('open','in_progress','resolved','closed','cancelled'\)/);
  assert.match(migration,/new\.status in \('resolved','closed','cancelled'\)/);
  assert.match(migration,/new\.status in \('open','in_progress'\)/);
  assert.match(migration,/new\.resolved_at:=null/);
});


test("staff notes and audit history are append-only",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925121424_lockliel_append_only_staff_notes_and_audit.sql","utf8");
  const notesApi=fs.readFileSync("netlify/functions/lockliel-admin-notes.mjs","utf8");

  assert.match(migration,/drop policy if exists member_staff_notes_author_update/);
  assert.match(migration,/revoke insert, update, delete on table public\.member_staff_notes from authenticated/);
  assert.match(migration,/grant insert \([\s\S]*profile_id[\s\S]*author_id[\s\S]*visibility[\s\S]*note_type[\s\S]*body[\s\S]*\) on table public\.member_staff_notes to authenticated/);
  assert.match(migration,/revoke insert, update, delete on table public\.audit_events from authenticated/);
  assert.match(notesApi,/method:"POST"/);
  assert.doesNotMatch(notesApi,/method:"PATCH"/);
});


test("leadership assignments and group leadership require approved compatible roles",()=>{
  const assignmentMigration=fs.readFileSync("supabase/migrations/20260925121010_lockliel_enforce_approved_leadership_roles.sql","utf8");
  const membershipMigration=fs.readFileSync("supabase/migrations/20260925121116_lockliel_guard_group_leadership_memberships.sql","utf8");
  const lifecycleMigration=fs.readFileSync("supabase/migrations/20260925121355_lockliel_protect_active_leader_responsibilities.sql","utf8");
  const leadersApi=fs.readFileSync("netlify/functions/lockliel-admin-leaders.mjs","utf8");
  const groupsApi=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");
  const leadersUi=fs.readFileSync("app/my-lockliel/admin/leaders-admin-client.tsx","utf8");
  const groupsUi=fs.readFileSync("app/my-lockliel/admin/groups-admin-client.tsx","utf8");

  assert.match(assignmentMigration,/leader_type_allows_assignment/);
  assert.match(assignmentMigration,/Leader assignments require an active approved leader profile/);
  assert.match(assignmentMigration,/Group leaders must have an active approved group-leader profile/);
  assert.match(membershipMigration,/Group leader and host roles require an active approved group-leader profile/);
  assert.match(membershipMigration,/sync_group_primary_leader_membership/);
  assert.match(lifecycleMigration,/Reassign active members before deactivating this leader/);
  assert.match(lifecycleMigration,/Reassign active groups before deactivating this leader/);
  assert.match(leadersApi,/approved leader role does not support this assignment type/);
  assert.match(groupsApi,/approved group leader, regional leader, or active Founders 50 host/);
  assert.match(leadersUi,/assignmentTypesFor/);
  assert.match(groupsUi,/approvedGroupLeaders/);
  assert.match(groupsUi,/Choose approved leader \/ host/);
});


test("follow-up task lifecycle is narrow, timestamped, and audited",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925121541_lockliel_harden_followup_task_lifecycle.sql","utf8");
  const adminApi=fs.readFileSync("netlify/functions/lockliel-admin-tasks.mjs","utf8");
  const memberApi=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");

  assert.match(migration,/grant update \([\s\S]*assigned_to[\s\S]*status[\s\S]*\) on table public\.follow_up_tasks to authenticated/);
  assert.match(migration,/status in \('open','in_progress','completed'\)/);
  assert.match(migration,/Completed follow-up tasks cannot be reopened/);
  assert.match(migration,/follow_up_task_changed/);
  assert.doesNotMatch(adminApi,/completed_at:new Date/);
  assert.doesNotMatch(memberApi,/completed_at:new Date/);
  assert.match(adminApi,/status=in\.\(open,in_progress\)/);
  assert.match(memberApi,/status=in\.\(open,in_progress\)/);
});


test("leader assignment lifecycle timestamps and actor are database-controlled",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925121546_lockliel_normalize_leader_assignment_lifecycle.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-leaders.mjs","utf8");

  assert.match(migration,/Leader assignment member identity cannot be changed/);
  assert.match(migration,/new\.assigned_at:=now\(\)/);
  assert.match(migration,/new\.ended_at:=now\(\)/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.match(migration,/actor:=\(select auth\.uid\(\)\)/);
  assert.doesNotMatch(api,/ended_at:null/);
  assert.doesNotMatch(api,/status:"ended",ended_at/);
  assert.doesNotMatch(api,/updated_at:new Date\(\)\.toISOString\(\)/);
});


test("leader profile approval identity and timestamps are database-controlled",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925121721_lockliel_normalize_leader_profile_approval.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-leaders.mjs","utf8");

  assert.match(migration,/Leader profile identity cannot be changed/);
  assert.match(migration,/new\.approved_at:=now\(\)/);
  assert.match(migration,/new\.approved_by:=old\.approved_by/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.doesNotMatch(api,/approved_by:uid,[\s\S]*updated_at:new Date/);
});


test("tags and consent history are read-only while notifications expose only read state",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925121919_lockliel_read_only_tags_consent_history_notifications.sql","utf8");

  assert.match(migration,/grant select on table public\.communication_preference_events to authenticated/);
  assert.match(migration,/grant select on table public\.tags to authenticated/);
  assert.match(migration,/grant select on table public\.profile_tags to authenticated/);
  assert.match(migration,/grant select on table public\.notifications to authenticated/);
  assert.match(migration,/grant update \(read_at\) on table public\.notifications to authenticated/);
  assert.doesNotMatch(migration,/grant insert .*communication_preference_events/);
  assert.doesNotMatch(migration,/grant insert .*profile_tags/);
});


test("Founders reviewers are scoped to Founders-specific people and tasks",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122007_lockliel_scope_founders_reviewer_access.sql","utf8");
  const groupsApi=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");
  const leadersApi=fs.readFileSync("netlify/functions/lockliel-admin-leaders.mjs","utf8");

  assert.match(migration,/founders50_reviewer/);
  assert.match(migration,/founders50_applications fa/);
  assert.match(migration,/founders50_orientation_followup/);
  assert.match(migration,/context_type in \('founders50','founders50_application'\)/);
  assert.doesNotMatch(groupsApi,/discipleship_admin","founders50_reviewer/);
  assert.doesNotMatch(leadersApi,/discipleship_admin","founders50_reviewer/);
  assert.match(groupsApi,/\["super_admin","admin","discipleship_admin"\]/);
  assert.match(leadersApi,/\["super_admin","admin","discipleship_admin"\]/);
});


test("pre-account CRM identity and attribution are system-owned",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122051_lockliel_harden_preaccount_crm_records.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-leads.mjs","utf8");

  assert.match(migration,/grant update \([\s\S]*status[\s\S]*assigned_to[\s\S]*next_follow_up_at[\s\S]*last_contacted_at[\s\S]*admin_notes[\s\S]*\) on table public\.lead_contacts to authenticated/);
  assert.match(migration,/grant select on table public\.lead_sources to authenticated/);
  assert.doesNotMatch(migration,/grant update .*lead_sources/);
  assert.match(migration,/lead_operational_change/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.doesNotMatch(api,/updated_at:new Date\(\)\.toISOString\(\)/);
});


test("Founders reviewer connection-card access uses only the scoped policy",()=>{
  const scoped=fs.readFileSync("supabase/migrations/20260925122007_lockliel_scope_founders_reviewer_access.sql","utf8");
  const cleanup=fs.readFileSync("supabase/migrations/20260925122202_lockliel_remove_legacy_connection_card_policy.sql","utf8");

  assert.match(scoped,/profile_connection_cards_allowed_read/);
  assert.match(scoped,/founders50_applications fa/);
  assert.match(cleanup,/drop policy if exists connection_cards_allowed_read/);
});


test("private lesson and product storage enforce enrollment, entitlement, locale, and release flags",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122252_lockliel_enrollment_and_locale_scoped_private_storage.sql","utf8");

  assert.match(migration,/ce\.profile_id=\(select auth\.uid\(\)\)/);
  assert.match(migration,/ce\.status in \('active','completed'\)/);
  assert.match(migration,/content_course\.translation_key=enrolled_course\.translation_key/);
  assert.match(migration,/bucket_id='lesson-assets'/);
  assert.match(migration,/bucket_id='member-resources'/);
  assert.match(migration,/content_product\.translation_key=source_product\.translation_key/);
  assert.match(migration,/content_product\.status='active'/);
  assert.match(migration,/f\.key='digital_book_delivery'/);
  assert.match(migration,/f\.enabled=true/);
});


test("private storage honors enrollment, entitlement, and release gates",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122318_lockliel_harden_private_storage_reads.sql","utf8");

  assert.match(migration,/bucket_id='lesson-assets'/);
  assert.match(migration,/ce\.profile_id=\(select auth\.uid\(\)\)/);
  assert.match(migration,/ce\.status in \('active','completed'\)/);
  assert.match(migration,/content_course\.translation_key=enrolled_course\.translation_key/);
  assert.match(migration,/bucket_id='member-resources'/);
  assert.match(migration,/e\.profile_id=\(select auth\.uid\(\)\)/);
  assert.match(migration,/p\.status='active'/);
  assert.match(migration,/f\.key='digital_book_delivery'/);
  assert.match(migration,/f\.enabled=true/);
});


test("canonical entitlements can serve approved translated product files",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122438_lockliel_restore_translated_entitlement_storage_reads.sql","utf8");

  assert.match(migration,/source_product\.id=e\.product_id/);
  assert.match(migration,/content_product\.storage_path=storage\.objects\.name/);
  assert.match(migration,/content_product\.translation_key=source_product\.translation_key/);
  assert.match(migration,/content_product\.status='active'/);
  assert.match(migration,/f\.key='digital_book_delivery'/);
});


test("commerce records use least privilege and entitlement changes are audited",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122502_lockliel_harden_resource_and_order_records.sql","utf8");

  assert.match(migration,/grant select on table public\.order_items to authenticated/);
  assert.match(migration,/grant select on table public\.order_shipping_addresses to authenticated/);
  assert.match(migration,/grant insert \([\s\S]*order_id[\s\S]*actor_profile_id[\s\S]*event_type[\s\S]*tracking_number[\s\S]*\) on table public\.order_fulfillment_events to authenticated/);
  assert.match(migration,/grant update \([\s\S]*status[\s\S]*price_cents[\s\S]*storage_path[\s\S]*translation_key[\s\S]*\) on table public\.products to authenticated/);
  assert.match(migration,/grant update \(status\) on table public\.benefit_rules to authenticated/);
  assert.match(migration,/grant insert \([\s\S]*profile_id[\s\S]*product_id[\s\S]*reason[\s\S]*source_ref[\s\S]*\) on table public\.entitlements to authenticated/);
  assert.match(migration,/entitlement_granted/);
  assert.match(migration,/entitlement_revoked/);
});


test("published lesson rows still require course enrollment",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122548_lockliel_scope_lesson_rows_to_enrollment.sql","utf8");

  assert.match(migration,/join public\.course_enrollments ce/);
  assert.match(migration,/ce\.profile_id=\(select auth\.uid\(\)\)/);
  assert.match(migration,/ce\.status in \('active','completed'\)/);
  assert.match(migration,/content_course\.status='published'/);
  assert.match(migration,/content_course\.translation_key=enrolled_course\.translation_key/);
});


test("members cannot write system-owned progress timestamps",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925122835_lockliel_limit_member_progress_columns.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-journey.mjs","utf8");

  assert.match(migration,/grant insert \([\s\S]*profile_id[\s\S]*worksheet_answers[\s\S]*\) on table public\.lesson_progress to authenticated/);
  assert.match(migration,/grant update \([\s\S]*worksheet_answers[\s\S]*\) on table public\.lesson_progress to authenticated/);
  assert.match(migration,/grant insert \([\s\S]*asset_id[\s\S]*covered_intervals[\s\S]*\) on table public\.media_progress to authenticated/);
  assert.doesNotMatch(migration,/grant update \([\s\S]*completed_at/);
  assert.doesNotMatch(migration,/grant update \([\s\S]*last_activity_at/);
  assert.doesNotMatch(api,/first_started_at:/);
  assert.doesNotMatch(api,/last_activity_at:new Date/);
  assert.doesNotMatch(api,/completed_at:b\.status/);
});


test("course metadata is limited to the member's enrolled course family",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925123002_lockliel_nonrecursive_course_access_scope.sql","utf8");

  assert.match(migration,/can_read_course/);
  assert.match(migration,/security definer/);
  assert.match(migration,/ce\.profile_id=\(select auth\.uid\(\)\)/);
  assert.match(migration,/ce\.status in \('active','completed'\)/);
  assert.match(migration,/enrolled_course\.translation_key=target_translation_key/);
  assert.match(migration,/status='published'/);
  assert.match(migration,/grant execute on function app_private\.can_read_course/);
});


test("public Founders and lead intake use hashed database-backed rate limits",()=>{
  const limiter=fs.readFileSync("supabase/migrations/20260925122850_lockliel_public_intake_rate_limits_v2.sql","utf8");
  const founders=fs.readFileSync("supabase/functions/submit-founders50/index.ts","utf8");
  const capture=fs.readFileSync("supabase/functions/capture-lead/index.ts","utf8");

  assert.match(limiter,/app_private\.public_rate_limits/);
  assert.match(limiter,/consume_public_rate_limit/);
  assert.match(limiter,/grant execute[\s\S]*to service_role/);
  assert.match(founders,/sha256/);
  assert.match(founders,/founders50_email/);
  assert.match(founders,/founders50_ip/);
  assert.match(founders,/duplicate:Boolean\(result\?\.is_duplicate\)/);
  assert.match(founders,/\.slice\(0,5000\)/);
  assert.doesNotMatch(founders,/detail:detail/);
  assert.match(capture,/sha256/);
  assert.match(capture,/capture_lead_email/);
  assert.match(capture,/capture_lead_ip/);
  assert.match(capture,/cleanObject/);
  assert.match(capture,/duplicate:Boolean\(result\?\.is_duplicate\)/);
  assert.match(founders,/^\/\/ @ts-nocheck/m);
  assert.match(capture,/^\/\/ @ts-nocheck/m);
});


test("content release integrity requires valid states, playable lesson coverage, and stable asset identity",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925123400_lockliel_align_content_release_integrity.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-content.mjs","utf8");

  assert.match(migration,/courses_status_check/);
  assert.match(migration,/products_status_check/);
  assert.match(migration,/products_price_nonnegative/);
  assert.match(migration,/Lesson asset identity cannot be moved to another lesson/);
  assert.match(migration,/Active video assets require a YouTube provider and video reference/);
  assert.match(migration,/count\(distinct a\.lesson_id\)/);
  assert.match(migration,/lower\(coalesce\(a\.provider,''\)\)='youtube'/);
  assert.match(migration,/\)>=10/);
  assert.doesNotMatch(api,/updated_at:new Date\(\)\.toISOString\(\)/);
});

test("released course and product files cannot silently become incomplete",()=>{
  const dependency=fs.readFileSync("supabase/migrations/20260925123523_lockliel_protect_released_content_dependencies.sql","utf8");
  const storage=fs.readFileSync("supabase/migrations/20260925123556_lockliel_block_released_storage_replacement.sql","utf8");

  assert.match(dependency,/ensure_grip_course_ready/);
  assert.match(dependency,/course_auto_unpublished/);
  assert.match(dependency,/recheck_grip_course_after_lesson_change_trigger/);
  assert.match(storage,/before delete or update/);
  assert.match(storage,/Unpublish or deactivate the lesson asset before deleting or replacing a released course file/);
  assert.match(storage,/Archive the active product before deleting or replacing its protected file/);
});


test("public intake uses atomic database workflows for CRM attribution",()=>{
  const leadUpsert=fs.readFileSync("supabase/migrations/20260925123704_lockliel_atomic_public_lead_upsert.sql","utf8");
  const atomic=fs.readFileSync("supabase/migrations/20260926003840_lockliel_atomic_public_intake_workflows.sql","utf8");
  const founders=fs.readFileSync("supabase/functions/submit-founders50/index.ts","utf8");
  const capture=fs.readFileSync("supabase/functions/capture-lead/index.ts","utf8");

  assert.match(leadUpsert,/on conflict\(email\)/);
  assert.match(leadUpsert,/normalized_email:=lower\(trim\(email_input\)\)/);
  assert.match(atomic,/capture_public_lead_atomic/);
  assert.match(atomic,/submit_public_founders50_application_atomic/);
  assert.match(atomic,/security invoker/);
  assert.match(atomic,/grant execute[\s\S]*to service_role/);
  assert.match(capture,/rpc\/capture_public_lead_atomic/);
  assert.match(founders,/rpc\/submit_public_founders50_application_atomic/);
  assert.doesNotMatch(capture,/rpc\/upsert_public_lead_contact/);
  assert.doesNotMatch(founders,/rpc\/upsert_public_lead_contact/);
  assert.doesNotMatch(capture,/rest\/v1\/lead_sources/);
  assert.doesNotMatch(founders,/rest\/v1\/lead_sources/);
  assert.doesNotMatch(founders,/rest\/v1\/founders50_applications/);
});

test("public intake records enforce bounded normalized identities and metadata",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925123628_lockliel_harden_public_intake_records.sql","utf8");
  assert.match(migration,/lead_contacts_email_key unique\(email\)/);
  assert.match(migration,/email=lower\(trim\(email\)\)/);
  assert.match(migration,/lead_sources_source_type_check/);
  assert.match(migration,/jsonb_typeof\(attribution\)='object'/);
  assert.match(migration,/jsonb_typeof\(consent\)='object'/);
  assert.match(migration,/founders50_growth_interests_check/);
  assert.match(migration,/founders50_why_interested_length/);
  assert.match(migration,/founders50_what_excites_length/);
});


test("launch readiness uses the authoritative Getting a Grip readiness RPC",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925124314_lockliel_align_public_grip_readiness_threshold.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");

  assert.match(migration,/lockliel_grip_readiness/);
  assert.match(migration,/security invoker/);
  assert.match(migration,/playable_video_lessons>=10/);
  assert.match(migration,/private_workbook_lessons/);
  assert.match(migration,/playable_video_lessons/);
  assert.match(migration,/Administrator access required/);
  assert.match(migration,/app_private\.has_staff_role/);
  assert.match(api,/rest\/v1\/rpc\/lockliel_grip_readiness/);
  assert.match(api,/gripReadiness\?\.release_ready/);
  assert.match(api,/distinct lessons with playable teaching video/);
  assert.doesNotMatch(api,/const gripVideos=gripAssets/);
});


test("Grip readiness RPC uses caller RLS instead of SECURITY DEFINER",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925124032_lockliel_make_grip_readiness_security_invoker.sql","utf8");
  const readiness=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");

  assert.match(migration,/security invoker/);
  assert.doesNotMatch(migration,/security definer[\s\S]*lockliel_grip_readiness/i);
  assert.match(migration,/has_staff_role[\s\S]*super_admin[\s\S]*admin/);
  assert.match(migration,/lesson_asset_storage_read/);
  assert.match(readiness,/rpc\/lockliel_grip_readiness/);
});


test("group transition resolution is atomic and role-gated in the database",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925124550_lockliel_atomic_group_transition_resolution.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");

  assert.match(migration,/lockliel_resolve_group_transition/);
  assert.match(migration,/security invoker/);
  assert.match(migration,/for update/);
  assert.match(migration,/Reassign group leadership before moving or ending this leader\/host membership/);
  assert.match(migration,/Target group is not available for assignment/);
  assert.match(migration,/update public\.connection_requests[\s\S]*set status='resolved'/);
  assert.match(api,/rest\/v1\/rpc\/lockliel_resolve_group_transition/);
  assert.doesNotMatch(api,/let targetAdded=false/);
  assert.doesNotMatch(api,/Current active group membership not found\.[\s\S]*method:"PATCH"/);
});


test("group assignment and request resolution are atomic",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925124731_lockliel_atomic_group_assignment.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");

  assert.match(migration,/lockliel_assign_member_to_group/);
  assert.match(migration,/security invoker/);
  assert.match(migration,/request_type='find_local_group'/);
  assert.match(migration,/for update/);
  assert.match(migration,/on conflict\(group_id,profile_id\)/);
  assert.match(migration,/update public\.connection_requests[\s\S]*set status='resolved'/);
  assert.match(api,/rest\/v1\/rpc\/lockliel_assign_member_to_group/);
  assert.doesNotMatch(api,/on_conflict=group_id,profile_id[\s\S]*connection_requests\?id=eq/);
});


test("members cannot create duplicate open connection requests under race conditions",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925124859_lockliel_unique_open_connection_requests.sql","utf8");
  const groups=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");
  const connections=fs.readFileSync("netlify/functions/lockliel-connections.mjs","utf8");

  assert.match(migration,/create unique index connection_requests_one_open_type_uidx/);
  assert.match(migration,/\(requester_id,request_type\)/);
  assert.match(migration,/where status='open'/);
  assert.match(groups,/r\.status===409[\s\S]*already have an open request of this type/);
  assert.match(connections,/r\.status===409[\s\S]*already have an open leader request/);
});


test("weekly group check-in corrections are audited without storing testimony or support text",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925125731_lockliel_audit_group_checkin_updates.sql","utf8");

  assert.match(migration,/group_weekly_checkin_updated/);
  assert.match(migration,/actor:=coalesce\(\(select auth\.uid\(\)\),new\.submitted_by\)/);
  assert.match(migration,/testimony_changed/);
  assert.match(migration,/support_changed/);
  assert.match(migration,/support_requested/);
  assert.match(migration,/after insert or update of/);
  assert.doesNotMatch(migration,/'testimony',new\.testimony/);
  assert.doesNotMatch(migration,/'needs_support',new\.needs_support/);
});


test("Founder orientation progress is active-step scoped, audited, and locked after host approval",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925130031_lockliel_harden_founder_orientation_progress.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-founder-orientation.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/founder/founder-orientation-client.tsx","utf8");

  assert.match(migration,/grant insert \([\s\S]*profile_id[\s\S]*step_id[\s\S]*completed_at[\s\S]*\) on table public\.founder_orientation_progress/);
  assert.match(migration,/s\.active=true/);
  assert.match(migration,/Founder orientation progress identity cannot be changed/);
  assert.match(migration,/Completed orientation history cannot be removed after active-host approval/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.match(migration,/founder_orientation_step_completed/);
  assert.match(migration,/founder_orientation_step_reopened/);
  assert.doesNotMatch(api,/updated_at:new Date/);
  assert.match(client,/status==="active_host"/);
  assert.match(client,/Orientation history is locked after active-host approval/);
});


test("Founder orientation catalog is read-only through the Data API",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925130305_lockliel_read_only_founder_orientation_catalog.sql","utf8");

  assert.match(migration,/revoke all privileges on table public\.founder_orientation_steps[\s\S]*from anon/);
  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.founder_orientation_steps[\s\S]*from authenticated/);
  assert.match(migration,/grant select[\s\S]*on table public\.founder_orientation_steps[\s\S]*to authenticated/);
});


test("staff role grants have database-owned timestamps and no update surface",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925130524_lockliel_system_owned_staff_role_grants.sql","utf8");

  assert.match(migration,/revoke insert, update on table public\.staff_roles[\s\S]*from authenticated/);
  assert.match(migration,/grant insert \([\s\S]*profile_id[\s\S]*role[\s\S]*\) on table public\.staff_roles[\s\S]*to authenticated/);
  const staffRoleInsertGrant=migration.match(/grant insert \(([\s\S]*?)\) on table public\.staff_roles[\s\S]*?to authenticated;/)?.[1]||"";
  assert.doesNotMatch(staffRoleInsertGrant,/granted_at/);
  assert.match(migration,/new\.granted_at:=now\(\)/);
  assert.match(migration,/before insert on public\.staff_roles/);
});


test("conversation identity and membership are system-owned while members can still read their active conversations",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925130730_lockliel_system_owned_conversation_membership.sql","utf8");
  const messaging=fs.readFileSync("supabase/migrations/20260925120440_lockliel_enforce_messaging_release_flag.sql","utf8");

  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.conversations[\s\S]*from authenticated/);
  assert.match(migration,/grant select[\s\S]*on table public\.conversations[\s\S]*to authenticated/);
  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.conversation_members[\s\S]*from authenticated/);
  assert.match(migration,/grant select[\s\S]*on table public\.conversation_members[\s\S]*to authenticated/);
  assert.match(messaging,/grant insert \([\s\S]*conversation_id[\s\S]*sender_id[\s\S]*body[\s\S]*\) on table public\.messages to authenticated/);
});


test("member profile text fields are normalized and bounded in both API and database",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925131048_lockliel_bound_member_profile_fields.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-profile.mjs","utf8");

  assert.match(migration,/profiles_first_name_length/);
  assert.match(migration,/char_length\(first_name\) between 1 and 120/);
  assert.match(migration,/char_length\(phone\)<=60/);
  assert.match(migration,/char_length\(city\) between 1 and 160/);
  assert.match(migration,/char_length\(locale\) between 2 and 35/);
  assert.match(migration,/char_length\(timezone\)<=100/);
  assert.match(migration,/new\.first_name:=nullif\(trim/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.match(api,/firstName\.length>120/);
  assert.match(api,/phone\.length>60/);
  assert.match(api,/city\.length>160/);
  assert.match(api,/locale\.length<2\|\|locale\.length>35/);
});


test("product and Share Library identity fields cannot drift after creation",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925131440_lockliel_harden_product_and_share_identity.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-share-library.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/share-library-admin-client.tsx","utf8");

  assert.match(migration,/Product identity fields cannot be changed after creation/);
  assert.match(migration,/Archive the product before changing its protected file/);
  const productSection=migration.slice(
    migration.indexOf("grant update ("),
    migration.indexOf("alter table public.products")
  );
  assert.doesNotMatch(productSection,/translation_key/);
  assert.match(migration,/Share resource identity fields cannot be changed after creation/);
  const shareStart=migration.indexOf("revoke insert, update on table public.share_assets");
  const shareSection=migration.slice(
    shareStart,
    migration.indexOf("create or replace function app_private.normalize_share_asset")
  );
  const shareUpdateGrant=shareSection.match(/grant update \(([\s\S]*?)\) on table public\.share_assets[\s\S]*?to authenticated;/)?.[1]||"";
  assert.doesNotMatch(shareUpdateGrant,/translation_key/);
  assert.doesNotMatch(shareUpdateGrant,/slug/);
  assert.match(api,/const allowedAssetTypes=\["faith_boost","graphic","book","course","invitation"\]/);
  assert.doesNotMatch(api,/assetType\|\|"resource"/);
  assert.match(api,/status:"draft"/);
  assert.match(client,/defaultValue="graphic"/);
  assert.match(client,/locked after creation/);
});


test("product and share resource identity fields are protected after creation",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925131440_lockliel_harden_product_and_share_identity.sql","utf8");

  assert.match(migration,/Product identity fields cannot be changed after creation/);
  assert.match(migration,/Archive the product before changing its protected file/);
  assert.match(migration,/Share resource identity fields cannot be changed after creation/);
  assert.match(migration,/grant update \([\s\S]*storage_path[\s\S]*language_code[\s\S]*\) on table public\.products to authenticated/);
  assert.doesNotMatch(migration,/grant update \([\s\S]*translation_key[\s\S]*\) on table public\.products/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
});

test("release controls expose sanitized checkout state while diagnostics stay staff-only",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925131510_lockliel_harden_release_control_surface.sql","utf8");
  const partner=fs.readFileSync("netlify/functions/lockliel-partner.mjs","utf8");

  assert.match(migration,/grant update \(enabled\) on table public\.feature_flags to authenticated/);
  assert.match(migration,/grant update \(verified,note\) on table public\.launch_verifications to authenticated/);
  assert.match(migration,/payment_provider_staff_read/);
  assert.match(migration,/payment_provider_staff_update/);
  assert.match(migration,/partner_checkout_state_member_read/);
  assert.match(migration,/refresh_partner_checkout_state/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
  assert.match(partner,/checkoutCapabilities/);
  assert.doesNotMatch(partner,/activeProvider/);
});


test("Founders review decisions require a documented rationale in the database",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925132018_lockliel_require_founders_review_rationale.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-founder-reviews.mjs","utf8");

  assert.match(migration,/founders50_reviews_decision_rationale/);
  assert.match(migration,/decision='note'/);
  assert.match(migration,/char_length\(trim\(coalesce\(rationale,''\)\)\)>=20/);
  assert.match(api,/rationale\.length<20/);
});


test("member-created referral links are bound to approved Share Library content",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925133008_lockliel_bind_referral_links_to_approved_content.sql","utf8");
  const shareApi=fs.readFileSync("netlify/functions/lockliel-share-link.mjs","utf8");

  assert.match(migration,/campaign in \('share-center','share-center-my-five'\)/);
  assert.match(migration,/sa\.status='active'/);
  assert.match(migration,/sa\.asset_type=content_type/);
  assert.match(migration,/sa\.destination_path=destination_path/);
  assert.match(migration,/Default member invitation links must use the canonical Lockliel sign-up destination/);
  assert.match(migration,/Referral links must match an active approved Share Library resource/);
  assert.match(migration,/referral_links_code_format/);
  assert.match(migration,/referral_links_destination_path_check/);
  assert.match(shareApi,/campaign:reachContact\?"share-center-my-five":"share-center"/);
  assert.match(shareApi,/destination_path:asset\.destination_path/);
});


test("gift benefits and gift records enforce financial integrity",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925133406_lockliel_harden_gift_benefit_integrity.sql","utf8");

  assert.match(migration,/drop trigger if exists audit_entitlement_insert_trigger/);
  assert.match(migration,/reason not like 'gift-benefit:%'/);
  assert.match(migration,/reason like 'gift-benefit:%'[\s\S]*finance_admin/);
  assert.match(migration,/Benefit rules require an active product/);
  assert.match(migration,/Digital benefit rules require a protected product file/);
  assert.match(migration,/A Heart for the Lost gift benefit requires its release flag to be enabled/);

  const giftUpdateGrant=migration.match(/grant update \(([\s\S]*?)\) on table public\.gifts[\s\S]*?to authenticated;/)?.[1]||"";
  assert.match(giftUpdateGrant,/status/);
  assert.match(giftUpdateGrant,/received_at/);
  assert.doesNotMatch(giftUpdateGrant,/amount_cents/);
  assert.doesNotMatch(giftUpdateGrant,/provider_transaction_ref/);
  assert.doesNotMatch(giftUpdateGrant,/profile_id/);

  assert.match(migration,/Gift transaction identity and amount fields cannot be changed after creation/);
  assert.match(migration,/new\.received_at:=now\(\)/);
  assert.match(migration,/gift_record_changed/);
  assert.match(migration,/donor_identity_changed/);
});


test("orders and payment events are system-owned financial records",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925133825_lockliel_system_owned_orders_and_payment_events.sql","utf8");
  const ordersApi=fs.readFileSync("netlify/functions/lockliel-admin-orders.mjs","utf8");

  assert.match(migration,/drop policy if exists orders_finance_update/);
  assert.match(migration,/revoke update on table public\.orders[\s\S]*from authenticated/);
  assert.match(migration,/orders_total_matches_components/);
  assert.match(migration,/Order financial identity and totals cannot be changed after creation/);
  assert.match(migration,/Order payment provider cannot be replaced once recorded/);
  assert.match(migration,/Payment event identity cannot be changed after receipt/);
  assert.match(migration,/new\.processed_at:=coalesce/);
  assert.match(migration,/payment_events_safe_metadata_object/);
  assert.match(ordersApi,/order_fulfillment_events/);
  assert.doesNotMatch(ordersApi,/rest\/v1\/orders\?.*method:"PATCH"/s);
});


test("checkout sessions have immutable financial identity and terminal lifecycle",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925134028_lockliel_harden_checkout_session_integrity.sql","utf8");

  assert.match(migration,/checkout_sessions_amount_positive/);
  assert.match(migration,/checkout_sessions_currency_format/);
  assert.match(migration,/Checkout financial identity cannot be changed after creation/);
  assert.match(migration,/Checkout provider session reference cannot be replaced once recorded/);
  assert.match(migration,/Terminal checkout sessions cannot be reopened/);
  assert.match(migration,/new\.completed_at:=coalesce/);
  assert.match(migration,/checkout_session_status_changed/);
});

test("partner commitments keep amount and provider identity immutable",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925134147_lockliel_harden_partner_commitment_integrity.sql","utf8");

  assert.match(migration,/partner_commitments_amount_positive/);
  assert.match(migration,/partner_commitments_currency_format/);
  assert.match(migration,/Partnership commitment identity and amount fields cannot be changed after creation/);
  assert.match(migration,/Partnership payment provider cannot be replaced once recorded/);
  assert.match(migration,/Partnership subscription reference cannot be replaced once recorded/);
  assert.match(migration,/new\.started_at:=now\(\)/);
  assert.match(migration,/new\.cancelled_at:=now\(\)/);
  assert.match(migration,/partner_commitment_changed/);
  assert.match(migration,/donor_identity_changed/);
});


test("order items, shipping addresses, and fulfillment events are bounded system records",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925134352_lockliel_harden_fulfillment_record_integrity.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-orders.mjs","utf8");

  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.order_items[\s\S]*from authenticated/);
  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.order_shipping_addresses[\s\S]*from authenticated/);
  assert.match(migration,/order_items_unit_price_nonnegative/);
  assert.match(migration,/order_items_order_product_uidx/);
  assert.match(migration,/shipping_postal_code_length/);
  assert.match(migration,/fulfillment_tracking_length/);
  assert.match(migration,/fulfillment_note_event_requires_note/);
  assert.match(migration,/new\.actor_profile_id:=coalesce\(\(select auth\.uid\(\)\),new\.actor_profile_id\)/);
  assert.match(migration,/new\.created_at:=now\(\)/);
  assert.doesNotMatch(api,/actor_profile_id:s\.user\.id/);
});


test("privacy request lifecycle is database-owned and race-safe",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925134636_lockliel_harden_privacy_request_lifecycle.sql","utf8");
  const memberApi=fs.readFileSync("netlify/functions/lockliel-privacy.mjs","utf8");
  const adminApi=fs.readFileSync("netlify/functions/lockliel-admin-privacy.mjs","utf8");

  assert.match(migration,/privacy_requests_one_open_type_uidx/);
  assert.match(migration,/grant insert \([\s\S]*profile_id[\s\S]*request_type[\s\S]*status[\s\S]*member_note[\s\S]*\) on table public\.privacy_requests/);
  assert.match(migration,/grant update \([\s\S]*status[\s\S]*admin_note[\s\S]*\) on table public\.privacy_requests/);
  assert.match(migration,/Privacy request identity and member submission fields cannot be changed after submission/);
  assert.match(migration,/new\.handled_by:=actor/);
  assert.match(migration,/new\.resolved_at:=coalesce\(old\.resolved_at,now\(\)\)/);
  assert.match(migration,/Completed account deletion requests require documented processing details/);
  assert.doesNotMatch(adminApi,/handled_by:s\.user\.id/);
  assert.doesNotMatch(adminApi,/resolved_at:new Date/);
  assert.match(memberApi,/r\.status===409[\s\S]*already have an open request of this type/);
});


test("profile connection and finance cards are system-owned read models",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925134935_lockliel_system_owned_profile_cards.sql","utf8");
  const reinforce=fs.readFileSync("supabase/migrations/20260925134949_lockliel_read_only_profile_card_tables.sql","utf8");

  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.profile_connection_cards[\s\S]*from authenticated/);
  assert.match(migration,/grant select[\s\S]*on table public\.profile_connection_cards[\s\S]*to authenticated/);
  assert.match(migration,/revoke insert, update, delete[\s\S]*on table public\.profile_finance_cards[\s\S]*from authenticated/);
  assert.match(migration,/grant select[\s\S]*on table public\.profile_finance_cards[\s\S]*to authenticated/);
  assert.match(reinforce,/revoke all privileges on table public\.profile_connection_cards[\s\S]*from authenticated/);
  assert.match(reinforce,/grant select on table public\.profile_connection_cards[\s\S]*to authenticated/);
  assert.match(reinforce,/revoke all privileges on table public\.profile_finance_cards[\s\S]*from authenticated/);
  assert.match(reinforce,/grant select on table public\.profile_finance_cards[\s\S]*to authenticated/);
});


test("tables without delete workflows do not retain dormant DELETE privileges",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925135309_lockliel_remove_dormant_delete_privileges.sql","utf8");

  for(const table of [
    "connection_requests",
    "courses",
    "faith_profiles",
    "founder_orientation_progress",
    "gifts",
    "group_members",
    "groups",
    "leader_assignments",
    "leader_profiles",
    "lesson_assets",
    "lesson_progress",
    "lessons",
    "media_progress",
    "privacy_requests",
    "share_assets"
  ]){
    assert.match(migration,new RegExp("revoke delete on table public\\."+table+" from authenticated"));
  }
});


test("group records are staff-managed while leaders use operational group tools",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925135715_lockliel_staff_owned_group_records.sql","utf8");
  const leaderApi=fs.readFileSync("netlify/functions/lockliel-leader.mjs","utf8");
  const checkinApi=fs.readFileSync("netlify/functions/lockliel-group-checkin.mjs","utf8");

  const insertGrant=migration.match(/grant insert \(([\s\S]*?)\) on table public\.groups to authenticated;/)?.[1]||"";
  const updateGrant=migration.match(/grant update \(([\s\S]*?)\) on table public\.groups to authenticated;/)?.[1]||"";

  const insertColumns=insertGrant.split(",").map(value=>value.trim()).filter(Boolean);
  const updateColumns=updateGrant.split(",").map(value=>value.trim()).filter(Boolean);
  assert.ok(!insertColumns.includes("id"));
  assert.ok(!insertColumns.includes("created_at"));
  assert.ok(!updateColumns.includes("id"));
  assert.ok(!updateColumns.includes("created_at"));
  assert.match(migration,/\['super_admin','admin','discipleship_admin'\]/);
  assert.match(migration,/Group identity fields cannot be changed after creation/);
  assert.match(leaderApi,/request\.method!==\"GET\"/);
  assert.match(checkinApi,/group_weekly_checkins/);
  assert.doesNotMatch(checkinApi,/method:\"PATCH\"[\s\S]*rest\/v1\/groups/);
});


test("group membership identity and weekly check-in timestamps are database-owned",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925135825_lockliel_harden_group_membership_identity.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-group-checkin.mjs","utf8");

  const insertGrant=migration.match(/grant insert \(([\s\S]*?)\) on table public\.group_members to authenticated;/)?.[1]||"";
  const updateGrant=migration.match(/grant update \(([\s\S]*?)\) on table public\.group_members to authenticated;/)?.[1]||"";
  const insertColumns=insertGrant.split(",").map(value=>value.trim()).filter(Boolean);
  const updateColumns=updateGrant.split(",").map(value=>value.trim()).filter(Boolean);

  assert.ok(!insertColumns.includes("joined_at"));
  assert.ok(!updateColumns.includes("group_id"));
  assert.ok(!updateColumns.includes("profile_id"));
  assert.ok(!updateColumns.includes("joined_at"));
  assert.match(migration,/Group membership identity cannot be changed after creation/);
  assert.doesNotMatch(api,/updated_at:new Date\(\)\.toISOString\(\)/);
});


test("group creation and staff changes are audited with compact operational metadata",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925140153_lockliel_audit_group_record_changes.sql","utf8");

  assert.match(migration,/group_created/);
  assert.match(migration,/group_changed/);
  assert.match(migration,/leader_id_from/);
  assert.match(migration,/leader_id_to/);
  assert.match(migration,/status_from/);
  assert.match(migration,/status_to/);
  assert.match(migration,/name_changed/);
  assert.match(migration,/location_changed/);
  assert.match(migration,/language_changed/);
  assert.match(migration,/after insert or update of/);
});


test("leader approval and assignment actors are database-owned",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925140411_lockliel_system_owned_leadership_actors.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-leaders.mjs","utf8");

  const assignmentInsert=migration.match(/grant insert \(([\s\S]*?)\) on table public\.leader_assignments to authenticated;/)?.[1]||"";
  const assignmentUpdate=migration.match(/grant update \(([\s\S]*?)\) on table public\.leader_assignments to authenticated;/)?.[1]||"";
  const profileInsert=migration.match(/grant insert \(([\s\S]*?)\) on table public\.leader_profiles to authenticated;/)?.[1]||"";
  const profileUpdate=migration.match(/grant update \(([\s\S]*?)\) on table public\.leader_profiles to authenticated;/)?.[1]||"";

  assert.doesNotMatch(assignmentInsert,/assigned_by/);
  assert.doesNotMatch(assignmentUpdate,/assigned_by/);
  assert.doesNotMatch(profileInsert,/approved_by/);
  assert.doesNotMatch(profileUpdate,/approved_by/);
  assert.doesNotMatch(api,/approved_by:uid/);
  assert.doesNotMatch(api,/assigned_by:uid/);
});


test("weekly check-in submitter is database-owned and preserved across corrections",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925140652_lockliel_system_owned_group_checkin_submitter.sql","utf8");
  const dedicatedApi=fs.readFileSync("netlify/functions/lockliel-group-checkin.mjs","utf8");
  const groupsApi=fs.readFileSync("netlify/functions/lockliel-groups.mjs","utf8");

  const insertGrant=migration.match(/grant insert \(([\s\S]*?)\) on table public\.group_weekly_checkins to authenticated;/)?.[1]||"";
  assert.doesNotMatch(insertGrant,/submitted_by/);
  assert.match(migration,/new\.submitted_by:=\(select auth\.uid\(\)\)/);
  assert.match(migration,/new\.submitted_by:=old\.submitted_by/);
  assert.match(migration,/old\.group_id is distinct from new\.group_id/);
  assert.match(migration,/old\.week_start is distinct from new\.week_start/);
  assert.doesNotMatch(dedicatedApi,/submitted_by:uid/);
  assert.doesNotMatch(groupsApi,/submitted_by:uid/);
});


test("fulfillment event actor identity is database-owned",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925140858_lockliel_system_owned_fulfillment_actor.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-orders.mjs","utf8");
  const integrity=fs.readFileSync("supabase/migrations/20260925134352_lockliel_harden_fulfillment_record_integrity.sql","utf8");

  const insertGrant=migration.match(/grant insert \(([\s\S]*?)\) on table public\.order_fulfillment_events to authenticated;/)?.[1]||"";
  assert.doesNotMatch(insertGrant,/actor_profile_id/);
  assert.doesNotMatch(api,/actor_profile_id:s\.user\.id/);
  assert.match(integrity,/new\.actor_profile_id:=coalesce\(\(select auth\.uid\(\)\),new\.actor_profile_id\)/);
  assert.match(integrity,/new\.created_at:=now\(\)/);
});


test("member-generated text and JSON payloads are bounded in PostgreSQL",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925141105_lockliel_bound_member_generated_payloads.sql","utf8");
  const journey=fs.readFileSync("netlify/functions/lockliel-journey.mjs","utf8");

  assert.match(migration,/connection_requests_message_length/);
  assert.match(migration,/char_length\(message\)<=5000/);
  assert.match(migration,/reach_contacts_relationship_context_length/);
  assert.match(migration,/char_length\(relationship_context\)<=500/);
  assert.match(migration,/reach_contacts_private_notes_length/);
  assert.match(migration,/char_length\(private_notes\)<=3000/);
  assert.match(migration,/jsonb_typeof\(worksheet_answers\)='object'/);
  assert.match(migration,/pg_column_size\(worksheet_answers\)<=65536/);
  assert.match(migration,/jsonb_typeof\(metadata\)='object'/);
  assert.match(migration,/pg_column_size\(metadata\)<=16384/);
  assert.match(journey,/Array\.isArray\(rawWorksheetAnswers\)/);
  assert.match(journey,/worksheetBytes>60000/);
});


test("gift-benefit access requires a currently valid qualifying gift without deleting entitlement history",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925151920_lockliel_validate_gift_benefit_access.sql","utf8");

  assert.match(migration,/gifts_status_check/);
  assert.match(migration,/'refunded'/);
  assert.match(migration,/'chargeback'/);
  assert.match(migration,/'reversed'/);
  assert.match(migration,/entitlement_is_current/);
  assert.match(migration,/g\.status in \('succeeded','paid','completed'\)/);
  assert.match(migration,/g\.amount_cents>=br\.minimum_gift_cents/);
  assert.match(migration,/app_private\.entitlement_is_current\([\s\S]*profile_id[\s\S]*product_id[\s\S]*reason/);
  assert.match(migration,/bucket_id='member-resources'/);
  assert.doesNotMatch(migration,/delete from public\.entitlements/);
});


test("benefit rule status changes are audited and date windows stay valid",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925152054_lockliel_audit_benefit_rule_status.sql","utf8");

  assert.match(migration,/benefit_rules_date_window_check/);
  assert.match(migration,/ends_at>=starts_at/);
  assert.match(migration,/benefit_rule_status_changed/);
  assert.match(migration,/status_from/);
  assert.match(migration,/status_to/);
  assert.match(migration,/after update of status/);
});

test("launch verification audits record state changes without duplicating note text",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925152155_lockliel_minimize_launch_verification_audit.sql","utf8");

  assert.match(migration,/launch_verification_changed/);
  assert.match(migration,/verified_from/);
  assert.match(migration,/verified_to/);
  assert.match(migration,/note_changed/);
  assert.doesNotMatch(migration,/'note',new\.note/);
  assert.match(migration,/new\.verified_by:=case/);
  assert.match(migration,/new\.verified_at:=case/);
  assert.match(migration,/new\.updated_at:=now\(\)/);
});


test("Auth email changes synchronize the profile without exposing email values in audit metadata",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925152507_lockliel_sync_profile_email_from_auth.sql","utf8");
  const auditMetadata=migration.match(/jsonb_build_object\([\s\S]*?\)/)?.[0]||"";

  assert.match(migration,/after update of email[\s\S]*on auth\.users/);
  assert.match(migration,/set email=lower\(trim\(new\.email\)\)/);
  assert.match(migration,/account_email_changed/);
  assert.match(auditMetadata,/email_changed/);
  assert.doesNotMatch(auditMetadata,/old\.email|new\.email/);
});

test("account security changes email and password through Supabase Auth with MFA protection",()=>{
  const api=fs.readFileSync("netlify/functions/lockliel-account-security.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/security/security-client.tsx","utf8");

  assert.match(api,/hasVerifiedTotp\(s\.user\).*sessionAal\(s\.access\)!=="aal2"/s);
  assert.match(api,/SUPABASE_URL\+"\/auth\/v1\/user"/);
  assert.match(api,/action==="changeEmail"/);
  assert.match(api,/action==="changePassword"/);
  assert.match(api,/rateLimit/);
  assert.doesNotMatch(api,/rest\/v1\/profiles/);
  assert.match(client,/Current sign-in email/);
  assert.match(client,/Request email change/);
  assert.match(client,/Change password/);
  assert.match(client,/\/api\/lockliel-auth\/account-security/);
});


test("confirmed email changes relink only unowned records and password changes are audited without password material",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925153043_lockliel_complete_account_identity_lifecycle.sql","utf8");
  const resetApi=fs.readFileSync("netlify/functions/lockliel-reset-password.mjs","utf8");
  const resetForm=fs.readFileSync("app/my-lockliel/reset-password/reset-password-form.tsx","utf8");
  const passwordAudit=migration.slice(migration.indexOf("account_password_changed"));
  const passwordMetadata=passwordAudit.match(/jsonb_build_object\([\s\S]*?\)/)?.[0]||"";

  assert.match(migration,/link_confirmed_financial_records_for_user/);
  assert.match(migration,/new\.email_confirmed_at is not null/);
  assert.match(migration,/Your sign-in email was updated/);
  assert.match(migration,/account_password_changed/);
  assert.match(migration,/after update of encrypted_password/);
  assert.match(passwordMetadata,/password_changed/);
  assert.doesNotMatch(passwordMetadata,/encrypted_password/);
  assert.match(resetApi,/password\.length>128/);
  assert.match(resetForm,/maxLength=\{128\}/);
});


test("active Founders 50 hosts qualify for group hosting without gaining broader admin authority",()=>{
  const eligibility=fs.readFileSync("supabase/migrations/20260925154111_lockliel_founders_active_host_group_eligibility.sql","utf8");
  const candidates=fs.readFileSync("supabase/migrations/20260925154343_lockliel_sanitized_group_host_candidates.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/groups-admin-client.tsx","utf8");

  assert.match(eligibility,/is_active_founders50_host/);
  assert.match(eligibility,/f\.status='active_host'/);
  assert.match(eligibility,/or app_private\.is_active_founders50_host\(new\.leader_id\)/);
  assert.match(eligibility,/or app_private\.is_active_founders50_host\(new\.profile_id\)/);
  assert.match(eligibility,/Reassign active group leadership before removing this Founders 50 active-host status/);
  assert.match(candidates,/lockliel_group_host_candidates/);
  assert.match(candidates,/security invoker/);
  assert.match(candidates,/discipleship_admin/);
  assert.match(api,/rest\/v1\/rpc\/lockliel_group_host_candidates/);
  assert.match(api,/active Founders 50 host/);
  assert.match(client,/Choose approved leader \/ host/);
  assert.doesNotMatch(eligibility,/staff_roles/);
});


test("Data API grants fail closed for anonymous users and future public objects",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925155851_lockliel_fail_closed_data_api_grants.sql","utf8");

  assert.match(migration,/revoke all privileges on all tables in schema public from anon/);
  assert.match(migration,/revoke all privileges on all sequences in schema public from anon/);
  assert.match(migration,/revoke truncate, references, trigger, maintain[\s\S]*on all tables in schema public[\s\S]*from authenticated/);
  assert.match(migration,/alter default privileges for role postgres in schema public[\s\S]*revoke all privileges on tables from anon, authenticated/);
  assert.match(migration,/alter default privileges for role postgres in schema public[\s\S]*revoke all privileges on sequences from anon, authenticated/);
  assert.match(migration,/revoke execute on functions from public, anon, authenticated/);
  assert.doesNotMatch(migration,/revoke all privileges on all tables in schema public from authenticated/);
});


test("group leadership eligibility changes serialize against active host and leader assignments",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925160443_lockliel_serialize_group_leadership_eligibility.sql","utf8");

  assert.match(migration,/protect_active_leader_responsibilities/);
  assert.match(migration,/validate_group_leader_approval/);
  assert.match(migration,/validate_group_leadership_membership/);
  assert.match(migration,/protect_active_founders_host_responsibility/);
  assert.match(migration,/pg_advisory_xact_lock/);
  assert.match(migration,/hashtextextended/);
  assert.match(migration,/gm\.status='active'/);
  assert.match(migration,/gm\.role in \('leader','host'\)/);
  assert.match(migration,/g\.status in \('forming','active'\)/);
  assert.match(migration,/Reassign active group leadership or hosting before deactivating this leader/);
  assert.match(migration,/must retain a group-leader compatible role/);
  assert.match(migration,/Reassign active group leadership before removing this Founders 50 active-host status/);
});


test("manual launch readiness verification requires documented evidence",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925160735_lockliel_require_launch_verification_evidence.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/readiness-admin-client.tsx","utf8");

  assert.match(migration,/launch_verifications_verified_note_required/);
  assert.match(migration,/char_length\(trim\(note\)\) between 20 and 3000/);
  assert.match(migration,/Verified launch checks require a verification note of at least 20 characters/);
  assert.match(migration,/new\.note:=nullif\(trim\(coalesce\(new\.note,''\)\),''\)/);
  assert.match(api,/verified&&note\.length<20/);
  assert.match(api,/note:note\|\|null/);
  assert.match(api,/note:verificationMap\.auth_url_configuration\?\.note\|\|""/);
  assert.match(api,/note:verificationMap\.custom_smtp\?\.note\|\|""/);
  assert.match(client,/Verification evidence/);
  assert.match(client,/trimmed\.length>=20/);
  assert.match(client,/body:JSON\.stringify\(\{key,verified,note\}\)/);
});


test("first super administrator bootstrap is serialized and rejects invalid auth accounts",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925161117_lockliel_serialize_first_super_admin_bootstrap.sql","utf8");

  assert.match(migration,/bootstrap_first_super_admin/);
  assert.match(migration,/pg_advisory_xact_lock/);
  assert.match(migration,/lockliel:first-super-admin/);
  assert.match(migration,/email_confirmed_at/);
  assert.match(migration,/deleted_at/);
  assert.match(migration,/banned_until/);
  assert.match(migration,/A super administrator already exists/);
  assert.match(migration,/revoke execute on function app_private\.bootstrap_first_super_admin\(uuid\)/);
});


test("launch readiness includes an admin-only aggregate database integrity health check",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925173856_lockliel_admin_integrity_health_rpc.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-readiness.mjs","utf8");

  assert.match(migration,/lockliel_integrity_health_internal/);
  assert.match(migration,/Administrator access required/);
  assert.match(migration,/profiles_without_journey/);
  assert.match(migration,/reach_count_mismatches/);
  assert.match(migration,/connection_count_mismatches/);
  assert.match(migration,/ineligible_primary_group_leaders/);
  assert.match(migration,/ineligible_group_leadership_memberships/);
  assert.match(migration,/primary_leader_membership_mismatches/);
  assert.match(migration,/checkout_state_mismatch/);
  assert.match(migration,/digital_book_release_mismatch/);
  assert.match(migration,/book_benefit_release_mismatch/);
  assert.match(migration,/security invoker/);
  assert.match(migration,/revoke execute on function public\.lockliel_integrity_health\(\)[\s\S]*from public, anon/);
  assert.match(api,/rpc\/lockliel_integrity_health/);
  assert.match(api,/Database integrity health/);
  assert.match(api,/integrityHealth/);
});


test("integrity health uses PostgreSQL boolean aggregates rather than unsupported max(boolean)",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925174244_lockliel_fix_integrity_health_boolean_aggregation.sql","utf8");

  assert.match(migration,/bool_or\(f\.enabled\)/);
  assert.doesNotMatch(migration,/max\(f\.enabled\)/);
  assert.match(migration,/partner_checkout/);
  assert.match(migration,/digital_book_delivery/);
  assert.match(migration,/heart_book_gift_benefit/);
});


test("privacy request history survives profile deletion without weakening member ownership",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925174623_lockliel_preserve_privacy_request_after_account_deletion.sql","utf8");
  const adminUi=fs.readFileSync("app/my-lockliel/admin/privacy-admin-client.tsx","utf8");

  assert.match(migration,/alter column profile_id drop not null/);
  assert.match(migration,/foreign key\(profile_id\)[\s\S]*on delete set null/);
  assert.match(migration,/Privacy request profile is required at submission/);
  assert.match(migration,/system_fk_unlink/);
  assert.match(migration,/actor is null/);
  assert.match(migration,/new\.profile_id is null/);
  assert.match(migration,/Administrator access required for privacy request processing/);
  assert.match(adminUi,/processing record is retained/i);
});


test("account deletion completion requires session, Auth, and personal-data processing checks",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925174856_lockliel_require_account_deletion_processing_checks.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-privacy.mjs","utf8");
  const client=fs.readFileSync("app/my-lockliel/admin/privacy-admin-client.tsx","utf8");

  assert.match(migration,/deletion_sessions_revoked boolean not null default false/);
  assert.match(migration,/deletion_auth_account_processed boolean not null default false/);
  assert.match(migration,/deletion_personal_data_processed boolean not null default false/);
  assert.match(migration,/privacy_requests_completed_deletion_checks/);
  assert.match(migration,/Completed account deletion requests require all deletion processing checks/);
  assert.match(migration,/Members cannot change staff processing fields/);
  assert.match(api,/deletionSessionsRevoked/);
  assert.match(api,/deletionAuthAccountProcessed/);
  assert.match(api,/deletionPersonalDataProcessed/);
  assert.match(api,/Complete all account-deletion processing checks/);
  assert.match(client,/Deletion processing checklist/);
  assert.match(client,/already-issued JWT/);
  assert.match(client,/Active sessions have been revoked or signed out/);
  assert.match(client,/Supabase Auth account processing is complete/);
  assert.match(client,/personal-data processing is complete/);
});


test("server sessions fail closed when the Supabase Auth session row is gone",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925175229_lockliel_require_active_session_for_staff_access.sql","utf8");
  const core=fs.readFileSync("netlify/lib/lockliel-core.mjs","utf8");

  assert.match(migration,/current_session_is_active/);
  assert.match(migration,/auth\.sessions/);
  assert.match(migration,/session_id/);
  assert.match(migration,/s\.not_after is null or s\.not_after>now\(\)/);
  assert.match(migration,/security invoker/);
  assert.match(migration,/app_private\.current_session_is_active\(\)[\s\S]*aal2/);
  assert.match(core,/function activeSession/);
  assert.match(core,/rpc\/lockliel_current_session_active/);
  assert.match(core,/if\(user&&!\(await activeSession\(access\)\)\)/);
  assert.match(core,/refreshed=null/);
});


test("every Lockliel server route is authenticated unless explicitly public and rate-limited",()=>{
  const publicRoutes=new Set([
    "lockliel-accept-session.mjs",
    "lockliel-founders50.mjs",
    "lockliel-login.mjs",
    "lockliel-logout.mjs",
    "lockliel-recover.mjs",
    "lockliel-referral-redirect.mjs",
    "lockliel-reset-password.mjs",
    "lockliel-signup.mjs"
  ]);

  const files=fs.readdirSync("netlify/functions")
    .filter(name=>name.startsWith("lockliel-")&&name.endsWith(".mjs"));

  assert.ok(files.length>=40);

  for(const name of files){
    const source=fs.readFileSync("netlify/functions/"+name,"utf8");

    if(publicRoutes.has(name)){
      assert.match(source,/rateLimit/,name+" must be rate-limited because it is intentionally public.");
      continue;
    }

    assert.match(source,/\brequireSession\b/,name+" must use the shared Lockliel session guard.");
  }
});


test("public Auth handoffs bind access and refresh tokens to the same user and pin trusted redirects",()=>{
  const core=fs.readFileSync("netlify/lib/lockliel-core.mjs","utf8");
  const accept=fs.readFileSync("netlify/functions/lockliel-accept-session.mjs","utf8");
  const reset=fs.readFileSync("netlify/functions/lockliel-reset-password.mjs","utf8");
  const signup=fs.readFileSync("netlify/functions/lockliel-signup.mjs","utf8");
  const recover=fs.readFileSync("netlify/functions/lockliel-recover.mjs","utf8");
  const referral=fs.readFileSync("netlify/functions/lockliel-referral-redirect.mjs","utf8");

  assert.match(core,/LOCKLIEL_APP_ORIGIN="https:\/\/lockliel\.com"/);
  assert.match(core,/function validatedTokenPair/);
  assert.match(core,/refreshSession\(refresh\)/);
  assert.match(core,/refreshedUser\.id!==accessUser\.id/);

  assert.match(accept,/validatedTokenPair\(access,refresh\)/);
  assert.match(accept,/sessionCookies\(pair\.session\)/);
  assert.doesNotMatch(accept,/sessionCookies\(\{access_token:access,refresh_token:refresh/);

  assert.match(reset,/validatedTokenPair\(access,refresh\)/);
  assert.match(reset,/Authorization:"Bearer "\+pair\.session\.access_token/);
  assert.match(reset,/validatedTokenPair\([\s\S]*pair\.session\.access_token[\s\S]*pair\.session\.refresh_token/);
  assert.match(reset,/requiresSignIn:true/);

  assert.match(signup,/LOCKLIEL_APP_ORIGIN\+"\/my-lockliel\/sign-in\?confirmed=1"/);
  assert.doesNotMatch(signup,/new URL\([\s\S]*request\.url/);
  assert.match(recover,/LOCKLIEL_APP_ORIGIN\+"\/my-lockliel\/reset-password"/);
  assert.doesNotMatch(recover,/new URL\([\s\S]*request\.url/);

  assert.match(referral,/function safeLocalDestination/);
  assert.match(referral,/raw\.startsWith\("\/"\)/);
  assert.match(referral,/raw\.startsWith\("\/\/"\)/);
  assert.match(referral,/Location:location/);
  assert.doesNotMatch(referral,/Location:dest\.toString\(\)/);
});


test("public Auth inputs are bounded before reaching Supabase Auth",()=>{
  const signup=fs.readFileSync("netlify/functions/lockliel-signup.mjs","utf8");
  const login=fs.readFileSync("netlify/functions/lockliel-login.mjs","utf8");
  const recover=fs.readFileSync("netlify/functions/lockliel-recover.mjs","utf8");
  const form=fs.readFileSync("app/my-lockliel/auth-form.tsx","utf8");
  const forgot=fs.readFileSync("app/my-lockliel/forgot-password/forgot-password-form.tsx","utf8");

  assert.match(signup,/firstName\.length>120/);
  assert.match(signup,/lastName\.length>120/);
  assert.match(signup,/email\.length>254/);
  assert.match(signup,/password\.length>128/);
  assert.match(signup,/\^\[a-z0-9\]\{6,20\}\$/);
  assert.match(login,/email\.length>254/);
  assert.match(login,/password\.length>128/);
  assert.match(recover,/email\.length>254/);
  assert.match(form,/maxLength=\{120\}/);
  assert.match(form,/maxLength=\{254\}/);
  assert.match(form,/maxLength=\{128\}/);
  assert.match(forgot,/maxLength=\{254\}/);
});


test("referral Edge Function rate-limits direct calls and only returns local destinations",()=>{
  const edge=fs.readFileSync("supabase/functions/track-referral/index.ts","utf8");

  assert.match(edge,/function clientIp/);
  assert.match(edge,/consume_public_rate_limit/);
  assert.match(edge,/scope_input:"referral_visit_ip"/);
  assert.match(edge,/window_seconds:3600/);
  assert.match(edge,/max_hits:600/);
  assert.match(edge,/status:429/);
  assert.match(edge,/function safeDestination/);
  assert.match(edge,/!raw\.startsWith\("\/"\)\|\|raw\.startsWith\("\/\/"\)/);
  assert.match(edge,/parsed\.origin!=="https:\/\/lockliel\.com"/);
  assert.match(edge,/destination:safeDestination\(link\.destination_path\)/);
});


test("lesson external URLs are HTTPS-only and the retired Grip importer stays disabled",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925213602_lockliel_require_https_lesson_external_urls.sql","utf8");
  const resource=fs.readFileSync("netlify/functions/lockliel-lesson-resource.mjs","utf8");
  const admin=fs.readFileSync("netlify/functions/lockliel-admin-content.mjs","utf8");
  const tombstone=fs.readFileSync("supabase/functions/import-grip-pdfs/index.ts","utf8");

  assert.match(migration,/lesson_assets_external_url_https/);
  assert.match(migration,/external_url ~\* '\^https:\/\/\[\^\[:space:\]\]\+\$'/);
  assert.match(migration,/char_length\(external_url\)<=2000/);
  assert.match(migration,/Lesson external URLs must use HTTPS/);

  assert.match(resource,/function safeHttpsUrl/);
  assert.match(resource,/url\.protocol!=="https:"/);
  assert.match(resource,/url\.username\|\|url\.password/);
  assert.match(resource,/Location:location/);

  assert.match(admin,/External lesson URLs must use HTTPS without embedded credentials/);
  assert.match(admin,/safeHttpsUrl\(rawExternalUrl\)/);

  assert.match(tombstone,/status:410/);
  assert.match(tombstone,/permanently disabled/);
});


test("public rate-limit history self-cleans beyond the maximum enforcement window",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925214004_lockliel_bound_public_rate_limit_history.sql","utf8");

  assert.match(migration,/public_rate_limits_updated_at_idx/);
  assert.match(migration,/window_seconds>86400/);
  assert.match(migration,/updated_at<now\(\)-interval '48 hours'/);
  assert.match(migration,/limit 500/);
  assert.match(migration,/current_hits=1/);
  assert.match(migration,/left\(key_hash_input,1\)='0'/);
  assert.match(migration,/grant execute on function public\.consume_public_rate_limit[\s\S]*to service_role/);
});


test("public lead and Founders intake never attach records to a profile from unverified submitted email",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925214457_lockliel_link_public_records_only_after_email_confirmation.sql","utf8");
  const atomic=fs.readFileSync("supabase/migrations/20260926003840_lockliel_atomic_public_intake_workflows.sql","utf8");
  const capture=fs.readFileSync("supabase/functions/capture-lead/index.ts","utf8");
  const founders=fs.readFileSync("supabase/functions/submit-founders50/index.ts","utf8");

  assert.match(migration,/link_confirmed_nonfinancial_records_for_user/);
  assert.match(migration,/email_confirmed_at is not null/);
  assert.match(migration,/linked_profile_id is null/);
  assert.match(migration,/profile_id is null/);
  assert.match(migration,/link_nonfinancial_records_on_email_confirmation_trigger/);
  assert.match(migration,/link_nonfinancial_records_for_confirmed_new_profile_trigger/);
  assert.match(migration,/confirmed_email_nonfinancial_records_linked/);

  assert.match(atomic,/public\.upsert_public_lead_contact\([\s\S]*null/);
  assert.match(atomic,/insert into public\.founders50_applications\([\s\S]*profile_id[\s\S]*values\([\s\S]*null/);
  assert.doesNotMatch(capture,/rest\/v1\/profiles\?email=eq/);
  assert.doesNotMatch(capture,/rest\/v1\/profile_tags/);
  assert.doesNotMatch(founders,/rest\/v1\/profiles\?email=eq/);
  assert.doesNotMatch(capture,/linked_profile_input/);
  assert.doesNotMatch(founders,/linked_profile_input/);
  assert.match(founders,/!flagRes\.ok\|\|flags\?\.\[0\]\?\.enabled!==true/);
});


test("unverified pre-account consent never silently enables member communication preferences",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925214922_lockliel_keep_preaccount_consent_separate.sql","utf8");
  const sourceLinkMigration=fs.readFileSync("supabase/migrations/20260925214457_lockliel_link_public_records_only_after_email_confirmation.sql","utf8");

  assert.match(migration,/drop trigger if exists on_lead_contact_sync_consent/);
  assert.match(migration,/sync_lead_consent_to_preferences/);
  assert.match(migration,/return new/);
  assert.doesNotMatch(migration,/update public\.communication_preferences/);
  assert.match(sourceLinkMigration,/confirmed_email_nonfinancial_records_linked/);
});


test("legacy email-only public record linkers are permanently removed",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260925215110_lockliel_remove_legacy_email_only_linkers.sql","utf8");

  assert.match(migration,/drop function if exists app_private\.link_existing_founders50_application\(\)/);
  assert.match(migration,/drop function if exists app_private\.link_existing_lead_contact\(\)/);
  assert.doesNotMatch(migration,/cascade/i);
});


test("Founder orientation completion creates only one completion task and notification",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926000636_lockliel_dedupe_founder_orientation_completion.sql","utf8");

  assert.match(migration,/task_type='founder_orientation_complete'/);
  assert.match(migration,/where not exists\([\s\S]*notification_type='founders50'[\s\S]*title='Founders 50 orientation complete'/);
  assert.doesNotMatch(migration,/f\.status in \('open','in_progress'\)/);
  assert.match(migration,/status in \('accepted','orientation'\)/);
});


test("fulfillment events are idempotent for order stages and shipment tracking",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926000830_lockliel_idempotent_fulfillment_events.sql","utf8");
  const api=fs.readFileSync("netlify/functions/lockliel-admin-orders.mjs","utf8");

  assert.match(migration,/order_fulfillment_one_stage_uidx/);
  assert.match(migration,/event_type in \('processing','packed','delivered','fulfilled'\)/);
  assert.match(migration,/order_fulfillment_shipment_uidx/);
  assert.match(migration,/coalesce\(tracking_number,''\)/);
  assert.match(migration,/where event_type='shipped'/);
  assert.match(api,/r\.status===409[\s\S]*already recorded for this order/);
});


test("recurring partner subscription references are provider-unique",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926001005_lockliel_unique_partner_subscription_refs.sql","utf8");

  assert.match(migration,/partner_commitments_provider_subscription_uidx/);
  assert.match(migration,/\(provider,provider_subscription_ref\)/);
  assert.match(migration,/where provider_subscription_ref is not null/);
});


test("order money fields cannot be negative",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926001148_lockliel_nonnegative_order_totals.sql","utf8");

  assert.match(migration,/orders_subtotal_nonnegative/);
  assert.match(migration,/subtotal_cents>=0/);
  assert.match(migration,/orders_shipping_nonnegative/);
  assert.match(migration,/shipping_cents>=0/);
  assert.match(migration,/orders_tax_nonnegative/);
  assert.match(migration,/tax_cents>=0/);
  assert.match(migration,/orders_total_nonnegative/);
  assert.match(migration,/total_cents>=0/);
});


test("one inviter cannot link the same member to multiple My Five rows",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926001333_lockliel_unique_linked_my_five_member.sql","utf8");

  assert.match(migration,/reach_contacts_owner_linked_profile_uidx/);
  assert.match(migration,/\(owner_id,linked_profile_id\)/);
  assert.match(migration,/where linked_profile_id is not null/);
});


test("referral links can only target their approved active Share Center asset route",()=>{
  const referral=fs.readFileSync("supabase/migrations/20260926001516_lockliel_bind_referral_destination_to_asset.sql","utf8");
  const assets=fs.readFileSync("supabase/migrations/20260926001548_lockliel_local_share_asset_destinations.sql","utf8");
  const redirect=fs.readFileSync("netlify/functions/lockliel-referral-redirect.mjs","utf8");

  assert.match(referral,/sa\.destination_path=referral_links\.destination_path/);
  assert.match(referral,/sa\.status='active'/);
  assert.match(referral,/left\(destination_path,2\)<>'\/\/'/);
  assert.match(assets,/share_assets_destination_local_path/);
  assert.match(assets,/left\(destination_path,2\)<>'\/\/'/);
  assert.match(redirect,/safeLocalDestination/);
  assert.match(redirect,/raw\.startsWith\("\/\/"\)/);
});


test("Founders 50 allows only one non-terminal application per email or linked profile",()=>{
  const uniqueness=fs.readFileSync("supabase/migrations/20260926001759_lockliel_one_active_founders_application.sql","utf8");
  const atomic=fs.readFileSync("supabase/migrations/20260926003840_lockliel_atomic_public_intake_workflows.sql","utf8");
  const edge=fs.readFileSync("supabase/functions/submit-founders50/index.ts","utf8");

  assert.match(uniqueness,/founders50_one_active_email_uidx/);
  assert.match(uniqueness,/on public\.founders50_applications\(email\)/);
  assert.match(uniqueness,/status not in \('withdrawn','declined'\)/);
  assert.match(uniqueness,/founders50_one_active_profile_uidx/);
  assert.match(uniqueness,/profile_id is not null/);
  assert.match(atomic,/fa\.status not in \('withdrawn','declined'\)/);
  assert.match(atomic,/when unique_violation/);
  assert.match(atomic,/submit_public_founders50_application_atomic/);
  assert.match(edge,/rpc\/submit_public_founders50_application_atomic/);
  assert.match(edge,/duplicate:Boolean\(result\?\.is_duplicate\)/);
});


test("non-null CRM source references are idempotent per lead and source type",()=>{
  const uniqueness=fs.readFileSync("supabase/migrations/20260926002052_lockliel_unique_referenced_lead_sources.sql","utf8");
  const atomic=fs.readFileSync("supabase/migrations/20260926003840_lockliel_atomic_public_intake_workflows.sql","utf8");

  assert.match(uniqueness,/lead_sources_unique_referenced_event_uidx/);
  assert.match(uniqueness,/\(lead_id,source_type,source_ref\)/);
  assert.match(uniqueness,/where source_ref is not null/);
  assert.match(atomic,/on conflict\(lead_id,source_type,source_ref\)/);
  assert.match(atomic,/return query select _lead_id, \(_source_id is null\)/);
  assert.match(atomic,/pg_advisory_xact_lock/);
});


test("gift benefit date windows cannot end before they start",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926002609_lockliel_valid_benefit_rule_window.sql","utf8");

  assert.match(migration,/benefit_rules_valid_date_window/);
  assert.match(migration,/starts_at is null/);
  assert.match(migration,/ends_at is null/);
  assert.match(migration,/starts_at<=ends_at/);
});

test("member messages require a meaningful bounded body",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926002734_lockliel_require_meaningful_message_body.sql","utf8");

  assert.match(migration,/messages_body_check/);
  assert.match(migration,/char_length\(trim\(body\)\)>=1/);
  assert.match(migration,/char_length\(body\)<=5000/);
});


test("staff notes require a meaningful bounded body",()=>{
  const migration=fs.readFileSync("supabase/migrations/20260926002837_lockliel_require_meaningful_staff_note_body.sql","utf8");

  assert.match(migration,/member_staff_notes_body_check/);
  assert.match(migration,/char_length\(trim\(body\)\)>=1/);
  assert.match(migration,/char_length\(body\)<=5000/);
});

