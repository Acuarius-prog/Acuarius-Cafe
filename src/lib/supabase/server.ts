import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para el SERVIDOR.
// Acepta las llaves con nombres normales (SUPABASE_URL) o con prefijo
// NEXT_PUBLIC_, así funciona tanto en local como en Cloudflare.
// Devuelve null si faltan, en vez de romper el build.
export function getSupabase() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
