import type { Config } from "tailwindcss";

/**
 * Care — tokens de accesibilidad para personas mayores (WCAG AA).
 * Los valores se aplican vía @theme en src/app/globals.css (@config).
 */
const config: Config = {
  theme: {
    extend: {
      fontSize: {
        sm: "1rem",
        base: "1.125rem",
        lg: "1.25rem",
      },
      lineHeight: {
        relaxed: "1.875",
      },
      minHeight: {
        touch: "2.75rem",
        "touch-lg": "3.5rem",
      },
      colors: {
        care: {
          primary: "#1e4d8c",
          text: "#1a1a1a",
          muted: "#4a4a4a",
          surface: "#f8fafc",
          border: "#cbd5e1",
        },
      },
    },
  },
};

export default config;
