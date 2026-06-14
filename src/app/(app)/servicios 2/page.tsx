"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { serviceCategoryLabels, servicesMock } from "@/lib/servicios-mock";
import { ServiceCategory } from "@/lib/servicios-types";

const categories = Object.entries(serviceCategoryLabels) as [ServiceCategory, string][];

export default function ServiciosPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "">("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const filteredServices = useMemo(() => {
    return servicesMock.filter((service) => {
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
  }, [selectedCategory, zoneFilter, availabilityFilter, onlyFeatured]);

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
              {service.destacado ? <Badge tone="success">Destacado</Badge> : null}
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
            <div className="mt-4">
              <Button className="w-full">Contactar</Button>
            </div>
          </Card>
        ))}
      </section>
      {filteredServices.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">
          No hay servicios que coincidan con los filtros actuales.
        </Card>
      ) : null}
    </section>
  );
}
