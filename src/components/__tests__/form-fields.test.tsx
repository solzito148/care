import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("marca aria-invalid cuando hay error", () => {
    render(<Input type="email" label="Email" error="Email inválido" />);

    const input = screen.getByLabelText(/Email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
  });

  it("no marca aria-invalid sin error", () => {
    render(<Input type="email" label="Email" />);
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
});

describe("FormField", () => {
  it("asocia label e input con htmlFor", async () => {
    const user = userEvent.setup();

    render(
      <FormField id="name" label="Nombre">
        <input id="name" type="text" />
      </FormField>,
    );

    const input = screen.getByLabelText("Nombre");
    await user.click(input);
    expect(input).toHaveFocus();
  });

  it("muestra mensaje de ayuda accesible", async () => {
    render(
      <FormField id="pwd" label="Contraseña" helpText="Mínimo 8 caracteres">
        <input id="pwd" type="password" />
      </FormField>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
    });
  });

  it("anuncia el error con role status", () => {
    render(
      <FormField id="email" label="Email" required error="Email inválido">
        <input id="email" type="email" />
      </FormField>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Email inválido");
  });
});
