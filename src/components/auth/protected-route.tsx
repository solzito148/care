"use client";

import type { ReactNode } from "react";

import { ProtectedRouteView } from "@/components/auth/protected-route-view";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { RoleCode } from "@/lib/supabase/types";

type ProtectedRouteProps = {
  requiredRoles: RoleCode[];
  children: ReactNode;
};

export function ProtectedRoute({ requiredRoles, children }: ProtectedRouteProps) {
  const { roles } = useCurrentUser();

  return (
    <ProtectedRouteView roles={roles} requiredRoles={requiredRoles}>
      {children}
    </ProtectedRouteView>
  );
}
