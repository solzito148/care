import { redirect } from "next/navigation";

import {
  ServiciosClient,
  type ServiciosTab,
} from "@/app/(app)/servicios/servicios-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadMarketplaceItems } from "@/lib/data/marketplace";
import { loadServices } from "@/lib/data/servicios";

const validTabs: ServiciosTab[] = [
  "prestaciones",
  "venta",
  "alquiler",
  "intercambio",
  "donaciones",
];

function resolveTab(seccion: string | string[] | undefined): ServiciosTab {
  const value = Array.isArray(seccion) ? seccion[0] : seccion;
  return validTabs.includes(value as ServiciosTab)
    ? (value as ServiciosTab)
    : "prestaciones";
}

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string | string[] }>;
}) {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const { seccion } = await searchParams;
  const [services, items] = await Promise.all([
    loadServices(),
    loadMarketplaceItems(),
  ]);

  return (
    <ServiciosClient
      services={services}
      items={items}
      initialTab={resolveTab(seccion)}
    />
  );
}
