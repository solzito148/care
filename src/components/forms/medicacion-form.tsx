"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  medicacionSchema,
  type MedicacionInput,
} from "@/lib/validations/medicacion-schema";

export function MedicacionFormStub() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicacionInput>({
    resolver: zodResolver(medicacionSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(() => undefined)}
      className="mt-8 max-w-xl space-y-4"
      noValidate
    >
      <FormField id="med-name" label="Medicamento" required error={errors.name?.message}>
        <Input id="med-name" hasError={Boolean(errors.name)} aria-required="true" {...register("name")} />
      </FormField>
      <FormField id="med-dose" label="Dosis" required error={errors.dose?.message}>
        <Input id="med-dose" hasError={Boolean(errors.dose)} aria-required="true" {...register("dose")} />
      </FormField>
      <Button type="submit">Guardar medicación</Button>
    </form>
  );
}
