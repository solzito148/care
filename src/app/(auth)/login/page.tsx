import { Suspense } from "react";

import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-care-surface px-4 py-12">
      <Suspense fallback={<p className="text-base text-care-muted">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}