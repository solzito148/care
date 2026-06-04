"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFilteredMobileNavItems } from "@/hooks/useCurrentUser";

export function BottomNav() {
  const pathname = usePathname();
  const mobileItems = useFilteredMobileNavItems();

  return (
    <nav
      aria-label="Navegacion movil"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white lg:hidden"
    >
      <ul className="grid grid-cols-5 gap-1 px-2 py-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-12 items-center justify-center rounded-lg px-2 text-xs font-medium ${
                  isActive ? "bg-care-100 text-care-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
