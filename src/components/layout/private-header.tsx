"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getRoleLabel } from "@/lib/permissions";

export function PrivateHeader() {
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-care-border bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-care-text">Care</p>
          <p className="text-sm text-care-muted">{user.displayName}</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Roles del usuario">
          {user.roles.length === 0 ? (
            <span className="rounded-full bg-care-border px-3 py-1 text-sm text-care-muted">
              Sin rol asignado
            </span>
          ) : (
            user.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-care-primary/10 px-3 py-1 text-sm font-medium text-care-primary"
              >
                {getRoleLabel(role)}
              </span>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
