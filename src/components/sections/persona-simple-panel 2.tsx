import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export function PersonaSimplePanel() {
  return (
    <section className="space-y-4">
      <Card className="p-6 sm:p-8">
        <h2 className="text-simple-title text-slate-900">Resumen del dia</h2>
        <p className="mt-3 text-simple-text text-slate-700">
          Hoy tenes 2 medicaciones pendientes y 1 turno confirmado.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <StatusBadge status="pendiente" />
          <StatusBadge status="confirmado" />
          <StatusBadge status="actualizado" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-slate-900">Medicacion 18:00</h3>
          <p className="mt-2 text-xl text-slate-700">Losartan 50 mg</p>
          <div className="mt-4">
            <StatusBadge status="alerta" />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-slate-900">Turno medico</h3>
          <p className="mt-2 text-xl text-slate-700">Viernes 10:30 - Clinica Central</p>
          <div className="mt-4">
            <StatusBadge status="recomendado" />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg">Marcar tarea realizada</Button>
        <Button variant="secondary" size="lg">
          Ver agenda completa
        </Button>
      </div>
    </section>
  );
}
