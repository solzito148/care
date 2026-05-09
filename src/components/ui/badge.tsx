import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

const badgeToneStyles: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-info-100 text-info-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-danger-100 text-danger-700",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full px-3 py-1 text-sm font-semibold",
        badgeToneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
