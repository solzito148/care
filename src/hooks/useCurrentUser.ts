"use client";

import { useCallback, useMemo } from "react";

import {
  useOptionalUser,
  useUserContext,
} from "@/components/providers/user-provider";
import {
  filterNavItemsByRoles,
  getMobileNavItems,
  NAV_ITEMS,
  canSeeNavItem,
  canSeeNavRoute,
} from "@/lib/navigation";
import {
  hasAnyRole,
  hasPermission,
  type RoleCode,
} from "@/lib/permissions";

export type { CurrentUser, RoleCode } from "@/lib/permissions";

export function useCurrentUser() {
  return useUserContext();
}

export function useCanAccess(requiredRole: RoleCode): boolean {
  const user = useOptionalUser();
  return user?.roles.includes(requiredRole) ?? false;
}

export function useCanAccessAny(requiredRoles: RoleCode[]): boolean {
  const user = useOptionalUser();
  if (!user) {
    return false;
  }
  return hasAnyRole(user, requiredRoles);
}

export function useCanAccessRoute(href: string): boolean {
  const user = useOptionalUser();
  return canSeeNavRoute(user, href);
}

export function useHasPermission(permission: string): boolean {
  const user = useOptionalUser();
  if (!user) {
    return false;
  }
  return hasPermission(user, permission);
}

export function useFilteredNavItems() {
  const { roles } = useCurrentUser();

  return useMemo(() => filterNavItemsByRoles(NAV_ITEMS, roles), [roles]);
}

export function useFilteredMobileNavItems() {
  const sidebarItems = useFilteredNavItems();
  return useMemo(() => getMobileNavItems(sidebarItems), [sidebarItems]);
}

export function useCanAccessNavItem(href: string): boolean {
  const { roles } = useCurrentUser();
  const item = NAV_ITEMS.find((navItem) => navItem.href === href);
  if (!item) {
    return false;
  }
  return canSeeNavItem(roles, item);
}

export function usePermissionCheck() {
  const user = useCurrentUser();

  return useCallback(
    (permission: string) => hasPermission(user, permission),
    [user],
  );
}
