"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { marketplaceItemsMock } from "@/lib/marketplace-mock";
import { MarketplaceTab } from "@/lib/marketplace-types";

const tabs: { id: MarketplaceTab; label: string; description: string }[] = [
  {
    id: "venta",
    label: "Venta",
    description:
      "Productos fisicos pagos publicados por proveedores o usuarios autorizados.",
  },
  {
    id: "alquiler",
    label: "Alquiler",
    description:
      "Alquiler de camas ortopedicas, sillas de ruedas, andadores, gruas, oxigeno y mas.",
  },
  {
    id: "intercambio",
    label: "Intercambio",
    description:
      "Intercambio de articulos o servicios sin dinero entre usuarios de CARE.",
  },
  {
    id: "donaciones",
    label: "Donaciones",
    description:
      "Donar o solicitar articulos gratuitamente, sin comision ni pagos entre partes.",
  },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("venta");
  const activeConfig = tabs.find((tab) => tab.id === activeTab);

  const items = useMemo(
    () => marketplaceItemsMock.filter((item) => item.tipo === activeTab),
    [activeTab]
  );

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Marketplace CARE</h1>
        <p className="mt-2 text-slate-700">
          Secciones disponibles: Venta, Alquiler, Intercambio y Donaciones.
        </p>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
        <p className="mt-3 text-sm text-slate-600">{activeConfig?.description}</p>
      </Card>

      {activeTab === "intercambio" || activeTab === "donaciones" ? (
        <Card className="border-warning-100 bg-warning-100/40 p-5">
          <p className="text-sm font-semibold text-warning-700">
            Esta seccion es gratuita. No se permite cobrar dinero ni pedir pagos encubiertos.
          </p>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-care-100 text-base font-bold text-care-800">
              {item.foto}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.titulo}</h2>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Categoria:</strong> {item.categoria}
            </p>
            <p className="text-sm text-slate-700">
              <strong>Zona:</strong> {item.zona}
            </p>
            <p className="text-sm text-slate-700">
              <strong>Estado:</strong> {item.estado}
            </p>
            <p className="text-sm text-slate-700">
              <strong>Tipo:</strong> {item.tipo}
            </p>
            <p className="text-sm text-slate-700">
              <strong>Precio:</strong> {item.precio ?? "No aplica"}
            </p>
            <div className="mt-4">
              <Button className="w-full">Contactar</Button>
            </div>
          </Card>
        ))}
      </section>
    </section>
  );
}
