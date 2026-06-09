import { describe, expect, it } from "vitest";

import {
  canAccessRoute,
  hasPermission,
  type CurrentUser,
} from "@/lib/permissions";

const tutorUser: CurrentUser = {
  id: "1",
  email: "tutor@care.dev",
  profile: null,
  roles: ["tutor"],
  displayName: "Tutor",
};

const caregiverUser: CurrentUser = {
  id: "2",
  email: "caregiver@care.dev",
  profile: null,
  roles: ["caregiver"],
  displayName: "Cuidador",
};

const professionalUser: CurrentUser = {
  id: "3",
  email: "pro@care.dev",
  profile: null,
  roles: ["professional"],
  displayName: "Profesional",
};

describe("permissions", () => {
  it("tutor puede acceder a /cuidadores", () => {
    expect(canAccessRoute(tutorUser, "/cuidadores")).toBe(true);
  });

  it("caregiver no puede acceder a /cuidadores", () => {
    expect(canAccessRoute(caregiverUser, "/cuidadores")).toBe(false);
  });

  it("evalúa permisos en todos los roles del usuario", () => {
    const multiRoleUser: CurrentUser = {
      ...caregiverUser,
      profile: null,
      roles: ["caregiver", "tutor"],
    };
    expect(hasPermission(multiRoleUser, "ver_cuidadores")).toBe(true);
  });

  describe("permisos por rol", () => {
    it("tutor tiene ver_documentos_legales", () => {
      expect(hasPermission(tutorUser, "ver_documentos_legales")).toBe(true);
    });

    it("caregiver no tiene ver_documentos_legales", () => {
      expect(hasPermission(caregiverUser, "ver_documentos_legales")).toBe(false);
    });

    it("caregiver tiene ver_persona_cuidada", () => {
      expect(hasPermission(caregiverUser, "ver_persona_cuidada")).toBe(true);
    });

    it("tutor no tiene ver_persona_cuidada", () => {
      expect(hasPermission(tutorUser, "ver_persona_cuidada")).toBe(false);
    });

    it("professional tiene ver_medicacion", () => {
      expect(hasPermission(professionalUser, "ver_medicacion")).toBe(true);
    });

    it("provider no tiene ver_medicacion", () => {
      const providerUser: CurrentUser = {
        id: "4",
        email: "provider@care.dev",
        profile: null,
        roles: ["provider"],
        displayName: "Proveedor",
      };
      expect(hasPermission(providerUser, "ver_medicacion")).toBe(false);
    });
  });
});
