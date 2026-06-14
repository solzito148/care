"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cuidadorSchema, type CuidadorInput } from "@/lib/validations/cuidador-schema";

export function CuidadorFormStub() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CuidadorInput>({
    resolver: zodResolver(cuidadorSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(() => undefined)}
      className="mt-8 max-w-xl space-y-4"
      noValidate
    >
      <FormField id="cuid-fullName" label="Nombre" required error={errors.fullName?.message}>
        <Input id="cuid-fullName" hasError={Boolean(errors.fullName)} aria-required="true" {...register("fullName")} />
      </FormField>
      <FormField id="cuid-email" label="Email" required error={errors.email?.message}>
        <Input id="cuid-email" type="email" hasError={Boolean(errors.email)} aria-required="true" {...register("email")} />
      </FormField>
      <Button type="submit">Invitar cuidador</Button>
    </form>
  );
}
