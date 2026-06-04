import { PrivatePage } from "@/components/layout/private-page";

export default function AgendaPage() {
  return (
    <PrivatePage
      title="Agenda"
      description="Calendario de tareas, visitas y recordatorios."
      requiredRoles={["tutor", "caregiver"]}
    />
  );
}
