import { redirect } from "next/navigation";

import { MarketplaceClient } from "@/app/(app)/marketplace/marketplace-client";
import { ensureCareContext } from "@/lib/data/care-context";
import { loadMarketplaceItems } from "@/lib/data/marketplace";

export default async function MarketplacePage() {
  const ctx = await ensureCareContext();
  if (!ctx) redirect("/login");

  const items = await loadMarketplaceItems();

  return <MarketplaceClient items={items} />;
}
