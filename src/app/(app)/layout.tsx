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

  // Sin rol = onboarding incompleto. Lo enviamos a completar su tipo de cuenta
  // (y, si es tutor, a registrar a la persona cuidada) antes de usar la app.
  if (user.roles.length === 0) {
    const accountType = user.profile?.account_type;
    redirect(accountType ? `/onboarding/${accountType}` : "/registro");
  }

  const careRecipients = await loadCareRecipients();

  return (
    <AppShell user={user} careRecipients={careRecipients}>
      {children}
    </AppShell>
  );
}
