import { cn } from "@/lib/cn";

type CheckboxFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
};

export function CheckboxField({ id, label, checked, onChange, error }: CheckboxFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-sm text-slate-700">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className={cn(
            "mt-1 h-5 w-5 rounded border-2",
            error ? "border-danger-700" : "border-slate-300"
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
