import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const solveItems = [
  "Recordatorios de medicamentos",
  "Avisos de turnos médicos y estudios",
  "Vista simple para la persona cuidada",
  "Panel completo para tutores y cuidadores",
  "Contactos rápidos y emergencias",
];

const views = [
  {
    title: "Vista Administrador del Cuidado",
    description:
      "Permite a familias y tutores gestionar agenda, medicación, documentos, alertas y tareas en un panel completo.",
  },
  {
    title: "Vista Persona Cuidada",
    description:
      "Interfaz simple, con botones grandes y lectura clara para seguir actividades diarias sin complejidad.",
  },
];

const mision =
  "Nuestra misión es transformar el cuidado de las personas mayores a través de un lugar diseñado para centralizar y simplificar sus vidas, convirtiéndonos en una verdadera red de contención y ayuda para las familias. Conectamos al entorno familiar y permitimos que el adulto mayor tenga el control de sus médicos, turnos y contactos sin necesidad de recurrir a diferentes fuentes, transformando la complejidad del día a día en un proceso organizado, cercano y seguro.";

const vision =
  "Nuestra visión es consolidarnos como la comunidad de ayuda familiar más confiable, transformando la forma en que la sociedad gestiona el envejecimiento para que cuidar a nuestros mayores sea siempre sinónimo de paz mental, amor y organización, y nunca más de soledad o desinformación.";

const features = [
  "Agenda",
  "Medicación",
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
  "Desarme y organización del hogar",
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // #region agent log
  const sp = await searchParams;
  fetch('http://127.0.0.1:7470/ingest/ee3f8cae-88a9-4b0b-8537-c8bc3463e644',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db74d2'},body:JSON.stringify({sessionId:'db74d2',hypothesisId:'E',location:'app/page.tsx:root',message:'landing root render with params',data:{hasCode:!!sp.code,type:sp.type ?? null,error:sp.error ?? null,errorDescription:sp.error_description ?? null,allParams:Object.keys(sp)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <div className="min-h-screen bg-gradient-to-b from-care-50 to-white">
      <Header />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-8 pb-28 sm:px-6 lg:space-y-8 lg:px-8 lg:py-12">
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
              médicos, estudios, contactos, cuidadores, servicios y alertas.
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
          <div className="rounded-3xl bg-white p-3 shadow-soft ring-1 ring-care-100">
            <div
              aria-hidden
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            >
              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger-100" />
                <span className="h-3 w-3 rounded-full bg-warning-100" />
                <span className="h-3 w-3 rounded-full bg-success-100" />
                <span className="ml-3 text-xs font-semibold text-slate-400">
                  CARE · Panel del cuidado
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "Medicación", v: "3" },
                    { k: "Turnos hoy", v: "2" },
                    { k: "Alertas", v: "1" },
                  ].map((tile) => (
                    <div key={tile.k} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-2xl font-bold text-care-800">{tile.v}</p>
                      <p className="text-[11px] font-medium text-slate-500">{tile.k}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="h-2.5 w-24 rounded-full bg-slate-200" />
                    <span className="rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-bold text-warning-700">
                      Pendiente
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-2/3 rounded-full bg-slate-100" />
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="h-2.5 w-20 rounded-full bg-slate-200" />
                    <span className="rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-bold text-success-700">
                      Confirmado
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-1/2 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Atributos de la plataforma">
              <Badge tone="info">Accesible</Badge>
              <Badge tone="success">Mobile-first</Badge>
              <Badge tone="neutral">Simple y moderna</Badge>
              <Badge tone="warning">Prioridad en alertas</Badge>
            </div>
          </div>
        </section>

        <section>
          <Card size="lg">
            <h2 className="text-2xl font-semibold text-slate-900">Qué resuelve CARE</h2>
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

        <section
          aria-labelledby="proposito-heading"
          className="rounded-3xl bg-gradient-to-b from-care-50 to-white p-6 ring-1 ring-care-100 sm:p-10"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-care-100 px-3 py-1 text-sm font-semibold text-care-800">
              Nuestro propósito
            </span>
            <h2
              id="proposito-heading"
              className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              Por qué existe CARE
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Una red de contención que transforma la complejidad del cuidado en un proceso
              organizado, cercano y seguro.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Card size="lg" className="rounded-2xl border-t-4 border-t-care-600">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-care-600 text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                  </svg>
                </span>
                <h3 className="text-xl font-semibold text-slate-900">Misión</h3>
              </div>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{mision}</p>
            </Card>

            <Card size="lg" className="rounded-2xl border-t-4 border-t-care-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-care-500 text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <h3 className="text-xl font-semibold text-slate-900">Visión</h3>
              </div>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{vision}</p>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Dos vistas principales</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {views.map((item) => (
              <Card key={item.title}>
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
              <Card key={feature} size="sm">
                <p className="text-base font-semibold text-slate-800">{feature}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card size="lg">
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
            <h2 className="text-2xl font-bold">Empezá a organizar el cuidado hoy</h2>
            <p className="mt-3 max-w-2xl text-care-100">
              Centralizá información, evitá olvidos y mejorá la coordinación diaria entre familia,
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-care-100 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <Button href="/registro" size="lg" className="w-full">
          Crear cuenta gratis
        </Button>
      </div>
    </div>
  );
}
