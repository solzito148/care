"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOutAction } from "@/app/actions/auth";
import { setActiveCareRecipientAction } from "@/actions/care-recipients";
import type { CareRecipientsState } from "@/lib/data/care-recipients";
import { appNavItems } from "@/lib/navigation";
import { cn } from "@/lib/cn";

const viewOptions = [
  { href: "/dashboard", label: "Vista Administrador" },
  { href: "/persona", label: "Vista Persona Cuidada" },
];

const logoutButtonClasses =
  "inline-flex min-h-11 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300";

type PrivateHeaderProps = {
  userDisplayName: string;
  userEmail: string;
  careRecipients: CareRecipientsState;
};

export function PrivateHeader({ userDisplayName, userEmail, careRecipients }: PrivateHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [, startTransition] = useTransition();

  const onSelectRecipient = (id: string) => {
    startTransition(async () => {
      const res = await setActiveCareRecipientAction(id);
      if (res.ok) router.refresh();
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Ir a dashboard">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-care-700 text-lg font-bold text-white">
              C
            </span>
            <span className="hidden text-lg font-semibold text-slate-900 sm:block">CARE</span>
          </Link>
          {careRecipients.recipients.length > 1 ? (
            <label className="flex items-center gap-1 text-xs font-semibold text-care-800">
              <span className="hidden sm:inline">Persona cuidada:</span>
              <select
                value={careRecipients.activeId}
                onChange={(event) => onSelectRecipient(event.target.value)}
                className="rounded-full bg-care-50 px-2 py-1 text-xs font-semibold text-care-800"
                aria-label="Persona cuidada activa"
              >
                {careRecipients.recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name}
                  </option>
                ))}
              </select>
            </label>
          ) : careRecipients.recipients.length === 1 ? (
            <p className="rounded-full bg-care-50 px-2 py-1 text-xs font-semibold text-care-800 sm:px-3">
              Persona cuidada: {careRecipients.recipients[0].name}
            </p>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <p className="text-sm font-medium text-slate-700" title={userEmail}>
            {userDisplayName}
          </p>
          <form action={signOutAction}>
            <button type="submit" className={logoutButtonClasses}>
              Cerrar sesion
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpenMenu((prev) => !prev)}
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 lg:hidden"
          aria-expanded={openMenu}
          aria-controls="mobile-secondary-menu"
        >
          Menu
        </button>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 pb-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => {
            const active = pathname.startsWith(option.href);
            return (
              <Link
                key={option.href}
                href={option.href}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold",
                  active ? "bg-care-100 text-care-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>

      {openMenu ? (
        <div id="mobile-secondary-menu" className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto w-full max-w-7xl space-y-2 px-3 py-3 sm:px-6">
            <p className="text-sm font-medium text-slate-700" title={userEmail}>
              {userDisplayName}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {appNavItems
                .filter((item) => !item.mobilePrimary)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMenu(false)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
            <form action={signOutAction}>
              <button type="submit" className={cn(logoutButtonClasses, "w-full")}>
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  );
}
