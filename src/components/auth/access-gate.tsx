import type { ReactNode } from "react";

import { hasAnyRole } from "@/lib/permissions";
import type { RoleCode } from "@/lib/supabase/types";

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

  if (!hasRequirements || hasAnyRole({ roles }, requiredRoles ?? [])) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
