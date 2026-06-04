import { PrivatePage } from "@/components/layout/private-page";

export default function PlanesPage() {
  return (
    <PrivatePage
      title="Planes"
      description="Planes de cuidado y suscripciones."
      requiredRoles={["tutor"]}
    />
  );
}
