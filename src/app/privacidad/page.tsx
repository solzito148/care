import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de privacidad - CARE",
  description:
    "Como CARE recopila, usa y protege los datos personales y de salud de las personas usuarias.",
};

const UPDATED_AT = "13 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link href="/" className="text-sm font-medium text-care-700 hover:text-care-800">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Politica de privacidad</h1>
      <p className="mt-2 text-sm text-slate-500">Ultima actualizacion: {UPDATED_AT}</p>

      <div className="mt-8 space-y-8 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Quienes somos</h2>
          <p className="mt-2">
            CARE es una plataforma para la gestion integral del cuidado de personas
            mayores. Esta politica explica que datos tratamos, con que finalidad y
            que derechos tenes sobre ellos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Datos que recopilamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Datos de cuenta: nombre, email, telefono y tipo de cuenta.</li>
            <li>
              Datos de la persona cuidada y de salud (estudios medicos, medicacion,
              contactos y notas) que cargas para gestionar el cuidado.
            </li>
            <li>Datos de uso tecnico necesarios para operar el servicio.</li>
          </ul>
          <p className="mt-2">
            Los datos de salud son <strong>categorias especiales</strong> y se tratan
            con acceso restringido por hogar mediante controles de seguridad a nivel
            de base de datos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. Pagos</h2>
          <p className="mt-2">
            Los pagos se procesan a traves de proveedores externos certificados
            (Mercado Pago y, en la app de iOS, Apple). <strong>CARE no almacena ni
            procesa los datos de tu tarjeta</strong>: esos datos se ingresan
            directamente en el entorno seguro del proveedor de pago. Solo guardamos
            el estado de la suscripcion y una referencia externa del pago.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Donde se almacenan los datos</h2>
          <p className="mt-2">
            Los datos se alojan en Supabase (base de datos y almacenamiento de
            archivos) con cifrado en transito (HTTPS/TLS) y acceso restringido. Los
            archivos de estudios se guardan en un bucket privado al que solo se
            accede mediante enlaces temporales firmados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Tus derechos</h2>
          <p className="mt-2">
            Podes acceder, corregir y eliminar tus datos. Para eliminar tu cuenta y
            los datos de los hogares que administras de forma permanente, usa la
            opcion <strong>Eliminar cuenta</strong> en{" "}
            <Link href="/mi-cuenta" className="font-medium text-care-700 hover:text-care-800">
              Mi cuenta
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Contacto</h2>
          <p className="mt-2">
            Ante cualquier consulta sobre privacidad o el ejercicio de tus derechos,
            podes contactarnos desde la seccion de soporte de la aplicacion.
          </p>
        </section>

        <p className="border-t border-slate-200 pt-6 text-sm text-slate-500">
          Este documento es una plantilla base y debe ser revisado por asesoria legal
          antes de la publicacion definitiva en tiendas de aplicaciones.
        </p>
      </div>
    </main>
  );
}
