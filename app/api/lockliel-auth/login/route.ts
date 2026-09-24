import { NextRequest, NextResponse } from "next/server";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL } from "@/lib/lockliel-supabase";
import { setAuthCookies } from "@/lib/lockliel-auth-cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const upstream = await fetch(`${LOCKLIEL_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok || !data.access_token) {
    return NextResponse.json({ error: data.msg || data.error_description || "We couldn't sign you in with those details." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, data);
  return response;
}
