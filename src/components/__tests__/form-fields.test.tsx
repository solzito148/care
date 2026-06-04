import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

describe("FormField + Input", () => {
  it("marca aria-invalid cuando hay error", () => {
    render(
      <FormField id="email" label="Email" required error="Email inválido">
        <Input id="email" hasError aria-required="true" />
      </FormField>,
    );

    const input = screen.getByLabelText(/Email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Email inválido");
  });

  it("asocia label e input con htmlFor", async () => {
    const user = userEvent.setup();

    render(
      <FormField id="name" label="Nombre">
        <Input id="name" />
      </FormField>,
    );

    const input = screen.getByLabelText("Nombre");
    await user.click(input);
    expect(input).toHaveFocus();
  });

  it("muestra mensaje de ayuda accesible", async () => {
    render(
      <FormField id="pwd" label="Contraseña" helpText="Mínimo 8 caracteres">
        <Input id="pwd" aria-describedby="pwd-help" />
      </FormField>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
    });
  });
});
