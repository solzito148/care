import { redirect } from "next/navigation";

import { PlanesClient } from "@/app/(app)/planes/planes-client";
import { Card } from "@/components/ui/card";
import { loadCurrentSubscription } from "@/lib/data/planes";
import { isMercadoPagoEnabled } from "@/lib/payments/mercadopago";
import { PLAN_CATALOG } from "@/lib/plans";
import { getCurrentUser } from "@/lib/permissions";

export default async function PlanesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await loadCurrentSubscription();

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Planes y monetizacion CARE</h1>
        <p className="mt-2 text-slate-700">
          Comparativa de planes para familias, profesionales, proveedores de marketplace y servicios.
          Intercambio y donaciones permanece gratuito.
        </p>
      </Card>

      <PlanesClient
        plans={PLAN_CATALOG}
        subscription={subscription}
        paymentsEnabled={isMercadoPagoEnabled()}
      />
    </section>
  );
}
