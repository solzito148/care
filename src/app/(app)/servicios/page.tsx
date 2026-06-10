import { redirect } from "next/navigation";

import { ServiciosClient } from "@/app/(app)/servicios/servicios-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadServices } from "@/lib/data/servicios";

export default async function ServiciosPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const services = await loadServices();

  return <ServiciosClient services={services} />;
}
