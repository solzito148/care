import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AltaCuidadorPage() {
  return (
    <main className="space-y-4">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Alta de Cuidadores</h1>
        <p className="mt-2 text-slate-700">
          El formulario multi-step de alta esta disponible en la version anterior del flujo y se
          mantendra en este modulo en la siguiente iteracion.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/cuidadores">Volver a busqueda</Button>
          <Button href="/dashboard" variant="secondary">
            Ir al dashboard
          </Button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Si necesitas retomar alta mock inmediatamente, puedo mover el formulario completo aqui.
        </p>
      </Card>
      <Link href="/cuidadores" className="text-sm font-medium text-care-700">
        Volver
      </Link>
    </main>
  );
}
