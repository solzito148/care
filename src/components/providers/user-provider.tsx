"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { CurrentUser } from "@/lib/permissions";

const UserContext = createContext<CurrentUser | null>(null);

type UserProviderProps = {
  user: CurrentUser;
  children: ReactNode;
};

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useOptionalUser(): CurrentUser | null {
  return useContext(UserContext);
}

export function useUserContext(): CurrentUser {
  const user = useContext(UserContext);

  if (!user) {
    throw new Error(
      "useCurrentUser debe estar dentro de UserProvider. Verifica que AppShell envuelva con UserProvider.",
    );
  }

  return user;
}
