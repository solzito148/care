import { redirect } from "next/navigation";

import { ReminderList } from "@/app/(app)/cuidadores/admin-actualizacion/reminder-list";
import { Card } from "@/components/ui/card";
import { listCaregiversNeedingUpdate } from "@/lib/data/admin";
import { getCurrentUser } from "@/lib/permissions";

export default async function AdminActualizacionCuidadoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("admin")) redirect("/403");

  const caregivers = await listCaregiversNeedingUpdate();

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Admin - Actualizacion de perfiles de cuidadores
        </h1>
        <p className="mt-2 text-slate-700">
          Recordatorio para que los cuidadores verifiquen y actualicen sus datos. El aviso llega
          como notificación in-app (y por email/WhatsApp cuando estén configurados los proveedores).
        </p>
      </Card>

      <ReminderList caregivers={caregivers} />
    </section>
  );
}
