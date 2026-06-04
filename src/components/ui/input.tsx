import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "min-h-12 w-full rounded-lg border bg-white px-4 text-base text-care-text",
          "placeholder:text-care-muted",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-care-primary",
          hasError ? "border-red-600" : "border-care-border",
          className,
        )}
        aria-invalid={hasError || undefined}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
