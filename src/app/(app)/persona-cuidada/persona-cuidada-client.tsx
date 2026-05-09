"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePersonaCuidada } from "@/actions/persona-cuidada";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { ListEditor } from "@/components/persona-cuidada/list-editor";
import { SectionCard } from "@/components/persona-cuidada/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Caregiver,
  DocumentItem,
  EmergencyContact,
  PersonaCuidada,
  Tutor,
} from "@/lib/persona-cuidada-types";

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
  tutores: (): Tutor => ({ id: newId(), nombre: "", rol: "secundario", permisos: "" }),
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

export function PersonaCuidadaClient({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PersonaCuidada>(initial);
  const [saveMessage, setSaveMessage] = useState("");

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
      <SectionCard
        title="Persona Cuidada"
        description="Ficha completa editable. Los datos se guardan en tu cuenta (persona cuidada del hogar)."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onSave} disabled={pending}>
            Guardar cambios
          </Button>
          {saveMessage ? (
            <p
              className={`text-sm font-medium ${saveMessage.includes("No se") ? "text-danger-700" : "text-success-700"}`}
            >
              {saveMessage}
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="1. Datos personales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={updateField("nombre")} />
          <Input label="Apellido" value={form.apellido} onChange={updateField("apellido")} />
          <Input label="DNI" value={form.dni} onChange={updateField("dni")} />
          <Input
            type="date"
            label="Fecha de nacimiento"
            value={form.fechaNacimiento}
            onChange={updateField("fechaNacimiento")}
          />
          <Input label="Domicilio" className="sm:col-span-2" value={form.domicilio} onChange={updateField("domicilio")} />
          <Input label="Localidad" value={form.localidad} onChange={updateField("localidad")} />
          <Input label="Provincia" value={form.provincia} onChange={updateField("provincia")} />
          <Input label="Telefono" className="sm:col-span-2" value={form.telefono} onChange={updateField("telefono")} />
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

      <SectionCard title="2. Tutores asociados">
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
                  onChange={(e) => updateTutor(tutor.id, { rol: e.target.value as Tutor["rol"] })}
                  className="mt-2 min-h-11 w-full rounded-xl2 border border-slate-300 bg-white px-4 py-2 text-base text-slate-900"
                >
                  <option value="principal">Tutor principal</option>
                  <option value="secundario">Tutor secundario</option>
                </select>
              </label>
              <Input
                label="Permisos"
                value={tutor.permisos}
                onChange={(e) => updateTutor(tutor.id, { permisos: e.target.value })}
              />
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

      <SectionCard title="3. Salud">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Medico de cabecera" value={form.medicoCabecera} onChange={updateField("medicoCabecera")} />
          <Input label="Movilidad" value={form.movilidad} onChange={updateField("movilidad")} />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Diagnosticos relevantes</span>
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
              label="Necesita acompanamiento"
              checked={form.necesitaAcompanamiento}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, necesitaAcompanamiento: value }));
                setSaveMessage("");
              }}
            />
          </div>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Observaciones medicas</span>
            <textarea
              value={form.observacionesMedicas}
              onChange={updateField("observacionesMedicas")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="4. Obra social / prepaga">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tipo" value={form.obraSocialTipo} onChange={updateField("obraSocialTipo")} />
          <Input label="Nombre" value={form.obraSocialNombre} onChange={updateField("obraSocialNombre")} />
          <Input label="Plan" value={form.obraSocialPlan} onChange={updateField("obraSocialPlan")} />
          <Input label="Numero de afiliado" value={form.numeroAfiliado} onChange={updateField("numeroAfiliado")} />
          <Input label="Telefono util" value={form.telefonoUtil} onChange={updateField("telefonoUtil")} />
          <Input label="Credencial adjunta" value={form.credencialAdjunta} onChange={updateField("credencialAdjunta")} />
        </div>
      </SectionCard>

      <SectionCard title="5. Cuidadores asociados">
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

      <SectionCard title="6. Contactos de emergencia">
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
                label="Relacion"
                value={item.relacion}
                onChange={(e) => updateContact(item.id, { relacion: e.target.value })}
              />
              <Input
                label="Telefono"
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

      <SectionCard title="7. Documentacion">
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
    </section>
  );
}
