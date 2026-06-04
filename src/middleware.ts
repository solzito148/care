import { type NextRequest, NextResponse } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  return updateSupabaseSession(request, response);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/persona-cuidada/:path*",
    "/agenda/:path*",
    "/medicacion/:path*",
    "/turnos/:path*",
    "/estudios/:path*",
    "/contactos/:path*",
    "/cuidadores/:path*",
    "/servicios/:path*",
    "/marketplace/:path*",
    "/planes/:path*",
    "/legales/:path*",
    "/mi-cuenta/:path*",
    "/login",
  ],
};
