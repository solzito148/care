import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex min-h-14 items-center justify-center rounded-lg px-6 text-base font-medium transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" && "bg-care-primary text-white hover:bg-care-primary/90",
          variant === "secondary" &&
            "border border-care-border bg-white text-care-text hover:bg-care-surface",
          variant === "ghost" && "text-care-primary hover:bg-care-primary/10",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
