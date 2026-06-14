"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Shield, UserRound } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { setActiveCareRecipientAction } from "@/actions/care-recipients";
import type { CareRecipientsState } from "@/lib/data/care-recipients";
import { cn } from "@/lib/cn";

const viewOptions = [
  { href: "/dashboard", label: "Administrador", icon: Shield },
  { href: "/persona", label: "Persona cuidada", icon: UserRound },
];

const logoutButtonClasses =
  "inline-flex min-h-11 items-center justify-center rounded-xl2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-care-300";

type PrivateHeaderProps = {
  userDisplayName: string;
  userEmail: string;
  careRecipients: CareRecipientsState;
};

export function PrivateHeader({ userDisplayName, userEmail, careRecipients }: PrivateHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
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
            <CareRecipientPicker
              recipients={careRecipients.recipients}
              activeId={careRecipients.activeId}
              onSelect={onSelectRecipient}
            />
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
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 pb-3 sm:px-6 lg:px-8">
        <div
          role="group"
          aria-label="Cambiar vista"
          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1"
        >
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vista
          </span>
          {viewOptions.map((option) => {
            const active =
              pathname === option.href || pathname.startsWith(`${option.href}/`);
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
                  active
                    ? "bg-white text-care-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

type CareRecipientPickerProps = {
  recipients: { id: string; name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
};

function CareRecipientPicker({ recipients, activeId, onSelect }: CareRecipientPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const active = recipients.find((r) => r.id === activeId) ?? recipients[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-care-50 px-3 py-1 text-xs font-semibold text-care-800 transition hover:bg-care-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-care-300"
      >
        <span className="hidden sm:inline text-care-700">Persona cuidada:</span>
        <span className="max-w-[8rem] truncate">{active?.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Elegir persona cuidada"
          className="absolute left-0 z-50 mt-2 max-h-72 w-56 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-soft"
        >
          {recipients.map((recipient) => {
            const isActive = recipient.id === activeId;
            return (
              <li key={recipient.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelect(recipient.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-left text-sm font-medium transition",
                    isActive ? "bg-care-50 text-care-800" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="truncate">{recipient.name}</span>
                  {isActive ? <Check className="h-4 w-4 shrink-0 text-care-700" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
