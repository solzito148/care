import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import type { CurrentUser, RoleCode } from "@/lib/permissions";
import {
  canAccessRoute,
  isPrivateRoute,
  normalizePath,
} from "@/lib/permissions";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

type RoleRow = {
  role: RoleCode;
};

export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = normalizePath(request.nextUrl.pathname);

  if (isPrivateRoute(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPrivateRoute(pathname) && user) {
    const currentUser = await fetchCurrentUserForMiddleware(supabase, user.id, user.email ?? "");

    if (!canAccessRoute(currentUser, pathname)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = "/403";
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return response;
}

async function fetchCurrentUserForMiddleware(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<CurrentUser | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roles = (roleRows ?? []).map((row: RoleRow) => row.role);

  return {
    id: userId,
    email,
    roles,
    displayName: profile?.full_name ?? email,
  };
}
