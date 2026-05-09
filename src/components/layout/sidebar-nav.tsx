"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavItems } from "@/lib/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-[calc(100vh-8.5rem)] w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav className="space-y-1 overflow-y-auto p-4" aria-label="Navegacion principal">
        {appNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-care-100 text-care-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
