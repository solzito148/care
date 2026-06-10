import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { loadCareRecipients } from "@/lib/data/care-recipients";
import { getCurrentUser } from "@/lib/permissions";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const careRecipients = await loadCareRecipients();

  return (
    <AppShell user={user} careRecipients={careRecipients}>
      {children}
    </AppShell>
  );
}
