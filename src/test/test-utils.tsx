import type { ReactNode } from "react";

import { UserProvider } from "@/components/providers/user-provider";
import type { CurrentUser } from "@/lib/permissions";

export function createTestUser(roles: CurrentUser["roles"]): CurrentUser {
  return {
    id: "test-user-id",
    email: "test@care.dev",
    roles,
    displayName: "Usuario de prueba",
  };
}

export function renderWithUser(user: CurrentUser, ui: ReactNode) {
  return <UserProvider user={user}>{ui}</UserProvider>;
}
