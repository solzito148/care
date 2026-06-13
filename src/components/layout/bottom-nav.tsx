"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import {
  useCurrentUser,
  useFilteredMobileNavItems,
  useFilteredNavItems,
} from "@/hooks/useCurrentUser";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const allItems = useFilteredNavItems();
  const primaryItems = useFilteredMobileNavItems();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const primaryHrefs = new Set(primaryItems.map((item) => item.href));
  const overflowItems = allItems.filter((item) => !primaryHrefs.has(item.href));
  const overflowActive = overflowItems.some((item) => isActive(item.href));

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white lg:hidden"
    >
      {open ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-900/30"
          />
          <div
            id="mobile-more-menu"
            className="absolute bottom-full left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-3 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <p
                className="truncate text-sm font-medium text-slate-700"
                title={user.email ?? undefined}
              >
                {user.displayName}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {overflowItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium",
                        active
                          ? "border-care-200 bg-care-50 text-care-800"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <LogOut className="h-5 w-5" aria-hidden />
                Cerrar sesión
              </button>
            </form>
          </div>
        </>
      ) : null}

      <ul className="grid grid-cols-5 gap-1 px-1 py-2">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[11px] font-semibold leading-tight",
                  active
                    ? "bg-care-100 text-care-700"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-more-menu"
            className={cn(
              "flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[11px] font-semibold leading-tight",
              open || overflowActive
                ? "bg-care-100 text-care-700"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Menu className="h-5 w-5" aria-hidden />
            <span>Más</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
