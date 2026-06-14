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

  // #region agent log
  fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'A',location:'auth/callback/route.ts:entry',message:'callback GET entry',data:{hasCode:!!code,type,hasErrorDescription:!!errorDescription,search:url.search,allParams:Object.fromEntries(url.searchParams.entries())},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);

  // #region agent log
  fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'B',location:'auth/callback/route.ts:postExchange',message:'exchangeCodeForSession result',data:{exchangeError:error?.message ?? null,exchangeErrorCode:(error as {code?:string})?.code ?? null,hasSession:!!exchangeData?.session,userId:exchangeData?.user?.id ?? null,type},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'A',location:'auth/callback/route.ts:redirectBranch',message:'redirect branch decision',data:{type,isRecovery:type==='recovery',redirectTo:type==='recovery'?'/actualizar-password':next},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/actualizar-password`);
  }

  // Solo aceptamos paths internos absolutos. Rechazamos protocol-relative
  // ("//evil.com") y URLs con esquema para evitar open redirect.
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
