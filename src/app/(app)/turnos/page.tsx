import { redirect } from "next/navigation";

import { TurnosClient } from "@/app/(app)/turnos/turnos-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadTurnosData } from "@/lib/data/agenda";

export default async function TurnosPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const { items, nowMs } = await loadTurnosData(ctx.careRecipientId);

  return <TurnosClient items={items} nowMs={nowMs} />;
}
