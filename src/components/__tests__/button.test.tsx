import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("es activable con teclado", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Guardar</Button>);

    const button = screen.getByRole("button", { name: "Guardar" });
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("tiene altura mínima accesible", () => {
    render(<Button>Acción</Button>);
    expect(screen.getByRole("button", { name: "Acción" })).toHaveClass("min-h-14");
  });
});
