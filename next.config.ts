import type { NextConfig } from "next";

// Para las apps móviles (Capacitor) se genera un sitio estático en out/;
// la web en Vercel sigue construyéndose igual que antes.
const isApp = process.env.BUILD_TARGET === "app";

// El único origen externo en tiempo de ejecución es Supabase: la tipografía la
// sirve next/font desde el propio dominio y no hay imágenes ni scripts de terceros.
// Limitar connect-src es lo que impide que un script inyectado se lleve la sesión,
// que vive en localStorage.
// 'unsafe-inline' en script-src lo exige el arranque de Next.js; quitarlo pide un
// nonce por petición, y eso obliga a middleware y a renderizar cada página en el
// servidor. 'unsafe-eval' solo en desarrollo, donde lo necesita el refresco en caliente.
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.supabase.co",
  "form-action 'self'",
  // En desarrollo se sirve por http://localhost y no hay nada que elevar.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// output: "export" no admite headers(): en la app móvil no hay servidor que las envíe.
const nextConfig: NextConfig = isApp
  ? { output: "export", images: { unoptimized: true } }
  : {
      async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
      },
    };

export default nextConfig;
