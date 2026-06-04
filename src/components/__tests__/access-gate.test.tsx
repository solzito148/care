import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccessGate } from "@/components/auth/access-gate";

describe("AccessGate", () => {
  it("deniega acceso cuando el rol no coincide", () => {
    render(
      <AccessGate
        roles={["caregiver"]}
        requiredRoles={["tutor"]}
        fallback={<p>Denegado</p>}
      >
        <p>Contenido protegido</p>
      </AccessGate>,
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(screen.getByText("Denegado")).toBeInTheDocument();
  });
});
