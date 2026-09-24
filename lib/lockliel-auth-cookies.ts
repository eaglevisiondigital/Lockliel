import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "lockliel_access";
export const REFRESH_COOKIE = "lockliel_refresh";

export function setAuthCookies(response: NextResponse, session: { access_token: string; refresh_token: string; expires_in?: number }) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: session.expires_in ?? 3600,
  });
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
