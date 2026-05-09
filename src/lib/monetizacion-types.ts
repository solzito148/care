export type MonetizationLine =
  | "planes-familiares"
  | "profesionales"
  | "proveedores-marketplace"
  | "servicios"
  | "legales-administrativos"
  | "intercambio-donaciones";

export type SubscriptionStatus = "activa" | "pendiente-pago" | "vencida" | "cancelada";

export type PlanItem = {
  id: string;
  linea: MonetizationLine;
  nombre: string;
  cliente: string;
  modalidad: string;
  precioMensual: string;
  descripcion: string;
  destacado?: boolean;
};

export type CurrentSubscription = {
  cuenta: string;
  planNombre: string;
  linea: MonetizationLine;
  estado: SubscriptionStatus;
  proximoVencimiento: string;
  monto: string;
  cicloFacturacion: string;
  notaIntegracion: string;
};
