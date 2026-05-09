import { accountTypeOptions, AccountType } from "@/lib/auth-types";
import { cn } from "@/lib/cn";

type AccountTypeSelectorProps = {
  value: AccountType | "";
  onChange: (value: AccountType) => void;
  error?: string;
};

export function AccountTypeSelector({ value, onChange, error }: AccountTypeSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">Tipo de cuenta</legend>
      <div className="grid gap-2">
        {accountTypeOptions.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                checked ? "border-care-600 bg-care-50" : "border-slate-300 bg-white hover:bg-slate-50"
              )}
            >
              <input
                type="radio"
                name="accountType"
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-1 h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-800">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? <p className="text-xs font-semibold text-danger-700">{error}</p> : null}
    </fieldset>
  );
}
