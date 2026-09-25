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
  const notifyMigration=fs.readFileSync("supabase/migrations/20260925111300_lockliel_group_transition_notifications.sql","utf8");

  assert.match(migration,/leave_or_change_group/);
  assert.match(migration,/add column if not exists left_at timestamptz/);
  assert.match(migration,/group_membership_changed/);
  assert.match(memberApi,/requestGroupChange/);
  assert.match(memberApi,/requestedGroupId:groupId/);
  assert.match(memberUi,/Need to leave or change groups/);
  assert.match(adminApi,/resolveGroupChange/);
  assert.match(adminApi,/Reassign group leadership before moving or ending this leader\/host membership/);
  assert.match(adminApi,/status:"inactive",left_at:now/);
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
  assert.doesNotMatch(integrity,/grant update \([\s\S]*owner_id/);
  assert.doesNotMatch(integrity,/grant update \([\s\S]*linked_profile_id/);
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
  const adminApi=fs.readFileSync("netlify/functions/lockliel-admin-groups.mjs","utf8");
  assert.match(migration,/if new\.status='active' then[\s\S]*new\.left_at:=null/);
  assert.match(migration,/old\.status='active'[\s\S]*new\.left_at:=now\(\)/);
  assert.match(adminApi,/status:"active",[\s\S]*left_at:null/);
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
