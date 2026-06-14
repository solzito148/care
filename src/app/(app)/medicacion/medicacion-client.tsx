"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { setMedicationActiveAction, upsertMedicationAction } from "@/actions/medicacion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { ActiveMedication, DailyMedication, MedicationHistoryItem, MedicationState } from "@/lib/medicacion-types";

const stateTone: Record<MedicationState, "neutral" | "info" | "success" | "warning" | "danger"> = {
  pendiente: "warning",
  tomado: "success",
  omitido: "danger",
  "sin-respuesta": "neutral",
  "confirmado-cuidador": "info",
};

const stateLabels: Record<MedicationState, string> = {
  pendiente: "Pendiente",
  tomado: "Tomado",
  omitido: "Omitido",
  "sin-respuesta": "Sin respuesta",
  "confirmado-cuidador": "Confirmado por cuidador",
};

const initialForm: ActiveMedication = {
  id: "",
  nombre: "",
  dosis: "",
  frecuencia: "",
  horarios: "",
  fechaInicio: "",
  fechaFin: "",
  indicaciones: "",
  fotoMedicamento: "",
  responsableAdministracion: "",
  requiereConfirmacion: true,
  alertarTutorSiNoConfirma: true,
  tiempoEsperaAlertaMinutos: 30,
  stockActual: 0,
  recordatorioReposicion: 7,
  recetaAsociada: "",
  activo: true,
};

type Props = {
  medicamentosActivos: ActiveMedication[];
  medicamentosDelDia: DailyMedication[];
  historial: MedicationHistoryItem[];
};

