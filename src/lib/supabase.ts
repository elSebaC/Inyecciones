import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

// Cliente solo de navegador: toda la seguridad la da RLS en Postgres,
// así el mismo código sirve luego empaquetado como app móvil.
export function getSupabase(): SupabaseClient {
  if (!url || !key) throw new Error("Supabase no está configurado");
  client ??= createClient(url, key, {
    auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true },
  });
  return client;
}
