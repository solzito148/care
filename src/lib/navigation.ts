import { ROUTE_ACCESS } from "@/lib/route-access";
import type { PermissionSubject } from "@/lib/permission-helpers";
import type { RoleCode } from "@/lib/supabase/types";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  mobilePrimary?: boolean;
  /** undefined = visible para cualquier usuario autenticado */
  allowedRoles?: RoleCode[];
};

function rolesForNav(href: string): RoleCode[] | undefined {
  const roles = ROUTE_ACCESS[href];
  if (roles === null || roles === undefined) {
    return undefined;
  }
  return roles;
}

export const appNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Inicio",
    mobilePrimary: true,
    allowedRoles: rolesForNav("/dashboard"),
  },
  {
    href: "/persona-cuidada",
    label: "Persona cuidada",
    shortLabel: "Persona",
    mobilePrimary: true,
    allowedRoles: rolesForNav("/persona-cuidada"),
  },
  {
    href: "/agenda",
    label: "Agenda",
    shortLabel: "Agenda",
    mobilePrimary: true,
    allowedRoles: rolesForNav("/agenda"),
  },
  {
    href: "/medicacion",
    label: "Medicacion",
    shortLabel: "Meds",
    mobilePrimary: true,
    allowedRoles: rolesForNav("/medicacion"),
  },
  {
    href: "/turnos",
    label: "Turnos",
    shortLabel: "Turnos",
    mobilePrimary: true,
    allowedRoles: rolesForNav("/turnos"),
  },
  {
    href: "/estudios",
    label: "Estudios",
    shortLabel: "Estudios",
    allowedRoles: rolesForNav("/estudios"),
  },
  {
    href: "/contactos",
    label: "Contactos",
    shortLabel: "Contactos",
    allowedRoles: rolesForNav("/contactos"),
  },
  {
    href: "/cuidadores",
    label: "Cuidadores",
    shortLabel: "Cuidadores",
    allowedRoles: rolesForNav("/cuidadores"),
  },
  {
    href: "/servicios",
    label: "Servicios",
    shortLabel: "Servicios",
    allowedRoles: rolesForNav("/servicios"),
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    shortLabel: "Market",
    allowedRoles: rolesForNav("/marketplace"),
  },
  {
    href: "/planes",
    label: "Planes",
    shortLabel: "Planes",
    allowedRoles: rolesForNav("/planes"),
  },
  {
    href: "/legales",
    label: "Legales y administrativos",
    shortLabel: "Legales",
    allowedRoles: rolesForNav("/legales"),
  },
  {
    href: "/mi-cuenta",
    label: "Mi cuenta",
    shortLabel: "Cuenta",
    allowedRoles: rolesForNav("/mi-cuenta"),
  },
  {
    href: "/admin",
    label: "Administracion",
    shortLabel: "Admin",
    allowedRoles: rolesForNav("/admin"),
  },
];

export function canSeeNavItem(roles: RoleCode[], item: NavItem): boolean {
  if (roles.includes("admin")) {
    return true;
  }

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
  return items.filter((item) => item.mobilePrimary).slice(0, 5);
}

export function canSeeNavRoute(user: PermissionSubject | null, href: string): boolean {
  if (!user) {
    return false;
  }

  const item = appNavItems.find((navItem) => navItem.href === href);
  if (!item) {
    return true;
  }

  return canSeeNavItem(user.roles, item);
}
