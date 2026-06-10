"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  publishMarketplaceItemAction,
  setMarketplaceItemStatusAction,
  type PublishItemInput,
} from "@/actions/marketplace";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MarketplaceListItem } from "@/lib/data/marketplace";
import type { MarketplaceTab } from "@/lib/marketplace-types";

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

const initialForm: PublishItemInput = {
  title: "",
  category: "",
  zone: "",
  condition: "",
  price: "",
  listingType: "venta",
  contactPhone: "",
};

type Props = {
  items: MarketplaceListItem[];
};

export function MarketplaceClient({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("venta");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const activeConfig = tabs.find((tab) => tab.id === activeTab);

  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.tipo === activeTab && (item.status === "publicado" || item.own)
      ),
    [items, activeTab]
  );

  const isPaidSection = form.listingType === "venta" || form.listingType === "alquiler";

  const updateField =
    (key: keyof PublishItemInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const onPublish = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await publishMarketplaceItemAction(form);
      if (res.ok) {
        setForm(initialForm);
        setMessageType("success");
        setMessage("Publicacion creada.");
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo publicar.");
      }
    });
  };

  const onToggleStatus = (item: MarketplaceListItem) => {
    startTransition(async () => {
      const res = await setMarketplaceItemStatusAction(
        item.id,
        item.status === "publicado" ? "pausado" : "publicado"
      );
      if (res.ok) {
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo actualizar.");
      }
    });
  };

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
        {visibleItems.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-care-100 text-base font-bold text-care-800">
                {item.foto}
              </div>
              {item.own && item.status === "pausado" ? (
                <Badge tone="warning">Pausado</Badge>
              ) : null}
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
            <div className="mt-4 space-y-2">
              {item.contactPhone ? (
                <Button
                  className="w-full"
                  href={`https://wa.me/${item.contactPhone.replace(/\D/g, "")}`}
                >
                  Contactar
                </Button>
              ) : null}
              {item.own ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={pending}
                  onClick={() => onToggleStatus(item)}
                >
                  {item.status === "publicado" ? "Pausar publicacion" : "Reactivar publicacion"}
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
      {visibleItems.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">
          No hay publicaciones en esta seccion todavia.
        </Card>
      ) : null}

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Publicar en el marketplace</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onPublish}>
          <div className="sm:col-span-2">
            <Input label="Titulo" value={form.title} onChange={updateField("title")} />
          </div>
          <label>
            <span className="text-sm font-medium text-slate-800">Seccion</span>
            <select
              value={form.listingType}
              onChange={updateField("listingType")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Categoria"
            hint="Ej: movilidad, descanso, insumos"
            value={form.category}
            onChange={updateField("category")}
          />
          <Input label="Zona" value={form.zone} onChange={updateField("zone")} />
          <Input
            label="Estado del articulo"
            hint="Ej: Nuevo, Muy bueno"
            value={form.condition}
            onChange={updateField("condition")}
          />
          {isPaidSection ? (
            <Input
              label="Precio"
              hint="Ej: $320.000 o $95.000 / mes"
              value={form.price}
              onChange={updateField("price")}
            />
          ) : null}
          <Input
            label="Telefono / WhatsApp de contacto"
            value={form.contactPhone}
            onChange={updateField("contactPhone")}
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              Publicar
            </Button>
          </div>
        </form>
        <div className="mt-3">
          <FormMessage message={message} type={messageType} />
        </div>
      </Card>
    </section>
  );
}
