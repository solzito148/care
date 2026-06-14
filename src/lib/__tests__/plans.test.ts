import { describe, expect, it } from "vitest";

import {
  DEFAULT_FAMILY_LIMITS,
  PLAN_CATALOG,
  familyLimitsForPlanId,
  findPlan,
  isFreePlan,
  planLimits,
  planPriceToNumber,
} from "@/lib/plans";

describe("plans", () => {
  it("parsea precios con separador de miles", () => {
    expect(planPriceToNumber("$14.900")).toBe(14900);
    expect(planPriceToNumber("$0")).toBe(0);
    expect(planPriceToNumber("")).toBe(0);
  });

  it("detecta planes gratuitos", () => {
    const free = PLAN_CATALOG.find((p) => p.precioMensual === "$0")!;
    const paid = PLAN_CATALOG.find((p) => p.precioMensual !== "$0")!;
    expect(isFreePlan(free)).toBe(true);
    expect(isFreePlan(paid)).toBe(false);
  });

  it("encuentra un plan por id y devuelve undefined si no existe", () => {
    expect(findPlan("fam-esencial")?.nombre).toBe("Familiar Esencial");
    expect(findPlan("inexistente")).toBeUndefined();
  });

  it("todos los ids del catalogo son unicos", () => {
    const ids = PLAN_CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("solo tiene las verticales del modelo simplificado", () => {
    const lineas = new Set(PLAN_CATALOG.map((p) => p.linea));
    expect(lineas).toEqual(
      new Set(["familias", "profesionales", "empresas", "intercambio-donaciones"]),
    );
  });

  it("aplica los limites de cuidadores/medicos por plan", () => {
    expect(familyLimitsForPlanId("fam-gratis")).toEqual({ cuidadores: 0, medicos: 0 });
    expect(familyLimitsForPlanId("fam-esencial")).toEqual({ cuidadores: 2, medicos: 2 });
    expect(familyLimitsForPlanId("fam-premium")).toEqual({
      cuidadores: null,
      medicos: null,
    });
  });

  it("usa limites por defecto cuando no hay plan de familia conocido", () => {
    expect(familyLimitsForPlanId(null)).toEqual(DEFAULT_FAMILY_LIMITS);
    expect(familyLimitsForPlanId("pro-premium")).toEqual(DEFAULT_FAMILY_LIMITS);
  });

  it("planLimits trata como ilimitado a los planes sin limites", () => {
    const profesional = findPlan("pro-basico")!;
    expect(planLimits(profesional)).toEqual({ cuidadores: null, medicos: null });
  });
});
