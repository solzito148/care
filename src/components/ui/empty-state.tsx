import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Icono opcional (SVG) centrado en un circulo de marca. */
  icon?: ReactNode;
  /** CTA opcional (boton/link). */
  action?: ReactNode;
  className?: string;
};

/**
 * Estado vacio unificado para listas (agenda, medicacion, turnos, etc.).
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-care-border bg-white px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-care-100 text-care-700">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-care-text">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-care-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
