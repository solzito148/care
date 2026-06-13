import { Card } from "@/components/ui/card";

type SectionPageProps = {
  title: string;
  description: string;
};

export function SectionPage({ title, description }: SectionPageProps) {
  return (
    <section className="space-y-4">
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">{description}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Próxima iteración</h2>
          <p className="mt-2 text-sm text-slate-600">
            Este módulo ya está preparado para agregar funcionalidades reales con componentes
            reutilizables y enfoque mobile-first.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Accesibilidad</h2>
          <p className="mt-2 text-sm text-slate-600">
            Se mantienen jerarquías claras, contrastes altos y tipografías legibles para personas
            mayores y familias cuidadoras.
          </p>
        </Card>
      </div>
    </section>
  );
}
