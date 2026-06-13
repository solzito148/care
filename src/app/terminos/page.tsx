import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terminos y condiciones - CARE",
  description: "Condiciones de uso de la plataforma CARE.",
};

const UPDATED_AT = "13 de junio de 2026";

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link href="/" className="text-sm font-medium text-care-700 hover:text-care-800">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Terminos y condiciones</h1>
      <p className="mt-2 text-sm text-slate-500">Ultima actualizacion: {UPDATED_AT}</p>

      <div className="mt-8 space-y-8 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Aceptacion</h2>
          <p className="mt-2">
            Al crear una cuenta y usar CARE aceptas estos terminos. Si no estas de
            acuerdo, no utilices el servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Uso del servicio</h2>
          <p className="mt-2">
            CARE es una herramienta de organizacion del cuidado y{" "}
            <strong>no sustituye el consejo medico profesional</strong>. Sos
            responsable de la veracidad de los datos que cargas y de contar con la
            autorizacion necesaria para registrar informacion de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. Cuentas y seguridad</h2>
          <p className="mt-2">
            Sos responsable de mantener la confidencialidad de tus credenciales y de
            la actividad realizada desde tu cuenta. Notificanos ante cualquier uso no
            autorizado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Planes y pagos</h2>
          <p className="mt-2">
            Algunos planes son pagos. El cobro se realiza a traves de proveedores de
            pago externos. Los precios y condiciones de cada plan se muestran antes de
            confirmar la suscripcion. Podes gestionar o cancelar tu plan desde{" "}
            <Link href="/mi-cuenta" className="font-medium text-care-700 hover:text-care-800">
              Mi cuenta
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Baja de la cuenta</h2>
          <p className="mt-2">
            Podes eliminar tu cuenta en cualquier momento desde Mi cuenta. La
            eliminacion es permanente e incluye los datos de los hogares que
            administras.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Limitacion de responsabilidad</h2>
          <p className="mt-2">
            El servicio se ofrece &quot;tal cual&quot;. En la maxima medida permitida
            por la ley, CARE no se responsabiliza por danos derivados del uso o la
            imposibilidad de uso del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. Cambios</h2>
          <p className="mt-2">
            Podemos actualizar estos terminos. Te avisaremos de cambios relevantes y
            la fecha de ultima actualizacion figura al inicio de este documento.
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
