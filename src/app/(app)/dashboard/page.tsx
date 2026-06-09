import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const { summaryCards, alerts } = await loadDashboardData(ctx);

  const quickActions = [
    { label: "Agregar medicamento", href: "/medicacion" },
    { label: "Agregar turno medico", href: "/agenda" },
    { label: "Gestionar turnos", href: "/turnos" },
    { label: "Agregar cuidador", href: "/cuidadores" },
    { label: "Editar persona cuidada", href: "/persona-cuidada" },
    { label: "Cambiar a vista persona cuidada", href: "/persona" },
  ];

  return (
    <section className="space-y-5">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Dashboard Administrador del Cuidado
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-700">
          Vista para tutores, familiares, cuidadores o encargados. Centraliza el estado diario del
          cuidado, alertas y acciones clave.
        </p>
      </Card>

      <section aria-label="Resumen principal" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} className="p-6">
            <p className="text-base font-semibold text-slate-900">{card.title}</p>
            <p className="mt-3 text-4xl font-bold text-care-800">{card.value}</p>
            <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900">Alertas importantes</h2>
          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-700">
                Sin alertas pendientes. Todo al dia.
              </p>
            ) : (
              alerts.map((alert) => (
                <article
                  key={alert.text}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-base font-medium text-slate-800">{alert.text}</p>
                  <StatusBadge status={alert.status} />
                </article>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900">Acciones rapidas</h2>
          <div className="mt-4 grid gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                href={action.href}
                variant={action.href === "/persona" ? "secondary" : "primary"}
                size="lg"
                className="w-full justify-start"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </section>
    </section>
  );
}
