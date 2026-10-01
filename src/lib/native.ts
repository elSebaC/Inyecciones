import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import type { Provider } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

// En la app móvil Google no permite iniciar sesión dentro del WebView: se abre el
// navegador del sistema y Supabase vuelve a la app por este esquema propio
// (debe estar en Supabase > Authentication > URL Configuration > Redirect URLs).
const NATIVE_REDIRECT = "com.elsebac.inyecciones://login";

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === "ios";

export async function signIn(provider: Provider): Promise<string | null> {
  const sb = getSupabase();
  if (!isNative) {
    const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    return error?.message ?? null;
  }
  const { data, error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
  });
  if (error) return error.message;
  await Browser.open({ url: data.url });
  return null;
}

// Recibe la vuelta del navegador y cambia el código por la sesión.
export function listenForLoginRedirect(onError: (msg: string) => void): () => void {
  if (!isNative) return () => {};
  const handle = CapApp.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith(NATIVE_REDIRECT)) return;
    Browser.close().catch(() => {});
    const params = new URL(url).searchParams;
    const code = params.get("code");
    if (!code) return onError(params.get("error_description") ?? "No se pudo iniciar sesión");
    const { error } = await getSupabase().auth.exchangeCodeForSession(code);
    if (error) onError(error.message);
  });
  return () => {
    handle.then((h) => h.remove());
  };
}
