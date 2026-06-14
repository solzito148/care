"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePersonaCuidada } from "@/actions/persona-cuidada";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { ListEditor } from "@/components/persona-cuidada/list-editor";
import { SectionCard } from "@/components/persona-cuidada/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type {
  Caregiver,
  DocumentItem,
  EmergencyContact,
  PersonaCuidada,
  Tutor,
  TutorPermiso,
} from "@/lib/persona-cuidada-types";

const TUTOR_PERMISO_OPTIONS: { value: TutorPermiso; label: string }[] = [
  { value: "administrador", label: "Administrador (todo y aprueba vínculos)" },
  { value: "edicion_total", label: "Edición total (ver y editar)" },
  { value: "salud", label: "Solo salud (medicación, turnos, estudios)" },
  { value: "agenda", label: "Solo agenda" },
  { value: "legales", label: "Solo legales y administrativo" },
  { value: "solo_lectura", label: "Solo lectura" },
];

type Props = {
  initial: PersonaCuidada;
};

type ListField = "tutores" | "cuidadores" | "contactosEmergencia" | "documentacion";

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tmp_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

const factories = {
  tutores: (): Tutor => ({ id: newId(), nombre: "", rol: "secundario", permisos: "solo_lectura" }),
  cuidadores: (): Caregiver => ({ id: newId(), nombre: "", rol: "", horarios: "", contacto: "" }),
  contactosEmergencia: (): EmergencyContact => ({
    id: newId(),
    nombre: "",
    relacion: "",
    telefono: "",
    whatsapp: "",
    email: "",
  }),
  documentacion: (): DocumentItem => ({
    id: newId(),
    tipo: "",
    archivo: "",
    actualizado: new Date().toISOString().slice(0, 10),
  }),
};

const removeBtnClass = "text-danger-700 hover:bg-danger-100 focus-visible:ring-care-300";

const WIZARD_STEPS = [
  { id: "datos", label: "Datos personales" },
  { id: "salud", label: "Salud y cobertura" },
  { id: "vinculos", label: "Vínculos y contactos" },
  { id: "documentacion", label: "Documentación" },
] as const;

