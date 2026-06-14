import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        care: {
          50: "#f3f8ff",
          100: "#e4efff",
          200: "#c8ddff",
          300: "#9fc3ff",
          400: "#6ea4ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          text: "#0f172a",
          muted: "#64748b",
          border: "#e2e8f0",
        },
        success: {
          100: "#dcfce7",
          700: "#15803d",
        },
        warning: {
          100: "#fef9c3",
          700: "#a16207",
        },
        danger: {
          100: "#fee2e2",
          700: "#b91c1c",
        },
        info: {
          100: "#e0f2fe",
          700: "#0369a1",
        },
      },
      fontSize: {
        "simple-title": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "simple-text": ["1.25rem", { lineHeight: "1.875rem" }],
      },
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        soft: "0 8px 20px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
