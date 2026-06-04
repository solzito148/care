import type { ReactNode } from "react";
import Link from "next/link";

import { AccessGate } from "@/components/auth/access-gate";
import type { RoleCode } from "@/lib/permissions";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRoles?: RoleCode[];
  fallback?: ReactNode;
};

function AccessDenied() {
  return (
    <section
      aria-labelledby="access-denied-title"
      className="mx-auto max-w-lg rounded-xl border border-care-border bg-white p-8 text-center"
    >
      <h1
        id="access-denied-title"
        className="text-2xl font-semibold text-care-text"
      >
        Acceso denegado
      </h1>
      <p className="mt-3 text-base leading-relaxed text-care-muted">
        No tienes permiso para ver esta sección. Si crees que es un error,
        contacta con tu tutor o administrador.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex min-h-14 items-center justify-center rounded-lg bg-care-primary px-6 text-base font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-primary"
      >
        Volver al inicio
      </Link>
    </section>
  );
}

export function ProtectedRouteView({
  children,
  roles,
  requiredRoles,
  fallback,
}: ProtectedRouteProps & { roles: RoleCode[] }) {
  return (
    <AccessGate
      roles={roles}
      requiredRoles={requiredRoles}
      fallback={fallback ?? <AccessDenied />}
    >
      {children}
    </AccessGate>
  );
}
