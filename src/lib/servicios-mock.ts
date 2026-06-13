import { ServiceItem } from "@/lib/servicios-types";
import { careMockData } from "@/lib/mock-data";

export const serviceCategoryLabels = {
  "traslados-y-acompanamiento": "Traslados y acompañamiento",
  "desarme-y-organizacion-del-hogar": "Desarme y organización del hogar",
  "adaptacion-del-hogar": "Adaptación del hogar",
  "tramites-y-gestiones": "Trámites y gestiones",
  "servicios-domiciliarios-complementarios": "Servicios domiciliarios complementarios",
} as const;

export const servicesMock: ServiceItem[] = careMockData.servicios;
