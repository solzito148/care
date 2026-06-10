import { redirect } from "next/navigation";

import { AdminClient } from "@/app/(app)/admin/admin-client";
import { Card } from "@/components/ui/card";
import {
  buildAdminOverview,
  listAllMarketplaceItems,
  listAllServices,
  listAllSubscriptions,
  listPendingRecommendations,
} from "@/lib/data/admin";
import { getCurrentUser } from "@/lib/permissions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("admin")) redirect("/403");

  const [recommendations, services, items, subscriptions] = await Promise.all([
    listPendingRecommendations(),
    listAllServices(),
    listAllMarketplaceItems(),
    listAllSubscriptions(),
  ]);

  const overview = buildAdminOverview(recommendations, services, items, subscriptions);

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Administracion CARE</h1>
        <p className="mt-2 text-slate-700">
          Moderacion de recomendaciones, servicios y marketplace, y gestion de suscripciones.
        </p>
      </Card>

      <AdminClient
        overview={overview}
        recommendations={recommendations}
        services={services}
        items={items}
        subscriptions={subscriptions}
      />
    </section>
  );
}
