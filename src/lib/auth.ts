import { AccountType } from "@/lib/auth-types";
import { createClient } from "@/lib/supabase/client";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  accountType: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export type SignUpResult = {
  userId: string | null;
  requiresEmailConfirmation: boolean;
};

export async function signInWithPassword(payload: SignInPayload) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  return { userId: data.user?.id ?? null };
}

export async function signUpWithPassword(
  payload: SignUpPayload
): Promise<SignUpResult> {
  const supabase = createClient();

  // emailRedirectTo SIEMPRE va al callback handler (`/auth/callback`), porque
  // ahi se hace `exchangeCodeForSession`. Despues, el callback redirige a
  // `next` (default: /dashboard).
  // Si apuntamos directo a `/dashboard`, el middleware redirige a /login
  // perdiendo el `code` y el flujo se rompe.
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const emailRedirectTo = `${origin}/auth/callback?next=/dashboard`;

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo,
      data: {
        account_type: payload.accountType,
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
      },
    },
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  return {
    userId: data.user?.id ?? null,
    requiresEmailConfirmation: !data.session,
  };
}

export async function requestPasswordReset(email: string) {
  const supabase = createClient();

  // Siempre apuntamos al callback de recovery. El origin se toma del browser
  // si esta disponible (caso normal: este helper se usa desde un Client
  // Component) o de NEXT_PUBLIC_SITE_URL como fallback (SSR/scripts).
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const redirectTo = `${origin}/auth/callback?type=recovery`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email o contrasena invalidos.";
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return "Ese email ya esta registrado. Probá iniciar sesion.";
  }
  if (m.includes("password") && m.includes("weak")) {
    return "La contrasena es muy debil. Usa al menos 8 caracteres con letras y numeros.";
  }
  if (m.includes("password")) {
    return "La contrasena no cumple los requisitos minimos.";
  }
  if (m.includes("email") && m.includes("not confirmed")) {
    return "Necesitas confirmar tu email antes de iniciar sesion.";
  }
  if (m.includes("rate limit")) {
    return "Demasiados intentos. Esperá unos minutos antes de reintentar.";
  }

  return "No pudimos completar la operacion. Intentalo nuevamente.";
}
