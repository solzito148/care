import { redirect } from "next/navigation";

import { ReminderList } from "@/app/(app)/cuidadores/admin-actualizacion/reminder-list";
import { PageHeader } from "@/components/ui/page-header";
import { listCaregiversNeedingUpdate } from "@/lib/data/admin";
import { getCurrentUser } from "@/lib/permissions";

export default async function AdminActualizacionCuidadoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("admin")) redirect("/403");

  const caregivers = await listCaregiversNeedingUpdate();

  return (
    <section className="space-y-5 pb-8">
      <PageHeader
        title="Admin · Actualización de perfiles de cuidadores"
        description="Recordatorio para que los cuidadores verifiquen y actualicen sus datos. El aviso llega como notificación in-app (y por email/WhatsApp cuando estén configurados los proveedores)."
      />

      <ReminderList caregivers={caregivers} />
    </section>
  );
}
