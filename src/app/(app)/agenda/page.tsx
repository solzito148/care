import { redirect } from "next/navigation";

import { AgendaClient } from "@/app/(app)/agenda/agenda-client";
import { loadAgendaItems } from "@/lib/data/agenda";
import { ensureCareContext } from "@/lib/data/care-context";

export default async function AgendaPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const items = await loadAgendaItems(ctx.careRecipientId);

  return <AgendaClient items={items} />;
}
