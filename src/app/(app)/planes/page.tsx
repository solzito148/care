import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { monetizationPlansMock } from "@/lib/monetizacion-mock";

export default function PlanesPage() {
  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Planes y monetizacion CARE</h1>
        <p className="mt-2 text-slate-700">
          Comparativa de planes para familias, profesionales, proveedores de marketplace y servicios.
          Intercambio y donaciones permanece gratuito.
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {monetizationPlansMock.map((plan) => (
          <Card key={plan.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{plan.nombre}</h2>
              {plan.destacado ? <Badge tone="success">Destacado</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-slate-700"><strong>Cliente:</strong> {plan.cliente}</p>
            <p className="mt-1 text-sm text-slate-700"><strong>Modalidad:</strong> {plan.modalidad}</p>
            <p className="mt-1 text-sm text-slate-700"><strong>Precio mensual:</strong> {plan.precioMensual}</p>
            <p className="mt-1 text-sm text-slate-700">{plan.descripcion}</p>
            <div className="mt-4">
              <Button className="w-full" variant="secondary">Seleccionar plan</Button>
            </div>
          </Card>
        ))}
      </section>
    </section>
  );
}
