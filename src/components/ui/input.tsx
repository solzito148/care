import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  large?: boolean;
  error?: string;
};

export function Input({ label, hint, large = false, className, id, error, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
      {label}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "mt-2 w-full rounded-xl2 border bg-white px-4 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus-visible:ring-4",
          error
            ? "border-danger-700 focus:border-danger-700 focus-visible:ring-danger-100"
            : "border-slate-300 focus:border-care-500 focus-visible:ring-care-200",
          large ? "min-h-14 text-lg" : "min-h-12 text-base",
          className
        )}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="mt-1 block text-xs font-semibold text-danger-700">
          {error}
        </span>
      ) : null}
      {hint ? <span className="mt-1 block text-xs text-slate-600">{hint}</span> : null}
    </label>
  );
}
