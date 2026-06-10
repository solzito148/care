"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  publishServiceAction,
  setServiceStatusAction,
  type PublishServiceInput,
} from "@/actions/servicios";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCanAccessAny } from "@/hooks/useCurrentUser";
import type { ServiceListItem } from "@/lib/data/servicios";
import { serviceCategoryLabels } from "@/lib/servicios-mock";
import type { ServiceCategory, ServicePlan } from "@/lib/servicios-types";

const categories = Object.entries(serviceCategoryLabels) as [ServiceCategory, string][];
const plans: ServicePlan[] = ["Basico", "Destacado", "Premium"];

const initialForm: PublishServiceInput = {
  providerName: "",
  category: "traslados-y-acompanamiento",
  description: "",
  coverageZone: "",
  availability: "",
  phoneWhatsapp: "",
  email: "",
  plan: "Basico",
};

type Props = {
  services: ServiceListItem[];
};

export function ServiciosClient({ services }: Props) {
  const router = useRouter();
  const canPublish = useCanAccessAny(["provider", "admin"]);
  const [pending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "">("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (service.status !== "publicado" && !service.own) return false;
      if (selectedCategory && service.categoria !== selectedCategory) return false;
      if (zoneFilter && !service.zonaCobertura.toLowerCase().includes(zoneFilter.toLowerCase())) {
        return false;
      }
      if (availabilityFilter && !service.disponibilidad.toLowerCase().includes(availabilityFilter.toLowerCase())) {
        return false;
      }
      if (onlyFeatured && !service.destacado) return false;
      return true;
    });
  }, [services, selectedCategory, zoneFilter, availabilityFilter, onlyFeatured]);

  const updateField =
    (key: keyof PublishServiceInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const onPublish = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await publishServiceAction(form);
      if (res.ok) {
        setForm(initialForm);
        setMessageType("success");
        setMessage("Servicio publicado.");
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo publicar.");
      }
    });
  };

  const onToggleStatus = (service: ServiceListItem) => {
    startTransition(async () => {
      const res = await setServiceStatusAction(
        service.id,
        service.status === "publicado" ? "pausado" : "publicado"
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
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios CARE</h1>
        <p className="mt-2 text-slate-700">
          Prestaciones complementarias (no productos fisicos). Cada proveedor publica su servicio
          mediante un plan mensual: Basico, Destacado o Premium.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Filtros</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="text-sm font-medium text-slate-800">Categoria</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as ServiceCategory | "")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              <option value="">Todas</option>
              {categories.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Zona"
            value={zoneFilter}
            onChange={(event) => setZoneFilter(event.target.value)}
            placeholder="Ej: CABA"
          />
          <Input
            label="Disponibilidad"
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            placeholder="Ej: 24 hs"
          />
          <label className="flex items-end">
            <span className="inline-flex min-h-12 w-full items-center gap-2 rounded-xl2 border border-slate-300 px-4">
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(event) => setOnlyFeatured(event.target.checked)}
              />
              <span className="text-sm font-medium text-slate-800">Solo servicio destacado</span>
            </span>
          </label>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{service.nombreProveedor}</h2>
              <div className="flex gap-1">
                {service.destacado ? <Badge tone="success">Destacado</Badge> : null}
                {service.own && service.status === "pausado" ? (
                  <Badge tone="warning">Pausado</Badge>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              <strong>Categoria:</strong> {serviceCategoryLabels[service.categoria]}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Descripcion:</strong> {service.descripcion}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Zona de cobertura:</strong> {service.zonaCobertura}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Disponibilidad:</strong> {service.disponibilidad}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Telefono/WhatsApp:</strong> {service.telefonoWhatsapp}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Email:</strong> {service.email}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Plan:</strong> {service.plan}
            </p>
            <div className="mt-4 space-y-2">
              {service.telefonoWhatsapp ? (
                <Button
                  className="w-full"
                  href={`https://wa.me/${service.telefonoWhatsapp.replace(/\D/g, "")}`}
                >
                  Contactar
                </Button>
              ) : null}
              {service.own ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={pending}
                  onClick={() => onToggleStatus(service)}
                >
                  {service.status === "publicado" ? "Pausar publicacion" : "Reactivar publicacion"}
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </section>
      {filteredServices.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">
          No hay servicios que coincidan con los filtros actuales.
        </Card>
      ) : null}

      {canPublish ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Publicar servicio</h2>
          <p className="mt-1 text-sm text-slate-600">
            Disponible para cuentas de proveedor. El plan elegido define la visibilidad.
          </p>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onPublish}>
            <div className="sm:col-span-2">
              <Input
                label="Nombre del proveedor"
                value={form.providerName}
                onChange={updateField("providerName")}
              />
            </div>
            <label>
              <span className="text-sm font-medium text-slate-800">Categoria</span>
              <select
                value={form.category}
                onChange={updateField("category")}
                className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
              >
                {categories.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-slate-800">Plan</span>
              <select
                value={form.plan}
                onChange={updateField("plan")}
                className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
              >
                {plans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Zona de cobertura" value={form.coverageZone} onChange={updateField("coverageZone")} />
            <Input label="Disponibilidad" value={form.availability} onChange={updateField("availability")} />
            <Input label="Telefono / WhatsApp" value={form.phoneWhatsapp} onChange={updateField("phoneWhatsapp")} />
            <Input type="email" label="Email" value={form.email} onChange={updateField("email")} />
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-slate-800">Descripcion</span>
              <textarea
                value={form.description}
                onChange={updateField("description")}
                className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                Publicar servicio
              </Button>
            </div>
          </form>
          <div className="mt-3">
            <FormMessage message={message} type={messageType} />
          </div>
        </Card>
      ) : null}
    </section>
  );
}
