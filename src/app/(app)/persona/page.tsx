import { redirect } from "next/navigation";

import { PersonaClient } from "@/app/(app)/persona/persona-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadPersonaViewData } from "@/lib/data/dashboard";

export default async function PersonaPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const data = await loadPersonaViewData(ctx);

  return <PersonaClient data={data} />;
}
