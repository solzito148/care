import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3";
};

/**
 * Encabezado de seccion unificado (h2 por defecto) para paginas admin.
 */
export function SectionHeading({
  children,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Tag className={cn("text-xl font-semibold text-care-text", className)}>
      {children}
    </Tag>
  );
}
