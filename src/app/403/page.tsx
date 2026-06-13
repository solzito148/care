import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Acceso denegado (403)
        </h1>
        <p className="mt-3 text-slate-600">
          Tu rol no tiene permiso para acceder a esta página.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-care-700 px-5 text-sm font-semibold text-white hover:bg-care-800"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
