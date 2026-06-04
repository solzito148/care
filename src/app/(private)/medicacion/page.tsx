import { MedicacionFormStub } from "@/components/forms/medicacion-form";
import { PrivatePage } from "@/components/layout/private-page";

export default function MedicacionPage() {
  return (
    <PrivatePage
      title="Medicación"
      description="Plan de medicación, dosis y alertas."
      requiredRoles={["tutor", "caregiver", "professional"]}
    >
      <MedicacionFormStub />
    </PrivatePage>
  );
}
