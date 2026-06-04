import { PrivatePage } from "@/components/layout/private-page";

export default function TurnosPage() {
  return (
    <PrivatePage
      title="Turnos"
      description="Gestión de turnos de cuidado."
      requiredRoles={["tutor", "caregiver"]}
    />
  );
}
