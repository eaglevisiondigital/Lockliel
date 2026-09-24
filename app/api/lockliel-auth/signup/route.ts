import { NextRequest, NextResponse } from "next/server";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL } from "@/lib/lockliel-supabase";
import { setAuthCookies } from "@/lib/lockliel-auth-cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const referralCode = String(body.referralCode || request.cookies.get("lockliel_ref")?.value || "").trim();
  if (!firstName || !lastName || !email || password.length < 8) {
    return NextResponse.json({ error: "Please enter your name, a valid email, and a password of at least 8 characters." }, { status: 400 });
  }
  const upstream = await fetch(`${LOCKLIEL_SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      email, password,
      data: { first_name: firstName, last_name: lastName, referral_code: referralCode || null, source: "my-lockliel" },
    }),
    cache: "no-store",
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return NextResponse.json({ error: data.msg || data.error_description || "We couldn't create your account." }, { status: upstream.status });
  const response = NextResponse.json({ ok: true, needsConfirmation: !data.access_token });
  if (data.access_token) setAuthCookies(response, data);
  return response;
}
