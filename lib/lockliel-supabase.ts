export const LOCKLIEL_SUPABASE_URL = "https://bsndfhbemstyrrglajat.supabase.co";
export const LOCKLIEL_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NSyTQx-izQeHisrQm7G4FA_ROG7N_u8";

export function supabaseHeaders(accessToken?: string) {
  return {
    apikey: LOCKLIEL_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken || LOCKLIEL_SUPABASE_PUBLISHABLE_KEY}`,
    "Content-Type": "application/json",
  };
}
