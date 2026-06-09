import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  required,
  helpText,
  error,
  children,
  className,
}: FormFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-base font-medium text-care-text">
        {label}
        {required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        ) : null}
      </label>
      {helpText ? (
        <p id={helpId} className="text-sm leading-relaxed text-care-muted">
          {helpText}
        </p>
      ) : null}
      <div aria-describedby={describedBy}>{children}</div>
      {error ? (
        <p
          id={errorId}
          role="status"
          className="text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
