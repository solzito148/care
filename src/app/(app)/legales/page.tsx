import { redirect } from "next/navigation";

import { LegalesClient } from "@/app/(app)/legales/legales-client";
import { PageHeader } from "@/components/ui/page-header";
import { loadLegalDocuments } from "@/lib/data/legales";
import { getCurrentUser } from "@/lib/permissions";

export default async function LegalesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const documents = await loadLegalDocuments();

  return (
    <section className="space-y-5 pb-8">
      <PageHeader
        title="Legales y administrativos"
        description="Seguimiento de poderes, directivas, curatelas y trámites con su estado y responsable."
      />

      <LegalesClient documents={documents} />
    </section>
  );
}
