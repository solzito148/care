export type ServiceCategory =
  | "traslados-y-acompanamiento"
  | "desarme-y-organizacion-del-hogar"
  | "adaptacion-del-hogar"
  | "tramites-y-gestiones"
  | "servicios-domiciliarios-complementarios";

export type ServicePlan = "Basico" | "Destacado" | "Premium";

export type ServiceItem = {
  id: string;
  nombreProveedor: string;
  categoria: ServiceCategory;
  descripcion: string;
  zonaCobertura: string;
  telefonoWhatsapp: string;
  email: string;
  plan: ServicePlan;
  destacado: boolean;
  disponibilidad: string;
};
