"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { getRequiredRolesForPath, normalizePath } from "@/lib/route-access";

type RouteRoleGateProps = {
  children: ReactNode;
};

export function RouteRoleGate({ children }: RouteRoleGateProps) {
  const pathname = normalizePath(usePathname());
  const requiredRoles = getRequiredRolesForPath(pathname);

  if (!requiredRoles?.length) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute requiredRoles={requiredRoles}>{children}</ProtectedRoute>
  );
}
