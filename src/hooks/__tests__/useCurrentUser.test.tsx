import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { UserProvider } from "@/components/providers/user-provider";
import {
  useCanAccess,
  useHasPermission,
} from "@/hooks/useCurrentUser";
import type { CurrentUser } from "@/lib/permissions";

function createWrapper(user: CurrentUser) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <UserProvider user={user}>{children}</UserProvider>;
  };
}

const tutorUser: CurrentUser = {
  id: "1",
  email: "tutor@care.dev",
  roles: ["tutor"],
  displayName: "Tutor",
};

const caregiverUser: CurrentUser = {
  id: "2",
  email: "caregiver@care.dev",
  roles: ["caregiver"],
  displayName: "Cuidador",
};

const professionalUser: CurrentUser = {
  id: "3",
  email: "pro@care.dev",
  roles: ["professional"],
  displayName: "Profesional",
};

describe("useHasPermission", () => {
  it("tutor puede ver_documentos_legales", () => {
    const { result } = renderHook(() => useHasPermission("ver_documentos_legales"), {
      wrapper: createWrapper(tutorUser),
    });
    expect(result.current).toBe(true);
  });

  it("caregiver no puede ver_documentos_legales", () => {
    const { result } = renderHook(() => useHasPermission("ver_documentos_legales"), {
      wrapper: createWrapper(caregiverUser),
    });
    expect(result.current).toBe(false);
  });

  it("caregiver puede ver_persona_cuidada", () => {
    const { result } = renderHook(() => useHasPermission("ver_persona_cuidada"), {
      wrapper: createWrapper(caregiverUser),
    });
    expect(result.current).toBe(true);
  });

  it("professional puede ver_medicacion", () => {
    const { result } = renderHook(() => useHasPermission("ver_medicacion"), {
      wrapper: createWrapper(professionalUser),
    });
    expect(result.current).toBe(true);
  });

  it("devuelve false fuera de UserProvider", () => {
    const { result } = renderHook(() => useHasPermission("ver_medicacion"));
    expect(result.current).toBe(false);
  });
});

describe("useCanAccess", () => {
  it("devuelve false fuera de UserProvider", () => {
    const { result } = renderHook(() => useCanAccess("tutor"));
    expect(result.current).toBe(false);
  });
});
