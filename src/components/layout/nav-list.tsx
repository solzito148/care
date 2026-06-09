import Link from "next/link";

import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/cn";

type NavListProps = {
  items: NavItem[];
  pathname: string;
  variant: "sidebar" | "bottom";
};

export function NavList({ items, pathname, variant }: NavListProps) {
  if (variant === "sidebar") {
    return (
      <nav
        aria-label="Navegación principal"
        className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 lg:block"
      >
        <ul className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-700",
                    isActive
                      ? "bg-care-700 text-white"
                      : "text-slate-800 hover:bg-white",
                  )}
                >
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-700",
                  isActive ? "text-care-700" : "text-slate-500",
                )}
              >
                <span className="truncate">{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SidebarNavView({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return <NavList items={items} pathname={pathname} variant="sidebar" />;
}

export function BottomNavView({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return <NavList items={items} pathname={pathname} variant="bottom" />;
}
