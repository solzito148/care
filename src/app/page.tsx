import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const solveItems = [
  "Recordatorios de medicamentos",
  "Avisos de turnos medicos y estudios",
  "Vista simple para la persona cuidada",
  "Panel completo para tutores y cuidadores",
  "Contactos rapidos y emergencias",
];

const views = [
  {
    title: "Vista Administrador del Cuidado",
    description:
      "Permite a familias y tutores gestionar agenda, medicacion, documentos, alertas y tareas en un panel completo.",
  },
  {
    title: "Vista Persona Cuidada",
    description:
      "Interfaz simple, con botones grandes y lectura clara para seguir actividades diarias sin complejidad.",
  },
];

const features = [
  "Agenda",
  "Medicacion",
  "Estudios",
  "Turnos",
  "Cuidadores",
  "Servicios",
  "Legales y administrativos",
];

const serviceOfferings = [
  "Venta",
  "Alquiler",
  "Intercambio y donaciones",
  "Traslados",
  "Ambulancias",
  "Desarme y organizacion del hogar",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-care-50 to-white">
      <Header />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:space-y-8 lg:px-8 lg:py-12">
        <section className="grid items-center gap-6 lg:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full bg-care-100 px-3 py-1 text-sm font-semibold text-care-800">
              Plataforma de cuidado integral
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Organiza el cuidado de una persona mayor desde un solo lugar
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              CARE ayuda a familias, tutores y cuidadores a gestionar medicamentos, turnos
              medicos, estudios, contactos, cuidadores, servicios y alertas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/registro" size="lg">
                Crear cuenta
              </Button>
              <Button href="/login" variant="secondary" size="lg">
                Ingresar
              </Button>
            </div>
          </div>
          <Card className="rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Disenada para uso diario</h2>
            <p className="mt-3 text-slate-600">
              Interfaz clara, confiable y accesible para familias y adultos mayores, priorizando
              tareas criticas y lectura comoda.
            </p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Atributos de la plataforma">
              <Badge tone="info">Accesible</Badge>
              <Badge tone="success">Mobile-first</Badge>
              <Badge tone="neutral">Simple y moderna</Badge>
              <Badge tone="warning">Prioridad en alertas</Badge>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Que resuelve CARE</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {solveItems.map((item) => (
                <article key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-care-100 text-sm font-bold text-care-800">
                    C
                  </span>
                  <p className="text-base text-slate-700">{item}</p>
                </article>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Dos vistas principales</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {views.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Funcionalidades principales</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature} className="p-4">
                <p className="text-base font-semibold text-slate-800">{feature}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Servicios</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {serviceOfferings.map((item) => (
                <article key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-800">{item}</p>
                </article>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <div className="rounded-3xl border border-care-700 bg-care-700 p-6 text-white shadow-soft sm:p-8">
            <h2 className="text-2xl font-bold">Empeza a organizar el cuidado hoy</h2>
            <p className="mt-3 max-w-2xl text-care-100">
              Centraliza informacion, evita olvidos y mejora la coordinacion diaria entre familia,
              tutores y cuidadores.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/registro" size="lg" className="bg-white text-care-800 hover:bg-care-50">
                Crear cuenta
              </Button>
              <Button
                href="/login"
                size="lg"
                variant="secondary"
                className="border-care-200 bg-care-700 text-white hover:bg-care-800"
              >
                Ingresar
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
