import {
  Calendar,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  Pill,
  Scale,
  ShoppingBag,
  Stethoscope,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  ROUTE_ACCESS,
  hasAnyRole,
  type CurrentUser,
  type RoleCode,
} from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** undefined = visible para cualquier usuario autenticado */
  allowedRoles?: RoleCode[];
  mobile?: boolean;
};

/** Deriva allowedRoles desde ROUTE_ACCESS (fuente única de verdad) */
function rolesForNav(href: string): RoleCode[] | undefined {
  const roles = ROUTE_ACCESS[href];
  if (roles === null || roles === undefined) {
    return undefined;
  }
  return roles;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    allowedRoles: rolesForNav("/dashboard"),
    mobile: true,
  },
  {
    href: "/persona-cuidada",
    label: "Persona cuidada",
    icon: HeartPulse,
    allowedRoles: rolesForNav("/persona-cuidada"),
    mobile: true,
  },
  {
    href: "/agenda",
    label: "Agenda",
    icon: Calendar,
    allowedRoles: rolesForNav("/agenda"),
    mobile: true,
  },
  {
    href: "/medicacion",
    label: "Medicación",
    icon: Pill,
    allowedRoles: rolesForNav("/medicacion"),
    mobile: true,
  },
  {
    href: "/turnos",
    label: "Turnos",
    icon: ClipboardList,
    allowedRoles: rolesForNav("/turnos"),
  },
  {
    href: "/estudios",
    label: "Estudios",
    icon: Stethoscope,
    allowedRoles: rolesForNav("/estudios"),
  },
  {
    href: "/contactos",
    label: "Contactos",
    icon: Users,
    allowedRoles: rolesForNav("/contactos"),
  },
  {
    href: "/cuidadores",
    label: "Cuidadores",
    icon: UserCog,
    allowedRoles: rolesForNav("/cuidadores"),
  },
  {
    href: "/servicios",
    label: "Servicios",
    icon: Home,
    allowedRoles: rolesForNav("/servicios"),
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
    allowedRoles: rolesForNav("/marketplace"),
  },
  {
    href: "/planes",
    label: "Planes",
    icon: FileText,
    allowedRoles: rolesForNav("/planes"),
  },
  {
    href: "/legales",
    label: "Legales",
    icon: Scale,
    allowedRoles: rolesForNav("/legales"),
  },
  {
    href: "/mi-cuenta",
    label: "Mi cuenta",
    icon: User,
    allowedRoles: rolesForNav("/mi-cuenta"),
    mobile: true,
  },
];

export function canSeeNavItem(roles: RoleCode[], item: NavItem): boolean {
  if (!item.allowedRoles?.length) {
    return true;
  }
  return item.allowedRoles.some((role) => roles.includes(role));
}

export function filterNavItemsByRoles(
  items: NavItem[],
  roles: RoleCode[],
): NavItem[] {
  return items.filter((item) => canSeeNavItem(roles, item));
}

export function getMobileNavItems(items: NavItem[]): NavItem[] {
  const mobileItems = items.filter((item) => item.mobile);
  return mobileItems.slice(0, 5);
}

export function canSeeNavRoute(user: CurrentUser | null, href: string): boolean {
  if (!user) {
    return false;
  }
  const item = NAV_ITEMS.find((navItem) => navItem.href === href);
  if (!item) {
    return true;
  }
  return canSeeNavItem(user.roles, item);
}

export function filterNavItemsForUser(user: CurrentUser): NavItem[] {
  return filterNavItemsByRoles(NAV_ITEMS, user.roles);
}