export function MedicacionClient({ medicamentosActivos, medicamentosDelDia, historial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ActiveMedication>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [medsTab, setMedsTab] = useState<"hoy" | "activos" | "historial">("hoy");

  const medsTabs = [
    { id: "hoy" as const, label: "Hoy", count: medicamentosDelDia.length },
    { id: "activos" as const, label: "Activos", count: medicamentosActivos.length },
    { id: "historial" as const, label: "Historial", count: historial.length },
  ];

  const tituloFormulario = editingId ? "Editar medicamento" : "Agregar medicamento";

  const stockBajo = useMemo(
    () => medicamentosActivos.filter((item) => item.stockActual <= item.recordatorioReposicion).length,
    [medicamentosActivos]
  );

  const updateField =
    <K extends keyof ActiveMedication>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [key]:
          key === "tiempoEsperaAlertaMinutos" || key === "stockActual" || key === "recordatorioReposicion"
            ? Number(value || 0)
            : value,
      }));
    };

  const startEdit = (item: ActiveMedication) => {
    setForm(item);
    setEditingId(item.id);
    setSaveMessage("");
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await upsertMedicationAction({ ...form, id: editingId ?? form.id });
      if (res.ok) {
        setSaveMessage(editingId ? "Medicamento actualizado." : "Medicamento agregado.");
        resetForm();
        router.refresh();
      } else {
        setSaveMessage(res.error ?? "Error al guardar.");
      }
    });
  };

  const changeActiveState = (id: string, activo: boolean) => {
    startTransition(async () => {
      const res = await setMedicationActiveAction(id, activo);
      if (res.ok) {
        router.refresh();
      } else {
        setSaveMessage(res.error ?? "No se pudo actualizar el estado.");
      }
    });
  };

  return (
    <section className="space-y-4 pb-8">
      <PageHeader
        title="Módulo Medicación"
        description="Gestión de medicamentos activos, cumplimiento, recordatorios y alertas para tutor o cuidador autorizado."
        actions={
          <span className="rounded-full bg-care-50 px-3 py-1 text-sm font-semibold text-care-700">
            Stock bajo en {stockBajo} medicamento(s).
            {pending ? " Guardando…" : ""}
          </span>
        }
      />

      <div role="tablist" aria-label="Vistas de medicación" className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {medsTabs.map((tab) => {
          const active = medsTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMedsTab(tab.id)}
              className={cn(
                "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
                active ? "bg-white text-care-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                  active ? "bg-care-100 text-care-700" : "bg-slate-200 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {medsTab === "hoy" ? (
        <Card className="p-6">
          <SectionHeading>Medicamentos del día</SectionHeading>
          <div className="mt-4 space-y-3">
            {medicamentosDelDia.length === 0 ? (
              <EmptyState
                title="No hay tomas programadas para hoy"
                description="Agregá un medicamento con sus horarios para verlo acá."
              />
            ) : (
              medicamentosDelDia.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">{item.nombre}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {item.dosis} - {item.horario} - Responsable: {item.responsable}
                  </p>
                  <div className="mt-3">
                    <Badge tone={stateTone[item.estado]}>{stateLabels[item.estado]}</Badge>
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {medsTab === "activos" ? (
        <Card className="p-6">
          <SectionHeading>Medicamentos activos</SectionHeading>
          <div className="mt-4 space-y-3">
            {medicamentosActivos.length === 0 ? (
              <EmptyState
                title="Todavía no cargaste medicamentos"
                description="Sumá el primer medicamento desde el formulario."
              />
            ) : (
              medicamentosActivos.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.nombre}</p>
                      <p className="text-sm text-slate-700">
                        {item.dosis} - {item.frecuencia} - Horarios: {item.horarios}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Stock: {item.stockActual} | Reposición: {item.recordatorioReposicion}
                      </p>
                    </div>
                    <Badge tone={item.activo ? "success" : "neutral"}>
                      {item.activo ? "Activo" : "Pausado/finalizado"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" type="button" onClick={() => startEdit(item)}>
                      Editar
                    </Button>
                    <Button variant="secondary" type="button" onClick={() => changeActiveState(item.id, false)}>
                      Pausar/finalizar
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => changeActiveState(item.id, true)}>
                      Reactivar
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {medsTab === "historial" ? (
        <Card className="p-6">
          <SectionHeading>Historial de cumplimiento</SectionHeading>
          <div className="mt-4">
            {historial.length === 0 ? (
              <EmptyState
                title="Sin historial todavía"
                description="El historial aparece cuando registres tomas."
              />
            ) : (
              <DataList
                items={historial}
                getRowKey={(item) => item.id}
                columns={[
                  { key: "fecha", header: "Fecha", render: (item) => item.fecha },
                  { key: "horario", header: "Hora", render: (item) => item.horario },
                  {
                    key: "confirmado",
                    header: "Confirmado por",
                    render: (item) => item.confirmadoPor,
                  },
                  {
                    key: "estado",
                    header: "Estado",
                    render: (item) => (
                      <Badge tone={stateTone[item.estado]}>{stateLabels[item.estado]}</Badge>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </Card>
      ) : null}

      <Card className="p-6">
        <SectionHeading>{tituloFormulario}</SectionHeading>
          <p className="mt-1 text-sm text-slate-600">
            Configura recordatorios y alertas al tutor cuando no se confirme la toma.
          </p>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submitForm}>
            <Input label="Nombre del medicamento" className="sm:col-span-2" value={form.nombre} onChange={updateField("nombre")} />
            <Input label="Dosis" value={form.dosis} onChange={updateField("dosis")} />
            <Input label="Frecuencia" value={form.frecuencia} onChange={updateField("frecuencia")} />
            <Input label="Horarios" value={form.horarios} onChange={updateField("horarios")} />
            <Input type="date" label="Fecha de inicio" value={form.fechaInicio} onChange={updateField("fechaInicio")} />
            <Input type="date" label="Fecha de fin opcional" value={form.fechaFin ?? ""} onChange={updateField("fechaFin")} />
            <Input
              label="Responsable de administración"
              className="sm:col-span-2"
              value={form.responsableAdministracion}
              onChange={updateField("responsableAdministracion")}
            />
            <Input
              label="Foto del medicamento (opcional)"
              className="sm:col-span-2"
              value={form.fotoMedicamento ?? ""}
              onChange={updateField("fotoMedicamento")}
            />
            <Input label="Stock actual" type="number" value={String(form.stockActual)} onChange={updateField("stockActual")} />
            <Input
              label="Recordatorio de reposición"
              type="number"
              value={String(form.recordatorioReposicion)}
              onChange={updateField("recordatorioReposicion")}
            />
            <Input label="Receta asociada" className="sm:col-span-2" value={form.recetaAsociada} onChange={updateField("recetaAsociada")} />
            <Input
              label="Tiempo de espera antes de alertar (min)"
              type="number"
              className="sm:col-span-2"
              value={String(form.tiempoEsperaAlertaMinutos)}
              onChange={updateField("tiempoEsperaAlertaMinutos")}
            />
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-slate-800">Indicaciones</span>
              <textarea
                value={form.indicaciones}
                onChange={updateField("indicaciones")}
                className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
              />
            </label>
            <div className="sm:col-span-2 space-y-2">
              <CheckboxField
                id="requiere-confirmacion"
                label="Requiere confirmación"
                checked={form.requiereConfirmacion}
                onChange={(value) => setForm((prev) => ({ ...prev, requiereConfirmacion: value }))}
              />
              <CheckboxField
                id="alertar-tutor"
                label="Alertar al tutor si no confirma"
                checked={form.alertarTutorSiNoConfirma}
                onChange={(value) => setForm((prev) => ({ ...prev, alertarTutorSiNoConfirma: value }))}
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {editingId ? "Guardar cambios" : "Agregar medicamento"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Limpiar
              </Button>
            </div>
          </form>
          {saveMessage ? <p className="mt-3 text-sm font-semibold text-success-700">{saveMessage}</p> : null}
      </Card>
    </section>
  );
}
