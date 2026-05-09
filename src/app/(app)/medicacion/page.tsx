"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  historialCumplimientoMock,
  medicamentosActivosMock,
  medicamentosDelDiaMock,
} from "@/lib/medicacion-mock";
import { ActiveMedication, MedicationState } from "@/lib/medicacion-types";

const stateStyles: Record<MedicationState, string> = {
  pendiente: "bg-warning-100 text-warning-700",
  tomado: "bg-success-100 text-success-700",
  omitido: "bg-danger-100 text-danger-700",
  "sin-respuesta": "bg-slate-200 text-slate-700",
  "confirmado-cuidador": "bg-info-100 text-info-700",
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

export default function MedicacionPage() {
  const [medicamentosActivos, setMedicamentosActivos] = useState(medicamentosActivosMock);
  const [form, setForm] = useState<ActiveMedication>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const tituloFormulario = editingId ? "Editar medicamento" : "Agregar medicamento";

  const stockBajo = useMemo(
    () =>
      medicamentosActivos.filter((item) => item.stockActual <= item.recordatorioReposicion).length,
    [medicamentosActivos]
  );

  const updateField =
    <K extends keyof ActiveMedication>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [key]:
          key === "tiempoEsperaAlertaMinutos" ||
          key === "stockActual" ||
          key === "recordatorioReposicion"
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

    if (editingId) {
      setMedicamentosActivos((prev) => prev.map((item) => (item.id === editingId ? { ...form, id: editingId } : item)));
      setSaveMessage("Medicamento actualizado en modo mock.");
    } else {
      const newItem = { ...form, id: `a${Date.now()}` };
      setMedicamentosActivos((prev) => [newItem, ...prev]);
      setSaveMessage("Medicamento agregado en modo mock.");
    }
    resetForm();
  };

  const changeActiveState = (id: string, activo: boolean) => {
    setMedicamentosActivos((prev) => prev.map((item) => (item.id === id ? { ...item, activo } : item)));
  };

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Modulo Medicacion</h1>
        <p className="mt-2 text-slate-700">
          Gestion de medicamentos activos, cumplimiento, recordatorios y alertas para tutor o cuidador autorizado.
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Stock bajo en {stockBajo} medicamento(s). Datos en modo mock.
        </p>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Medicamentos del dia</h2>
          <div className="mt-4 space-y-3">
            {medicamentosDelDiaMock.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">{item.nombre}</p>
                <p className="mt-1 text-sm text-slate-700">
                  {item.dosis} - {item.horario} - Responsable: {item.responsable}
                </p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${stateStyles[item.estado]}`}>
                  {stateLabels[item.estado]}
                </span>
              </article>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Medicamentos activos</h2>
          <div className="mt-4 space-y-3">
            {medicamentosActivos.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.nombre}</p>
                    <p className="text-sm text-slate-700">
                      {item.dosis} - {item.frecuencia} - Horarios: {item.horarios}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Stock: {item.stockActual} | Reposicion: {item.recordatorioReposicion}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${item.activo ? "bg-success-100 text-success-700" : "bg-slate-200 text-slate-700"}`}>
                    {item.activo ? "Activo" : "Pausado/finalizado"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => startEdit(item)}>
                    Editar
                  </Button>
                  <Button variant="secondary" onClick={() => changeActiveState(item.id, false)}>
                    Pausar/finalizar
                  </Button>
                  <Button variant="ghost" onClick={() => changeActiveState(item.id, true)}>
                    Reactivar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">Historial de cumplimiento</h2>
          <div className="mt-4 space-y-3">
            {historialCumplimientoMock.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {item.fecha} - {item.horario}
                </p>
                <p className="mt-1 text-sm text-slate-700">{item.confirmadoPor}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${stateStyles[item.estado]}`}>
                  {stateLabels[item.estado]}
                </span>
              </article>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900">{tituloFormulario}</h2>
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
            <Input label="Responsable de administracion" className="sm:col-span-2" value={form.responsableAdministracion} onChange={updateField("responsableAdministracion")} />
            <Input label="Foto del medicamento (opcional)" className="sm:col-span-2" value={form.fotoMedicamento ?? ""} onChange={updateField("fotoMedicamento")} />
            <Input label="Stock actual" type="number" value={String(form.stockActual)} onChange={updateField("stockActual")} />
            <Input label="Recordatorio de reposicion" type="number" value={String(form.recordatorioReposicion)} onChange={updateField("recordatorioReposicion")} />
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
                label="Requiere confirmacion"
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
              <Button type="submit">{editingId ? "Guardar cambios" : "Agregar medicamento"}</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Limpiar
              </Button>
            </div>
          </form>
          {saveMessage ? <p className="mt-3 text-sm font-semibold text-success-700">{saveMessage}</p> : null}
        </Card>
      </section>
    </section>
  );
}
