import { redirect } from "next/navigation";

import { EstudiosClient } from "@/app/(app)/estudios/estudios-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadStudies } from "@/lib/data/estudios";

export default async function EstudiosPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const studies = await loadStudies(ctx.careRecipientId);

  return <EstudiosClient studies={studies} />;
}
