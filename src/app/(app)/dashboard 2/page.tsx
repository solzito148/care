import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DashboardPage() {
  const summaryCards = [
    { title: "Personas cuidadas asociadas", value: "3", detail: "2 activas ahora" },
    { title: "Medicacion pendiente de hoy", value: "5", detail: "2 sin confirmar" },
    { title: "Turnos medicos proximos", value: "4", detail: "1 manana 09:30" },
    { title: "Estudios medicos proximos", value: "2", detail: "1 con preparacion previa" },
    { title: "Alertas sin confirmar", value: "6", detail: "3 urgentes" },
    { title: "Cuidadores asignados", value: "4", detail: "1 sin confirmar asistencia" },
    { title: "Proximos vencimientos", value: "3", detail: "receta y CUD incluidos" },
    { title: "Contactos rapidos", value: "7", detail: "familiares y emergencias" },
  ];

  const importantAlerts = [
    { text: "Medicacion no confirmada", status: "urgente" as const },
    { text: "Turno medico manana", status: "alerta" as const },
    { text: "Estudio con preparacion previa", status: "pendiente" as const },
    { text: "Cuidador no confirmo asistencia", status: "alerta" as const },
    { text: "Receta por vencer", status: "pendiente" as const },
    { text: "CUD por vencer", status: "urgente" as const },
  ];

  const quickActions = [
    { label: "Agregar medicamento", href: "/medicacion" },
    { label: "Agregar turno medico", href: "/turnos" },
    { label: "Agregar estudio", href: "/estudios" },
    { label: "Agregar cuidador", href: "/cuidadores" },
    { label: "Agregar contacto", href: "/contactos" },
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

      <section aria-label="Resumen principal" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            {importantAlerts.map((alert) => (
              <article
                key={alert.text}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-base font-medium text-slate-800">{alert.text}</p>
                <StatusBadge status={alert.status} />
              </article>
            ))}
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
