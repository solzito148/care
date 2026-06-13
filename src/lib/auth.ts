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
    throw new Error(translateAuthError(error.message, error.code));
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

  const emailRedirectTo = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo,
      data: {
        // account_type queda en el perfil (trigger); el rol RBAC se asigna
        // al completar onboarding via sync_user_role_from_account_type.
        account_type: payload.accountType,
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
      },
    },
  });

  if (error) {
    throw new Error(translateAuthError(error.message, error.code));
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
    throw new Error(translateAuthError(error.message, error.code));
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error(translateAuthError(error.message, error.code));
  }
}

function translateAuthError(message: string, code?: string): string {
  const c = (code ?? "").toLowerCase();
  const m = message.toLowerCase();

  if (c === "user_already_exists" || c === "email_exists") {
    return "Ese email ya esta registrado. Proba iniciar sesion.";
  }
  if (c === "redirect_to_not_allowed" || c === "validation_failed") {
    if (m.includes("redirect")) {
      return "Error de configuracion: la URL de redireccion no esta autorizada en Supabase.";
    }
  }
  if (c === "weak_password") {
    return "La contrasena es muy debil. Usa al menos 10 caracteres con mayuscula, minuscula y numero.";
  }
  if (c === "signup_disabled") {
    return "El registro de nuevas cuentas esta deshabilitado temporalmente.";
  }
  if (c === "over_email_send_rate_limit" || c === "over_request_rate_limit") {
    return "Demasiados intentos. Espera unos minutos antes de reintentar.";
  }
  if (c === "unexpected_failure" && m.includes("database")) {
    return "No se pudo crear el perfil en la base de datos. Aplica supabase/migrate-all.sql en el proyecto cloud.";
  }

  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email o contrasena invalidos.";
  }
  if (
    m.includes("already registered") ||
    m.includes("already exists") ||
    m.includes("user already registered")
  ) {
    return "Ese email ya esta registrado. Proba iniciar sesion.";
  }
  if (m.includes("redirect") && (m.includes("not allowed") || m.includes("invalid"))) {
    return "Error de configuracion: la URL de redireccion no esta autorizada en Supabase. Contacta al administrador.";
  }
  if (m.includes("database error") || m.includes("saving new user")) {
    return "No se pudo crear el perfil en la base de datos. Verifica que las migraciones de Supabase esten aplicadas.";
  }
  if (m.includes("signup") && m.includes("disabled")) {
    return "El registro de nuevas cuentas esta deshabilitado temporalmente.";
  }
  if (m.includes("invalid api key") || m.includes("invalid jwt")) {
    return "Error de configuracion del servidor. Las credenciales de Supabase no son validas.";
  }
  if (m.includes("password") && m.includes("weak")) {
    return "La contrasena es muy debil. Usa al menos 10 caracteres con mayuscula, minuscula y numero.";
  }
  if (m.includes("password")) {
    return "La contrasena no cumple los requisitos minimos.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "El email no es valido.";
  }
  if (m.includes("email") && m.includes("not confirmed")) {
    return "Necesitas confirmar tu email antes de iniciar sesion.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Demasiados intentos. Espera unos minutos antes de reintentar.";
  }

  // En desarrollo mostrar el mensaje original para diagnosticar mas rapido.
  if (process.env.NODE_ENV !== "production") {
    return message;
  }

  return "No pudimos completar la operacion. Intentalo nuevamente.";
}
