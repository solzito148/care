import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Origenes de Supabase (REST + realtime via websocket) para connect-src.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseWs = supabaseUrl.replace(/^http/, "ws");
const supabaseConnect = [supabaseUrl, supabaseWs].filter(Boolean).join(" ");

// CSP pragmatica: bloquea clickjacking, mixed content y orígenes externos no
// declarados. Next.js inyecta scripts/estilos inline, por eso se permite
// 'unsafe-inline'; 'unsafe-eval' solo es necesario en dev (Fast Refresh).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseConnect} https://api.mercadopago.com`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.mercadopago.com https://*.mercadopago.com.ar",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // En produccion Next.js (SWC) ya minifica, hace tree-shaking y elimina
  // comentarios. Ademas, aca quitamos los console.* (salvo error/warn) para no
  // filtrar informacion de desarrollo en el bundle del navegador.
  compiler: {
    removeConsole: isDev ? false : { exclude: ["error", "warn"] },
  },
  // No publicar source maps del browser en produccion (dificulta el reversing).
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
