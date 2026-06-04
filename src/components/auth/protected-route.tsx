"use client";

import type { ReactNode } from "react";

import { ProtectedRouteView } from "@/components/auth/protected-route-view";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { RoleCode } from "@/lib/permissions";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRoles?: RoleCode[];
  fallback?: ReactNode;
};

export { ProtectedRouteView } from "@/components/auth/protected-route-view";

export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) {
  const { roles } = useCurrentUser();

  return (
    <ProtectedRouteView
      roles={roles}
      requiredRoles={requiredRoles}
      fallback={fallback}
    >
      {children}
    </ProtectedRouteView>
  );
}
