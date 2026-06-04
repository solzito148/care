import { PrivatePage } from "@/components/layout/private-page";

export default function ContactosPage() {
  return (
    <PrivatePage
      title="Contactos"
      description="Contactos de emergencia y red de apoyo."
      requiredRoles={["tutor", "caregiver", "professional"]}
    />
  );
}
