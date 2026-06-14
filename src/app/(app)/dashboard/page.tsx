import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const { summaryCards, alerts } = await loadDashboardData(ctx);

  const quickActions = [
    { label: "Agregar medicamento", href: "/medicacion" },
    { label: "Agregar turno médico", href: "/agenda" },
    { label: "Gestionar turnos", href: "/turnos" },
    { label: "Agregar cuidador", href: "/cuidadores" },
    { label: "Editar persona cuidada", href: "/persona-cuidada" },
  ];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Dashboard Administrador del Cuidado"
        description="Vista para tutores, familiares, cuidadores o encargados. Centraliza el estado diario del cuidado, alertas y acciones clave."
        actions={
          <Button href="/persona" variant="secondary" size="lg">
            Ver vista persona cuidada
          </Button>
        }
      />

      <section aria-label="Resumen principal" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <p className="text-base font-semibold text-slate-900">{card.title}</p>
            <p className="mt-3 text-4xl font-bold text-care-800">{card.value}</p>
            <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeading>Alertas importantes</SectionHeading>
          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-700">
                Sin alertas pendientes. Todo al día.
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

        <Card>
          <SectionHeading>Acciones rápidas</SectionHeading>
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
