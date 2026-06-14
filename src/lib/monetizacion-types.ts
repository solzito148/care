/**
 * Verticales de monetizacion de CARE. Modelo simplificado a 3 lineas de negocio
 * mas el beneficio transversal de Intercambio y Donaciones (siempre gratuito).
 */
export type MonetizationLine =
  | "familias"
  | "profesionales"
  | "empresas"
  | "intercambio-donaciones";

export type SubscriptionStatus = "activa" | "pendiente-pago" | "vencida" | "cancelada";

/**
 * Limites de vinculacion por plan (vertical Familias).
 * `null` significa ilimitado.
 */
export type PlanLimits = {
  cuidadores: number | null;
  medicos: number | null;
};

export type PlanItem = {
  id: string;
  linea: MonetizationLine;
  nombre: string;
  cliente: string;
  modalidad: string;
  precioMensual: string;
  descripcion: string;
  /** Beneficios incluidos, para listar en la tarjeta de pricing. */
  features: string[];
  /** Solo aplica a la vertical Familias: tope de cuidadores/medicos vinculados. */
  limits?: PlanLimits;
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
