import { redirect } from "next/navigation";

import { LegalesClient } from "@/app/(app)/legales/legales-client";
import { Card } from "@/components/ui/card";
import { loadLegalDocuments } from "@/lib/data/legales";
import { getCurrentUser } from "@/lib/permissions";

export default async function LegalesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const documents = await loadLegalDocuments();

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Legales y administrativos</h1>
        <p className="mt-2 text-slate-700">
          Seguimiento de poderes, directivas, curatelas y trámites con su estado y responsable.
        </p>
      </Card>

      <LegalesClient documents={documents} />
    </section>
  );
}
