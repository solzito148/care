import type { ReactNode } from "react";

import { UserProvider } from "@/components/providers/user-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { PrivateHeader } from "@/components/layout/private-header";
import type { CurrentUser } from "@/lib/permissions";

type AppShellProps = {
  children: ReactNode;
  currentUser: CurrentUser;
};

export function AppShell({ children, currentUser }: AppShellProps) {
  return (
    <UserProvider user={currentUser}>
      <div className="min-h-screen bg-care-surface">
        <PrivateHeader />
        <div className="mx-auto flex w-full max-w-7xl">
          <SidebarNav />
          <main
            id="main-content"
            className="min-h-[calc(100vh-8.5rem)] w-full px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8"
          >
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </UserProvider>
  );
}
