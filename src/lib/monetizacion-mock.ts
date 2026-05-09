import { CurrentSubscription, PlanItem } from "@/lib/monetizacion-types";
import { careMockData } from "@/lib/mock-data";

export const monetizationPlansMock: PlanItem[] = careMockData.monetizacion.planes;
export const currentSubscriptionMock: CurrentSubscription = careMockData.monetizacion.suscripcionActual;
