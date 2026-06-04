import { PersonaCuidadaFormStub } from "@/components/forms/persona-cuidada-form";
import { PrivatePage } from "@/components/layout/private-page";

export default function PersonaCuidadaPage() {
  return (
    <PrivatePage
      title="Persona cuidada"
      description="Información básica y seguimiento de la persona bajo cuidado."
      requiredRoles={["tutor", "caregiver", "professional"]}
    >
      <PersonaCuidadaFormStub />
    </PrivatePage>
  );
}
