import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  canAccessRouteForRoles,
  isRoleRestrictedRoute,
} from "@/lib/route-access";
import type { RoleCode } from "@/lib/supabase/types";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/agenda",
  "/contactos",
  "/cuidadores",
  "/estudios",
  "/legales",
  "/marketplace",
  "/medicacion",
  "/mi-cuenta",
  "/onboarding",
  "/persona",
  "/persona-cuidada",
  "/planes",
  "/servicios",
  "/turnos",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function getUserRoleCodes(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<RoleCode[]> {
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  const roleIds = (userRoles ?? []).map((row: { role_id: string }) => row.role_id);
  if (roleIds.length === 0) {
    return [];
  }

  const { data: rolesRows } = await supabase
    .from("roles")
    .select("code")
    .in("id", roleIds);

  return (rolesRows ?? [])
    .map((row: { code: RoleCode }) => row.code)
    .filter(Boolean);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    user &&
    isRoleRestrictedRoute(request.nextUrl.pathname) &&
    !canAccessRouteForRoles(
      await getUserRoleCodes(supabase, user.id),
      request.nextUrl.pathname,
    )
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/403";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
