import { redirect } from "next/navigation";

import { MedicacionClient } from "@/app/(app)/medicacion/medicacion-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadMedicationData } from "@/lib/data/medicacion";

export default async function MedicacionPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const { active, daily, history } = await loadMedicationData(ctx.careRecipientId);

  return (
    <MedicacionClient medicamentosActivos={active} medicamentosDelDia={daily} historial={history} />
  );
}
