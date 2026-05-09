"use client";

import { ChangeEvent, useState } from "react";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { ListEditor } from "@/components/persona-cuidada/list-editor";
import { SectionCard } from "@/components/persona-cuidada/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { personaCuidadaMock } from "@/lib/persona-cuidada-mock";
import { PersonaCuidada } from "@/lib/persona-cuidada-types";

export default function PersonaCuidadaPage() {
  const [form, setForm] = useState<PersonaCuidada>(personaCuidadaMock);
  const [saveMessage, setSaveMessage] = useState("");

  const updateField =
    <K extends keyof PersonaCuidada>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setSaveMessage("");
    };

  const onSaveMock = () => {
    // Ready to replace with API call + DB persistence.
    setSaveMessage("Cambios guardados en modo mock. Listo para integrar base de datos.");
  };

  return (
    <section className="space-y-4 pb-10">
      <SectionCard
        title="Persona Cuidada"
        description="Ficha completa editable. Este modulo usa datos mock y estructura preparada para integracion con base de datos."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onSaveMock}>
            Guardar cambios
          </Button>
          {saveMessage ? <p className="text-sm font-medium text-success-700">{saveMessage}</p> : null}
        </div>
      </SectionCard>

      <SectionCard title="1. Datos personales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={updateField("nombre")} />
          <Input label="Apellido" value={form.apellido} onChange={updateField("apellido")} />
          <Input label="DNI" value={form.dni} onChange={updateField("dni")} />
          <Input type="date" label="Fecha de nacimiento" value={form.fechaNacimiento} onChange={updateField("fechaNacimiento")} />
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
        <ListEditor title="Tutor principal y secundarios" addLabel="Agregar tutor">
          {form.tutores.map((tutor) => (
            <article key={tutor.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
              <Input label="Nombre" value={tutor.nombre} onChange={() => undefined} />
              <Input label="Rol" value={tutor.rol === "principal" ? "Tutor principal" : "Tutor secundario"} onChange={() => undefined} />
              <Input label="Permisos" value={tutor.permisos} onChange={() => undefined} />
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
              onChange={(value) => setForm((prev) => ({ ...prev, necesitaAcompanamiento: value }))}
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
        <ListEditor title="Cuidadores" addLabel="Agregar cuidador">
          {form.cuidadores.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
              <Input label="Nombre" value={item.nombre} onChange={() => undefined} />
              <Input label="Rol" value={item.rol} onChange={() => undefined} />
              <Input label="Horarios" value={item.horarios} onChange={() => undefined} />
              <Input label="Contacto" value={item.contacto} onChange={() => undefined} />
            </article>
          ))}
        </ListEditor>
      </SectionCard>

      <SectionCard title="6. Contactos de emergencia">
        <ListEditor title="Contactos" addLabel="Agregar contacto">
          {form.contactosEmergencia.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
              <Input label="Nombre" value={item.nombre} onChange={() => undefined} />
              <Input label="Relacion" value={item.relacion} onChange={() => undefined} />
              <Input label="Telefono" value={item.telefono} onChange={() => undefined} />
              <Input label="WhatsApp" value={item.whatsapp} onChange={() => undefined} />
              <Input label="Email" className="sm:col-span-2" value={item.email} onChange={() => undefined} />
            </article>
          ))}
        </ListEditor>
      </SectionCard>

      <SectionCard title="7. Documentacion">
        <ListEditor title="Archivos cargados" addLabel="Adjuntar documento">
          {form.documentacion.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
              <Input label="Tipo" value={item.tipo} onChange={() => undefined} />
              <Input label="Archivo" value={item.archivo} onChange={() => undefined} />
              <Input type="date" label="Actualizado" value={item.actualizado} onChange={() => undefined} />
            </article>
          ))}
        </ListEditor>
      </SectionCard>
    </section>
  );
}
