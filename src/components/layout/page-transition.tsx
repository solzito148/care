"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Envuelve el contenido de cada ruta y reproduce una entrada suave (fade-up)
 * en cada navegacion. El `key` por pathname fuerza el re-montaje para que la
 * animacion se repita al cambiar de pagina. El movimiento se desactiva
 * automaticamente con `prefers-reduced-motion` (ver globals.css).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
