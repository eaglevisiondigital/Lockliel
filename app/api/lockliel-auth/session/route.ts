import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "@/lib/lockliel-auth-cookies";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL, supabaseHeaders } from "@/lib/lockliel-supabase";

async function getUser(accessToken: string) {
  const res = await fetch(`${LOCKLIEL_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function refreshSession(refreshToken: string) {
  const res = await fetch(`${LOCKLIEL_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(request: NextRequest) {
  let access = request.cookies.get(ACCESS_COOKIE)?.value || "";
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value || "";
  let user = access ? await getUser(access) : null;
  let refreshed: any = null;

  if (!user && refresh) {
    refreshed = await refreshSession(refresh);
    if (refreshed?.access_token) {
      access = refreshed.access_token;
      user = await getUser(access);
    }
  }

  if (!user || !access) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  const headers = supabaseHeaders(access);
  const [profileRes, journeyRes] = await Promise.all([
    fetch(`${LOCKLIEL_SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,first_name,last_name,email,city,region,country,onboarding_status,original_inviter_id,current_leader_id`, { headers, cache: "no-store" }),
    fetch(`${LOCKLIEL_SUPABASE_URL}/rest/v1/member_journey?profile_id=eq.${encodeURIComponent(user.id)}&select=next_step_type,next_step_title,next_step_path,reach_one_count,active_connections_count,last_faith_boost_at`, { headers, cache: "no-store" }),
  ]);
  const profiles = profileRes.ok ? await profileRes.json() : [];
  const journeys = journeyRes.ok ? await journeyRes.json() : [];
  const response = NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email }, profile: profiles[0] || null, journey: journeys[0] || null });
  if (refreshed?.access_token) setAuthCookies(response, refreshed);
  return response;
}
