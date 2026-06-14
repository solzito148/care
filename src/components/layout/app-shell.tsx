import { ReactNode } from "react";

import { UserProvider } from "@/components/providers/user-provider";
import { RouteRoleGate } from "@/components/auth/route-role-gate";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { PrivateHeader } from "@/components/layout/private-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { CareRecipientsState } from "@/lib/data/care-recipients";
import type { CurrentUser } from "@/lib/permissions";

type AppShellProps = {
  children: ReactNode;
  user: CurrentUser;
  careRecipients: CareRecipientsState;
};

export function AppShell({ children, user, careRecipients }: AppShellProps) {
  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-slate-50">
        <PrivateHeader
          userDisplayName={user.displayName}
          userEmail={user.email ?? ""}
          careRecipients={careRecipients}
        />
        <div className="mx-auto flex w-full max-w-7xl">
          <SidebarNav />
          <main className="min-h-[calc(100vh-8.5rem)] w-full px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
            <RouteRoleGate>
              <PageTransition>{children}</PageTransition>
            </RouteRoleGate>
          </main>
        </div>
        <BottomNav />
      </div>
    </UserProvider>
  );
}
