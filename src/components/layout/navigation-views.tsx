import Link from "next/link";

import {
  filterNavItemsByRoles,
  getMobileNavItems,
  NAV_ITEMS,
  type NavItem,
} from "@/lib/navigation";
import type { RoleCode } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type NavListProps = {
  items: NavItem[];
  pathname: string;
  variant: "sidebar" | "bottom";
};

function NavList({ items, pathname, variant }: NavListProps) {
  if (variant === "sidebar") {
    return (
      <nav
        aria-label="Navegación principal"
        className="hidden w-64 shrink-0 border-r border-care-border bg-care-surface lg:block"
      >
        <ul className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-primary",
                    isActive
                      ? "bg-care-primary text-white"
                      : "text-care-text hover:bg-white",
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-care-border bg-white lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-primary",
                  isActive ? "text-care-primary" : "text-care-muted",
                )}
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SidebarNavView({
  roles,
  pathname,
}: {
  roles: RoleCode[];
  pathname: string;
}) {
  const items = filterNavItemsByRoles(NAV_ITEMS, roles);
  return <NavList items={items} pathname={pathname} variant="sidebar" />;
}

export function BottomNavView({
  roles,
  pathname,
}: {
  roles: RoleCode[];
  pathname: string;
}) {
  const items = getMobileNavItems(filterNavItemsByRoles(NAV_ITEMS, roles));
  return <NavList items={items} pathname={pathname} variant="bottom" />;
}
