"use client";
import { createClient } from "@supabase/supabase-js";

// Cliente para el NAVEGADOR (componentes interactivos, login, carrito).
// Lo usarás más adelante; por ahora el menú se lee desde el servidor.
export function getBrowserSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
