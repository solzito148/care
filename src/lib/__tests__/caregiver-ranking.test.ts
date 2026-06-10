import { describe, expect, it } from "vitest";

import { rankingScore } from "@/lib/data/caregivers";
import type { CaregiverSearchItem } from "@/lib/cuidadores-types";

function makeCaregiver(overrides: Partial<CaregiverSearchItem>): CaregiverSearchItem {
  return {
    id: "c1",
    foto: "AB",
    nombre: "Cuidador",
    zonasTrabajo: [],
    localidad: "CABA",
    modalidades: [],
    disponibilidadEspecial: [],
    experiencia: 0,
    tareas: [],
    calificacion: 0,
    perfilCompleto: true,
    referenciasCargadas: false,
    referenciasVerificadas: false,
    recomendadoCare: false,
    datosActualizados: false,
    estadoActualizacionPerfil: "datos-actualizados",
    altaDisponibilidad: false,
    ultimaActualizacion: "2026-01-01",
    recomendacionesCount: 0,
    recomendacionesPromedio: 0,
    ...overrides,
  };
}

describe("rankingScore", () => {
  it("prioriza cuidadores recomendados por CARE", () => {
    const recommended = makeCaregiver({ recomendadoCare: true });
    const plain = makeCaregiver({ recomendadoCare: false, recomendacionesPromedio: 4 });
    expect(rankingScore(recommended)).toBeGreaterThan(rankingScore(plain));
  });

  it("a igualdad de badges, gana mejor promedio de recomendaciones", () => {
    const better = makeCaregiver({ recomendacionesPromedio: 5, recomendacionesCount: 3 });
    const worse = makeCaregiver({ recomendacionesPromedio: 2, recomendacionesCount: 3 });
    expect(rankingScore(better)).toBeGreaterThan(rankingScore(worse));
  });

  it("las referencias verificadas suman", () => {
    const verified = makeCaregiver({ referenciasVerificadas: true });
    const unverified = makeCaregiver({ referenciasVerificadas: false });
    expect(rankingScore(verified)).toBeGreaterThan(rankingScore(unverified));
  });
});
