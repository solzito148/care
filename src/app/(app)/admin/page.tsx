import { redirect } from "next/navigation";

import { AdminClient } from "@/app/(app)/admin/admin-client";
import { PageHeader } from "@/components/ui/page-header";
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
    <section className="space-y-5 pb-8">
      <PageHeader
        title="Administración CARE"
        description="Moderación de recomendaciones, servicios y publicaciones, y gestión de suscripciones."
      />

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
