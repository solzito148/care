import { Badge } from "@/components/ui/badge";

export type CareStatus =
  | "pendiente"
  | "confirmado"
  | "alerta"
  | "urgente"
  | "actualizado"
  | "recomendado"
  | "proximo";

type StatusBadgeProps = {
  status: CareStatus;
};

const statusMap: Record<CareStatus, { label: string; tone: "warning" | "success" | "danger" | "info" }> = {
  pendiente: { label: "Pendiente", tone: "warning" },
  confirmado: { label: "Confirmado", tone: "success" },
  alerta: { label: "Alerta", tone: "warning" },
  urgente: { label: "Urgente", tone: "danger" },
  actualizado: { label: "Actualizado", tone: "info" },
  recomendado: { label: "Recomendado", tone: "success" },
  proximo: { label: "Proximo", tone: "info" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
