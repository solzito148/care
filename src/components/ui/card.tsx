import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardSize = "sm" | "md" | "lg";

const sizePadding: Record<CardSize, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Densidad de padding estandar: sm=16px, md=24px (default), lg=32px. */
  size?: CardSize;
  /** Activa elevacion al pasar el cursor (para tarjetas clickeables). */
  interactive?: boolean;
};

export function Card({ children, className, size = "md", interactive = false }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-soft transition-shadow duration-200",
        interactive &&
          "hover-lift cursor-pointer hover:border-care-200 motion-reduce:transition-none",
        sizePadding[size],
        className
      )}
    >
      {children}
    </article>
  );
}
