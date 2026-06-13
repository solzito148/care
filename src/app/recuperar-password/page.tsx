"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth";
import { validateEmail } from "@/lib/form-validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const err = validateEmail(email);
    setEmailError(err);
    setFormError("");
    if (err) return;

    try {
      setLoading(true);
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos enviar el email de recuperación.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Te enviamos un email con un enlace seguro para definir una contraseña nueva.
        </p>

        {success ? (
          <div className="mt-6 rounded-xl border border-care-200 bg-care-50 px-4 py-3 text-sm text-care-800">
            Si la cuenta existe, te llegará un email a <strong>{email}</strong>. Revisá
            tu bandeja y la carpeta de spam.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <Input
              type="email"
              label="Email"
              placeholder="familia@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={emailError}
              autoComplete="email"
            />
            <FormMessage message={formError} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar email de recuperación"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm text-slate-600">
          <Link href="/login" className="font-medium text-care-700">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
