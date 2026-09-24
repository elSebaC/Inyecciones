import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// La URL y la clave publishable son públicas por diseño (viajan a cada navegador);
// la protección de los datos la da RLS. Las variables de entorno las reemplazan si existen.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hkcrurcwpepbxkxbctsu.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Y5ZdmUKjKN2QebY_ndtJrQ_EV7Khs7f";

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
