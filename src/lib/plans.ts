import type { MonetizationLine, PlanItem, PlanLimits } from "@/lib/monetizacion-types";

/**
 * Catalogo de planes CARE. Modelo simplificado a 3 verticales:
 *  - Familias (Tutor / familia)
 *  - Profesionales (cuidadores, medicos, enfermeros, terapeutas, abogados, contadores)
 *  - Empresas y proveedores (farmacias, ortopedias, residencias, servicios)
 * Mas el beneficio transversal de Intercambio y Donaciones (siempre $0).
 *
 * Fuente de verdad estatica: el pricing cambia poco. Si en el futuro se necesita
 * edicion desde el admin, migrar a una tabla `plans`.
 */
export const PLAN_CATALOG: PlanItem[] = [
  // 1) VERTICAL FAMILIAS -------------------------------------------------------
  {
    id: "fam-gratis",
    linea: "familias",
    nombre: "Plan Gratis",
    cliente: "Familias / Tutores",
    modalidad: "Suscripción mensual",
    precioMensual: "$0",
    descripcion: "Ideal para explorar la comunidad.",
    features: [
      "Acceso de lectura al marketplace de profesionales",
      "Módulo de Intercambio y Donaciones (100% gratuito)",
    ],
    limits: { cuidadores: 0, medicos: 0 },
  },
  {
    id: "fam-esencial",
    linea: "familias",
    nombre: "Familiar Esencial",
    cliente: "Familias / Tutores",
    modalidad: "Suscripción mensual",
    precioMensual: "$14.900",
    descripcion: "Para un esquema de cuidado básico o intermedio.",
    features: [
      "Gestión de medicamentos con alarmas en la app",
      "Turnos médicos y agenda compartida",
      "Contactos de emergencia",
      "Alertas push estándar",
      "Hasta 2 cuidadores y 2 médicos vinculados en simultáneo",
    ],
    limits: { cuidadores: 2, medicos: 2 },
    destacado: true,
  },
  {
    id: "fam-premium",
    linea: "familias",
    nombre: "Familiar Premium",
    cliente: "Familias / Tutores",
    modalidad: "Suscripción mensual",
    precioMensual: "$27.900",
    descripcion: "Para casos complejos, internación domiciliaria o equipos rotativos.",
    features: [
      "Todo lo del Plan Esencial",
      "Módulo de Estudios Médicos (repositorio ilimitado de PDFs y recetas)",
      "Alertas avanzadas (notificaciones críticas vía WhatsApp/SMS)",
      "Reportes de salud exportables en PDF",
      "Cuidadores y médicos ilimitados",
    ],
    limits: { cuidadores: null, medicos: null },
  },

  // 2) VERTICAL PROFESIONALES --------------------------------------------------
  {
    id: "pro-basico",
    linea: "profesionales",
    nombre: "Perfil Básico",
    cliente: "Cuidadores, médicos, enfermeros, terapeutas, abogados y contadores",
    modalidad: "Suscripción mensual",
    precioMensual: "$0",
    descripcion: "Perfil activo con alcance limitado.",
    features: [
      "Aparición al final de las búsquedas",
      "Contacto inicial únicamente por chat interno de CARE (datos de contacto ocultos)",
    ],
  },
  {
    id: "pro-destacado",
    linea: "profesionales",
    nombre: "Profesional Destacado",
    cliente: "Cuidadores, médicos, enfermeros, terapeutas, abogados y contadores",
    modalidad: "Suscripción mensual",
    precioMensual: "$19.500",
    descripcion: "Mayor visibilidad en búsquedas por zona.",
    features: [
      "Botón de contacto directo (WhatsApp/Teléfono)",
      'Sello de "Perfil Verificado"',
      "Visualización de reseñas",
    ],
    destacado: true,
  },
  {
    id: "pro-premium",
    linea: "profesionales",
    nombre: "Profesional Premium",
    cliente: "Cuidadores, médicos, enfermeros, terapeutas, abogados y contadores",
    modalidad: "Suscripción mensual",
    precioMensual: "$35.000",
    descripcion: "Posicionamiento prioritario y herramientas avanzadas.",
    features: [
      "Primeros lugares en los listados",
      "Agenda integrada para reservas directas",
      "Estadísticas de visitas al perfil",
    ],
  },

  // 3) VERTICAL EMPRESAS Y PROVEEDORES -----------------------------------------
  {
    id: "emp-estandar",
    linea: "empresas",
    nombre: "Empresa Estándar",
    cliente: "Farmacias, ortopedias, residencias y empresas de servicios",
    modalidad: "Suscripción mensual",
    precioMensual: "$25.000",
    descripcion: "Publicación básica para prestadores de servicios y comercios.",
    features: [
      "Perfil corporativo",
      "Catálogo de hasta 10 productos o servicios",
      "Link directo a web/WhatsApp",
    ],
  },
  {
    id: "emp-premium",
    linea: "empresas",
    nombre: "Empresa Premium",
    cliente: "Farmacias, ortopedias, residencias y empresas de servicios",
    modalidad: "Suscripción mensual + futura comisión",
    precioMensual: "$45.000",
    descripcion: "Exposición prioritaria y preparación para venta directa.",
    features: [
      "Banners destacados por zona",
      "Catálogo ilimitado",
      "Botón de compra/alquiler directo (infraestructura lista para comisiones futuras)",
      "Reportes de intención de compra",
    ],
    destacado: true,
  },

  // BENEFICIO TRANSVERSAL ------------------------------------------------------
  {
    id: "comunidad-intercambio",
    linea: "intercambio-donaciones",
    nombre: "Intercambio y Donaciones",
    cliente: "Toda la comunidad CARE",
    modalidad: "Gratuito, sin comisiones",
    precioMensual: "$0",
    descripcion:
      "Beneficio transversal: el módulo de Intercambio y Donaciones es 100% gratuito para toda la comunidad CARE.",
    features: [
      "Sin comisiones",
      "Sin dinero entre usuarios",
      "Disponible en todos los planes, incluso el gratuito",
    ],
  },
];

/** Etiqueta legible de cada vertical para agrupar en la UI. */
export const LINE_LABELS: Record<MonetizationLine, string> = {
  familias: "Familias",
  profesionales: "Profesionales",
  empresas: "Empresas y proveedores",
  "intercambio-donaciones": "Intercambio y donaciones",
};

/** Orden de aparicion de las verticales en la pagina de planes. */
export const LINE_ORDER: MonetizationLine[] = [
  "familias",
  "profesionales",
  "empresas",
  "intercambio-donaciones",
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

/**
 * Limites de vinculacion por defecto para una familia SIN suscripcion activa.
 * Coincide con el plan Esencial (2 cuidadores / 2 medicos) para no romper el
 * alta basica de la red de cuidado; el tope ilimitado se desbloquea con Premium.
 */
export const DEFAULT_FAMILY_LIMITS: PlanLimits = { cuidadores: 2, medicos: 2 };

/** Limites efectivos de un plan (familias). Planes sin `limits` => ilimitado. */
export function planLimits(plan: PlanItem): PlanLimits {
  return plan.limits ?? { cuidadores: null, medicos: null };
}

/**
 * Resuelve los limites de la familia a partir del id de plan de su suscripcion
 * activa. Si no hay plan conocido, usa los limites por defecto.
 */
export function familyLimitsForPlanId(planId: string | null | undefined): PlanLimits {
  if (!planId) return DEFAULT_FAMILY_LIMITS;
  const plan = findPlan(planId);
  if (!plan || plan.linea !== "familias") return DEFAULT_FAMILY_LIMITS;
  return planLimits(plan);
}
