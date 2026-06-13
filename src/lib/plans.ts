import type { PlanItem } from "@/lib/monetizacion-types";

/**
 * Catalogo de planes CARE. Fuente de verdad (antes vivia en mock-data).
 * Estatico a proposito: el pricing cambia poco y no amerita una tabla. Si en el
 * futuro se necesita edicion desde el admin, migrar a una tabla `plans`.
 */
export const PLAN_CATALOG: PlanItem[] = [
  { id: "pf-1", linea: "planes-familiares", nombre: "Gratis", cliente: "Tutor / familia", modalidad: "Suscripción mensual", precioMensual: "$0", descripcion: "Acceso inicial con funcionalidades limitadas." },
  { id: "pf-2", linea: "planes-familiares", nombre: "Familiar Básico", cliente: "Tutor / familia", modalidad: "Suscripción mensual", precioMensual: "$9.900", descripcion: "Funciones esenciales para seguimiento diario del cuidado." },
  { id: "pf-3", linea: "planes-familiares", nombre: "Familiar Plus", cliente: "Tutor / familia", modalidad: "Suscripción mensual", precioMensual: "$19.900", descripcion: "Alertas avanzadas, reportes y mayor capacidad de gestión.", destacado: true },
  { id: "pf-4", linea: "planes-familiares", nombre: "Familiar Premium", cliente: "Tutor / familia", modalidad: "Suscripción mensual", precioMensual: "$34.900", descripcion: "Experiencia completa con soporte prioritario." },
  { id: "pr-1", linea: "profesionales", nombre: "Perfil gratuito", cliente: "Cuidadores, médicos, enfermeros, terapeutas, abogados, contadores", modalidad: "Fee mensual por publicación", precioMensual: "$0", descripcion: "Perfil no destacado con alcance limitado." },
  { id: "pr-2", linea: "profesionales", nombre: "Perfil publicado", cliente: "Profesionales", modalidad: "Fee mensual por publicación", precioMensual: "$12.500", descripcion: "Perfil visible en búsquedas y contacto directo." },
  { id: "pr-3", linea: "profesionales", nombre: "Perfil destacado", cliente: "Profesionales", modalidad: "Fee mensual por publicación", precioMensual: "$22.000", descripcion: "Mayor posicionamiento y badge de destacado.", destacado: true },
  { id: "pr-4", linea: "profesionales", nombre: "Perfil premium", cliente: "Profesionales", modalidad: "Fee mensual por publicación", precioMensual: "$35.000", descripcion: "Posición preferencial y beneficios de conversión." },
  { id: "pm-1", linea: "proveedores-marketplace", nombre: "Proveedor de productos", cliente: "Farmacias, ortopedias, alquiler, insumos", modalidad: "Fee mensual + futura comisión por venta/alquiler", precioMensual: "$45.000", descripcion: "Publicación de productos con preparación para comisiones futuras." },
  { id: "sv-1", linea: "servicios", nombre: "Servicio Básico", cliente: "Empresas / prestadores de servicios", modalidad: "Fee mensual por publicar servicio", precioMensual: "$14.000", descripcion: "Publicación básica de servicios." },
  { id: "sv-2", linea: "servicios", nombre: "Servicio Destacado", cliente: "Empresas / prestadores de servicios", modalidad: "Fee mensual por publicar servicio", precioMensual: "$24.000", descripcion: "Mayor visibilidad en listados.", destacado: true },
  { id: "sv-3", linea: "servicios", nombre: "Servicio Premium", cliente: "Empresas / prestadores de servicios", modalidad: "Fee mensual por publicar servicio", precioMensual: "$39.000", descripcion: "Exposición prioritaria y posición destacada." },
  { id: "lg-1", linea: "legales-administrativos", nombre: "Legal / Administrativo publicado", cliente: "Abogados, contadores, gestores CUD, liquidadores", modalidad: "Fee mensual por publicar nombre y servicio", precioMensual: "$16.500", descripcion: "Publicación profesional para servicios legales y administrativos." },
  { id: "id-1", linea: "intercambio-donaciones", nombre: "Intercambio y donaciones", cliente: "Comunidad CARE", modalidad: "Gratuito, sin comisión, sin dinero entre usuarios", precioMensual: "$0", descripcion: "Uso social sin cobros ni comisiones." },
];

export function findPlan(planId: string): PlanItem | undefined {
  return PLAN_CATALOG.find((plan) => plan.id === planId);
}

/** Convierte "$19.900" a un numero (19900). Devuelve 0 para planes gratuitos. */
export function planPriceToNumber(precioMensual: string): number {
  const digits = precioMensual.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
}

export function isFreePlan(plan: PlanItem): boolean {
  return planPriceToNumber(plan.precioMensual) === 0;
}
