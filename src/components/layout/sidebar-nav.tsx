"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFilteredNavItems } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/cn";

export function SidebarNav() {
  const pathname = usePathname();
  const navItems = useFilteredNavItems();

  return (
    <aside className="hidden h-[calc(100vh-8.5rem)] w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav className="space-y-1 overflow-y-auto p-4" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-care-100 text-care-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-care-700 transition-all duration-300 ease-out",
                  isActive ? "opacity-100" : "h-0 opacity-0"
                )}
              />
              <Icon
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
