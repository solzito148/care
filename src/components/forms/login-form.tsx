"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setAuthError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setAuthError("Credenciales incorrectas. Inténtalo de nuevo.");
      return;
    }

    const next = searchParams.get("next") ?? "/dashboard";
    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md space-y-6 rounded-xl border border-care-border bg-white p-8"
      noValidate
    >
      <div>
        <h1 className="text-3xl font-semibold text-care-text">Iniciar sesión</h1>
        <p className="mt-2 text-base leading-relaxed text-care-muted">
          Accede a tu cuenta Care con email y contraseña.
        </p>
      </div>

      <FormField
        id="email"
        label="Email"
        required
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-required="true"
          hasError={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="password"
        label="Contraseña"
        required
        helpText="Mínimo 8 caracteres"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-required="true"
          hasError={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>

      {authError ? (
        <p role="status" className="text-sm font-medium text-red-700">
          {authError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
