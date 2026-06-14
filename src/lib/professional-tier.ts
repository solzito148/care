/**
 * Niveles de la Vertical Profesionales (cuidadores, médicos, enfermeros,
 * kinesiólogos, abogados, contadores, etc.). Modelo unificado a 3 niveles que
 * reemplaza los planes viejos (Perfil gratuito/publicado/destacado/premium y
 * Legal/Administrativo). Cada nivel mapea a un plan del catálogo (`plans.ts`)
 * y define las capacidades de UI/UX y de negocio.
 */
export type ProfessionalTier = "basico" | "destacado" | "premium";

export type ProfessionalTierCapabilities = {
  tier: ProfessionalTier;
  /** Etiqueta legible. */
  label: string;
  /** Id del plan correspondiente en PLAN_CATALOG. */
  planId: string;
  /** Habilita contacto directo (WhatsApp / Teléfono). Si es false, solo chat de CARE. */
  showDirectContact: boolean;
  /** Muestra el sello "Perfil Verificado" (dorado). */
  isVerified: boolean;
  /** Muestra reseñas / calificaciones de estrellas de las familias. */
  showReviews: boolean;
  /** Habilita el módulo de Agenda Integrada (reservas online). */
  hasIntegratedAgenda: boolean;
  /** Habilita el panel de Estadísticas de Perfil (vistas, clics en WhatsApp). */
  hasProfileStats: boolean;
  /** Boost de posicionamiento en los listados de búsqueda (mayor = más arriba). */
  rankBoost: number;
};

/**
 * Mapa canónico de capacidades por nivel. Es la fuente de verdad para la
 * lógica condicional del frontend: visibilidad de contacto, sello verificado,
 * reseñas, agenda integrada, estadísticas y orden en los listados.
 */
export const PROFESSIONAL_TIERS: Record<ProfessionalTier, ProfessionalTierCapabilities> = {
  basico: {
    tier: "basico",
    label: "Básico",
    planId: "pro-basico",
    showDirectContact: false,
    isVerified: false,
    showReviews: false,
    hasIntegratedAgenda: false,
    hasProfileStats: false,
    rankBoost: 0,
  },
  destacado: {
    tier: "destacado",
    label: "Destacado",
    planId: "pro-destacado",
    showDirectContact: true,
    isVerified: true,
    showReviews: true,
    hasIntegratedAgenda: false,
    hasProfileStats: false,
    rankBoost: 50,
  },
  premium: {
    tier: "premium",
    label: "Premium",
    planId: "pro-premium",
    showDirectContact: true,
    isVerified: true,
    showReviews: true,
    hasIntegratedAgenda: true,
    hasProfileStats: true,
    rankBoost: 200,
  },
};

export function tierCapabilities(tier: ProfessionalTier): ProfessionalTierCapabilities {
  return PROFESSIONAL_TIERS[tier];
}

/** Normaliza un valor arbitrario (DB, legado) a un nivel válido. Default: básico. */
export function normalizeProfessionalTier(value: string | null | undefined): ProfessionalTier {
  switch ((value ?? "").toLowerCase()) {
    case "premium":
      return "premium";
    case "destacado":
    case "featured":
      return "destacado";
    case "basico":
    case "básico":
    case "basic":
    case "gratis":
    case "free":
      return "basico";
    default:
      return "basico";
  }
}

/** Construye un link de WhatsApp (wa.me) a partir de un teléfono con cualquier formato. */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

/** Construye un link `tel:` a partir de un teléfono con cualquier formato. */
export function telLink(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}
