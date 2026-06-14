import { redirect } from "next/navigation";

import { PlanesClient } from "@/app/(app)/planes/planes-client";
import { PageHeader } from "@/components/ui/page-header";
import { loadCurrentSubscription } from "@/lib/data/planes";
import { isMercadoPagoEnabled } from "@/lib/payments/mercadopago";
import { PLAN_CATALOG } from "@/lib/plans";
import { getCurrentUser } from "@/lib/permissions";

export default async function PlanesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await loadCurrentSubscription();

  return (
    <section className="space-y-5 pb-8">
      <PageHeader
        title="Planes y monetización CARE"
        description="Comparativa de planes para familias, profesionales y proveedores de servicios. Intercambio y donaciones permanece gratuito."
      />

      <PlanesClient
        plans={PLAN_CATALOG}
        subscription={subscription}
        paymentsEnabled={isMercadoPagoEnabled()}
      />
    </section>
  );
}
