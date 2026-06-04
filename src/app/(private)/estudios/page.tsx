import { PrivatePage } from "@/components/layout/private-page";

export default function EstudiosPage() {
  return (
    <PrivatePage
      title="Estudios"
      description="Resultados clínicos y estudios médicos."
      requiredRoles={["tutor", "professional"]}
    />
  );
}
