import { PrivatePage } from "@/components/layout/private-page";

export default function MarketplacePage() {
  return (
    <PrivatePage
      title="Marketplace"
      description="Catálogo de servicios y proveedores."
      requiredRoles={["tutor", "provider"]}
    />
  );
}
