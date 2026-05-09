import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de Supabase Auth.
 *
 * Cubre:
 *  - Confirmacion de email (signup):   /auth/callback?code=xxx&type=signup
 *  - Magic link / OAuth:               /auth/callback?code=xxx
 *  - Recuperacion de password:         /auth/callback?code=xxx&type=recovery
 *
 * Ver Authentication > URL Configuration en Supabase para registrar esta URL.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const errorDescription = url.searchParams.get("error_description");
  const origin = url.origin;

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/actualizar-password`);
  }

  // Solo aceptamos paths internos absolutos. Rechazamos protocol-relative
  // ("//evil.com") y URLs con esquema para evitar open redirect.
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
