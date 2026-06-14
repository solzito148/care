"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInWithPassword } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/form-validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToParam = searchParams.get("redirectTo");
  // Solo aceptamos paths internos absolutos. Rechazamos:
  //   - relativos sin "/" (no empiezan con "/")
  //   - protocol-relative ("//evil.com" -> open redirect)
  //   - URLs con esquema ("https://...")
  const redirectTo =
    redirectToParam &&
    redirectToParam.startsWith("/") &&
    !redirectToParam.startsWith("//")
      ? redirectToParam
      : "/dashboard";
  const initialError =
    searchParams.get("error") === "supabase_not_configured"
      ? "Supabase no esta configurado. Revisa las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
      : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setFormError("");

    if (nextErrors.email || nextErrors.password) return;

    try {
      setLoading(true);
      await signInWithPassword({ email, password });
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos iniciar sesion.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Ingresar a CARE</h1>
        <p className="mt-2 text-sm text-slate-600">
          Iniciá sesion con tu email y contrasena.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Input
            type="email"
            label="Email"
            placeholder="familia@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            type="password"
            label="Contrasena"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          <FormMessage message={formError} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
        <Link
          href="/recuperar-password"
          className="mt-4 inline-block text-sm font-medium text-care-700"
        >
          Olvide mi contrasena
        </Link>
        <p className="mt-4 text-sm text-slate-600">
          No tenes cuenta?{" "}
          <Link href="/registro" className="font-medium text-care-700">
            Crear cuenta
          </Link>
        </p>
      </Card>
    </main>
  );
}
