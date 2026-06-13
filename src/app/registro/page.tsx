"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AccountTypeSelector } from "@/components/forms/account-type-selector";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signUpWithPassword } from "@/lib/auth";
import { AccountType } from "@/lib/auth-types";
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateStrongPassword,
} from "@/lib/form-validation";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {
      accountType: accountType ? "" : "Seleccioná un tipo de cuenta.",
      firstName: validateRequired(firstName, "El nombre"),
      lastName: validateRequired(lastName, "El apellido"),
      email: validateEmail(email),
      phone: validatePhone(phone),
      password: validateStrongPassword(password),
      confirmPassword:
        password === confirmPassword ? "" : "Las contraseñas no coinciden.",
      terms: termsAccepted ? "" : "Debés aceptar términos y condiciones.",
    };

    setErrors(nextErrors);
    setFormError("");
    setSuccessMessage("");

    if (Object.values(nextErrors).some(Boolean) || !accountType) return;

    try {
      setLoading(true);
      const result = await signUpWithPassword({
        accountType,
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      if (result.requiresEmailConfirmation) {
        setSuccessMessage(
          "Te enviamos un email para confirmar tu cuenta. Revisá tu casilla y volvé a iniciar sesión."
        );
        return;
      }

      router.replace(`/onboarding/${accountType}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos crear la cuenta.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta en CARE</h1>
        <p className="mt-2 text-sm text-slate-600">
          Al registrarte, se te redirige al onboarding según tu tipo de cuenta.
        </p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
          <div className="sm:col-span-2">
            <AccountTypeSelector
              value={accountType}
              onChange={setAccountType}
              error={errors.accountType}
            />
          </div>
          <Input
            label="Nombre"
            className="sm:col-span-1"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Apellido"
            className="sm:col-span-1"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            error={errors.lastName}
            autoComplete="family-name"
          />
          <Input
            type="email"
            label="Email"
            className="sm:col-span-1"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Teléfono"
            className="sm:col-span-1"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={errors.phone}
            autoComplete="tel"
          />
          <Input
            type="password"
            label="Contraseña"
            className="sm:col-span-1"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <p className="sm:col-span-2 -mt-2 text-xs text-slate-500">
            Mínimo 10 caracteres, con mayúscula, minúscula y número.
          </p>
          <Input
            type="password"
            label="Confirmar contraseña"
            className="sm:col-span-1"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <div className="sm:col-span-2">
            <CheckboxField
              id="terms"
              label="Acepto los términos y condiciones de CARE."
              checked={termsAccepted}
              onChange={setTermsAccepted}
              error={errors.terms}
            />
            <p className="mt-1 text-xs text-slate-500">
              Leé los{" "}
              <Link href="/terminos" className="font-medium text-care-700 hover:text-care-800">
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="font-medium text-care-700 hover:text-care-800">
                política de privacidad
              </Link>
              .
            </p>
          </div>
          <div className="sm:col-span-2">
            <FormMessage message={formError} />
            {successMessage ? (
              <p className="mt-2 rounded-xl border border-care-200 bg-care-50 px-4 py-3 text-sm font-medium text-care-800">
                {successMessage}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="sm:col-span-2" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarme"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-care-700">
            Ingresar
          </Link>
        </p>
      </Card>
    </main>
  );
}
