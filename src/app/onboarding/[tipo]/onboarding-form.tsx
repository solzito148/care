"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { completeOnboardingAction, type OnboardingInput } from "@/actions/onboarding";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountType } from "@/lib/auth-types";

type Props = {
  accountType: AccountType;
  defaultFullName: string;
  defaultPhone: string;
};

export function OnboardingForm({ accountType, defaultFullName, defaultPhone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<OnboardingInput>({
    accountType,
    fullName: defaultFullName,
    phone: defaultPhone,
    recipientName: "",
    recipientDni: "",
    recipientPreferredName: "",
    recipientBirthDate: "",
    recipientEmergencyNotes: "",
    locality: "",
    experienceYears: "",
  });

  const updateField =
    (key: keyof OnboardingInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const res = await completeOnboardingAction(form);
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setMessage(res.error ?? "No se pudo completar el onboarding.");
      }
    });
  };

  const isTutor = accountType === "tutor-familiar-encargado";
  const isCaregiver = accountType === "cuidador";
  const linksByDni =
    accountType === "cuidador" ||
    accountType === "profesional-salud" ||
    accountType === "profesional-legal-administrativo";

  return (
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <Input label="Tu nombre completo" value={form.fullName} onChange={updateField("fullName")} />
      <Input label="Teléfono" value={form.phone} onChange={updateField("phone")} />

      {isTutor ? (
        <>
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Persona cuidada</h2>
            <p className="text-sm text-slate-600">Cargá los datos de quien vas a acompañar.</p>
          </div>
          <Input
            label="Nombre de la persona cuidada"
            value={form.recipientName}
            onChange={updateField("recipientName")}
          />
          <Input
            label="DNI de la persona cuidada"
            inputMode="numeric"
            value={form.recipientDni}
            onChange={updateField("recipientDni")}
            hint="Identifica de forma única al adulto mayor y conecta su red de cuidado."
          />
          <Input
            label="Cómo prefiere que la llamen"
            value={form.recipientPreferredName}
            onChange={updateField("recipientPreferredName")}
          />
          <Input
            type="date"
            label="Fecha de nacimiento"
            value={form.recipientBirthDate}
            onChange={updateField("recipientBirthDate")}
          />
          <label className="block text-sm font-medium text-slate-800 sm:col-span-2">
            Notas de emergencia
            <textarea
              value={form.recipientEmergencyNotes}
              onChange={updateField("recipientEmergencyNotes")}
              className="mt-2 min-h-24 w-full rounded-xl2 border border-slate-300 px-4 py-3 text-base"
            />
          </label>
        </>
      ) : null}

      {isCaregiver ? (
        <>
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Tu perfil de cuidador</h2>
            <p className="text-sm text-slate-600">
              Creamos tu perfil base. Después podés completar zonas, modalidades y referencias.
            </p>
          </div>
          <Input label="Localidad" value={form.locality} onChange={updateField("locality")} />
          <Input
            type="number"
            label="Años de experiencia"
            value={form.experienceYears}
            onChange={updateField("experienceYears")}
          />
        </>
      ) : null}

      {linksByDni ? (
        <>
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Adulto mayor que vas a atender
            </h2>
            <p className="text-sm text-slate-600">
              Ingresá el DNI para vincularte a su red de cuidado. La solicitud
              queda pendiente de aprobación del tutor responsable. Es opcional:
              podés vincularte más tarde.
            </p>
          </div>
          <Input
            label="DNI del adulto mayor"
            inputMode="numeric"
            value={form.recipientDni}
            onChange={updateField("recipientDni")}
          />
          <Input
            label="Nombre (referencia)"
            value={form.recipientName}
            onChange={updateField("recipientName")}
          />
        </>
      ) : null}

      <div className="sm:col-span-2 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Completar y entrar"}
        </Button>
      </div>
      <div className="sm:col-span-2">
        <FormMessage message={message} type="error" />
      </div>
    </form>
  );
}
