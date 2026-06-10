import { hasAnyRole as rolesIncludeAny } from "@/lib/route-access";
import type { RoleCode } from "@/lib/supabase/types";

export type PermissionSubject = {
  roles: RoleCode[];
};

type PermissionRole =
  | "tutor"
  | "caregiver"
  | "professional"
  | "legal_admin"
  | "provider";

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

export function hasAnyRole(user: PermissionSubject, roles: RoleCode[]): boolean {
  return rolesIncludeAny(user.roles, roles);
}

export function hasPermission(user: PermissionSubject, permission: string): boolean {
  if (user.roles.includes("admin")) {
    return true;
  }

  return user.roles.some((role) => {
    const permissions = PERMISSION_MAP[role as PermissionRole];
    return permissions?.has(permission) ?? false;
  });
}
