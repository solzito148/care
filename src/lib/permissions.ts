// Helpers de identidad y permisos. Solo invocables desde Server Components,
// route handlers o server actions: la cadena llama a `next/headers` -> cookies(),
// que arroja si se ejecuta en cliente.
import { createClient } from "@/lib/supabase/server";
import {
  canAccessRouteForRoles,
  hasAnyRole as rolesIncludeAny,
} from "@/lib/route-access";
import type { AccountTypeCode, Database, RoleCode } from "@/lib/supabase/types";

export {
  ROUTE_ACCESS,
  canAccessRouteForRoles,
  hasAnyRole as hasAnyRoleCode,
  normalizePath,
} from "@/lib/route-access";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
  roles: RoleCode[];
  displayName: string;
};

const ACCOUNT_TYPE_TO_ROLE: Record<AccountTypeCode, RoleCode> = {
  "tutor-familiar-encargado": "tutor",
  cuidador: "caregiver",
  "profesional-salud": "professional",
  "profesional-legal-administrativo": "legal_admin",
  "proveedor-marketplace": "provider",
  "proveedor-servicios": "provider",
};

export function defaultRoleFor(accountType: AccountTypeCode | null): RoleCode | null {
  if (!accountType) return null;
  return ACCOUNT_TYPE_TO_ROLE[accountType] ?? null;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountTypeCode, string> = {
  "tutor-familiar-encargado": "Tutor / Familiar / Encargado",
  cuidador: "Cuidador",
  "profesional-salud": "Profesional de salud",
  "profesional-legal-administrativo": "Profesional legal o administrativo",
  "proveedor-marketplace": "Proveedor de marketplace",
  "proveedor-servicios": "Proveedor de servicios",
};

/**
 * Obtiene el usuario autenticado junto con su profile y roles.
 * Si no hay sesion, devuelve null.
 *
 * NO redirige; eso lo hace el layout/protected route que llama a esta funcion.
 *
 * Estrategia de queries: dos pasos en lugar de embed (`roles!inner(code)`).
 * Razon: el `Database` type esta hand-rolled y no expone Relationships, asi que
 * los embeds quedan tipados como `unknown`. Dos queries simples + un IN final
 * son mas explicitas y se llevan bien con TS estricto.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profilePromise = supabase
    .from("profiles")
    .select(
      "id, full_name, phone, avatar_url, birth_date, account_type, is_active, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  const userRolesPromise = supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);

  const [profileResult, userRolesResult] = await Promise.all([
    profilePromise,
    userRolesPromise,
  ]);

  const profile = (profileResult.data as ProfileRow | null) ?? null;
  const roleIds = (userRolesResult.data ?? []).map((r) => r.role_id);

  let roles: RoleCode[] = [];
  if (roleIds.length > 0) {
    const { data: rolesRows } = await supabase
      .from("roles")
      .select("code")
      .in("id", roleIds);

    roles = (rolesRows ?? [])
      .map((r) => r.code as RoleCode | null)
      .filter((code): code is RoleCode => Boolean(code));
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile,
    roles,
    displayName:
      (profile?.full_name && profile.full_name.trim()) ||
      user.email ||
      "Usuario CARE",
  };
}

export function hasRole(user: CurrentUser | null, ...required: RoleCode[]): boolean {
  if (!user) return false;
  return required.some((code) => user.roles.includes(code));
}

const PERMISSION_ROLES = [
  "tutor",
  "caregiver",
  "professional",
  "legal_admin",
  "provider",
] as const satisfies readonly RoleCode[];

type PermissionRole = (typeof PERMISSION_ROLES)[number];

export const PERMISSION_MAP: Record<PermissionRole, Set<string>> = {
  tutor: new Set([
    "ver_mayores",
    "editar_perfil",
    "ver_cuidadores",
    "ver_reportes",
    "editar_medicacion",
    "ver_documentos_legales",
  ]),
  caregiver: new Set([
    "ver_tareas",
    "registrar_actividades",
    "alertar",
    "ver_medicacion",
    "ver_persona_cuidada",
  ]),
  professional: new Set([
    "ver_historial",
    "prescribir",
    "ver_alertas",
    "editar_historial",
    "ver_medicacion",
  ]),
  legal_admin: new Set([
    "ver_documentos",
    "editar_legales",
    "firmar_documentos",
  ]),
  provider: new Set([
    "ver_mi_perfil",
    "editar_servicios",
    "ver_ordenes",
  ]),
};

export function hasAnyRole(user: CurrentUser, roles: RoleCode[]): boolean {
  return rolesIncludeAny(user.roles, roles);
}

export function hasPermission(user: CurrentUser, permission: string): boolean {
  if (user.roles.includes("admin")) {
    return true;
  }

  return user.roles.some((role) => {
    const permissions = PERMISSION_MAP[role as PermissionRole];
    return permissions?.has(permission) ?? false;
  });
}

export function canAccessRoute(
  user: CurrentUser | null,
  pathname: string,
): boolean {
  if (!user) {
    return false;
  }

  return canAccessRouteForRoles(user.roles, pathname);
}

export function getRoleLabel(role: RoleCode): string {
  const labels: Partial<Record<RoleCode, string>> = {
    tutor: "Tutor",
    caregiver: "Cuidador",
    professional: "Profesional",
    legal_admin: "Admin legal",
    provider: "Proveedor",
    admin: "Administrador",
  };
  return labels[role] ?? role;
}
