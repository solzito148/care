import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y condiciones - CARE",
  description:
    "Términos y condiciones de uso de la plataforma CARE, adaptados a la legislación de la República Argentina.",
};

const UPDATED_AT = "13 de junio de 2026";

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link href="/" className="text-sm font-medium text-care-700 hover:text-care-800">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">
        Términos y condiciones de uso de la plataforma CARE
      </h1>
      <p className="mt-2 text-sm text-slate-500">Última actualización: {UPDATED_AT}</p>

      <div className="mt-8 space-y-8 text-slate-700">
        <p>
          Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma web
          y aplicación móvil <strong>CARE</strong> (en adelante, la &quot;Plataforma&quot;).
          Cualquier persona que acceda, se registre o utilice la Plataforma (en adelante, el
          &quot;Usuario&quot;, incluyendo bajo este término a familias, tutores, adultos
          mayores, cuidadores, médicos, profesionales de la salud, abogados, contadores y
          proveedores de productos o servicios) acepta de forma expresa, plena y sin reservas
          los términos aquí expuestos.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            1. Naturaleza del servicio: mero intermediario
          </h2>
          <p className="mt-2">
            CARE es una plataforma tecnológica cuyo único objeto es ofrecer un espacio virtual
            de comunidad, gestión y nexo de unión entre particulares (familias/tutores) y
            terceros proveedores independientes (profesionales de la salud, cuidadores,
            comercios, etc.).
          </p>
          <div className="mt-4 rounded-xl border-l-4 border-l-care-600 bg-care-50 p-4">
            <p>
              <strong>IMPORTANTE:</strong> CARE <strong>no es</strong> una empresa de medicina
              prepaga, <strong>no es</strong> un prestador de servicios de salud,{" "}
              <strong>no es</strong> una agencia de empleo de cuidadores, ni un comercio de
              venta o alquiler de insumos médicos. CARE no presta ningún servicio asistencial,
              médico, terapéutico ni comercial por sí misma.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            2. Exclusión absoluta de responsabilidad por servicios y mala praxis
          </h2>
          <p className="mt-2">
            Dado que CARE no participa, no supervisa ni tiene control sobre la ejecución de los
            servicios publicados por los Usuarios Profesionales o Proveedores, se establece que:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Sin responsabilidad por idoneidad:</strong> La aparición de un profesional
              o proveedor en la Plataforma (incluso aquellos con la condición de &quot;Perfil
              Verificado&quot; o planes pagos) no implica una recomendación, garantía o aval por
              parte de CARE respecto a su idoneidad, moralidad, capacidad técnica o legal para
              ejercer dicha actividad.
            </li>
            <li>
              <strong>Exclusión por mala praxis:</strong> CARE queda totalmente exenta de
              cualquier tipo de responsabilidad civil, penal, administrativa o de cualquier otra
              índole por daños y perjuicios, lesiones, mala praxis médica, negligencia, abandono,
              hurto, o cualquier otro hecho ilícito o perjudicial que pudiera ocurrir en el marco
              de la relación directa entre la familia/adulto mayor y el profesional o cuidador
              contratado.
            </li>
            <li>
              <strong>Vínculo directo:</strong> Toda contratación, acuerdo o prestación de
              servicios se realiza bajo el exclusivo riesgo y cuenta de las partes intervinientes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            3. Inexistencia de relación laboral
          </h2>
          <p className="mt-2">
            El uso de la Plataforma por parte de los cuidadores, médicos o cualquier otro
            profesional no genera, bajo ninguna circunstancia, una relación de dependencia,
            vínculo laboral, sociedad, ni contrato de agencia o franquicia entre dichos
            profesionales y CARE.
          </p>
          <p className="mt-2">
            Los profesionales independientes actúan por su propia cuenta y riesgo, siendo los
            únicos responsables del cumplimiento de las normativas laborales, previsionales y de
            seguridad social aplicables a su actividad en la República Argentina.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            4. Exclusión de responsabilidad fiscal y de facturación
          </h2>
          <p className="mt-2">
            CARE es ajena a las transacciones económicas, comerciales y contractuales que se
            celebren entre los Usuarios. En consecuencia:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Facturación independiente:</strong> Cada proveedor, comercio o profesional
              independiente es el único y exclusivo responsable de fijar sus honorarios/precios,
              percibir sus cobros y emitir las facturas correspondientes (Facturas A, B, C o
              recibos válidos) de acuerdo con las normativas vigentes de la Administración Federal
              de Ingresos Públicos (AFIP) y demás organismos provinciales.
            </li>
            <li>
              <strong>Sin intermediación financiera:</strong> CARE no es responsable por la falta
              de entrega, defectos, roturas, demoras o deficiencias en los materiales,
              medicamentos o insumos adquiridos o alquilados a través de los proveedores listados
              en la Plataforma. CARE no actúa como agente de retención ni interviene en las
              disputas económicas entre los usuarios.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            5. Módulo de intercambio y donaciones
          </h2>
          <p className="mt-2">
            El módulo destinado al intercambio y donación de insumos entre los miembros de la
            comunidad CARE es de uso estrictamente social y gratuito.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              CARE no verifica el estado de conservación, higiene, funcionamiento o fecha de
              vencimiento de los productos, medicamentos o insumos donados o intercambiados.
            </li>
            <li>
              El uso, aceptación y consumo de dichos elementos es bajo la exclusiva
              responsabilidad del Usuario que los recibe, eximiendo a CARE de cualquier reclamo
              por intoxicación, falla de materiales o daños derivados.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Indemnidad</h2>
          <p className="mt-2">
            El Usuario se compromete a mantener indemne a CARE, sus directivos, empleados y
            representantes frente a cualquier reclamo, demanda, sanción o acción legal (incluyendo
            honorarios de abogados) iniciada por otros Usuarios o terceros, que tenga su origen o
            causa en el uso de la Plataforma, el incumplimiento de estos Términos y Condiciones, o
            la violación de leyes o derechos de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            7. Legislación aplicable y jurisdicción
          </h2>
          <p className="mt-2">
            Estos Términos y Condiciones se rigen por las leyes vigentes de la{" "}
            <strong>República Argentina</strong>.
          </p>
          <p className="mt-2">
            Para cualquier controversia derivada del uso de la Plataforma o la interpretación de
            estos términos, las partes se someten a la jurisdicción de los{" "}
            <strong>Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires</strong>,
            renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera
            corresponderles.
          </p>
        </section>

        <p className="border-t border-slate-200 pt-6 text-sm text-slate-500">
          Podés gestionar o dar de baja tu cuenta en cualquier momento desde{" "}
          <Link href="/mi-cuenta" className="font-medium text-care-700 hover:text-care-800">
            Mi cuenta
          </Link>
          . Consultá también nuestra{" "}
          <Link href="/privacidad" className="font-medium text-care-700 hover:text-care-800">
            política de privacidad
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
