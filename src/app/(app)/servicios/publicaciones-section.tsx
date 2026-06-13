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

const sections: Record<MarketplaceTab, { label: string; description: string }> = {
  venta: {
    label: "Venta",
    description:
      "Productos físicos pagos publicados por proveedores o usuarios autorizados.",
  },
  alquiler: {
    label: "Alquiler",
    description:
      "Alquiler de camas ortopédicas, sillas de ruedas, andadores, grúas, oxígeno y más.",
  },
  intercambio: {
    label: "Intercambio",
    description:
      "Intercambio de artículos o servicios sin dinero entre usuarios de CARE.",
  },
  donaciones: {
    label: "Donaciones",
    description:
      "Donar o solicitar artículos gratuitamente, sin comisión ni pagos entre partes.",
  },
};

const sectionOptions = Object.entries(sections) as [
  MarketplaceTab,
  { label: string; description: string },
][];

type Props = {
  items: MarketplaceListItem[];
  listingType: MarketplaceTab;
};

export function PublicacionesSection({ items, listingType }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PublishItemInput>({
    title: "",
    category: "",
    zone: "",
    condition: "",
    price: "",
    listingType,
    contactPhone: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.tipo === listingType && (item.status === "publicado" || item.own)
      ),
    [items, listingType]
  );

  const isPaidSection = form.listingType === "venta" || form.listingType === "alquiler";
  const isFreeSection = listingType === "intercambio" || listingType === "donaciones";

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
        setForm({
          title: "",
          category: "",
          zone: "",
          condition: "",
          price: "",
          listingType,
          contactPhone: "",
        });
        setMessageType("success");
        setMessage("Publicación creada.");
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
    <>
      <Card className="p-6">
        <p className="text-sm text-slate-600">{sections[listingType].description}</p>
      </Card>

      {isFreeSection ? (
        <Card className="border-warning-100 bg-warning-100/40 p-5">
          <p className="text-sm font-semibold text-warning-700">
            Esta sección es gratuita. No se permite cobrar dinero ni pedir pagos encubiertos.
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
              <strong>Categoría:</strong> {item.categoria}
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
                  {item.status === "publicado" ? "Pausar publicación" : "Reactivar publicación"}
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
      {visibleItems.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">
          No hay publicaciones en esta sección todavía.
        </Card>
      ) : null}

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Publicar artículo</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onPublish}>
          <div className="sm:col-span-2">
            <Input label="Título" value={form.title} onChange={updateField("title")} />
          </div>
          <label>
            <span className="text-sm font-medium text-slate-800">Sección</span>
            <select
              value={form.listingType}
              onChange={updateField("listingType")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              {sectionOptions.map(([id, config]) => (
                <option key={id} value={id}>
                  {config.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Categoría"
            hint="Ej: movilidad, descanso, insumos"
            value={form.category}
            onChange={updateField("category")}
          />
          <Input label="Zona" value={form.zone} onChange={updateField("zone")} />
          <Input
            label="Estado del artículo"
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
            label="Teléfono / WhatsApp de contacto"
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
    </>
  );
}
