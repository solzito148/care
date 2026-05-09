import { AgendaEvent } from "@/lib/agenda-types";
import { CaregiverRecommendation, CaregiverReminderStatus, CaregiverSearchItem } from "@/lib/cuidadores-types";
import { ActiveMedication, DailyMedication, MedicationHistoryItem } from "@/lib/medicacion-types";
import { CurrentSubscription, PlanItem } from "@/lib/monetizacion-types";
import { MarketplaceItem } from "@/lib/marketplace-types";
import { PersonaCuidada } from "@/lib/persona-cuidada-types";
import { ServiceItem } from "@/lib/servicios-types";

export type CareUserRole =
  | "tutor"
  | "persona-cuidada"
  | "cuidador"
  | "profesional"
  | "proveedor"
  | "admin";

export type CareUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: CareUserRole;
};

export type CareMockData = {
  usuarios: CareUser[];
  personasCuidadas: PersonaCuidada[];
  cuidadores: {
    perfiles: CaregiverSearchItem[];
    recomendaciones: CaregiverRecommendation[];
    recordatoriosActualizacion: CaregiverReminderStatus[];
  };
  medicacion: {
    delDia: DailyMedication[];
    activa: ActiveMedication[];
    historial: MedicationHistoryItem[];
  };
  agenda: {
    eventos: AgendaEvent[];
  };
  marketplace: MarketplaceItem[];
  servicios: ServiceItem[];
  monetizacion: {
    planes: PlanItem[];
    suscripcionActual: CurrentSubscription;
  };
};
