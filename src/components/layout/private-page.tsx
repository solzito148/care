import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import type { RoleCode } from "@/lib/permissions";

type PrivatePageProps = {
  title: string;
  description: string;
  requiredRoles?: RoleCode[];
  children?: ReactNode;
};

export function PrivatePage({
  title,
  description,
  requiredRoles,
  children,
}: PrivatePageProps) {
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <section aria-labelledby="page-title">
        <h1 id="page-title" className="text-3xl font-semibold text-care-text">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-care-muted">
          {description}
        </p>
        {children}
      </section>
    </ProtectedRoute>
  );
}
