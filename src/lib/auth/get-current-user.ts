import type { SupabaseClient } from "@supabase/supabase-js";

import type { CurrentUser, RoleCode } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  full_name: string | null;
};

type RoleRow = {
  role: RoleCode;
};

export async function getCurrentUser(
  supabase?: SupabaseClient,
): Promise<CurrentUser | null> {
  const client = supabase ?? (await createSupabaseServerClient());
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user?.email) {
    return null;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const { data: roleRows, error: rolesError } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError) {
    return {
      id: user.id,
      email: user.email,
      roles: [],
      displayName: profile?.full_name ?? user.email,
    };
  }

  const roles = (roleRows ?? []).map((row: RoleRow) => row.role);

  return {
    id: user.id,
    email: user.email,
    roles,
    displayName: profile?.full_name ?? user.email,
  };
}
