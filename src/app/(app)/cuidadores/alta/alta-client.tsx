"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createCaregiverProfileAction,
  type CreateCaregiverProfileInput,
} from "@/actions/cuidadores";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

const initialForm: CreateCaregiverProfileInput = {
  fullName: "",
  locality: "",
  zones: "",
  modalities: "",
  availabilitySpecial: "",
  experienceYears: "0",
  tasks: "",
  highAvailability: false,
};

export function AltaCuidadorClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const updateField =
    (key: keyof CreateCaregiverProfileInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Nombre completo obligatorio.";
    if (!form.locality.trim()) next.locality = "Localidad obligatoria.";
    if (!form.zones.trim()) next.zones = "Indicá al menos una zona.";
    if (!form.modalities.trim()) next.modalities = "Indicá al menos una modalidad.";
    if (!form.tasks.trim()) next.tasks = "Indicá al menos una tarea.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    startTransition(async () => {
      const res = await createCaregiverProfileAction(form);
      if (res.ok && res.id) {
        setMessageType("success");
        setMessage("Perfil de cuidador creado.");
        router.push(`/cuidadores/${res.id}`);
        router.refresh();
      } else {
        setMessageType("error");
        setMessage(res.error ?? "No se pudo crear el perfil.");
      }
    });
  };

  return (
    <section className="space-y-5 pb-8">
      <PageHeader
        title="Alta de cuidador"
        description="Creá tu perfil en el directorio CARE. Los datos serán visibles para familias que buscan cuidadores. Tu perfil queda vinculado a tu cuenta."
      />

      <Card className="p-6">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <Input
            label="Nombre completo"
            className="sm:col-span-2"
            value={form.fullName}
            onChange={updateField("fullName")}
            error={errors.fullName}
          />
          <Input
            label="Localidad"
            value={form.locality}
            onChange={updateField("locality")}
            error={errors.locality}
          />
          <Input
            type="number"
            min="0"
            max="60"
            label="Años de experiencia"
            value={form.experienceYears}
            onChange={updateField("experienceYears")}
          />
          <Input
            label="Zonas de trabajo (separadas por coma)"
            className="sm:col-span-2"
            hint="Ej: CABA, Zona Norte, La Plata"
            value={form.zones}
            onChange={updateField("zones")}
            error={errors.zones}
          />
          <Input
            label="Modalidades (separadas por coma)"
            className="sm:col-span-2"
            hint="Ej: Por hora, Con retiro, Guardia 24 hs"
            value={form.modalities}
            onChange={updateField("modalities")}
            error={errors.modalities}
          />
          <Input
            label="Tareas que realizas (separadas por coma)"
            className="sm:col-span-2"
            hint="Ej: Adultos mayores, Administración de medicación, Movilidad reducida"
            value={form.tasks}
            onChange={updateField("tasks")}
            error={errors.tasks}
          />
          <Input
            label="Disponibilidad especial (separadas por coma)"
            className="sm:col-span-2"
            hint="Ej: Sábados, Domingos, Feriados"
            value={form.availabilitySpecial}
            onChange={updateField("availabilitySpecial")}
          />
          <div className="sm:col-span-2">
            <CheckboxField
              id="alta-disponibilidad"
              label="Tengo alta disponibilidad horaria"
              checked={form.highAvailability}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, highAvailability: value }))
              }
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              Crear perfil
            </Button>
            <Button href="/cuidadores" variant="secondary">
              Volver a búsqueda
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
