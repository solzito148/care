"use client";

import { useState } from "react";

import { PrestacionesSection } from "@/app/(app)/servicios/prestaciones-section";
import { PublicacionesSection } from "@/app/(app)/servicios/publicaciones-section";
import { Card } from "@/components/ui/card";
import type { MarketplaceListItem } from "@/lib/data/marketplace";
import type { MarketplaceTab } from "@/lib/marketplace-types";
import type { ServiceListItem } from "@/lib/data/servicios";

export type ServiciosTab = "prestaciones" | MarketplaceTab;

const tabs: { id: ServiciosTab; label: string }[] = [
  { id: "prestaciones", label: "Prestaciones" },
  { id: "venta", label: "Venta" },
  { id: "alquiler", label: "Alquiler" },
  { id: "intercambio", label: "Intercambio" },
  { id: "donaciones", label: "Donaciones" },
];

type Props = {
  services: ServiceListItem[];
  items: MarketplaceListItem[];
  initialTab?: ServiciosTab;
};

export function ServiciosClient({ services, items, initialTab = "prestaciones" }: Props) {
  const [activeTab, setActiveTab] = useState<ServiciosTab>(initialTab);

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios CARE</h1>
        <p className="mt-2 text-slate-700">
          Prestaciones complementarias para el cuidado y publicaciones de articulos y equipamiento:
          venta, alquiler, intercambio y donaciones.
        </p>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-care-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {activeTab === "prestaciones" ? (
        <PrestacionesSection services={services} />
      ) : (
        <PublicacionesSection items={items} listingType={activeTab} />
      )}
    </section>
  );
}
