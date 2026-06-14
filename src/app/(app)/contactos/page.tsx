import { redirect } from "next/navigation";

import { ContactosClient } from "@/app/(app)/contactos/contactos-client";
import { PageHeader } from "@/components/ui/page-header";
import { loadContacts } from "@/lib/data/contactos";
import { getCurrentUser } from "@/lib/permissions";

export default async function ContactosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const contacts = await loadContacts();

  return (
    <section className="space-y-5 pb-8">
      <PageHeader
        title="Red de contactos"
        description="Familia, profesionales de salud y contactos de emergencia de la persona cuidada, accesibles para todo el grupo de cuidado."
      />

      <ContactosClient contacts={contacts} />
    </section>
  );
}
