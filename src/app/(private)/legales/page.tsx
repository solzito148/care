import { PrivatePage } from "@/components/layout/private-page";

export default function LegalesPage() {
  return (
    <PrivatePage
      title="Documentos legales"
      description="Documentación legal, consentimientos y firmas."
      requiredRoles={["legal_admin"]}
    />
  );
}
