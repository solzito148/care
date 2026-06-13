import { twMerge } from "tailwind-merge";

/**
 * Une clases de Tailwind resolviendo conflictos: cuando dos utilidades chocan
 * (p. ej. `bg-white` y `bg-care-700`), gana la ultima. Esto permite que los
 * `className` que se pasan a componentes (Card, Button) sobreescriban de forma
 * confiable los estilos base.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}
