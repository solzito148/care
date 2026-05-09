import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PrivateHeader } from "@/components/layout/private-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";

type AppShellProps = {
  children: ReactNode;
  userDisplayName: string;
  userEmail: string;
};

export function AppShell({
  children,
  userDisplayName,
  userEmail,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PrivateHeader userDisplayName={userDisplayName} userEmail={userEmail} />
      <div className="mx-auto flex w-full max-w-7xl">
        <SidebarNav />
        <main className="min-h-[calc(100vh-8.5rem)] w-full px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
