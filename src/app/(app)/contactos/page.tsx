import { redirect } from "next/navigation";

import { ContactosClient } from "@/app/(app)/contactos/contactos-client";
import { Card } from "@/components/ui/card";
import { loadContacts } from "@/lib/data/contactos";
import { getCurrentUser } from "@/lib/permissions";

export default async function ContactosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const contacts = await loadContacts();

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Red de contactos</h1>
        <p className="mt-2 text-slate-700">
          Familia, profesionales de salud y contactos de emergencia de la persona cuidada,
          accesibles para todo el grupo de cuidado.
        </p>
      </Card>

      <ContactosClient contacts={contacts} />
    </section>
  );
}
