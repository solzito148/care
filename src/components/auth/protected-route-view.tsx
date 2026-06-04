import type { ReactNode } from "react";

import type { RoleCode } from "@/lib/supabase/types";

type ProtectedRouteViewProps = {
  roles: RoleCode[];
  requiredRoles: RoleCode[];
  children: ReactNode;
};

export function ProtectedRouteView({
  roles,
  requiredRoles,
  children,
}: ProtectedRouteViewProps) {
  const allowed =
    roles.includes("admin") ||
    requiredRoles.some((role) => roles.includes(role));

  if (!allowed) {
    return (
      <section
        className="rounded-2xl border border-slate-200 bg-white p-6"
        role="alert"
      >
        <h2 className="text-xl font-semibold text-slate-900">Acceso denegado</h2>
        <p className="mt-2 text-slate-600">
          No tenes permiso para ver esta seccion con tu rol actual.
        </p>
      </section>
    );
  }

  return <>{children}</>;
}
