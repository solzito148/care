import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-care-surface px-4">
      <section
        aria-labelledby="forbidden-title"
        className="max-w-lg rounded-xl border border-care-border bg-white p-8 text-center"
      >
        <h1
          id="forbidden-title"
          className="text-3xl font-semibold text-care-text"
        >
          Acceso denegado (403)
        </h1>
        <p className="mt-4 text-base leading-relaxed text-care-muted">
          No tienes permiso para acceder a esta página. Si necesitas acceso,
          solicítalo a tu tutor o administrador.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex min-h-14 items-center justify-center rounded-lg bg-care-primary px-6 text-base font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-primary"
        >
          Ir al panel principal
        </Link>
      </section>
    </main>
  );
}
