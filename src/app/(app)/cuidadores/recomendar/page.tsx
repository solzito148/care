"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { caregiverRecommendationsMock, caregiversMock } from "@/lib/cuidadores-mock";
import { CaregiverRecommendation, RecommendationStatus } from "@/lib/cuidadores-types";

const statusLabels: Record<RecommendationStatus, string> = {
  "pendiente-revision": "Pendiente de revision",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const initialForm = {
  caregiverId: caregiversMock[0]?.id ?? "",
  personaQueRecomienda: "",
  periodoDesde: "",
  periodoHasta: "",
  zonaServicio: "",
  modalidadServicio: "",
  tareasRealizadas: "",
  calificacionGeneral: "5",
  puntualidad: "5",
  tratoHumano: "5",
  responsabilidad: "5",
  comunicacion: "5",
  confiabilidad: "5",
  comentario: "",
  loVolveriaAContratar: true,
  autorizaMostrarRecomendacion: true,
  autorizaContactoReferencia: false,
};

export default function RecomendarCuidadorPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField =
    (key: keyof typeof initialForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.caregiverId) nextErrors.caregiverId = "Selecciona cuidador.";
    if (!form.personaQueRecomienda) nextErrors.personaQueRecomienda = "Dato obligatorio.";
    if (!form.periodoDesde) nextErrors.periodoDesde = "Dato obligatorio.";
    if (!form.periodoHasta) nextErrors.periodoHasta = "Dato obligatorio.";
    if (!form.zonaServicio) nextErrors.zonaServicio = "Dato obligatorio.";
    if (!form.modalidadServicio) nextErrors.modalidadServicio = "Dato obligatorio.";
    if (!form.tareasRealizadas) nextErrors.tareasRealizadas = "Dato obligatorio.";
    if (!form.comentario) nextErrors.comentario = "Dato obligatorio.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const caregiver = caregiversMock.find((item) => item.id === form.caregiverId);
    const recommendation: CaregiverRecommendation = {
      id: `r-${Date.now()}`,
      caregiverId: form.caregiverId,
      cuidadorSeleccionado: caregiver?.nombre ?? "Sin nombre",
      personaQueRecomienda: form.personaQueRecomienda,
      periodoDesde: form.periodoDesde,
      periodoHasta: form.periodoHasta,
      zonaServicio: form.zonaServicio,
      modalidadServicio: form.modalidadServicio,
      tareasRealizadas: form.tareasRealizadas,
      calificacionGeneral: Number(form.calificacionGeneral),
      puntualidad: Number(form.puntualidad),
      tratoHumano: Number(form.tratoHumano),
      responsabilidad: Number(form.responsabilidad),
      comunicacion: Number(form.comunicacion),
      confiabilidad: Number(form.confiabilidad),
      comentario: form.comentario,
      loVolveriaAContratar: form.loVolveriaAContratar,
      autorizaMostrarRecomendacion: form.autorizaMostrarRecomendacion,
      autorizaContactoReferencia: form.autorizaContactoReferencia,
      status: "pendiente-revision",
    };
    caregiverRecommendationsMock.unshift(recommendation);
    setMessage("Recomendacion enviada. Estado inicial: Pendiente de revision.");
  };

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Recomendar cuidador</h1>
        <p className="mt-2 text-slate-700">
          Un cuidador puede ser marcado como Recomendado CARE cuando un usuario registrado lo recomienda tras haberlo contratado.
        </p>
      </Card>

      <Card className="p-6">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Cuidador seleccionado</span>
            <select
              value={form.caregiverId}
              onChange={updateField("caregiverId")}
              className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 px-4"
            >
              {caregiversMock.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
            {errors.caregiverId ? <span className="mt-1 block text-xs font-semibold text-danger-700">{errors.caregiverId}</span> : null}
          </label>

          <Input label="Persona que recomienda" value={form.personaQueRecomienda} onChange={updateField("personaQueRecomienda")} error={errors.personaQueRecomienda} />
          <Input label="Zona o lugar del servicio" value={form.zonaServicio} onChange={updateField("zonaServicio")} error={errors.zonaServicio} />
          <Input type="date" label="Periodo desde" value={form.periodoDesde} onChange={updateField("periodoDesde")} error={errors.periodoDesde} />
          <Input type="date" label="Periodo hasta" value={form.periodoHasta} onChange={updateField("periodoHasta")} error={errors.periodoHasta} />
          <Input label="Modalidad del servicio" value={form.modalidadServicio} onChange={updateField("modalidadServicio")} error={errors.modalidadServicio} />
          <Input label="Tareas realizadas" value={form.tareasRealizadas} onChange={updateField("tareasRealizadas")} error={errors.tareasRealizadas} />

          <Input type="number" min="1" max="5" label="Calificacion general (1-5)" value={form.calificacionGeneral} onChange={updateField("calificacionGeneral")} />
          <Input type="number" min="1" max="5" label="Puntualidad (1-5)" value={form.puntualidad} onChange={updateField("puntualidad")} />
          <Input type="number" min="1" max="5" label="Trato humano (1-5)" value={form.tratoHumano} onChange={updateField("tratoHumano")} />
          <Input type="number" min="1" max="5" label="Responsabilidad (1-5)" value={form.responsabilidad} onChange={updateField("responsabilidad")} />
          <Input type="number" min="1" max="5" label="Comunicacion (1-5)" value={form.comunicacion} onChange={updateField("comunicacion")} />
          <Input type="number" min="1" max="5" label="Confiabilidad (1-5)" value={form.confiabilidad} onChange={updateField("confiabilidad")} />

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Comentario</span>
            <textarea
              value={form.comentario}
              onChange={updateField("comentario")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3"
            />
            {errors.comentario ? <span className="mt-1 block text-xs font-semibold text-danger-700">{errors.comentario}</span> : null}
          </label>

          <div className="sm:col-span-2 space-y-2">
            <CheckboxField
              id="volveria-contratar"
              label="Lo volveria a contratar"
              checked={form.loVolveriaAContratar}
              onChange={(value) => setForm((prev) => ({ ...prev, loVolveriaAContratar: value }))}
            />
            <CheckboxField
              id="autoriza-mostrar"
              label="Autoriza mostrar recomendacion"
              checked={form.autorizaMostrarRecomendacion}
              onChange={(value) => setForm((prev) => ({ ...prev, autorizaMostrarRecomendacion: value }))}
            />
            <CheckboxField
              id="autoriza-contacto"
              label="Autoriza ser contactado como referencia"
              checked={form.autorizaContactoReferencia}
              onChange={(value) => setForm((prev) => ({ ...prev, autorizaContactoReferencia: value }))}
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit">Enviar recomendacion</Button>
          </div>
        </form>
        <div className="mt-3">
          <FormMessage message={message} type="success" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Estados de recomendacion</h2>
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {Object.entries(statusLabels).map(([value, label]) => (
            <li key={value}>- {label}</li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
