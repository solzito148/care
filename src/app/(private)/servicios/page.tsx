import { PrivatePage } from "@/components/layout/private-page";

export default function ServiciosPage() {
  return (
    <PrivatePage
      title="Servicios"
      description="Servicios contratados y disponibles."
      requiredRoles={["tutor", "provider"]}
    />
  );
}
