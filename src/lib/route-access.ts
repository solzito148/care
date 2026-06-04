import type { RoleCode } from "@/lib/supabase/types";

/** null = cualquier usuario autenticado; undefined = sin restriccion declarada */
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

export function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split("?")[0] ?? pathname;
  return withoutQuery.replace(/\/$/, "") || "/";
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

  const normalized = normalizePath(pathname);
  const allowedRoles = ROUTE_ACCESS[normalized];

  if (allowedRoles === undefined || allowedRoles === null) {
    return true;
  }

  return hasAnyRole(roles, allowedRoles);
}

export function isRoleRestrictedRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  const allowedRoles = ROUTE_ACCESS[normalized];
  return Array.isArray(allowedRoles) && allowedRoles.length > 0;
}
