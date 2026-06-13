import type { RoleCode } from "@/lib/supabase/types";

/** null = cualquier usuario autenticado; undefined = sin restriccion declarada */
export const ROUTE_ACCESS: Record<string, RoleCode[] | null> = {
  "/dashboard": null,
  "/admin": ["admin"],
  "/persona-cuidada": ["tutor", "caregiver", "professional"],
  "/agenda": ["tutor", "caregiver"],
  "/medicacion": ["tutor", "caregiver", "professional"],
  "/turnos": ["tutor", "caregiver"],
  "/estudios": ["tutor", "professional"],
  "/contactos": ["tutor", "caregiver", "professional"],
  "/cuidadores": ["tutor"],
  "/cuidadores/admin-actualizacion": ["admin"],
  "/servicios": ["tutor", "provider"],
  "/planes": ["tutor"],
  "/legales": ["legal_admin"],
  "/mi-cuenta": null,
};

export function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split("?")[0] ?? pathname;
  return withoutQuery.replace(/\/$/, "") || "/";
}

/** null = autenticado; undefined = sin regla; RoleCode[] = roles requeridos */
export function getRequiredRolesForPath(
  pathname: string,
): RoleCode[] | null | undefined {
  const normalized = normalizePath(pathname);

  if (Object.prototype.hasOwnProperty.call(ROUTE_ACCESS, normalized)) {
    return ROUTE_ACCESS[normalized];
  }

  const parentRoute = Object.keys(ROUTE_ACCESS)
    .filter((route) => route !== "/" && normalized.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  if (parentRoute) {
    return ROUTE_ACCESS[parentRoute];
  }

  return undefined;
}

export function hasAnyRole(roles: RoleCode[], required: RoleCode[]): boolean {
  return required.some((role) => roles.includes(role));
}

export function canAccessRouteForRoles(
  roles: RoleCode[],
  pathname: string,
): boolean {
  if (roles.includes("admin")) {
    return true;
  }

  const allowedRoles = getRequiredRolesForPath(pathname);

  if (allowedRoles === undefined || allowedRoles === null) {
    return true;
  }

  return hasAnyRole(roles, allowedRoles);
}

export function isRoleRestrictedRoute(pathname: string): boolean {
  const allowedRoles = getRequiredRolesForPath(pathname);
  return Array.isArray(allowedRoles) && allowedRoles.length > 0;
}
