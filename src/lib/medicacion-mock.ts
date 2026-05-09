import { ActiveMedication, DailyMedication, MedicationHistoryItem } from "@/lib/medicacion-types";
import { careMockData } from "@/lib/mock-data";

export const medicamentosDelDiaMock: DailyMedication[] = careMockData.medicacion.delDia;
export const medicamentosActivosMock: ActiveMedication[] = careMockData.medicacion.activa;
export const historialCumplimientoMock: MedicationHistoryItem[] = careMockData.medicacion.historial;
