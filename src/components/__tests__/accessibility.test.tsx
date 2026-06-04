import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Suspense } from "react";
import { describe, expect, it } from "vitest";

import { LoginForm } from "@/components/forms/login-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

expect.extend(toHaveNoViolations);

describe("Accesibilidad WCAG AA", () => {
  it("Button no tiene violaciones axe", async () => {
    const { container } = render(<Button>Guardar</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("FormField + Input no tienen violaciones axe", async () => {
    const { container } = render(
      <FormField id="email" label="Email" required>
        <Input id="email" type="email" aria-required="true" />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("LoginForm no tiene violaciones axe críticas", async () => {
    const { container } = render(
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
