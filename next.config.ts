import type { NextConfig } from "next";

// Para las apps móviles (Capacitor) se genera un sitio estático en out/;
// la web en Vercel sigue construyéndose igual que antes.
const isApp = process.env.BUILD_TARGET === "app";

const nextConfig: NextConfig = isApp ? { output: "export", images: { unoptimized: true } } : {};

export default nextConfig;
