"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/auth";
import { validatePassword } from "@/lib/form-validation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { password?: string; confirmPassword?: string } = {
      password: validatePassword(password),
      confirmPassword:
        password === confirmPassword ? "" : "Las contrasenas no coinciden.",
    };
    setErrors(nextErrors);
    setFormError("");
    if (nextErrors.password || nextErrors.confirmPassword) return;

    try {
      setLoading(true);
      await updatePassword(password);
      setDone(true);
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos actualizar la contrasena.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Definir nueva contrasena
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Esta pagina solo funciona luego de abrir el enlace de recuperacion enviado
          por email.
        </p>

        {done ? (
          <div className="mt-6 rounded-xl border border-care-200 bg-care-50 px-4 py-3 text-sm text-care-800">
            Listo. Te llevamos al panel...
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <Input
              type="password"
              label="Nueva contrasena"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Confirmar contrasena"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <FormMessage message={formError} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Actualizar contrasena"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm text-slate-600">
          <Link href="/login" className="font-medium text-care-700">
            Volver a iniciar sesion
          </Link>
        </p>
      </Card>
    </main>
  );
}
