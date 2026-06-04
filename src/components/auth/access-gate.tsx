import type { ReactNode } from "react";

import type { RoleCode } from "@/lib/permissions";
import { hasAnyRole } from "@/lib/permissions";

type AccessGateProps = {
  children: ReactNode;
  roles: RoleCode[];
  requiredRoles?: RoleCode[];
  fallback?: ReactNode;
};

export function AccessGate({
  children,
  roles,
  requiredRoles,
  fallback,
}: AccessGateProps) {
  const hasRequirements = Boolean(requiredRoles?.length);

  if (!hasRequirements || hasAnyRole({ id: "", email: "", roles, displayName: "" }, requiredRoles ?? [])) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
