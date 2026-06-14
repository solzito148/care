"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth";
import { validateStrongPassword } from "@/lib/form-validation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // #region agent log
  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data, error }) => {
      fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'C',location:'actualizar-password/page.tsx:mount',message:'session on mount',data:{hasSession:!!data?.session,userId:data?.session?.user?.id ?? null,getSessionError:error?.message ?? null,hash:typeof window!=='undefined'?window.location.hash:null,search:typeof window!=='undefined'?window.location.search:null},timestamp:Date.now()})}).catch(()=>{});
    });
  }, []);
  // #endregion

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { password?: string; confirmPassword?: string } = {
      password: validateStrongPassword(password),
      confirmPassword:
        password === confirmPassword ? "" : "Las contraseñas no coinciden.",
    };
    setErrors(nextErrors);
    setFormError("");
    if (nextErrors.password || nextErrors.confirmPassword) return;

    try {
      setLoading(true);
      await updatePassword(password);
      setDone(true);
      // #region agent log
      fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'D',location:'actualizar-password/page.tsx:submitOk',message:'updatePassword succeeded',data:{},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos actualizar la contraseña.";
      // #region agent log
      fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'C',location:'actualizar-password/page.tsx:submitError',message:'updatePassword threw',data:{errorMessage:message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Definir nueva contraseña
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Esta página solo funciona luego de abrir el enlace de recuperación enviado
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
              label="Nueva contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <FormMessage message={formError} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Actualizar contraseña"}
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
