import { CuidadorFormStub } from "@/components/forms/cuidador-form";
import { PrivatePage } from "@/components/layout/private-page";

export default function CuidadoresPage() {
  return (
    <PrivatePage
      title="Cuidadores"
      description="Gestión de cuidadores asignados. Solo visible para tutores."
      requiredRoles={["tutor"]}
    >
      <CuidadorFormStub />
    </PrivatePage>
  );
}
