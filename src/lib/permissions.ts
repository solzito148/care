export const ROLE_CODES = [
  "tutor",
  "caregiver",
  "professional",
  "legal_admin",
  "provider",
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

export type CurrentUser = {
  id: string;
  email: string;
  roles: RoleCode[];
  displayName: string;
};

export const PERMISSION_MAP: Record<RoleCode, Set<string>> = {
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

export const ROUTE_ACCESS: Record<string, RoleCode[] | null> = {
  "/dashboard": null,
  "/persona-cuidada": ["tutor", "caregiver", "professional"],
  "/agenda": ["tutor", "caregiver"],
  "/medicacion": ["tutor", "caregiver", "professional"],
  "/turnos": ["tutor", "caregiver"],
  "/estudios": ["tutor", "professional"],
  "/contactos": ["tutor", "caregiver", "professional"],
  "/cuidadores": ["tutor"],
  "/servicios": ["tutor", "provider"],
  "/marketplace": ["tutor", "provider"],
  "/planes": ["tutor"],
  "/legales": ["legal_admin"],
  "/mi-cuenta": null,
};

export const PRIVATE_ROUTE_PREFIXES = Object.keys(ROUTE_ACCESS);

export function hasRole(user: CurrentUser, role: RoleCode): boolean {
  return user.roles.includes(role);
}

export function hasAnyRole(user: CurrentUser, roles: RoleCode[]): boolean {
  return roles.some((role) => user.roles.includes(role));
}

export function hasPermission(user: CurrentUser, permission: string): boolean {
  return user.roles.some((role) => PERMISSION_MAP[role]?.has(permission) ?? false);
}

export function canAccessRoute(user: CurrentUser | null, pathname: string): boolean {
  if (!user) {
    return false;
  }

  const normalized = normalizePath(pathname);
  const allowedRoles = ROUTE_ACCESS[normalized];

  if (allowedRoles === undefined) {
    return true;
  }

  if (allowedRoles === null) {
    return true;
  }

  return hasAnyRole(user, allowedRoles);
}

export function getRequiredRolesForRoute(pathname: string): RoleCode[] | null {
  const normalized = normalizePath(pathname);
  return ROUTE_ACCESS[normalized] ?? null;
}

export function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split("?")[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/$/, "") || "/";
  return trimmed;
}

export function isPrivateRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return PRIVATE_ROUTE_PREFIXES.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`),
  );
}

export function getRoleLabel(role: RoleCode): string {
  const labels: Record<RoleCode, string> = {
    tutor: "Tutor",
    caregiver: "Cuidador",
    professional: "Profesional",
    legal_admin: "Admin legal",
    provider: "Proveedor",
  };
  return labels[role];
}
