import { ServiceItem } from "@/lib/servicios-types";
import { careMockData } from "@/lib/mock-data";

export const serviceCategoryLabels = {
  "traslados-y-acompanamiento": "Traslados y acompanamiento",
  "desarme-y-organizacion-del-hogar": "Desarme y organizacion del hogar",
  "adaptacion-del-hogar": "Adaptacion del hogar",
  "tramites-y-gestiones": "Tramites y gestiones",
  "servicios-domiciliarios-complementarios": "Servicios domiciliarios complementarios",
} as const;

export const servicesMock: ServiceItem[] = careMockData.servicios;
