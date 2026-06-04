import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProtectedRouteView } from "@/components/auth/protected-route-view";

describe("ProtectedRoute", () => {
  it("permite acceso cuando el rol coincide", () => {
    render(
      <ProtectedRouteView roles={["tutor"]} requiredRoles={["tutor"]}>
        <p>Contenido protegido</p>
      </ProtectedRouteView>,
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("muestra acceso denegado cuando el rol no coincide", () => {
    render(
      <ProtectedRouteView roles={["caregiver"]} requiredRoles={["tutor"]}>
        <p>Contenido protegido</p>
      </ProtectedRouteView>,
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Acceso denegado" })).toBeInTheDocument();
  });
});