export function PersonaCuidadaClient({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PersonaCuidada>(initial);
  const [saveMessage, setSaveMessage] = useState("");
  const [step, setStep] = useState(0);
  const lastStep = WIZARD_STEPS.length - 1;
  // El DNI es la clave unívoca del adulto mayor: una vez seteado no se edita.
  const dniLocked = initial.dni.trim().length > 0;

  const goToStep = (next: number) => {
    setStep(Math.min(Math.max(next, 0), lastStep));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateField =
    <K extends keyof PersonaCuidada>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value as PersonaCuidada[K] }));
      setSaveMessage("");
    };

  const addItem = (field: ListField) => () => {
    setForm((prev) => {
      switch (field) {
        case "tutores":
          return { ...prev, tutores: [...prev.tutores, factories.tutores()] };
        case "cuidadores":
          return { ...prev, cuidadores: [...prev.cuidadores, factories.cuidadores()] };
        case "contactosEmergencia":
          return { ...prev, contactosEmergencia: [...prev.contactosEmergencia, factories.contactosEmergencia()] };
        case "documentacion":
          return { ...prev, documentacion: [...prev.documentacion, factories.documentacion()] };
      }
    });
    setSaveMessage("");
  };

  const removeItem = (field: ListField, id: string) => () => {
    setForm((prev) => {
      switch (field) {
        case "tutores":
          return { ...prev, tutores: prev.tutores.filter((it) => it.id !== id) };
        case "cuidadores":
          return { ...prev, cuidadores: prev.cuidadores.filter((it) => it.id !== id) };
        case "contactosEmergencia":
          return { ...prev, contactosEmergencia: prev.contactosEmergencia.filter((it) => it.id !== id) };
        case "documentacion":
          return { ...prev, documentacion: prev.documentacion.filter((it) => it.id !== id) };
      }
    });
    setSaveMessage("");
  };

  const updateTutor = (id: string, patch: Partial<Tutor>) => {
    setForm((prev) => ({
      ...prev,
      tutores: prev.tutores.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
    setSaveMessage("");
  };

  const updateCaregiver = (id: string, patch: Partial<Caregiver>) => {
    setForm((prev) => ({
      ...prev,
      cuidadores: prev.cuidadores.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
    setSaveMessage("");
  };

  const updateContact = (id: string, patch: Partial<EmergencyContact>) => {
    setForm((prev) => ({
      ...prev,
      contactosEmergencia: prev.contactosEmergencia.map((it) =>
        it.id === id ? { ...it, ...patch } : it
      ),
    }));
    setSaveMessage("");
  };

  const updateDocument = (id: string, patch: Partial<DocumentItem>) => {
    setForm((prev) => ({
      ...prev,
      documentacion: prev.documentacion.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
    setSaveMessage("");
  };

  const onSave = () => {
    startTransition(async () => {
      const res = await savePersonaCuidada(form);
      if (res.ok) {
        setSaveMessage("Cambios guardados.");
        router.refresh();
      } else {
        setSaveMessage(res.error ?? "No se pudo guardar.");
      }
    });
  };

  return (
    <section className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-care-text sm:text-3xl">
            Persona cuidada
          </h1>
          <p className="mt-1 text-base text-care-muted">
            Ficha completa editable. Los datos se guardan en tu cuenta (persona cuidada del hogar).
          </p>
        </div>
        {saveMessage ? (
          <p
            className={`text-sm font-medium ${saveMessage.includes("No se") ? "text-danger-700" : "text-success-700"}`}
            role="status"
          >
            {saveMessage}
          </p>
        ) : null}
      </div>

      <ol className="flex flex-wrap gap-2" aria-label="Pasos del formulario">
        {WIZARD_STEPS.map((wizardStep, index) => {
          const isCurrent = index === step;
          const isDone = index < step;
          return (
            <li key={wizardStep.id} className="min-w-[8rem] flex-1">
              <button
                type="button"
                onClick={() => goToStep(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
                  isCurrent
                    ? "border-care-600 bg-care-50 text-care-800"
                    : isDone
                      ? "border-care-200 bg-white text-care-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent
                      ? "bg-care-600 text-white"
                      : isDone
                        ? "bg-care-100 text-care-700"
                        : "bg-slate-100 text-slate-500"
                  )}
                >
                  {index + 1}
                </span>
                <span className="truncate">{wizardStep.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 0 ? (
      <SectionCard title="Datos personales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={updateField("nombre")} />
          <Input label="Apellido" value={form.apellido} onChange={updateField("apellido")} />
          <Input
            label="DNI"
            inputMode="numeric"
            value={form.dni}
            onChange={updateField("dni")}
            disabled={dniLocked}
            hint={dniLocked ? "Clave única del adulto mayor. No se modifica." : "7 u 8 dígitos."}
          />
          <Input
            type="date"
            label="Fecha de nacimiento"
            value={form.fechaNacimiento}
            onChange={updateField("fechaNacimiento")}
          />
          <Input label="Domicilio" className="sm:col-span-2" value={form.domicilio} onChange={updateField("domicilio")} />
          <Input label="Localidad" value={form.localidad} onChange={updateField("localidad")} />
          <Input label="Provincia" value={form.provincia} onChange={updateField("provincia")} />
          <Input label="Teléfono" className="sm:col-span-2" value={form.telefono} onChange={updateField("telefono")} />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Observaciones generales</span>
            <textarea
              value={form.observacionesGenerales}
              onChange={updateField("observacionesGenerales")}
              className="mt-2 min-h-28 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-care-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-care-200"
            />
          </label>
        </div>
      </SectionCard>
      ) : null}

      {step === 2 ? (
      <SectionCard title="Tutores asociados">
        <ListEditor
          title="Tutor principal y secundarios"
          addLabel="Agregar tutor"
          onAdd={addItem("tutores")}
          emptyLabel="No hay tutores cargados."
        >
          {form.tutores.map((tutor) => (
            <article key={tutor.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
              <Input
                label="Nombre"
                value={tutor.nombre}
                onChange={(e) => updateTutor(tutor.id, { nombre: e.target.value })}
              />
              <label>
                <span className="text-sm font-medium text-slate-800">Rol</span>
                <select
                  value={tutor.rol}
                  onChange={(e) => {
                    const rol = e.target.value as Tutor["rol"];
                    updateTutor(
                      tutor.id,
                      rol === "principal" ? { rol, permisos: "administrador" } : { rol },
                    );
                  }}
                  className="mt-2 min-h-11 w-full rounded-xl2 border border-slate-300 bg-white px-4 py-2 text-base text-slate-900"
                >
                  <option value="principal">Tutor principal</option>
                  <option value="secundario">Tutor secundario</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-slate-800">Permisos</span>
                <select
                  value={tutor.permisos}
                  onChange={(e) =>
                    updateTutor(tutor.id, { permisos: e.target.value as TutorPermiso })
                  }
                  className="mt-2 min-h-11 w-full rounded-xl2 border border-slate-300 bg-white px-4 py-2 text-base text-slate-900"
                >
                  {TUTOR_PERMISO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className={removeBtnClass}
                  onClick={removeItem("tutores", tutor.id)}
                >
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </ListEditor>
      </SectionCard>
      ) : null}

      {step === 1 ? (
      <SectionCard title="Salud">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Médico de cabecera" value={form.medicoCabecera} onChange={updateField("medicoCabecera")} />
          <Input label="Movilidad" value={form.movilidad} onChange={updateField("movilidad")} />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Diagnósticos relevantes</span>
            <textarea
              value={form.diagnosticosRelevantes}
              onChange={updateField("diagnosticosRelevantes")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3"
            />
          </label>
          <Input label="Alergias" value={form.alergias} onChange={updateField("alergias")} />
          <Input label="Restricciones" value={form.restricciones} onChange={updateField("restricciones")} />
          <div className="sm:col-span-2">
            <CheckboxField
              id="necesita-acompanamiento"
              label="Necesita acompañamiento"
              checked={form.necesitaAcompanamiento}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, necesitaAcompanamiento: value }));
                setSaveMessage("");
              }}
            />
          </div>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Observaciones médicas</span>
            <textarea
              value={form.observacionesMedicas}
              onChange={updateField("observacionesMedicas")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3"
            />
          </label>
        </div>
      </SectionCard>
      ) : null}

      {step === 1 ? (
      <SectionCard title="Obra social / prepaga">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tipo" value={form.obraSocialTipo} onChange={updateField("obraSocialTipo")} />
          <Input label="Nombre" value={form.obraSocialNombre} onChange={updateField("obraSocialNombre")} />
          <Input label="Plan" value={form.obraSocialPlan} onChange={updateField("obraSocialPlan")} />
          <Input label="Número de afiliado" value={form.numeroAfiliado} onChange={updateField("numeroAfiliado")} />
          <Input label="Teléfono útil" value={form.telefonoUtil} onChange={updateField("telefonoUtil")} />
          <Input label="Credencial adjunta" value={form.credencialAdjunta} onChange={updateField("credencialAdjunta")} />
        </div>
      </SectionCard>
      ) : null}

      {step === 2 ? (
      <SectionCard title="Cuidadores asociados">
        <ListEditor
          title="Cuidadores"
          addLabel="Agregar cuidador"
          onAdd={addItem("cuidadores")}
          emptyLabel="No hay cuidadores cargados."
        >
          {form.cuidadores.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={item.nombre}
                onChange={(e) => updateCaregiver(item.id, { nombre: e.target.value })}
              />
              <Input
                label="Rol"
                value={item.rol}
                onChange={(e) => updateCaregiver(item.id, { rol: e.target.value })}
              />
              <Input
                label="Horarios"
                value={item.horarios}
                onChange={(e) => updateCaregiver(item.id, { horarios: e.target.value })}
              />
              <Input
                label="Contacto"
                value={item.contacto}
                onChange={(e) => updateCaregiver(item.id, { contacto: e.target.value })}
              />
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className={removeBtnClass}
                  onClick={removeItem("cuidadores", item.id)}
                >
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </ListEditor>
      </SectionCard>
      ) : null}

      {step === 2 ? (
      <SectionCard title="Contactos de emergencia">
        <ListEditor
          title="Contactos"
          addLabel="Agregar contacto"
          onAdd={addItem("contactosEmergencia")}
          emptyLabel="No hay contactos cargados."
        >
          {form.contactosEmergencia.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={item.nombre}
                onChange={(e) => updateContact(item.id, { nombre: e.target.value })}
              />
              <Input
                label="Relación"
                value={item.relacion}
                onChange={(e) => updateContact(item.id, { relacion: e.target.value })}
              />
              <Input
                label="Teléfono"
                value={item.telefono}
                onChange={(e) => updateContact(item.id, { telefono: e.target.value })}
              />
              <Input
                label="WhatsApp"
                value={item.whatsapp}
                onChange={(e) => updateContact(item.id, { whatsapp: e.target.value })}
              />
              <Input
                label="Email"
                className="sm:col-span-2"
                value={item.email}
                onChange={(e) => updateContact(item.id, { email: e.target.value })}
              />
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className={removeBtnClass}
                  onClick={removeItem("contactosEmergencia", item.id)}
                >
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </ListEditor>
      </SectionCard>
      ) : null}

      {step === 3 ? (
      <SectionCard title="Documentación">
        <ListEditor
          title="Archivos cargados"
          addLabel="Adjuntar documento"
          onAdd={addItem("documentacion")}
          emptyLabel="No hay documentos cargados."
        >
          {form.documentacion.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
              <Input
                label="Tipo"
                value={item.tipo}
                onChange={(e) => updateDocument(item.id, { tipo: e.target.value })}
              />
              <Input
                label="Archivo"
                value={item.archivo}
                onChange={(e) => updateDocument(item.id, { archivo: e.target.value })}
              />
              <Input
                type="date"
                label="Actualizado"
                value={item.actualizado}
                onChange={(e) => updateDocument(item.id, { actualizado: e.target.value })}
              />
              <div className="sm:col-span-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className={removeBtnClass}
                  onClick={removeItem("documentacion", item.id)}
                >
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </ListEditor>
      </SectionCard>
      ) : null}

      <div className="sticky bottom-16 z-30 lg:bottom-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-soft backdrop-blur">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0}
            onClick={() => goToStep(step - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium text-care-muted">
            Paso {step + 1} de {WIZARD_STEPS.length}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onSave} disabled={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
            {step < lastStep ? (
              <Button type="button" onClick={() => goToStep(step + 1)}>
                Siguiente
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
