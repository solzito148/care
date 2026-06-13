import {
  CaregiverRecommendation,
  CaregiverReferencePublic,
  CaregiverSearchItem,
} from "@/lib/cuidadores-types";
import { careMockData } from "@/lib/mock-data";

export const caregiversMock: CaregiverSearchItem[] = careMockData.cuidadores.perfiles;

export const caregiverReferencesMock: Record<string, CaregiverReferencePublic[]> = {
  "c-1": [
    {
      nombreContratante: "Ana Martínez",
      zona: "Belgrano",
      periodo: "2024-2026",
      modalidad: "Con retiro",
      tareas: "Medicación, compañía y turnos médicos",
      telefono: "+54 11 4000-1112",
    },
  ],
  "c-2": [
    {
      nombreContratante: "Familia Pérez",
      zona: "Ramos Mejía",
      periodo: "2023-2025",
      modalidad: "Sin retiro",
      tareas: "Guardias 24 hs y control de signos vitales",
      telefono: "+54 11 4333-1000",
    },
  ],
  "c-3": [
    {
      nombreContratante: "Lucía Gómez",
      zona: "Caballito",
      periodo: "2025-2026",
      modalidad: "Por hora",
      tareas: "Acompañamiento y tareas livianas",
      telefono: "+54 11 4777-2200",
    },
  ],
};

export const caregiverRecommendationsMock: CaregiverRecommendation[] = [
  ...careMockData.cuidadores.recomendaciones,
];
