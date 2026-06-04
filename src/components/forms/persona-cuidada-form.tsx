"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  personaCuidadaSchema,
  type PersonaCuidadaInput,
} from "@/lib/validations/persona-cuidada-schema";

export function PersonaCuidadaFormStub() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonaCuidadaInput>({
    resolver: zodResolver(personaCuidadaSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(() => undefined)}
      className="mt-8 max-w-xl space-y-4"
      noValidate
    >
      <FormField
        id="pc-fullName"
        label="Nombre completo"
        required
        error={errors.fullName?.message}
      >
        <Input
          id="pc-fullName"
          hasError={Boolean(errors.fullName)}
          aria-required="true"
          {...register("fullName")}
        />
      </FormField>
      <FormField
        id="pc-birthDate"
        label="Fecha de nacimiento"
        required
        error={errors.birthDate?.message}
      >
        <Input
          id="pc-birthDate"
          type="date"
          hasError={Boolean(errors.birthDate)}
          aria-required="true"
          {...register("birthDate")}
        />
      </FormField>
      <Button type="submit">Guardar borrador</Button>
    </form>
  );
}
